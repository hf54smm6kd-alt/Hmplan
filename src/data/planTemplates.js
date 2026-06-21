// Canonical per-week volume + long-run targets straight from the spec tables
// (§2.3–§2.6), used when the plan structure matches the default (season ends
// W16, 31-week plan). When the season-end date shifts, the generator falls back
// to a formula model (see plan.js) so phases re-flow gracefully.

// weekNumber -> { vol (km), long (km), down, tuneUp }
export const CANONICAL_WEEKS = {
  // Phase 1 — In-Season Aerobic Bridge (all easy)
  1: { vol: 15, long: 7 },
  2: { vol: 16, long: 7 },
  3: { vol: 17, long: 8 },
  4: { vol: 18, long: 8 },
  5: { vol: 19, long: 8 },
  6: { vol: 21, long: 9 },
  7: { vol: 23, long: 9 },
  8: { vol: 25, long: 10 },
  9: { vol: 24, long: 10 },
  10: { vol: 26, long: 11 },
  11: { vol: 28, long: 11 },
  12: { vol: 30, long: 12 },
  13: { vol: 27, long: 12 },
  14: { vol: 29, long: 13 },
  15: { vol: 31, long: 13 },
  16: { vol: 32, long: 14 },
  // Phase 2 — Base / Volume
  17: { vol: 34, long: 13.5 },
  18: { vol: 38, long: 14.5 },
  19: { vol: 44, long: 15.5 },
  20: { vol: 48, long: 16.5 },
  21: { vol: 38, long: 13, down: true },
  22: { vol: 52, long: 17.5 },
  // Phase 3 — Half-Marathon Specific
  23: { vol: 56, long: 18.5 },
  24: { vol: 60, long: 19.5 },
  25: { vol: 48, long: 14, down: true, tuneUp: true },
  26: { vol: 62, long: 20 },
  27: { vol: 64, long: 20.5 },
  28: { vol: 58, long: 18, down: true },
  29: { vol: 50, long: 16 },
  // Phase 4 — Taper & Race
  30: { vol: 38, long: 12.5 },
  31: { vol: 26, long: 21.0975, race: true },
}

export const PHASE_DEFS = [
  { name: 'In-Season Aerobic Bridge', short: 'Phase 1', focus: 'GAA priority. Build easy aerobic volume. Maintain strength.', runRole: 'secondary' },
  { name: 'Base / Volume', short: 'Phase 2', focus: 'Football over. Ramp volume, install the Speed Day, build the long run.', runRole: 'primary' },
  { name: 'Half-Marathon Specific', short: 'Phase 3', focus: 'Peak volume, threshold + HM-pace + VO₂max, long run to ~20–21 km, tune-up.', runRole: 'primary' },
  { name: 'Taper & Race', short: 'Phase 4', focus: 'Cut volume ~40–60%, keep intensity, sharpen, race.', runRole: 'primary' },
]

// Explicit per-week progression for the canonical plan: the concrete "this week"
// dose for each quality session, so the app can show exactly what to do rather
// than a generic range. Keyed by week number. Fields:
//   threshold  — Thursday threshold prescription
//   vo2        — whether VO₂max is scheduled this week (Phase 3 only)
//   vo2text    — the VO₂max prescription when vo2 is true
//   sprints    — flying-sprint + plyo dose on the Speed Day
//   hmPace     — HM-pace segment folded into the long run
//   tuneup     — tune-up race instruction (W25)
//   longRun/note — misc progression notes
//
// VO₂max cadence: W23 / W26 / W28 only — skipping the W25 tune-up week and the
// W27 peak week (which carries HM-pace in the long run), and fading out by W29.
export const WEEK_PROGRESSIONS = {
  // Phase 1 — milestones (everything easy; volume is the progression)
  1: { note: 'Intro — everything easy. Just build the aerobic habit around football.', longRun: 'Easy 6–8 km, no pace targets.' },
  5: { longRun: 'Easy long run ~8 km. Add 4–6 strides to one midweek run.' },
  9: { longRun: 'Easy long run ~10 km. Move to 3 runs/week if fixtures allow.' },
  13: { longRun: 'Easy long run ~12 km — building toward 14 by season end.' },
  16: { longRun: 'Easy long run ~14 km. You should now be comfortable with ~30 km/week of easy running.' },

  // Phase 2 — threshold builds 3×8 → 2×20; flying-sprint volume builds gradually
  17: { threshold: '3 × 8 min @ threshold, 2 min jog (24 min at threshold).', sprints: 'Flying sprints 4 × 20 m fly, full recovery. Plyos ~40 contacts (pogos, line hops).' },
  18: { threshold: '2 × 15 min @ threshold, 3 min jog (30 min).', sprints: '4 × 25 m fly. Plyos ~50 contacts (add low box jumps).' },
  19: { threshold: '3 × 12 min @ threshold, 2 min jog (36 min).', sprints: '5 × 25 m fly. Plyos ~60 contacts.' },
  20: { threshold: '2 × 18 min @ threshold, 3 min jog (36 min).', sprints: '5 × 30 m fly. Plyos ~70 contacts (add hurdle hops).' },
  21: { threshold: 'DOWN WEEK — 2 × 10 min @ threshold, 2 min jog (20 min).', sprints: 'DOWN — 4 × 20 m fly, plyos ~40 contacts. Keep it light.' },
  22: { threshold: '2 × 20 min @ threshold, 3 min jog (40 min).', sprints: '6 × 30 m fly. Plyos ~80 contacts.' },

  // Phase 3 — race-specific. VO₂max W23/26/28; HM-pace in the long run W24/27/29
  23: { threshold: '3 × 12 min @ threshold, 2 min jog (36 min).', vo2: true, vo2text: 'VO₂max: 5 × 3 min @ 3k–5k effort, 2–3 min jog (15 min hard).', sprints: '5 × 30 m fly. Add bilateral depth/drop jumps 3 × 5.' },
  24: { threshold: '2 × 20 min @ threshold, 3 min jog (40 min).', hmPace: 'Long-run finish: last 5 km @ HM goal pace.', sprints: '6 × 30 m fly. Depth jumps 3 × 5.' },
  25: { threshold: 'Tune-up week — Thu light: 2 × 8 min easy-threshold. Save the legs.', sprints: 'DOWN — 3 × 20 m fly only. Plyos ~40 contacts.', tuneup: '★ 10k tune-up race / time trial. ~37:00–38:00 tracks toward 1:21. Recalibrate ALL paces off the result (Pace tab).' },
  26: { threshold: '4 × 10 min @ threshold, 90 s jog (40 min).', vo2: true, vo2text: 'VO₂max: 6 × 3 min @ 3k–5k effort, 2–3 min jog (18 min hard) — or 8 × 2 min.', sprints: '6 × 30 m fly. Depth jumps 3 × 6.' },
  27: { threshold: '2 × 15 min @ threshold (controlled — HM-pace lives in the long run this week).', hmPace: 'Peak long run: 2 × 4 km @ HM goal pace within the run.', sprints: '6 × 30 m fly (hold volume, quality high).' },
  28: { threshold: '3 × 12 min @ threshold, 2 min jog (36 min).', vo2: true, vo2text: 'VO₂max: 10 × 2 min @ 3k–5k effort, 90 s jog (20 min hard) — last hard VO₂max of the block.', sprints: '5 × 30 m fly (starting to ease).' },
  29: { threshold: 'Sharpen: 20 min continuous tempo + 4 × 2 min @ 10k effort.', hmPace: 'Long-run finish: last 4 km @ HM pace.', sprints: '4 × 30 m fly — sharp, fresh, low volume.' },

  // Phase 4 — taper
  30: { threshold: 'Sharp & short: 3 × 6 min @ threshold + 4 × 2 min @ HM pace.', sprints: 'Speed touch only: 3 × 20 m fly. Speed freshens, doesn’t fatigue.', hmPace: 'Trimmed long run with a 3–4 km HM-pace segment.' },
  31: { hmPace: 'Race-week openers (Tue): 3–4 × 2 min @ HM goal pace.', note: 'Race Sunday — even / slight-negative split off your recalibrated goal pace.' },
}

// Front-squat heavy-anchor loading progression (the athlete's chosen heavy
// bilateral lift). Built around maintenance: establish & build in Phase 1, hold
// heavy/low-volume through the running block (done fresh after the Speed Day's
// sprints), back off on down/tune-up weeks, and drop volume in the taper.
export function lowerProgression(week) {
  const w = week.weekNumber
  if (week.isRaceWeek) return 'Front squat: skip the heavy squat — movement prep only. Race Sunday.'
  if (week.isTuneUp) return 'Front squat: 2 × 3 @ RPE 7 (light) — save the legs for the tune-up TT.'
  if (week.isDownWeek) return 'Front squat: 2 × 3 @ RPE 7 — back off the load this down week.'
  if (week.phaseIdx === 0) {
    if (w <= 4) return 'Front squat: 3 × 5 @ RPE 7 — establish a clean, heavy 5.'
    if (w <= 8) return 'Front squat: 3 × 5 @ RPE 7.5 — add load when bar speed stays fast.'
    if (w <= 12) return 'Front squat: 4 × 4 @ RPE 8 — heavier, crisp reps.'
    return 'Front squat: 4 × 3 @ RPE 8 (~85% 1RM) — peak in-season strength.'
  }
  if (week.phaseIdx === 3) return 'Front squat: 2 × 2 @ RPE 7 — hold the pattern, drop volume (taper).'
  // Phases 2 & 3: heavy, low-volume maintenance, done fresh after the sprints.
  if (w <= 20) return 'Front squat: 3 × 3 @ ~85% 1RM (RPE 8) — heavy & low-volume, fresh after the sprints.'
  if (w <= 24) return 'Front squat: 3 × 3 @ RPE 8.'
  if (w <= 27) return 'Front squat: 3 × 2 @ RPE 8 — heavy & snappy.'
  return 'Front squat: 2 × 3 @ RPE 7.5 — easing.'
}
