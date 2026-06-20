// Training-load math (§3.6). Internal-load currency is sRPE = RPE × minutes,
// summed per day. We expose both rolling-sum and EWMA flavours of acute/chronic
// load, the ACWR ratio, and the simpler (more defensible) week-on-week %Δ flag.
//
// IMPORTANT framing carried into the UI: ACWR is a *descriptive spike flag*, not
// a validated injury predictor (§1.9). Rate-of-change is the signal we trust.

import { isoDate, addDays, diffDays } from './dates.js'

export function sessionSRPE(rpe, durationSec) {
  if (!rpe || !durationSec) return 0
  return rpe * (durationSec / 60)
}

// Build a continuous daily series of load from a sparse map of {isoDate: load}.
// Fills gaps with 0 between the earliest entry (or `from`) and `to`.
export function dailySeries(loadByDate, from, to) {
  const dates = Object.keys(loadByDate).sort()
  if (!dates.length && !from) return []
  const start = from || dates[0]
  const end = to || isoDate(new Date())
  const out = []
  let cursor = start
  let guard = 0
  while (diffDays(cursor, end) <= 0 && guard < 5000) {
    const d = isoDate(cursor)
    out.push({ date: d, load: loadByDate[d] || 0 })
    cursor = addDays(cursor, 1)
    guard++
  }
  return out
}

// Rolling-sum acute (7d) / chronic-average (28d→weekly equivalent) ACWR.
// Chronic is the 28-day average *weekly* load (28-day sum / 4) to keep acute and
// chronic on the same 7-day scale.
export function rollingAcwrSeries(series) {
  return series.map((pt, i) => {
    const acuteWindow = series.slice(Math.max(0, i - 6), i + 1)
    const chronicWindow = series.slice(Math.max(0, i - 27), i + 1)
    const acute = acuteWindow.reduce((s, p) => s + p.load, 0)
    const chronicSum = chronicWindow.reduce((s, p) => s + p.load, 0)
    const chronic = (chronicSum / chronicWindow.length) * 7 // weekly-equivalent
    const acwr = chronic > 0 ? acute / chronic : 0
    return { date: pt.date, acute, chronic, acwr: Number(acwr.toFixed(2)) }
  })
}

// EWMA variant. λ = 2/(N+1). Acute N=7, chronic N=28.
export function ewmaAcwrSeries(series) {
  const lambdaA = 2 / (7 + 1)
  const lambdaC = 2 / (28 + 1)
  let ewmaA = 0
  let ewmaC = 0
  return series.map((pt, i) => {
    if (i === 0) {
      ewmaA = pt.load
      ewmaC = pt.load
    } else {
      ewmaA = pt.load * lambdaA + ewmaA * (1 - lambdaA)
      ewmaC = pt.load * lambdaC + ewmaC * (1 - lambdaC)
    }
    const acwr = ewmaC > 0 ? ewmaA / ewmaC : 0
    return { date: pt.date, ewmaAcute: ewmaA, ewmaChronic: ewmaC, acwr: Number(acwr.toFixed(2)) }
  })
}

export function weekOnWeekPct(thisWeek, lastWeek) {
  if (!lastWeek) return null
  return Math.round(((thisWeek - lastWeek) / lastWeek) * 1000) / 10
}

// Descriptive flags. Honest, non-overclaiming (§2.9/§3.5).
export function loadFlags({ wowPct, acwr }) {
  const flags = []
  if (wowPct != null) {
    if (wowPct > 30) flags.push({ level: 'red', text: `Spike +${wowPct}% — consider holding volume` })
    else if (wowPct > 10) flags.push({ level: 'amber', text: `Ramping +${wowPct}% — fine if intentional` })
  }
  if (acwr != null && acwr > 1.5) flags.push({ level: 'amber', text: `ACWR ${acwr} elevated (rough guide only)` })
  return flags
}
