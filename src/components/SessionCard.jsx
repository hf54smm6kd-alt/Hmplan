import React, { useState } from 'react'
import { metaFor } from '../data/sessionLibrary.js'
import { Pill } from './ui.jsx'
import { useStore } from '../lib/store.jsx'

const STATUS_TONE = { DONE: 'green', MODIFIED: 'amber', SKIPPED: 'red', PLANNED: 'slate' }

export default function SessionCard({ session, onLog, compact }) {
  const { getLog } = useStore()
  const meta = metaFor(session.type)
  const log = getLog(session)
  const status = log?.status || 'PLANNED'
  const [showWhy, setShowWhy] = useState(false)

  return (
    <div className="rounded-2xl bg-slate-800/60 p-4 ring-1 ring-slate-700/60">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg" style={{ background: `${meta.color}22` }}>
          {meta.icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-slate-100">{meta.label}</span>
            {session.plannedKm ? <Pill tone="blue">{session.plannedKm} km</Pill> : null}
            {status !== 'PLANNED' && <Pill tone={STATUS_TONE[status]}>{status.toLowerCase()}</Pill>}
          </div>
          {!compact && session.plannedDetail && <p className="mt-1 text-sm text-slate-400">{session.plannedDetail}</p>}
          {!compact && (
            <button onClick={() => setShowWhy((v) => !v)} className="mt-2 text-xs text-sky-400 hover:text-sky-300">
              {showWhy ? 'Hide rationale' : 'Explain this session'}
            </button>
          )}
          {showWhy && <p className="mt-2 rounded-xl bg-slate-900/50 p-3 text-xs leading-relaxed text-slate-300">{meta.why}</p>}
          {log?.run?.distanceKm != null && (
            <p className="mt-2 text-xs text-slate-400">
              Logged: {log.run.distanceKm} km{log.run.avgPaceSecPerKm ? ` @ ${Math.floor(log.run.avgPaceSecPerKm / 60)}:${String(Math.round(log.run.avgPaceSecPerKm % 60)).padStart(2, '0')}/km` : ''}
            </p>
          )}
        </div>
        {onLog && (
          <button onClick={() => onLog(session)} className="shrink-0 rounded-xl bg-slate-700/60 px-3 py-1.5 text-sm text-slate-100 hover:bg-slate-600/60">
            Log
          </button>
        )}
      </div>
    </div>
  )
}
