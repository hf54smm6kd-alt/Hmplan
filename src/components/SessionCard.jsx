import React, { useState } from 'react'
import { metaFor } from '../data/sessionLibrary.js'
import { Pill } from './ui.jsx'
import { useStore } from '../lib/store.jsx'
import { zoneTables } from '../lib/selectors.js'
import { formatPace } from '../lib/paces.js'

const STATUS_TONE = { DONE: 'green', MODIFIED: 'amber', SKIPPED: 'red', PLANNED: 'slate' }

function zoneBand(zonesArr, key) {
  if (!zonesArr || !key) return null
  const z = zonesArr.find((x) => x.key === key)
  if (!z) return null
  if (z.text) return z.text
  if (z.fast == null) return null
  if (z.fast === z.slow) return `${formatPace(z.fast)}/km`
  return `${formatPace(z.fast)}–${formatPace(z.slow)}/km`
}

export default function SessionCard({ session, onLog, compact, defaultOpen = false }) {
  const { state, getLog } = useStore()
  const meta = metaFor(session.type)
  const log = getLog(session)
  const status = log?.status || 'PLANNED'
  const [showPlan, setShowPlan] = useState(defaultOpen)
  const [showWhy, setShowWhy] = useState(false)

  const tables = zoneTables(state)
  const paceText = zoneBand(tables.current || tables.goal, meta.zone)
  const paceIsCurrent = !!tables.current

  const fill = (body) => body.replace('{km}', session.plannedKm != null ? session.plannedKm : '—')

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
            {paceText && <Pill tone="violet">{paceText}</Pill>}
            {status !== 'PLANNED' && <Pill tone={STATUS_TONE[status]}>{status.toLowerCase()}</Pill>}
          </div>

          {!compact && session.plannedDetail && <p className="mt-1 text-sm text-slate-400">{session.plannedDetail}</p>}

          {!compact && meta.prescription?.length > 0 && (
            <>
              <button onClick={() => setShowPlan((v) => !v)} className="mt-2 text-xs font-medium text-sky-400 hover:text-sky-300">
                {showPlan ? '▾ Session plan' : '▸ Show session plan'}
              </button>
              {showPlan && (
                <ol className="mt-2 space-y-1.5">
                  {meta.prescription.map((step, i) => (
                    <li key={i} className="rounded-xl bg-slate-900/50 px-3 py-2 text-sm">
                      <span className="font-semibold text-slate-200">{step.title}: </span>
                      <span className="text-slate-300">{fill(step.body)}</span>
                    </li>
                  ))}
                  {paceText && (
                    <li className="px-3 text-xs text-slate-500">
                      Target pace ({paceIsCurrent ? 'current fitness' : 'goal'}): <span className="text-violet-300">{paceText}</span>
                    </li>
                  )}
                </ol>
              )}
            </>
          )}

          {!compact && (
            <button onClick={() => setShowWhy((v) => !v)} className="mt-2 ml-3 text-xs text-slate-500 hover:text-slate-300">
              {showWhy ? 'Hide why' : 'Why this session?'}
            </button>
          )}
          {showWhy && <p className="mt-2 rounded-xl bg-slate-900/50 p-3 text-xs leading-relaxed text-slate-300">{meta.why}</p>}

          {log?.run?.distanceKm != null && (
            <p className="mt-2 text-xs text-slate-400">
              Logged: {log.run.distanceKm} km{log.run.avgPaceSecPerKm ? ` @ ${formatPace(log.run.avgPaceSecPerKm)}/km` : ''}
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
