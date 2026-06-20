import React, { useState } from 'react'
import { useStore } from '../lib/store.jsx'
import { zoneTables } from '../lib/selectors.js'
import { formatPace, formatTime, parseTime } from '../lib/paces.js'
import { Card, SectionTitle, Field, Input, Select, Button, Pill } from './ui.jsx'

const DISTANCES = [
  { label: '5k', km: 5 },
  { label: '10k', km: 10 },
  { label: 'parkrun (5k)', km: 5 },
  { label: 'Half (21.1k)', km: 21.0975 },
]

export default function PaceCalculator() {
  const { state, updateConfig, addTest } = useStore()
  const tables = zoneTables(state)
  const [dist, setDist] = useState(10)
  const [time, setTime] = useState('')

  function applyAsCurrent() {
    const sec = parseTime(time)
    if (!sec) return
    updateConfig({ recentRaceDistanceKm: Number(dist), recentRaceTimeSec: sec })
    setTime('')
  }
  function logAsTest() {
    const sec = parseTime(time)
    if (!sec) return
    addTest({ date: new Date().toISOString().slice(0, 10), type: Number(dist) === 5 ? '5k_TT' : Number(dist) === 10 ? '10k_TT' : 'race', distanceKm: Number(dist), timeSec: sec })
    setTime('')
  }

  return (
    <div className="space-y-4">
      <SectionTitle sub="Goal-anchored vs current-fitness paces, side by side. After the W25 tune-up, drive everything off the current result (§2.8).">
        Pace calculator
      </SectionTitle>

      <Card className="p-4">
        <div className="mb-3 text-sm text-slate-300">
          Anchored to:{' '}
          {tables.basis ? (
            <Pill tone="blue">{tables.basis.source} · {tables.basis.distanceKm}k in {formatTime(tables.basis.timeSec)}</Pill>
          ) : (
            <Pill tone="amber">no current result yet</Pill>
          )}
        </div>
        {tables.currentHmTime && (
          <div className="mb-3 rounded-xl bg-slate-900/50 p-3 text-sm text-slate-300">
            Riegel-projected HM off current fitness:{' '}
            <span className="font-semibold text-sky-300">{formatTime(tables.currentHmTime)}</span>{' '}
            <span className="text-slate-500">(goal {formatTime(state.config.goalTimeSec)})</span>
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Distance">
            <Select value={dist} onChange={(e) => setDist(e.target.value)}>
              {DISTANCES.map((d) => (
                <option key={d.label} value={d.km}>{d.label}</option>
              ))}
            </Select>
          </Field>
          <Field label="Time (mm:ss / h:mm:ss)">
            <Input value={time} placeholder="39:30" onChange={(e) => setTime(e.target.value)} />
          </Field>
        </div>
        <div className="mt-3 flex gap-2">
          <Button className="flex-1" onClick={applyAsCurrent} disabled={!parseTime(time)}>Set as current</Button>
          <Button variant="ghost" onClick={logAsTest} disabled={!parseTime(time)}>Log as test</Button>
        </div>
      </Card>

      <Card className="p-4">
        <div className="mb-3 grid grid-cols-[1.4fr,1fr,1fr] gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <span>Zone</span>
          <span className="text-right">Current</span>
          <span className="text-right">Goal (1:21)</span>
        </div>
        <div className="space-y-1.5">
          {tables.goal.map((gz, i) => {
            const cz = tables.current ? tables.current[i] : null
            return (
              <div key={gz.key} className="grid grid-cols-[1.4fr,1fr,1fr] items-center gap-2 rounded-lg bg-slate-900/40 px-3 py-2">
                <div>
                  <div className="text-sm font-medium text-slate-200">{gz.label}</div>
                  <div className="text-[11px] text-slate-500">{gz.use}</div>
                </div>
                <div className="text-right text-sm text-slate-300">{cz ? zoneText(cz) : '–'}</div>
                <div className="text-right text-sm font-semibold text-sky-300">{zoneText(gz)}</div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}

function zoneText(z) {
  if (z.text) return z.text
  if (z.fast === z.slow) return `${formatPace(z.fast)}`
  return `${formatPace(z.fast)}–${formatPace(z.slow)}`
}
