// The "coach brain" (§2.9 / §3.5). Turns a readiness state + a planned session
// into a concrete recommendation, with an explicit reason. Hamstring flag is the
// hard override; then the green/yellow/red traffic-light drives trims/converts.

const FAST_OR_ECCENTRIC = ['SPEED_DAY', 'PLYO', 'VO2MAX', 'THRESHOLD', 'HM_PACE', 'STRIDES']
const HARD_QUALITY = ['SPEED_DAY', 'VO2MAX', 'THRESHOLD', 'HM_PACE']

// Compute the traffic-light from a readiness record. Wearable recovery score
// wins if present; otherwise a 1–5 self-rating composite + resting-HR bump.
export function computeLight(r) {
  if (!r) return null
  if (r.hamstringFlag) {
    // Flag doesn't set the light, but callers treat it as an override.
  }
  if (r.recoveryScore != null) {
    if (r.recoveryScore >= 67) return 'GREEN'
    if (r.recoveryScore >= 34) return 'YELLOW'
    return 'RED'
  }
  // Manual composite: average of sleep/soreness/energy (each 1–5; soreness is
  // already "5 = no soreness" per the form). 4–5 green, 3 yellow, ≤2.5 red.
  const ratings = [r.sleepRating, r.sorenessRating, r.energyRating].filter((v) => v != null)
  if (!ratings.length) return null
  const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length
  let light = avg >= 3.7 ? 'GREEN' : avg >= 2.8 ? 'YELLOW' : 'RED'
  // Resting-HR elevation nudges one step worse.
  if (r.restingHr != null && r.restingHrBaseline != null && r.restingHr - r.restingHrBaseline >= 7) {
    light = light === 'GREEN' ? 'YELLOW' : 'RED'
  }
  return light
}

// Returns { action, type, reason, trimPct } describing the adjustment.
export function recommend(session, readiness) {
  if (!session) return null
  const light = readiness ? computeLight(readiness) : null

  // Hamstring override — no fast/eccentric work today.
  if (readiness?.hamstringFlag && FAST_OR_ECCENTRIC.includes(session.type)) {
    return {
      action: 'CONVERT',
      type: 'EASY',
      light,
      reason: 'Hamstring flag: no fast or eccentric work today. Convert to easy or cross-train, and log the flag.',
    }
  }

  if (!light || light === 'GREEN') {
    return { action: 'AS_PLANNED', type: session.type, light: light || 'GREEN', reason: light ? 'Recovered — run the session as written.' : 'No check-in yet — assuming green. Log a readiness check-in for a tailored call.' }
  }

  if (light === 'YELLOW') {
    if (session.type === 'VO2MAX') {
      return { action: 'DOWNGRADE', type: 'THRESHOLD', light, reason: 'A bit flat — downgrade VO₂max to threshold to keep quality without the ceiling-stress.' }
    }
    if (HARD_QUALITY.includes(session.type)) {
      return { action: 'TRIM', type: session.type, trimPct: 30, light, reason: 'A bit flat — keep the session but trim the hard volume ~30% (one fewer interval / shorter tempo).' }
    }
    return { action: 'AS_PLANNED', type: session.type, light, reason: 'Easy/maintenance work is fine on yellow — proceed as written.' }
  }

  // RED
  if (HARD_QUALITY.includes(session.type)) {
    return { action: 'CONVERT', type: 'EASY', light, reason: 'Low readiness — convert to easy or rest. Protect quality and tissue; reschedule the hard session.' }
  }
  if (['LONG_RUN', 'EASY', 'STRIDES'].includes(session.type)) {
    return { action: 'CONVERT', type: 'RECOVERY', light, reason: 'Low readiness — keep it to an easy recovery jog or rest.' }
  }
  return { action: 'AS_PLANNED', type: session.type, light, reason: 'Proceed, but keep it gentle.' }
}

// Rolling hamstring-flag count over the last N days (default 10) for the
// "two flags in 10 days" escalation (§2.9).
export function hamstringFlagStreak(readinessList, todayISO, windowDays = 10) {
  const cutoff = new Date(todayISO)
  cutoff.setDate(cutoff.getDate() - windowDays)
  return readinessList.filter((r) => r.hamstringFlag && new Date(r.date) >= cutoff).length
}
