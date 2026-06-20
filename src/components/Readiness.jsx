import React, { useState, useEffect } from 'react'
import { Modal, Button, Field, Input, Select } from './ui.jsx'
import { useStore } from '../lib/store.jsx'
import { computeLight } from '../lib/autoRegulation.js'

const RATINGS = [1, 2, 3, 4, 5]

function RatingRow({ label, value, onChange, leftHint, rightHint }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs text-slate-400">
        <span className="font-medium uppercase tracking-wide text-slate-300">{label}</span>
        <span>{leftHint} ←→ {rightHint}</span>
      </div>
      <div className="flex gap-2">
        {RATINGS.map((n) => (
          <button
            key={n}
            onClick={() => onChange(n)}
            className={`flex-1 rounded-xl py-2 text-sm font-semibold ring-1 transition ${
              value === n ? 'bg-sky-600 text-white ring-sky-500' : 'bg-slate-900/60 text-slate-300 ring-slate-700 hover:bg-slate-700/50'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function Readiness({ open, onClose, dateISO }) {
  const { state, saveReadiness, readinessFor, updateConfig } = useStore()
  const source = state.config.wearableSource
  const existing = readinessFor(dateISO)

  const [recoveryScore, setRecoveryScore] = useState('')
  const [restingHr, setRestingHr] = useState('')
  const [hrv, setHrv] = useState('')
  const [sleep, setSleep] = useState(null)
  const [soreness, setSoreness] = useState(null)
  const [energy, setEnergy] = useState(null)
  const [hamstringFlag, setHamstringFlag] = useState(false)

  useEffect(() => {
    if (!open) return
    setRecoveryScore(existing?.recoveryScore ?? '')
    setRestingHr(existing?.restingHr ?? '')
    setHrv(existing?.hrv ?? '')
    setSleep(existing?.sleepRating ?? null)
    setSoreness(existing?.sorenessRating ?? null)
    setEnergy(existing?.energyRating ?? null)
    setHamstringFlag(existing?.hamstringFlag ?? false)
  }, [open, dateISO]) // eslint-disable-line react-hooks/exhaustive-deps

  const draft = {
    date: dateISO,
    source,
    recoveryScore: source !== 'MANUAL' && recoveryScore !== '' ? Number(recoveryScore) : null,
    restingHr: restingHr !== '' ? Number(restingHr) : null,
    restingHrBaseline: state.config.restingHrBaseline ?? null,
    hrv: hrv !== '' ? Number(hrv) : null,
    sleepRating: sleep,
    sorenessRating: soreness,
    energyRating: energy,
    hamstringFlag,
  }
  const light = computeLight(draft)

  function save() {
    saveReadiness({ ...draft, computedLight: light })
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Readiness check-in">
      <div className="space-y-4">
        <Field label="Source">
          <Select value={source} onChange={(e) => updateConfig({ wearableSource: e.target.value })}>
            <option value="MANUAL">Manual (30-second check-in)</option>
            <option value="WHOOP">WHOOP recovery score</option>
            <option value="GARMIN">Garmin recovery/body battery</option>
          </Select>
        </Field>

        {source !== 'MANUAL' && (
          <Field label="Recovery score (0–100)" hint="≥67 green · 34–66 yellow · <34 red">
            <Input type="number" min="0" max="100" value={recoveryScore} onChange={(e) => setRecoveryScore(e.target.value)} />
          </Field>
        )}

        {source === 'MANUAL' && (
          <div className="space-y-3">
            <RatingRow label="Sleep" value={sleep} onChange={setSleep} leftHint="poor" rightHint="great" />
            <RatingRow label="Freshness (legs)" value={soreness} onChange={setSoreness} leftHint="sore" rightHint="fresh" />
            <RatingRow label="Energy / mood" value={energy} onChange={setEnergy} leftHint="flat" rightHint="buzzing" />
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Field label="Resting HR" hint={`baseline ${state.config.restingHrBaseline ?? '–'}`}>
            <Input type="number" value={restingHr} onChange={(e) => setRestingHr(e.target.value)} />
          </Field>
          <Field label="HRV (optional)">
            <Input type="number" value={hrv} onChange={(e) => setHrv(e.target.value)} />
          </Field>
        </div>

        <label
          className={`flex items-center gap-3 rounded-xl px-3 py-3 ring-1 ${
            hamstringFlag ? 'bg-red-500/15 ring-red-500/50' : 'bg-slate-900/60 ring-slate-700'
          }`}
        >
          <input type="checkbox" checked={hamstringFlag} onChange={(e) => setHamstringFlag(e.target.checked)} className="h-5 w-5" />
          <div>
            <div className="text-sm font-semibold text-slate-100">🚩 Hamstring flag</div>
            <div className="text-xs text-slate-400">Any niggle, tightness or "grabbing" → no sprints / plyos / fast running today.</div>
          </div>
        </label>

        <div className="flex items-center justify-between rounded-xl bg-slate-900/60 px-4 py-3">
          <span className="text-sm text-slate-400">Computed light</span>
          <span className="flex items-center gap-2 text-sm font-semibold">
            <span className={`h-3 w-3 rounded-full ${light === 'GREEN' ? 'bg-green-500' : light === 'YELLOW' ? 'bg-amber-500' : light === 'RED' ? 'bg-red-500' : 'bg-slate-500'}`} />
            {light || 'incomplete'}
          </span>
        </div>

        <Button variant="success" className="w-full" onClick={save} disabled={!light}>
          Save check-in
        </Button>
      </div>
    </Modal>
  )
}
