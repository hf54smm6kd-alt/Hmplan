import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react'
import { loadState, saveState, clearState } from './storage.js'
import { generatePlan } from '../data/plan.js'
import { isoDate } from './dates.js'

// Default athlete profile & config straight from §0 of the spec. The recent-race
// fields seed "current fitness" paces until the W25 tune-up overrides them.
export const DEFAULT_CONFIG = {
  name: 'Athlete',
  dob: '2002-06-01',
  weightKg: 81.5,
  heightCm: 183,
  maxVelocityMs: 9.5,
  hamstringHistory: true,
  sport: 'Gaelic football (full-back)',
  goalRaceDate: '2027-01-24',
  goalTimeSec: 4860, // 1:21:00
  startDate: '2026-06-22', // Mon, Week 1
  seasonEndDate: '2026-10-11', // ~W16; re-flows the plan when changed
  recentRaceDistanceKm: 10,
  recentRaceTimeSec: 2370, // 39:30
  restingHrBaseline: 48,
  wearableSource: 'MANUAL', // 'WHOOP' | 'GARMIN' | 'MANUAL'
  daysPerWeek: 6,
  units: 'km',
}

// Logs are keyed by a stable session key (date|type) so they survive plan
// regeneration when the config (e.g. season-end date) changes.
export function sessionKey(session) {
  return `${session.date}|${session.type}`
}

function freshState(config = DEFAULT_CONFIG) {
  return {
    config,
    logs: {}, // sessionKey -> { status, run, strength, sprint, notes }
    readiness: [], // [{ date, ... , computedLight }]
    tests: [], // [{ id, date, type, distanceKm, timeSec }]
  }
}

function init() {
  const persisted = loadState()
  if (persisted && persisted.config) {
    // Merge in any new default keys added since the blob was written.
    return { ...freshState({ ...DEFAULT_CONFIG, ...persisted.config }), ...persisted, config: { ...DEFAULT_CONFIG, ...persisted.config } }
  }
  return freshState()
}

function reducer(state, action) {
  switch (action.type) {
    case 'UPDATE_CONFIG':
      return { ...state, config: { ...state.config, ...action.patch } }
    case 'SET_LOG': {
      const key = action.key
      const prev = state.logs[key] || {}
      return { ...state, logs: { ...state.logs, [key]: { ...prev, ...action.patch } } }
    }
    case 'SAVE_READINESS': {
      const others = state.readiness.filter((r) => r.date !== action.record.date)
      return { ...state, readiness: [...others, action.record].sort((a, b) => a.date.localeCompare(b.date)) }
    }
    case 'ADD_TEST':
      return { ...state, tests: [...state.tests, action.record].sort((a, b) => a.date.localeCompare(b.date)) }
    case 'REMOVE_TEST':
      return { ...state, tests: state.tests.filter((t) => t.id !== action.id) }
    case 'RESET':
      return freshState()
    case 'IMPORT':
      return action.state
    default:
      return state
  }
}

const StoreContext = createContext(null)

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, init)

  // Persist on every change.
  useEffect(() => {
    saveState(state)
  }, [state])

  // The plan is derived from config — regenerate when the relevant inputs change.
  const plan = useMemo(
    () => generatePlan(state.config),
    [state.config.startDate, state.config.raceDate, state.config.goalRaceDate, state.config.seasonEndDate],
  )

  const api = useMemo(
    () => ({
      state,
      plan,
      updateConfig: (patch) => dispatch({ type: 'UPDATE_CONFIG', patch }),
      setLog: (session, patch) => dispatch({ type: 'SET_LOG', key: sessionKey(session), patch }),
      setStatus: (session, status) => dispatch({ type: 'SET_LOG', key: sessionKey(session), patch: { status } }),
      getLog: (session) => state.logs[sessionKey(session)] || null,
      saveReadiness: (record) => dispatch({ type: 'SAVE_READINESS', record }),
      readinessFor: (dateISO) => state.readiness.find((r) => r.date === dateISO) || null,
      addTest: (record) => dispatch({ type: 'ADD_TEST', record: { id: `test_${Date.now()}`, ...record } }),
      removeTest: (id) => dispatch({ type: 'REMOVE_TEST', id }),
      reset: () => {
        clearState()
        dispatch({ type: 'RESET' })
      },
      importState: (s) => dispatch({ type: 'IMPORT', state: s }),
    }),
    [state, plan],
  )

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}

// Convenience: today's ISO date (real today, clamped is the app's responsibility).
export function todayISO() {
  return isoDate(new Date())
}
