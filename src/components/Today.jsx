import React, { useState, useMemo } from 'react'
import { useStore, todayISO } from '../lib/store.jsx'
import { fmtShort, parseISO, isoDate, addDays, diffDays, weekNumberFor } from '../lib/dates.js'
import { recommend, hamstringFlagStreak } from '../lib/autoRegulation.js'
import { metaFor } from '../data/sessionLibrary.js'
import { Card, Button, Pill, LIGHT_STYLES } from './ui.jsx'
import SessionCard from './SessionCard.jsx'

const ACTION_TONE = { AS_PLANNED: 'green', TRIM: 'amber', DOWNGRADE: 'amber', CONVERT: 'red' }

export default function Today({ onLog, onCheckIn }) {
  const { state, plan, readinessFor } = useStore()
  const start = plan.startDate
  const race = state.config.goalRaceDate

  const clampToday = useMemo(() => {
    const t = todayISO()
    if (diffDays(t, start) < 0) return start
    if (diffDays(t, race) > 0) return race
    return t
  }, [start, race])

  const [date, setDate] = useState(clampToday)

  const sessions = plan.sessions.filter((s) => s.date === date).sort((a, b) => a.dayOffset - b.dayOffset)
  const weekNum = weekNumberFor(parseISO(date), start)
  const week = plan.weeks.find((w) => w.weekNumber === weekNum)
  const phase = week ? plan.phases[week.phaseIdx] : plan.phases[0]
  const readiness = readinessFor(date)
  const light = readiness?.computedLight
  const daysToRace = diffDays(race, date)
  const hamStreak = hamstringFlagStreak(state.readiness, date, 10)

  const beforeStart = diffDays(todayISO(), start) < 0

  return (
    <div className="space-y-4">
      {/* date + phase header */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <button onClick={() => setDate(isoDate(addDays(date, -1)))} className="rounded-lg px-2 py-1 text-slate-400 hover:bg-slate-700">‹</button>
          <div className="text-center">
            <div className="text-lg font-semibold text-slate-100">{fmtShort(date)}</div>
            <div className="text-xs text-slate-400">
              Week {weekNum} · {phase?.short} · {phase?.name}
            </div>
          </div>
          <button onClick={() => setDate(isoDate(addDays(date, 1)))} className="rounded-lg px-2 py-1 text-slate-400 hover:bg-slate-700">›</button>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          {date !== clampToday && (
            <Button variant="subtle" onClick={() => setDate(clampToday)}>Jump to today</Button>
          )}
          <Pill tone="violet">{daysToRace} days to race</Pill>
          {week?.isDownWeek && <Pill tone="amber">down week</Pill>}
          {week?.isTuneUp && <Pill tone="blue">tune-up week</Pill>}
          {phase?.runRole === 'secondary' && <Pill>GAA priority</Pill>}
        </div>
        {beforeStart && (
          <p className="mt-3 rounded-xl bg-slate-900/50 p-2 text-center text-xs text-slate-400">
            Plan begins {fmtShort(start)}. Showing day 1 — log a readiness check-in any time.
          </p>
        )}
      </Card>

      {/* readiness */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-slate-300">Readiness</div>
            {light ? (
              <div className={`mt-1 flex items-center gap-2 text-sm font-semibold ${LIGHT_STYLES[light].text}`}>
                <span className={`h-3 w-3 rounded-full ${LIGHT_STYLES[light].dot}`} />
                {LIGHT_STYLES[light].label}
                {readiness?.hamstringFlag && <Pill tone="red">🚩 hamstring</Pill>}
              </div>
            ) : (
              <div className="mt-1 text-sm text-slate-500">No check-in yet</div>
            )}
          </div>
          <Button onClick={() => onCheckIn(date)}>{light ? 'Update' : 'Check in'}</Button>
        </div>
        {hamStreak >= 2 && (
          <p className="mt-3 rounded-xl bg-red-500/15 p-3 text-xs text-red-200 ring-1 ring-red-500/40">
            ⚠️ {hamStreak} hamstring flags in the last 10 days. Pull back the next Speed Day's sprint volume and bias toward eccentric strength + easy running until clear (§2.9).
          </p>
        )}
      </Card>

      {/* sessions with auto-regulation */}
      {sessions.length === 0 && (
        <Card className="p-6 text-center text-slate-400">Rest day — nothing scheduled.</Card>
      )}
      {sessions.map((session) => {
        const rec = recommend(session, readiness)
        const recMeta = rec && rec.type !== session.type ? metaFor(rec.type) : null
        return (
          <div key={session.id} className="space-y-2">
            <SessionCard session={session} onLog={onLog} />
            {rec && rec.action !== 'AS_PLANNED' && (
              <div className={`rounded-xl px-4 py-3 text-sm ring-1 ${
                ACTION_TONE[rec.action] === 'red' ? 'bg-red-500/10 text-red-200 ring-red-500/30' :
                'bg-amber-500/10 text-amber-200 ring-amber-500/30'
              }`}>
                <span className="font-semibold">
                  {rec.action === 'CONVERT' && `→ Convert to ${recMeta?.label || rec.type}`}
                  {rec.action === 'DOWNGRADE' && `→ Downgrade to ${recMeta?.label || rec.type}`}
                  {rec.action === 'TRIM' && `→ Trim hard volume ~${rec.trimPct}%`}
                </span>
                <div className="mt-0.5 opacity-90">{rec.reason}</div>
              </div>
            )}
            {rec && rec.action === 'AS_PLANNED' && light && (
              <div className="rounded-xl bg-green-500/10 px-4 py-2 text-xs text-green-200 ring-1 ring-green-500/30">{rec.reason}</div>
            )}
          </div>
        )
      })}
    </div>
  )
}
