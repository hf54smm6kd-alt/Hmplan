// Lightweight date helpers. All dates handled as local-midnight Date objects
// and serialised as YYYY-MM-DD strings so storage stays timezone-stable.

export const MS_PER_DAY = 24 * 60 * 60 * 1000

export function isoDate(d) {
  const date = d instanceof Date ? d : new Date(d)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function parseISO(s) {
  // Treat a YYYY-MM-DD string as local midnight (avoids UTC off-by-one).
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function addDays(d, n) {
  const date = d instanceof Date ? new Date(d) : parseISO(d)
  date.setDate(date.getDate() + n)
  return date
}

export function diffDays(a, b) {
  const da = a instanceof Date ? a : parseISO(a)
  const db = b instanceof Date ? b : parseISO(b)
  // Normalise to midnight before diffing.
  const ua = Date.UTC(da.getFullYear(), da.getMonth(), da.getDate())
  const ub = Date.UTC(db.getFullYear(), db.getMonth(), db.getDate())
  return Math.round((ua - ub) / MS_PER_DAY)
}

// Monday-start week index that a given date falls into, relative to a plan start
// (also a Monday). Returns 1-based week number.
export function weekNumberFor(date, startDate) {
  const d = diffDays(date, startDate)
  return Math.floor(d / 7) + 1
}

export function startOfMonday(d) {
  const date = d instanceof Date ? new Date(d) : parseISO(d)
  const day = date.getDay() // 0 Sun .. 6 Sat
  const delta = (day + 6) % 7 // days since Monday
  return addDays(date, -delta)
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function fmtShort(d) {
  const date = d instanceof Date ? d : parseISO(d)
  return `${WEEKDAYS[date.getDay()]} ${date.getDate()} ${MONTHS[date.getMonth()]}`
}

export function fmtDayMonth(d) {
  const date = d instanceof Date ? d : parseISO(d)
  return `${date.getDate()} ${MONTHS[date.getMonth()]}`
}

export function weekdayShort(d) {
  const date = d instanceof Date ? d : parseISO(d)
  return WEEKDAYS[date.getDay()]
}

export function monthLabel(d) {
  const date = d instanceof Date ? d : parseISO(d)
  return `${MONTHS[date.getMonth()]} ${date.getFullYear()}`
}
