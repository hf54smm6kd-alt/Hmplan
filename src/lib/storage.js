// Thin persistence wrapper. Single key blob for v1 simplicity; the read/write
// surface is deliberately small so a real backend (SQLite/Postgres + API) can be
// dropped in later without touching components.
//
// Uses localStorage when available (standalone deployed app). Falls back to an
// in-memory store if storage is unavailable or throws (e.g. private mode, or if
// this ever runs inside a sandboxed artifact where storage is blocked).

const KEY = 'hm-training-app/v1'

let memoryFallback = null
let useMemory = false

function storageAvailable() {
  try {
    const t = '__hm_test__'
    window.localStorage.setItem(t, t)
    window.localStorage.removeItem(t)
    return true
  } catch {
    return false
  }
}

if (typeof window === 'undefined' || !storageAvailable()) {
  useMemory = true
}

export function loadState() {
  try {
    if (useMemory) return memoryFallback
    const raw = window.localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return useMemory ? memoryFallback : null
  }
}

export function saveState(state) {
  try {
    if (useMemory) {
      memoryFallback = state
      return
    }
    window.localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    // Storage quota or blocked — degrade to memory so the session still works.
    useMemory = true
    memoryFallback = state
  }
}

export function clearState() {
  try {
    if (!useMemory) window.localStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
  memoryFallback = null
}
