// Pace math: Riegel race-time projection, pace formatting, and the zone table
// (§2.8). Zones are expressed as second-per-km offsets from half-marathon pace
// so the "goal" and "current" columns stay internally consistent — feed in goal
// HM pace for one column and the Riegel-derived current HM pace for the other.

export const HM_DISTANCE_KM = 21.0975

// Riegel: T2 = T1 * (D2 / D1) ^ 1.06
export function riegelPredict(knownDistanceKm, knownTimeSec, targetDistanceKm) {
  if (!knownDistanceKm || !knownTimeSec) return null
  return knownTimeSec * Math.pow(targetDistanceKm / knownDistanceKm, 1.06)
}

export function paceSecPerKm(timeSec, distanceKm) {
  if (!distanceKm) return null
  return timeSec / distanceKm
}

export function formatPace(secPerKm) {
  if (secPerKm == null || !isFinite(secPerKm)) return '–'
  const s = Math.round(secPerKm)
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${m}:${String(r).padStart(2, '0')}`
}

export function formatTime(totalSec) {
  if (totalSec == null || !isFinite(totalSec)) return '–'
  const s = Math.round(totalSec)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const r = s % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`
  return `${m}:${String(r).padStart(2, '0')}`
}

// Accepts "MM:SS", "H:MM:SS" or "HH:MM:SS"; returns seconds or null.
export function parseTime(str) {
  if (!str) return null
  const parts = String(str).trim().split(':').map((p) => Number(p))
  if (parts.some((p) => Number.isNaN(p))) return null
  if (parts.length === 2) return parts[0] * 60 + parts[1]
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
  return null
}

// Offsets in sec/km relative to HM pace. Tuned so that an HM pace of 3:50
// reproduces the spec's goal-anchored zone table (§2.8).
const ZONE_OFFSETS = [
  { key: 'recovery', label: 'Recovery', lo: 80, hi: 100, use: 'day-after / shakeouts' },
  { key: 'easy', label: 'Easy (the 80%)', lo: 60, hi: 85, use: 'bulk of all running' },
  { key: 'steady', label: 'Steady / long-run float', lo: 40, hi: 60, use: 'later long-run segments' },
  { key: 'hm', label: 'HM goal pace', lo: 0, hi: 0, use: 'race-pace segments, race day' },
  { key: 'threshold', label: 'Threshold (LT2 / ~1hr)', lo: 0, hi: 12, use: 'tempo sessions' },
  { key: 'tenk', label: '10k', lo: -8, hi: 0, use: 'tune-up target band' },
  { key: 'vo2max', label: 'VO₂max (3k–5k)', lo: -30, hi: -12, use: 'short intervals' },
]

export function zonesFromHmPace(hmPaceSecPerKm) {
  const zones = ZONE_OFFSETS.map((z) => ({
    key: z.key,
    label: z.label,
    use: z.use,
    // lo offset => slower pace (bigger number); list as fast..slow for readability
    fast: hmPaceSecPerKm + z.hi,
    slow: hmPaceSecPerKm + z.lo,
  }))
  // Append non-paced neuromuscular zones for completeness.
  zones.push({ key: 'strides', label: 'Strides / reps', use: 'neuromuscular upkeep', text: '~3:00–3:20 feel' })
  zones.push({ key: 'sprint', label: 'Flying sprint', use: 'speed maintenance', text: 'max velocity (effort)' })
  return zones
}

// Convenience: zone table directly from a race result.
export function zonesFromRace(distanceKm, timeSec) {
  const hmTime = riegelPredict(distanceKm, timeSec, HM_DISTANCE_KM)
  const hmPace = paceSecPerKm(hmTime, HM_DISTANCE_KM)
  return { hmTime, hmPace, zones: zonesFromHmPace(hmPace) }
}
