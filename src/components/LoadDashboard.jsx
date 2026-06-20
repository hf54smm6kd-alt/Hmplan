import React, { useState, useMemo } from 'react'
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceArea, ReferenceLine, Legend,
} from 'recharts'
import { useStore } from '../lib/store.jsx'
import { weeklyVolume, loadSeries, speedExposureByWeek } from '../lib/selectors.js'
import { Card, SectionTitle, Pill } from './ui.jsx'

const axis = { stroke: '#64748b', fontSize: 11 }
const grid = '#1e293b'

export default function LoadDashboard() {
  const { state, plan } = useStore()
  const [mode, setMode] = useState('rolling')

  const vol = useMemo(() => weeklyVolume(plan, state), [plan, state])
  const { series, acwr } = useMemo(() => loadSeries(state, mode), [state, mode])
  const speed = useMemo(() => speedExposureByWeek(plan, state), [plan, state])

  const volData = vol.map((v) => ({ name: `W${v.weekNumber}`, planned: v.planned, actual: v.actual }))
  const acwrData = acwr.map((a) => ({ date: a.date.slice(5), acwr: a.acwr }))
  const srpeData = series.map((s) => ({ date: s.date.slice(5), srpe: Math.round(s.load) }))
  const speedData = speed.filter((s) => s.sprintReps > 0 || s.exposures > 0).map((s) => ({ name: `W${s.weekNumber}`, exposures: s.exposures, reps: s.sprintReps }))

  const hasLoad = series.length > 0
  const latestFlags = vol.filter((v) => v.flags.length).slice(-1)[0]

  return (
    <div className="space-y-4">
      <SectionTitle sub="Honest framing: rate-of-change is the signal we trust. ACWR is a descriptive spike flag, not a validated injury predictor (§1.9).">
        Load dashboard
      </SectionTitle>

      {latestFlags && (
        <div className="space-y-2">
          {latestFlags.flags.map((f, i) => (
            <div key={i} className={`rounded-xl px-4 py-2 text-sm ring-1 ${f.level === 'red' ? 'bg-red-500/10 text-red-200 ring-red-500/30' : 'bg-amber-500/10 text-amber-200 ring-amber-500/30'}`}>
              W{latestFlags.weekNumber}: {f.text}
            </div>
          ))}
        </div>
      )}

      <Card className="p-4">
        <div className="mb-2 text-sm font-medium text-slate-300">Weekly volume — planned vs actual (km)</div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={volData} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
            <CartesianGrid stroke={grid} vertical={false} />
            <XAxis dataKey="name" tick={axis} interval={2} />
            <YAxis tick={axis} />
            <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 12, fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="planned" fill="#334155" radius={[3, 3, 0, 0]} />
            <Bar dataKey="actual" fill="#0ea5e9" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-4">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-sm font-medium text-slate-300">ACWR trend <span className="text-xs text-slate-500">(0.8–1.3 shaded guide)</span></div>
          <div className="flex gap-1 rounded-lg bg-slate-900/60 p-1 text-xs">
            {['rolling', 'ewma'].map((m) => (
              <button key={m} onClick={() => setMode(m)} className={`rounded px-2 py-1 ${mode === m ? 'bg-sky-600 text-white' : 'text-slate-300'}`}>
                {m === 'rolling' ? 'Rolling' : 'EWMA'}
              </button>
            ))}
          </div>
        </div>
        {hasLoad ? (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={acwrData} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid stroke={grid} vertical={false} />
              <ReferenceArea y1={0.8} y2={1.3} fill="#22c55e" fillOpacity={0.08} />
              <ReferenceLine y={1.5} stroke="#ef4444" strokeDasharray="4 4" />
              <XAxis dataKey="date" tick={axis} minTickGap={28} />
              <YAxis tick={axis} domain={[0, 2]} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 12, fontSize: 12 }} />
              <Line type="monotone" dataKey="acwr" stroke="#a78bfa" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <EmptyHint />
        )}
        <p className="mt-2 text-xs text-slate-500">Guide, not gospel. Pair it with the week-on-week %Δ flags above — that's the more defensible signal.</p>
      </Card>

      <Card className="p-4">
        <div className="mb-2 text-sm font-medium text-slate-300">Internal load — sRPE (RPE × min)</div>
        {hasLoad ? (
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={srpeData} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid stroke={grid} vertical={false} />
              <XAxis dataKey="date" tick={axis} minTickGap={28} />
              <YAxis tick={axis} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 12, fontSize: 12 }} />
              <Line type="monotone" dataKey="srpe" stroke="#38bdf8" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <EmptyHint />
        )}
      </Card>

      <Card className="p-4">
        <div className="mb-2 text-sm font-medium text-slate-300">
          Speed exposure / week <span className="text-xs text-slate-500">keep ≥1× consistently (§1.7)</span>
        </div>
        {speedData.length ? (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={speedData} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid stroke={grid} vertical={false} />
              <XAxis dataKey="name" tick={axis} />
              <YAxis tick={axis} allowDecimals={false} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 12, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="exposures" fill="#8b5cf6" radius={[3, 3, 0, 0]} name="exposures" />
              <Bar dataKey="reps" fill="#c4b5fd" radius={[3, 3, 0, 0]} name="sprint reps" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <EmptyHint label="Log a Speed Day or match to start the counter." />
        )}
      </Card>
    </div>
  )
}

function EmptyHint({ label = 'Log some sessions (with RPE + duration) to populate this chart.' }) {
  return <div className="flex h-32 items-center justify-center rounded-xl bg-slate-900/40 text-center text-xs text-slate-500">{label}</div>
}
