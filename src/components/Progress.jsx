import React, { useMemo } from 'react'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from 'recharts'
import { useStore } from '../lib/store.jsx'
import { onTrack } from '../lib/selectors.js'
import { formatTime, formatPace, paceSecPerKm } from '../lib/paces.js'
import { Card, SectionTitle, StatTile, Pill, Button } from './ui.jsx'

const axis = { stroke: '#64748b', fontSize: 11 }

const VERDICT = {
  'on-track': { tone: 'green', text: 'On track for 1:21 — hold the build.' },
  close: { tone: 'amber', text: 'Close — 1:23–1:24 looks like the realistic day; keep building.' },
  stretch: { tone: 'red', text: 'Stretch — race to current fitness, don\'t over-pace off the goal.' },
}

export default function Progress() {
  const { state, plan, removeTest } = useStore()
  const ot = onTrack(state)

  // Pace progression from logged quality efforts + tests.
  const paceData = useMemo(() => {
    const pts = []
    for (const [key, log] of Object.entries(state.logs || {})) {
      const [date, type] = key.split('|')
      if (log?.run?.avgPaceSecPerKm && ['THRESHOLD', 'HM_PACE', 'RACE', 'TEMPO'].includes(type)) {
        pts.push({ date, pace: Math.round(log.run.avgPaceSecPerKm), label: type })
      }
    }
    for (const t of state.tests || []) {
      pts.push({ date: t.date, pace: Math.round(paceSecPerKm(t.timeSec, t.distanceKm)), label: t.type })
    }
    return pts.sort((a, b) => a.date.localeCompare(b.date)).map((p) => ({ ...p, d: p.date.slice(5) }))
  }, [state.logs, state.tests])

  // Strength history (heavy lower + Nordics) from logged strength sessions.
  const strengthRows = useMemo(() => {
    const rows = []
    for (const [key, log] of Object.entries(state.logs || {})) {
      if (!log?.strength?.exercises) continue
      const date = key.split('|')[0]
      for (const ex of log.strength.exercises) {
        const top = (ex.sets || []).reduce((m, s) => (Number(s.loadKg) > (m?.load || 0) ? { load: Number(s.loadKg), reps: s.reps, rpe: s.rpe } : m), null)
        if (ex.name && top) rows.push({ date, name: ex.name, ...top })
      }
    }
    return rows.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 12)
  }, [state.logs])

  const goalPace = paceSecPerKm(state.config.goalTimeSec, 21.0975)

  return (
    <div className="space-y-4">
      <SectionTitle sub="Riegel projection vs the 1:21 goal — updates after every logged tune-up (§3.4).">Progress & tests</SectionTitle>

      {ot ? (
        <>
          <div className="grid grid-cols-2 gap-3">
            <StatTile label="Projected HM" value={formatTime(ot.projected)} sub={`from ${ot.basis.source}`} tone={VERDICT[ot.verdict].tone} />
            <StatTile label="vs goal 1:21" value={`${ot.deltaSec >= 0 ? '+' : ''}${formatTime(Math.abs(ot.deltaSec))}`} sub={ot.deltaSec >= 0 ? 'behind goal' : 'ahead of goal'} tone={VERDICT[ot.verdict].tone} />
          </div>
          <div className={`rounded-xl px-4 py-3 text-sm ring-1 ${
            VERDICT[ot.verdict].tone === 'green' ? 'bg-green-500/10 text-green-200 ring-green-500/30' :
            VERDICT[ot.verdict].tone === 'amber' ? 'bg-amber-500/10 text-amber-200 ring-amber-500/30' :
            'bg-red-500/10 text-red-200 ring-red-500/30'
          }`}>
            {VERDICT[ot.verdict].text}
          </div>
        </>
      ) : (
        <Card className="p-4 text-sm text-slate-400">Add a recent race in the Pace calculator to see your projected HM time.</Card>
      )}

      <Card className="p-4">
        <div className="mb-2 text-sm font-medium text-slate-300">Pace progression (toward goal)</div>
        {paceData.length ? (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={paceData} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
              <CartesianGrid stroke="#1e293b" vertical={false} />
              <ReferenceLine y={Math.round(goalPace)} stroke="#22c55e" strokeDasharray="4 4" label={{ value: 'goal', fill: '#22c55e', fontSize: 10 }} />
              <XAxis dataKey="d" tick={axis} minTickGap={20} />
              <YAxis tick={axis} domain={['dataMin - 10', 'dataMax + 10']} reversed tickFormatter={(v) => formatPace(v)} width={44} />
              <Tooltip formatter={(v) => `${formatPace(v)}/km`} contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 12, fontSize: 12 }} />
              <Line type="monotone" dataKey="pace" stroke="#38bdf8" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-28 items-center justify-center text-xs text-slate-500">Log threshold/HM-pace runs or tune-ups to chart pace over time.</div>
        )}
      </Card>

      <Card className="p-4">
        <div className="mb-2 text-sm font-medium text-slate-300">Tune-ups / tests</div>
        {state.tests?.length ? (
          <div className="space-y-2">
            {[...state.tests].sort((a, b) => b.date.localeCompare(a.date)).map((t) => (
              <div key={t.id} className="flex items-center justify-between rounded-lg bg-slate-900/40 px-3 py-2 text-sm">
                <span className="text-slate-200">{t.date} · {t.distanceKm}k · {formatTime(t.timeSec)}</span>
                <div className="flex items-center gap-2">
                  <Pill>{formatPace(paceSecPerKm(t.timeSec, t.distanceKm))}/km</Pill>
                  <button onClick={() => removeTest(t.id)} className="text-slate-500 hover:text-red-400">✕</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">No tests yet. The W25 10k tune-up is the big one — ~37:00–38:00 tracks toward 1:21.</p>
        )}
      </Card>

      <Card className="p-4">
        <div className="mb-1 text-sm font-medium text-slate-300">Strength log (heavy lower + Nordics)</div>
        <p className="mb-3 text-xs text-slate-500">Keep the main compound ≥80% 1RM — heavy load is what maintains strength on low volume (§1.5).</p>
        {strengthRows.length ? (
          <div className="space-y-1.5">
            {strengthRows.map((r, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg bg-slate-900/40 px-3 py-1.5 text-sm">
                <span className="text-slate-300">{r.date} · {r.name}</span>
                <span className="text-slate-400">{r.load ? `${r.load} kg` : ''} {r.reps ? `× ${r.reps}` : ''} {r.rpe ? `@${r.rpe}` : ''}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">Log a Speed Day or lower-strength session to start tracking.</p>
        )}
      </Card>
    </div>
  )
}
