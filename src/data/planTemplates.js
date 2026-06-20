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
