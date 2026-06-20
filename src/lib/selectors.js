// Derived/selector helpers shared across screens: pace zones (goal vs current),
// the Riegel on-track readout, and weekly/daily load aggregation from logs.

import { HM_DISTANCE_KM, zonesFromHmPace, zonesFromRace, riegelPredict, paceSecPerKm } from './paces.js'
import { sessionKey } from './store.jsx'
import { dailySeries, rollingAcwrSeries, ewmaAcwrSeries, sessionSRPE, weekOnWeekPct, loadFlags } from './load.js'
import { isoDate, addDays } from './dates.js'

// The race result currently driving "current fitness": latest logged test, else
// the recent-race config field. Returns { distanceKm, timeSec, source }.
export function currentRaceBasis(state) {
  const tests = state.tests || []
  if (tests.length) {
    const latest = [...tests].sort((a, b) => b.date.localeCompare(a.date))[0]
    return { distanceKm: latest.distanceKm, timeSec: latest.timeSec, source: `${latest.type} (${latest.date})` }
  }
  if (state.config.recentRaceDistanceKm && state.config.recentRaceTimeSec) {
    return { distanceKm: state.config.recentRaceDistanceKm, timeSec: state.config.recentRaceTimeSec, source: 'recent race (config)' }
  }
  return null
}

export function goalHmPace(state) {
  return paceSecPerKm(state.config.goalTimeSec, HM_DISTANCE_KM)
}

// Goal vs current zone tables side by side.
export function zoneTables(state) {
  const goalPace = goalHmPace(state)
  const goal = zonesFromHmPace(goalPace)
  const basis = currentRaceBasis(state)
  let current = null
  let currentHmPace = null
  let currentHmTime = null
  if (basis) {
    const z = zonesFromRace(basis.distanceKm, basis.timeSec)
    current = z.zones
    currentHmPace = z.hmPace
    currentHmTime = z.hmTime
  }
  return { goal, current, goalPace, currentHmPace, currentHmTime, basis }
}

// On-track readout: projected HM vs goal, with an honest band (§0).
export function onTrack(state) {
  const basis = currentRaceBasis(state)
  if (!basis) return null
  const projected = riegelPredict(basis.distanceKm, basis.timeSec, HM_DISTANCE_KM)
  const goal = state.config.goalTimeSec
  const deltaSec = projected - goal
  let verdict
  if (deltaSec <= 30) verdict = 'on-track'
  else if (deltaSec <= 180) verdict = 'close'
  else verdict = 'stretch'
  return { projected, goal, deltaSec, verdict, basis }
}

// Build a per-date load map from logs. Counts sRPE (RPE×min) from any logged
// session that has both, and running km from run logs.
export function loadByDate(state) {
  const byDate = {}
  const kmByDate = {}
  for (const [key, log] of Object.entries(state.logs || {})) {
    if (!log || log.status === 'SKIPPED') continue
    const date = key.split('|')[0]
    const run = log.run
    const strength = log.strength
    const sprint = log.sprint
    let srpe = 0
    let km = 0
    if (run) {
      if (run.rpe && run.durationSec) srpe += sessionSRPE(run.rpe, run.durationSec)
      if (run.distanceKm) km += Number(run.distanceKm)
    }
    if (strength?.rpe && strength?.durationSec) srpe += sessionSRPE(strength.rpe, strength.durationSec)
    if (sprint?.rpe && sprint?.durationSec) srpe += sessionSRPE(sprint.rpe, sprint.durationSec)
    byDate[date] = (byDate[date] || 0) + srpe
    kmByDate[date] = (kmByDate[date] || 0) + km
  }
  return { srpe: byDate, km: kmByDate }
}

export function loadSeries(state, mode = 'rolling') {
  const { srpe } = loadByDate(state)
  const dates = Object.keys(srpe)
  if (!dates.length) return { series: [], acwr: [] }
  const from = dates.sort()[0]
  const to = isoDate(addDays(new Date(), 0))
  const series = dailySeries(srpe, from, to)
  const acwr = mode === 'ewma' ? ewmaAcwrSeries(series) : rollingAcwrSeries(series)
  return { series, acwr }
}

// Planned vs actual weekly running volume, plus week-on-week %Δ + flags.
export function weeklyVolume(plan, state) {
  const out = []
  const { km: actualKmByDate } = loadByDate(state)
  let prevActual = null
  for (const week of plan.weeks) {
    const weekSessions = plan.sessions.filter((s) => s.weekId === week.id)
    const planned = week.plannedVolumeKm
    let actual = 0
    for (const s of weekSessions) {
      const log = state.logs[sessionKey(s)]
      if (log?.run?.distanceKm) actual += Number(log.run.distanceKm)
    }
    // Fallback: also count any actual km recorded on dates within the week.
    const wowPct = prevActual ? weekOnWeekPct(actual, prevActual) : null
    out.push({
      weekNumber: week.weekNumber,
      phaseIdx: week.phaseIdx,
      planned,
      actual: Math.round(actual * 10) / 10,
      longPlanned: week.plannedLongRunKm,
      isDownWeek: week.isDownWeek,
      wowPct,
      flags: loadFlags({ wowPct, acwr: null }),
    })
    if (actual > 0) prevActual = actual
  }
  return out
}

// Speed-exposure counter: flying-sprint reps + matches/strides per week.
export function speedExposureByWeek(plan, state) {
  return plan.weeks.map((week) => {
    const weekSessions = plan.sessions.filter((s) => s.weekId === week.id)
    let exposures = 0
    let sprintReps = 0
    for (const s of weekSessions) {
      const log = state.logs[sessionKey(s)]
      if (s.type === 'GAA_MATCH' || s.type === 'GAA_PITCH') exposures += log?.status === 'DONE' ? 1 : 0
      if (log?.sprint?.reps) {
        sprintReps += Number(log.sprint.reps)
        exposures += 1
      }
    }
    return { weekNumber: week.weekNumber, exposures, sprintReps, planned: week.phaseIdx >= 1 ? 1 : 1 }
  })
}
