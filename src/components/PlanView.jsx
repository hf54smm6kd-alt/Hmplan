import React, { useState } from 'react'
import { useStore } from '../lib/store.jsx'
import { fmtDayMonth, parseISO, addDays, weekdayShort } from '../lib/dates.js'
import { metaFor } from '../data/sessionLibrary.js'
import { Card, Pill } from './ui.jsx'
import SessionCard from './SessionCard.jsx'

const PHASE_COLORS = ['#10b981', '#0ea5e9', '#f59e0b', '#eab308']

export default function PlanView({ onLog }) {
  const { state, plan } = useStore()
  const [openWeek, setOpenWeek] = useState(null)

  return (
    <div className="space-y-3">
      {plan.phases.map((phase, pi) => {
        const phaseWeeks = plan.weeks.filter((w) => w.phaseIdx === pi)
        if (!phaseWeeks.length) return null
        return (
          <div key={phase.id}>
            <div className="mb-2 flex items-center gap-2 px-1">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: PHASE_COLORS[pi] }} />
              <span className="text-sm font-semibold text-slate-200">{phase.short}: {phase.name}</span>
              <span className="text-xs text-slate-500">W{phase.startWeek}–{phase.endWeek}</span>
            </div>
            <p className="mb-2 px-1 text-xs text-slate-500">{phase.focus}</p>
            <div className="space-y-2">
              {phaseWeeks.map((week) => {
                const monday = parseISO(week.startDate)
                const isOpen = openWeek === week.weekNumber
                const weekSessions = plan.sessions.filter((s) => s.weekId === week.id)
                return (
                  <Card key={week.id} className="overflow-hidden">
                    <button
                      onClick={() => setOpenWeek(isOpen ? null : week.weekNumber)}
                      className="flex w-full items-center justify-between p-3.5 text-left hover:bg-slate-700/30"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-100">Week {week.weekNumber}</span>
                          <span className="text-xs text-slate-500">{fmtDayMonth(monday)}</span>
                          {week.isDownWeek && <Pill tone="amber">down</Pill>}
                          {week.isTuneUp && <Pill tone="blue">tune-up</Pill>}
                          {week.isRaceWeek && <Pill tone="violet">race</Pill>}
                        </div>
                        <div className="mt-0.5 text-xs text-slate-400">
                          {week.plannedVolumeKm} km · long {week.plannedLongRunKm} km
                        </div>
                      </div>
                      <span className="text-slate-500">{isOpen ? '▲' : '▼'}</span>
                    </button>
                    {isOpen && (
                      <div className="space-y-3 border-t border-slate-700/60 p-3.5">
                        {[0, 1, 2, 3, 4, 5, 6].map((dow) => {
                          const day = addDays(monday, dow)
                          const daySessions = weekSessions.filter((s) => s.dayOffset === dow)
                          return (
                            <div key={dow}>
                              <div className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                                {weekdayShort(day)} {fmtDayMonth(day)}
                              </div>
                              {daySessions.length === 0 ? (
                                <div className="text-xs text-slate-600">—</div>
                              ) : (
                                <div className="space-y-2">
                                  {daySessions.map((s) => (
                                    <SessionCard key={s.id} session={s} onLog={onLog} />
                                  ))}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </Card>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
