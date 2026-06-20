import React, { useState } from 'react'
import { useStore } from './lib/store.jsx'
import { diffDays } from './lib/dates.js'
import { todayISO } from './lib/store.jsx'
import Today from './components/Today.jsx'
import PlanView from './components/PlanView.jsx'
import LoadDashboard from './components/LoadDashboard.jsx'
import PaceCalculator from './components/PaceCalculator.jsx'
import Progress from './components/Progress.jsx'
import Settings from './components/Settings.jsx'
import LogSession from './components/LogSession.jsx'
import Readiness from './components/Readiness.jsx'

const TABS = [
  { id: 'today', label: 'Today', icon: '📍' },
  { id: 'plan', label: 'Plan', icon: '🗓️' },
  { id: 'load', label: 'Load', icon: '📊' },
  { id: 'paces', label: 'Paces', icon: '⏱️' },
  { id: 'progress', label: 'Progress', icon: '📈' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
]

export default function App() {
  const { state, plan } = useStore()
  const [tab, setTab] = useState('today')
  const [logSession, setLogSession] = useState(null)
  const [checkInDate, setCheckInDate] = useState(null)

  const daysToRace = diffDays(state.config.goalRaceDate, todayISO())

  return (
    <div className="mx-auto flex min-h-full max-w-2xl flex-col">
      {/* header */}
      <header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-900/90 px-4 py-3 backdrop-blur">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold text-slate-100">HM Plan · 1:21</h1>
            <p className="text-[11px] text-slate-400">{state.config.sport} → 24 Jan 2027 · {daysToRace > 0 ? `${daysToRace}d out` : 'race week!'}</p>
          </div>
          <div className="text-right text-[11px] text-slate-500">
            {plan.totalWeeks}-week<br />periodised plan
          </div>
        </div>
      </header>

      {/* content */}
      <main className="flex-1 px-4 py-4 pb-24">
        {tab === 'today' && <Today onLog={setLogSession} onCheckIn={(d) => setCheckInDate(d)} />}
        {tab === 'plan' && <PlanView onLog={setLogSession} />}
        {tab === 'load' && <LoadDashboard />}
        {tab === 'paces' && <PaceCalculator />}
        {tab === 'progress' && <Progress />}
        {tab === 'settings' && <Settings />}
      </main>

      {/* bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-800 bg-slate-900/95 backdrop-blur">
        <div className="mx-auto grid max-w-2xl grid-cols-6">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition ${
                tab === t.id ? 'text-sky-400' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <span className="text-base leading-none">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      <LogSession session={logSession} open={!!logSession} onClose={() => setLogSession(null)} />
      <Readiness open={!!checkInDate} dateISO={checkInDate} onClose={() => setCheckInDate(null)} />
    </div>
  )
}
