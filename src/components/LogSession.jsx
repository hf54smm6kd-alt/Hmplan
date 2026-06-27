import React, { useState, useEffect } from 'react'
import { Modal, Button, Field, Input, Select } from './ui.jsx'
import { metaFor } from '../data/sessionLibrary.js'
import { parseTime, formatTime, formatPace, paceSecPerKm } from '../lib/paces.js'
import { useStore } from '../lib/store.jsx'

const RUN_TYPES = ['EASY', 'RECOVERY', 'LONG_RUN', 'THRESHOLD', 'HM_PACE', 'VO2MAX', 'STRIDES', 'CROSS_TRAIN', 'RACE', 'TEST']
const STRENGTH_TYPES = ['STRENGTH_LOWER', 'STRENGTH_UPPER']
const SPRINT_TYPES = ['SPEED_DAY', 'PLYO']

const blankSet = () => ({ reps: '', loadKg: '', rpe: '' })

export default function LogSession({ session, open, onClose }) {
  const { state, getLog, setLog, setStatus, addTest } = useStore()
  const existing = session ? getLog(session) : null
  const meta = session ? metaFor(session.type) : null

  const [tab, setTab] = useState('run')
  const [run, setRun] = useState({ distanceKm: '', time: '', avgHr: '', maxHr: '', rpe: '' })
  const [strength, setStrength] = useState({ exercises: [{ name: '', sets: [blankSet()] }], durationMin: '', rpe: '' })
  const [sprint, setSprint] = useState({ kind: 'FLYING', reps: '', flyDistanceM: '', footContacts: '', maxVelocityMs: '', hamstringOk: true, durationMin: '', rpe: '' })
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (!session) return
    setNotes(existing?.notes || '')
    if (existing?.run) {
      const r = existing.run
      setRun({ distanceKm: r.distanceKm ?? '', time: r.durationSec ? formatTime(r.durationSec) : '', avgHr: r.avgHr ?? '', maxHr: r.maxHr ?? '', rpe: r.rpe ?? '' })
    } else setRun({ distanceKm: session.plannedKm ?? '', time: '', avgHr: '', maxHr: '', rpe: '' })
    if (existing?.strength) setStrength({ ...existing.strength, durationMin: existing.strength.durationSec ? Math.round(existing.strength.durationSec / 60) : '' })
    if (existing?.sprint) setSprint({ ...existing.sprint, durationMin: existing.sprint.durationSec ? Math.round(existing.sprint.durationSec / 60) : '' })
    // Default tab from session type (falls back to strength for days with no
    // run/sprint, e.g. rest days used to log split-out prehab).
    if (SPRINT_TYPES.includes(session.type)) setTab('sprint')
    else if (STRENGTH_TYPES.includes(session.type)) setTab('strength')
    else if (RUN_TYPES.includes(session.type)) setTab('run')
    else setTab('strength')
  }, [session?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!session) return null

  const runSecs = parseTime(run.time)
  const pace = runSecs && run.distanceKm ? paceSecPerKm(runSecs, Number(run.distanceKm)) : null

  function saveRun(markDone = true) {
    const distKm = run.distanceKm === '' ? null : Number(run.distanceKm)
    setLog(session, {
      run: {
        distanceKm: distKm,
        durationSec: runSecs,
        avgPaceSecPerKm: pace,
        avgHr: run.avgHr === '' ? null : Number(run.avgHr),
        maxHr: run.maxHr === '' ? null : Number(run.maxHr),
        rpe: run.rpe === '' ? null : Number(run.rpe),
      },
      notes,
      status: markDone ? 'DONE' : existing?.status || 'PLANNED',
    })
    // A scheduled test/race auto-creates a TestResult so paces recalibrate.
    if ((session.type === 'TEST' || session.type === 'RACE') && distKm && runSecs) {
      const dup = (state.tests || []).some((t) => t.date === session.date && Math.abs(t.distanceKm - distKm) < 0.1)
      if (!dup) {
        const type = Math.abs(distKm - 5) < 0.3 ? '5k_TT' : Math.abs(distKm - 10) < 0.3 ? '10k_TT' : distKm > 20 ? 'race' : 'race'
        addTest({ date: session.date, type, distanceKm: distKm, timeSec: runSecs })
      }
    }
    onClose()
  }

  function saveStrength(markDone = true) {
    setLog(session, {
      strength: {
        exercises: strength.exercises,
        durationSec: strength.durationMin ? Number(strength.durationMin) * 60 : null,
        rpe: strength.rpe === '' ? null : Number(strength.rpe),
      },
      notes,
      status: markDone ? 'DONE' : existing?.status || 'PLANNED',
    })
    onClose()
  }

  function saveSprint(markDone = true) {
    setLog(session, {
      sprint: {
        kind: sprint.kind,
        reps: sprint.reps === '' ? null : Number(sprint.reps),
        flyDistanceM: sprint.flyDistanceM === '' ? null : Number(sprint.flyDistanceM),
        footContacts: sprint.footContacts === '' ? null : Number(sprint.footContacts),
        maxVelocityMs: sprint.maxVelocityMs === '' ? null : Number(sprint.maxVelocityMs),
        hamstringOk: sprint.hamstringOk,
        durationSec: sprint.durationMin ? Number(sprint.durationMin) * 60 : null,
        rpe: sprint.rpe === '' ? null : Number(sprint.rpe),
      },
      notes,
      status: markDone ? 'DONE' : existing?.status || 'PLANNED',
    })
    onClose()
  }

  const availTabs = []
  if (RUN_TYPES.includes(session.type)) availTabs.push('run')
  if (session.type === 'SPEED_DAY' || SPRINT_TYPES.includes(session.type)) availTabs.push('sprint')
  // Strength/accessory can be logged on ANY day — this is what lets you split a
  // session (e.g. front squat + sliders one day, the prehab circuit on another).
  availTabs.push('strength')

  return (
    <Modal open={open} onClose={onClose} title={`Log · ${meta.label}`} wide>
      <div className="mb-4 text-sm text-slate-400">{meta.detail}</div>

      {availTabs.length > 1 && (
        <div className="mb-4 flex gap-1 rounded-xl bg-slate-900/60 p-1">
          {availTabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 rounded-lg px-3 py-1.5 text-sm font-medium capitalize ${tab === t ? 'bg-sky-600 text-white' : 'text-slate-300 hover:bg-slate-700/50'}`}
            >
              {t === 'run' ? 'Run' : t === 'sprint' ? 'Sprint / Plyo' : 'Strength'}
            </button>
          ))}
        </div>
      )}

      {tab === 'run' && availTabs.includes('run') && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Distance (km)">
              <Input type="number" inputMode="decimal" step="0.1" value={run.distanceKm} onChange={(e) => setRun({ ...run, distanceKm: e.target.value })} />
            </Field>
            <Field label="Time (mm:ss / h:mm:ss)">
              <Input value={run.time} placeholder="42:30" onChange={(e) => setRun({ ...run, time: e.target.value })} />
            </Field>
          </div>
          <div className="rounded-xl bg-slate-900/50 px-3 py-2 text-sm text-slate-300">
            Avg pace: <span className="font-semibold text-sky-300">{pace ? `${formatPace(pace)} /km` : '–'}</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Avg HR"><Input type="number" value={run.avgHr} onChange={(e) => setRun({ ...run, avgHr: e.target.value })} /></Field>
            <Field label="Max HR"><Input type="number" value={run.maxHr} onChange={(e) => setRun({ ...run, maxHr: e.target.value })} /></Field>
            <Field label="RPE (1–10)"><Input type="number" min="1" max="10" value={run.rpe} onChange={(e) => setRun({ ...run, rpe: e.target.value })} /></Field>
          </div>
          <Field label="Notes"><Input value={notes} onChange={(e) => setNotes(e.target.value)} /></Field>
          {(session.type === 'TEST' || session.type === 'RACE') && (
            <p className="rounded-xl bg-amber-500/10 px-3 py-2 text-xs text-amber-200 ring-1 ring-amber-500/30">
              Saving this logs it as a test result — your current-fitness paces and projected HM time recalibrate automatically.
            </p>
          )}
          <div className="flex gap-2 pt-1">
            <Button variant="success" className="flex-1" onClick={() => saveRun(true)}>Save & mark done</Button>
            <Button variant="ghost" onClick={() => saveRun(false)}>Save draft</Button>
          </div>
        </div>
      )}

      {tab === 'sprint' && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Type">
              <Select value={sprint.kind} onChange={(e) => setSprint({ ...sprint, kind: e.target.value })}>
                <option value="FLYING">Flying sprints</option>
                <option value="HILL">Hill sprints</option>
                <option value="SLED">Sled</option>
              </Select>
            </Field>
            <Field label="Reps"><Input type="number" value={sprint.reps} onChange={(e) => setSprint({ ...sprint, reps: e.target.value })} /></Field>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Fly dist (m)"><Input type="number" value={sprint.flyDistanceM} onChange={(e) => setSprint({ ...sprint, flyDistanceM: e.target.value })} /></Field>
            <Field label="Foot contacts (plyo)"><Input type="number" value={sprint.footContacts} onChange={(e) => setSprint({ ...sprint, footContacts: e.target.value })} /></Field>
            <Field label="Max vel (m/s)"><Input type="number" step="0.1" value={sprint.maxVelocityMs} onChange={(e) => setSprint({ ...sprint, maxVelocityMs: e.target.value })} /></Field>
          </div>
          <label className="flex items-center gap-2 rounded-xl bg-slate-900/50 px-3 py-2 text-sm">
            <input type="checkbox" checked={sprint.hamstringOk} onChange={(e) => setSprint({ ...sprint, hamstringOk: e.target.checked })} />
            <span className="text-slate-300">Hamstrings felt good (no grab/tightness)</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Session minutes"><Input type="number" value={sprint.durationMin} onChange={(e) => setSprint({ ...sprint, durationMin: e.target.value })} /></Field>
            <Field label="RPE (1–10)"><Input type="number" min="1" max="10" value={sprint.rpe} onChange={(e) => setSprint({ ...sprint, rpe: e.target.value })} /></Field>
          </div>
          <Field label="Notes"><Input value={notes} onChange={(e) => setNotes(e.target.value)} /></Field>
          <div className="flex gap-2 pt-1">
            <Button variant="success" className="flex-1" onClick={() => saveSprint(true)}>Save & mark done</Button>
            <Button variant="ghost" onClick={() => saveSprint(false)}>Save draft</Button>
          </div>
        </div>
      )}

      {tab === 'strength' && (
        <div className="space-y-3">
          {strength.exercises.map((ex, ei) => (
            <div key={ei} className="rounded-xl bg-slate-900/50 p-3">
              <div className="mb-2 flex items-center gap-2">
                <Input
                  placeholder="Exercise (e.g. Front squat, sliders, Copenhagen)"
                  value={ex.name}
                  onChange={(e) => {
                    const exercises = [...strength.exercises]
                    exercises[ei] = { ...ex, name: e.target.value }
                    setStrength({ ...strength, exercises })
                  }}
                />
                {strength.exercises.length > 1 && (
                  <button
                    className="rounded-lg px-2 text-slate-400 hover:text-red-400"
                    onClick={() => setStrength({ ...strength, exercises: strength.exercises.filter((_, i) => i !== ei) })}
                  >
                    ✕
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {ex.sets.map((st, si) => (
                  <div key={si} className="grid grid-cols-3 gap-2">
                    <Input placeholder="reps" type="number" value={st.reps} onChange={(e) => updateSet(ei, si, 'reps', e.target.value)} />
                    <Input placeholder="kg" type="number" value={st.loadKg} onChange={(e) => updateSet(ei, si, 'loadKg', e.target.value)} />
                    <Input placeholder="RPE" type="number" value={st.rpe} onChange={(e) => updateSet(ei, si, 'rpe', e.target.value)} />
                  </div>
                ))}
                <button
                  className="text-xs text-sky-400 hover:text-sky-300"
                  onClick={() => {
                    const exercises = [...strength.exercises]
                    exercises[ei] = { ...ex, sets: [...ex.sets, blankSet()] }
                    setStrength({ ...strength, exercises })
                  }}
                >
                  + add set
                </button>
              </div>
            </div>
          ))}
          <button
            className="text-sm text-sky-400 hover:text-sky-300"
            onClick={() => setStrength({ ...strength, exercises: [...strength.exercises, { name: '', sets: [blankSet()] }] })}
          >
            + add exercise
          </button>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Session minutes"><Input type="number" value={strength.durationMin} onChange={(e) => setStrength({ ...strength, durationMin: e.target.value })} /></Field>
            <Field label="RPE (1–10)"><Input type="number" min="1" max="10" value={strength.rpe} onChange={(e) => setStrength({ ...strength, rpe: e.target.value })} /></Field>
          </div>
          <Field label="Notes"><Input value={notes} onChange={(e) => setNotes(e.target.value)} /></Field>
          <div className="flex gap-2 pt-1">
            <Button variant="success" className="flex-1" onClick={() => saveStrength(true)}>Save & mark done</Button>
            <Button variant="ghost" onClick={() => saveStrength(false)}>Save draft</Button>
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-slate-700 pt-3 text-sm">
        <span className="text-slate-400">Quick status:</span>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => { setStatus(session, 'DONE'); onClose() }}>Done</Button>
          <Button variant="subtle" onClick={() => { setStatus(session, 'MODIFIED'); onClose() }}>Modified</Button>
          <Button variant="subtle" onClick={() => { setStatus(session, 'SKIPPED'); onClose() }}>Skipped</Button>
        </div>
      </div>
    </Modal>
  )

  function updateSet(ei, si, field, value) {
    const exercises = [...strength.exercises]
    const sets = [...exercises[ei].sets]
    sets[si] = { ...sets[si], [field]: value }
    exercises[ei] = { ...exercises[ei], sets }
    setStrength({ ...strength, exercises })
  }
}
