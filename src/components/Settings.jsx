import React, { useState } from 'react'
import { useStore } from '../lib/store.jsx'
import { formatTime, parseTime } from '../lib/paces.js'
import { Card, SectionTitle, Field, Input, Select, Button, Pill } from './ui.jsx'

export default function Settings() {
  const { state, plan, updateConfig, reset } = useStore()
  const c = state.config
  const [goalStr, setGoalStr] = useState(formatTime(c.goalTimeSec))

  function saveGoal() {
    const sec = parseTime(goalStr)
    if (sec) updateConfig({ goalTimeSec: sec })
  }

  return (
    <div className="space-y-4">
      <SectionTitle sub="Goal, race date, and season-end date drive the whole plan. Changing the season-end re-flows the phases (§2.2).">Settings</SectionTitle>

      <Card className="p-4 space-y-3">
        <div className="text-sm font-semibold text-slate-200">Goal & dates</div>
        <Field label="Goal HM time (h:mm:ss)">
          <div className="flex gap-2">
            <Input value={goalStr} onChange={(e) => setGoalStr(e.target.value)} />
            <Button variant="ghost" onClick={saveGoal}>Set</Button>
          </div>
        </Field>
        <Field label="Race date">
          <Input type="date" value={c.goalRaceDate} onChange={(e) => updateConfig({ goalRaceDate: e.target.value })} />
        </Field>
        <Field label="Plan start (Monday of Week 1)">
          <Input type="date" value={c.startDate} onChange={(e) => updateConfig({ startDate: e.target.value })} />
        </Field>
        <Field label="GAA season-end date" hint="Re-flows the Phase 1→2 boundary. The HM-specific block wants ~14–16 weeks.">
          <Input type="date" value={c.seasonEndDate} onChange={(e) => updateConfig({ seasonEndDate: e.target.value })} />
        </Field>
        <div className="flex flex-wrap gap-2 pt-1">
          {plan.phases.map((p, i) => (
            <Pill key={i}>{p.short}: W{p.startWeek}–{p.endWeek}</Pill>
          ))}
        </div>
      </Card>

      <Card className="p-4 space-y-3">
        <div className="text-sm font-semibold text-slate-200">Training inputs</div>
        <Field label="Readiness source">
          <Select value={c.wearableSource} onChange={(e) => updateConfig({ wearableSource: e.target.value })}>
            <option value="MANUAL">Manual check-in</option>
            <option value="WHOOP">WHOOP</option>
            <option value="GARMIN">Garmin</option>
          </Select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Resting HR baseline"><Input type="number" value={c.restingHrBaseline ?? ''} onChange={(e) => updateConfig({ restingHrBaseline: e.target.value === '' ? null : Number(e.target.value) })} /></Field>
          <Field label="Days/week available"><Input type="number" min="4" max="7" value={c.daysPerWeek} onChange={(e) => updateConfig({ daysPerWeek: Number(e.target.value) })} /></Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Recent race distance (km)"><Input type="number" step="0.1" value={c.recentRaceDistanceKm} onChange={(e) => updateConfig({ recentRaceDistanceKm: Number(e.target.value) })} /></Field>
          <Field label="Recent race time"><Input value={formatTime(c.recentRaceTimeSec)} onChange={(e) => { const s = parseTime(e.target.value); if (s) updateConfig({ recentRaceTimeSec: s }) }} /></Field>
        </div>
      </Card>

      <Card className="p-4 space-y-3">
        <div className="text-sm font-semibold text-slate-200">Athlete profile</div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Weight (kg)"><Input type="number" step="0.1" value={c.weightKg} onChange={(e) => updateConfig({ weightKg: Number(e.target.value) })} /></Field>
          <Field label="Height (cm)"><Input type="number" value={c.heightCm} onChange={(e) => updateConfig({ heightCm: Number(e.target.value) })} /></Field>
        </div>
        <Field label="Max velocity (m/s)" hint="Top of the men's Gaelic-football range — worth protecting (§1.8).">
          <Input type="number" step="0.1" value={c.maxVelocityMs} onChange={(e) => updateConfig({ maxVelocityMs: Number(e.target.value) })} />
        </Field>
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input type="checkbox" checked={c.hamstringHistory} onChange={(e) => updateConfig({ hamstringHistory: e.target.checked })} />
          Recurrent hamstring history (drives the hamstring-aware rules)
        </label>
      </Card>

      <Card className="p-4">
        <div className="mb-2 text-sm font-semibold text-slate-200">Data</div>
        <p className="mb-3 text-xs text-slate-500">Stored locally in your browser. Resetting clears all logs, readiness and tests.</p>
        <Button variant="danger" onClick={() => { if (confirm('Reset all data? This cannot be undone.')) reset() }}>Reset all data</Button>
      </Card>

      <p className="px-1 pb-2 text-center text-[11px] text-slate-600">
        The numbers are starting targets, not commandments — the auto-regulation is what keeps the plan honest against how your body and hamstring actually respond.
      </p>
    </div>
  )
}
