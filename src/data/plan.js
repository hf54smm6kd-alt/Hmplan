// Plan generator. Produces the full week-by-week plan (phases, weekly targets,
// and daily sessions) from a small config. Re-flows when the season-end date
// moves: Phase 1 = weeks up to season end, Phase 4 = final 2 (taper), Phase 3 =
// the 7 weeks before taper, Phase 2 = whatever sits between. Volume uses the
// canonical spec tables when the structure is the default, otherwise a formula.

import { startOfMonday, weekNumberFor, addDays, isoDate, diffDays } from '../lib/dates.js'
import { CANONICAL_WEEKS, PHASE_DEFS } from './planTemplates.js'

let sid = 0
const nextId = (prefix) => `${prefix}_${sid++}`

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v))
}
const round5 = (v) => Math.round(v * 2) / 2

// ---- Phase boundary computation -------------------------------------------

export function computeStructure(config) {
  const start = startOfMonday(config.startDate)
  // The store stores the race date as `goalRaceDate`; accept either name.
  const raceDate = config.raceDate || config.goalRaceDate
  const totalWeeks = Math.max(8, weekNumberFor(raceDate, start))
  const taperWeeks = 2
  // Where the season ends (last Phase-1 week). Clamp so Phase 2 keeps ≥2 weeks
  // and Phase 3 keeps ≥6, while protecting the 2-week taper.
  const maxP1 = totalWeeks - taperWeeks - 6 - 2
  let p1End = clamp(weekNumberFor(config.seasonEndDate, start), 4, Math.max(4, maxP1))

  const p4Start = totalWeeks - taperWeeks + 1 // e.g. 30
  let p3Len = 7
  let p3Start = p4Start - p3Len
  if (p3Start <= p1End + 1) {
    // Season ran long — shrink Phase 3 toward its 6-week floor.
    p3Len = Math.max(6, p4Start - 1 - (p1End + 1))
    p3Start = p4Start - p3Len
  }
  const p2Start = p1End + 1

  return {
    start,
    totalWeeks,
    bounds: [
      { idx: 0, startWeek: 1, endWeek: p1End },
      { idx: 1, startWeek: p2Start, endWeek: p3Start - 1 },
      { idx: 2, startWeek: p3Start, endWeek: p4Start - 1 },
      { idx: 3, startWeek: p4Start, endWeek: totalWeeks },
    ],
  }
}

function phaseIndexForWeek(weekNum, bounds) {
  for (const b of bounds) if (weekNum >= b.startWeek && weekNum <= b.endWeek) return b.idx
  return bounds.length - 1
}

// Is this the default 31-week / season-end-W16 structure? If so use canonical.
function isDefaultStructure(structure) {
  return structure.totalWeeks === 31 && structure.bounds[0].endWeek === 16
}

// Formula fallback for weekly targets when structure deviates from default.
function formulaTargets(weekNum, phaseIdx, bounds, totalWeeks) {
  const b = bounds[phaseIdx]
  const span = Math.max(1, b.endWeek - b.startWeek)
  const t = (weekNum - b.startWeek) / span // 0..1 within phase
  const everyThirdDown = (weekNum - b.startWeek) % 3 === 2 && weekNum !== b.endWeek
  if (phaseIdx === 0) {
    const vol = 14 + t * (32 - 14)
    const long = 7 + t * (14 - 7)
    return { vol: round5(vol), long: round5(long) }
  }
  if (phaseIdx === 1) {
    let vol = 34 + t * (52 - 34)
    if (everyThirdDown) vol *= 0.78
    return { vol: round5(vol), long: round5(13.5 + t * (17.5 - 13.5)) }
  }
  if (phaseIdx === 2) {
    const tuneUp = Math.abs(t - 0.35) < 0.12
    let vol = 56 + t * (64 - 56)
    let long = 18.5 + t * (21 - 18.5)
    if (tuneUp) {
      vol = 48
      long = 14
    } else if (everyThirdDown) {
      vol *= 0.85
      long *= 0.9
    }
    return { vol: round5(clamp(vol, 40, 64)), long: round5(clamp(long, 14, 21)), down: tuneUp || everyThirdDown, tuneUp }
  }
  // Phase 4 taper
  const isRaceWeek = weekNum === totalWeeks
  return isRaceWeek ? { vol: 26, long: 21.0975, race: true } : { vol: 38, long: 12.5 }
}

// ---- Daily session builders ------------------------------------------------

function makeSession(weekId, date, dayOffset, type, plannedDetail, plannedKm) {
  return {
    id: nextId('sess'),
    weekId,
    date: isoDate(date),
    dayOffset,
    type,
    plannedDetail: plannedDetail || '',
    plannedKm: plannedKm != null ? round5(plannedKm) : null,
    status: 'PLANNED',
  }
}

// Phase 1: football is king; 2–3 easy runs around fixtures.
function buildPhase1(weekId, monday, targets) {
  const out = []
  const long = targets.long
  const remaining = Math.max(0, targets.vol - long)
  // Split remaining easy volume across Wed (primary) and an optional short Fri.
  let wed = remaining
  let fri = 0
  if (remaining > 11) {
    wed = round5(remaining * 0.6)
    fri = round5(remaining - wed)
  }
  out.push(makeSession(weekId, addDays(monday, 0), 0, 'STRENGTH_LOWER', 'Heavy compound + Nordics. Bilateral plyos only if fresh (far from match).'))
  out.push(makeSession(weekId, addDays(monday, 1), 1, 'GAA_PITCH', 'Speed/accel work here, fresh & early.'))
  out.push(makeSession(weekId, addDays(monday, 2), 2, 'EASY', wed >= remaining ? 'Conversational. Add 4–6×80 m strides on quieter weeks.' : 'Conversational pace.', wed))
  out.push(makeSession(weekId, addDays(monday, 2), 2, 'STRENGTH_UPPER', 'Maintenance upper session.'))
  out.push(makeSession(weekId, addDays(monday, 3), 3, 'GAA_PITCH', ''))
  if (fri > 0) out.push(makeSession(weekId, addDays(monday, 4), 4, 'EASY', 'Short & easy — yields to match recovery if readiness is low.', fri))
  else out.push(makeSession(weekId, addDays(monday, 4), 4, 'REST', 'Pre-match freshness / light mobility.'))
  out.push(makeSession(weekId, addDays(monday, 5), 5, 'GAA_MATCH', 'The match always wins.'))
  out.push(makeSession(weekId, addDays(monday, 6), 6, 'LONG_RUN', 'Easy long-ish — OR rest/30 min if the match was brutal.', long))
  return out
}

// Phase 2: ramp volume + install the Speed Day; one threshold/week.
function buildPhase2(weekId, monday, targets) {
  const out = []
  const long = targets.long
  const speedKm = 4
  const thrKm = clamp(targets.vol * 0.2, 8, 13)
  let rem = Math.max(0, targets.vol - long - speedKm - thrKm)
  const mon = round5(rem * 0.18)
  const wed = round5(rem * 0.3)
  const sat = round5(rem * 0.28)
  const fri = round5(Math.max(0, rem - mon - wed - sat))
  out.push(makeSession(weekId, addDays(monday, 0), 0, 'EASY', 'Recover from Sunday long run. + 4–6 strides. (Rest if flat.)', mon))
  out.push(makeSession(weekId, addDays(monday, 1), 1, 'SPEED_DAY', 'Plyos: pogos, line/ankle hops, low box jumps, hurdle hops (two-footed).'))
  out.push(makeSession(weekId, addDays(monday, 2), 2, 'EASY', 'Conversational.', wed))
  out.push(makeSession(weekId, addDays(monday, 2), 2, 'STRENGTH_UPPER', 'Maintenance upper session.'))
  out.push(makeSession(weekId, addDays(monday, 3), 3, 'THRESHOLD', 'Within an easy-padded run. Build ~3×8 min → 2×15–20 min across the phase.', thrKm))
  out.push(makeSession(weekId, addDays(monday, 4), 4, 'EASY', 'Easy or rest.', fri))
  out.push(makeSession(weekId, addDays(monday, 5), 5, 'EASY', 'Easy + 4–6 strides.', sat))
  out.push(makeSession(weekId, addDays(monday, 6), 6, 'LONG_RUN', 'Easy. Volume + durability.', long))
  return out
}

// Phase 3: race-specific. Alternate Thu threshold/HM-pace, Sat VO₂max/easy.
function buildPhase3(weekId, monday, targets, weekNum) {
  const out = []
  const long = targets.long
  const vo2Week = weekNum % 2 === 1 // alternating weeks
  const speedKm = 4
  const thrKm = clamp(targets.vol * 0.18, 8, 12)
  const satQualityKm = vo2Week ? clamp(targets.vol * 0.16, 7, 11) : 0
  let rem = Math.max(0, targets.vol - long - speedKm - thrKm - satQualityKm)
  const mon = round5(rem * 0.2)
  const wed = round5(rem * 0.34)
  const fri = round5(rem * 0.22)
  const satEasy = vo2Week ? 0 : round5(Math.max(0, rem - mon - wed - fri))
  const thuType = weekNum % 2 === 0 ? 'HM_PACE' : 'THRESHOLD'

  out.push(makeSession(weekId, addDays(monday, 0), 0, 'EASY', 'Easy + strides, or rest.', mon))
  out.push(makeSession(weekId, addDays(monday, 1), 1, 'SPEED_DAY', 'Add bilateral depth/drop jumps this phase. Build flying-sprint exposure gradually.'))
  out.push(makeSession(weekId, addDays(monday, 2), 2, 'EASY', 'Conversational.', wed))
  out.push(makeSession(weekId, addDays(monday, 2), 2, 'STRENGTH_UPPER', 'Maintenance upper session.'))
  out.push(
    makeSession(
      weekId,
      addDays(monday, 3),
      3,
      thuType,
      thuType === 'HM_PACE' ? 'HM-pace reps (or fold HM-pace into the long run instead).' : 'Threshold session, race-specific.',
      thrKm,
    ),
  )
  out.push(makeSession(weekId, addDays(monday, 4), 4, 'EASY', 'Easy or rest.', fri))
  if (vo2Week) out.push(makeSession(weekId, addDays(monday, 5), 5, 'VO2MAX', 'Short reps at 3k–5k effort. Lift the ceiling.', satQualityKm))
  else out.push(makeSession(weekId, addDays(monday, 5), 5, 'EASY', 'Easy + 4–6 strides.', satEasy))
  out.push(
    makeSession(
      weekId,
      addDays(monday, 6),
      6,
      'LONG_RUN',
      targets.tuneUp ? 'Down week — replace with a 10k tune-up race/TT and recalibrate paces.' : 'Long run; add HM-pace finishing segments in later weeks.',
      long,
    ),
  )
  if (targets.tuneUp) out[out.length - 1].type = 'HM_PACE'
  return out
}

// Phase 4: taper. W-1 sharpens; race week opens up and races.
function buildPhase4(weekId, monday, targets, isRaceWeek) {
  const out = []
  if (isRaceWeek) {
    out.push(makeSession(weekId, addDays(monday, 0), 0, 'EASY', 'Easy + strides.', 6))
    out.push(makeSession(weekId, addDays(monday, 1), 1, 'HM_PACE', 'Openers: 3–4 × 2 min at race pace.', 7))
    out.push(makeSession(weekId, addDays(monday, 2), 2, 'EASY', 'Easy.', 6))
    out.push(makeSession(weekId, addDays(monday, 3), 3, 'STRIDES', 'A few strides — stay sharp.', 4))
    out.push(makeSession(weekId, addDays(monday, 4), 4, 'REST', 'Rest or 20 min shakeout.'))
    out.push(makeSession(weekId, addDays(monday, 5), 5, 'RECOVERY', 'Pre-race jog 15–20 min + 4 strides.', 3))
    out.push(makeSession(weekId, addDays(monday, 6), 6, 'RACE', 'RACE DAY — 24 Jan. Even/slight-negative split off recalibrated goal pace.', 21.0975))
    return out
  }
  // Final pre-race week (~−40%).
  const long = targets.long
  let rem = Math.max(0, targets.vol - long - 9)
  out.push(makeSession(weekId, addDays(monday, 0), 0, 'EASY', 'Easy + strides.', round5(rem * 0.3)))
  out.push(makeSession(weekId, addDays(monday, 1), 1, 'SPEED_DAY', 'Keep the speed touch: a few short flying sprints. Speed freshens, doesn\'t fatigue.'))
  out.push(makeSession(weekId, addDays(monday, 2), 2, 'EASY', 'Easy.', round5(rem * 0.3)))
  out.push(makeSession(weekId, addDays(monday, 3), 3, 'THRESHOLD', 'One sharp, short threshold at pace + a HM-pace segment.', 9))
  out.push(makeSession(weekId, addDays(monday, 4), 4, 'REST', 'Rest.'))
  out.push(makeSession(weekId, addDays(monday, 5), 5, 'EASY', 'Easy + strides.', round5(rem * 0.4)))
  out.push(makeSession(weekId, addDays(monday, 6), 6, 'LONG_RUN', 'Trimmed long run with a short HM-pace segment.', long))
  return out
}

// ---- Top-level generator ---------------------------------------------------

export function generatePlan(config) {
  sid = 0
  const structure = computeStructure(config)
  const useCanonical = isDefaultStructure(structure)
  const phases = PHASE_DEFS.map((p, i) => ({
    id: `phase_${i}`,
    name: p.name,
    short: p.short,
    focus: p.focus,
    runRole: p.runRole,
    startWeek: structure.bounds[i].startWeek,
    endWeek: structure.bounds[i].endWeek,
  }))

  const weeks = []
  const sessions = []

  for (let w = 1; w <= structure.totalWeeks; w++) {
    const phaseIdx = phaseIndexForWeek(w, structure.bounds)
    const monday = addDays(structure.start, (w - 1) * 7)
    const targets =
      useCanonical && CANONICAL_WEEKS[w] ? CANONICAL_WEEKS[w] : formulaTargets(w, phaseIdx, structure.bounds, structure.totalWeeks)

    const weekId = `week_${w}`
    weeks.push({
      id: weekId,
      weekNumber: w,
      phaseId: `phase_${phaseIdx}`,
      phaseIdx,
      startDate: isoDate(monday),
      plannedVolumeKm: targets.vol,
      plannedLongRunKm: targets.long,
      isDownWeek: !!targets.down,
      isTuneUp: !!targets.tuneUp,
      isRaceWeek: w === structure.totalWeeks,
    })

    let daySessions
    if (phaseIdx === 0) daySessions = buildPhase1(weekId, monday, targets)
    else if (phaseIdx === 1) daySessions = buildPhase2(weekId, monday, targets)
    else if (phaseIdx === 2) daySessions = buildPhase3(weekId, monday, targets, w)
    else daySessions = buildPhase4(weekId, monday, targets, w === structure.totalWeeks)

    sessions.push(...daySessions)
  }

  return { phases, weeks, sessions, totalWeeks: structure.totalWeeks, startDate: isoDate(structure.start) }
}

// Sum of planned run km for a week's sessions (excludes non-running types).
export function plannedRunKm(sessions) {
  return sessions.reduce((s, x) => s + (x.plannedKm || 0), 0)
}

export { diffDays }
