import React from 'react'

export function Card({ children, className = '' }) {
  return <div className={`rounded-2xl bg-slate-800/60 ring-1 ring-slate-700/60 ${className}`}>{children}</div>
}

export function SectionTitle({ children, sub }) {
  return (
    <div className="mb-3">
      <h2 className="text-lg font-semibold text-slate-100">{children}</h2>
      {sub && <p className="text-sm text-slate-400">{sub}</p>}
    </div>
  )
}

export function Pill({ children, tone = 'slate' }) {
  const tones = {
    slate: 'bg-slate-700/70 text-slate-200',
    green: 'bg-green-500/20 text-green-300 ring-1 ring-green-500/40',
    amber: 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/40',
    red: 'bg-red-500/20 text-red-300 ring-1 ring-red-500/40',
    violet: 'bg-violet-500/20 text-violet-200 ring-1 ring-violet-500/40',
    blue: 'bg-sky-500/20 text-sky-200 ring-1 ring-sky-500/40',
  }
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone] || tones.slate}`}>{children}</span>
}

export function Button({ children, onClick, variant = 'primary', className = '', type = 'button', disabled }) {
  const variants = {
    primary: 'bg-sky-600 hover:bg-sky-500 text-white',
    ghost: 'bg-slate-700/60 hover:bg-slate-600/60 text-slate-100',
    subtle: 'bg-transparent hover:bg-slate-700/40 text-slate-300 ring-1 ring-slate-600',
    danger: 'bg-red-600/80 hover:bg-red-500 text-white',
    success: 'bg-green-600 hover:bg-green-500 text-white',
  }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-xl px-3.5 py-2 text-sm font-medium transition disabled:opacity-40 ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  )
}

export function Field({ label, children, hint }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-400">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
    </label>
  )
}

export function Input(props) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl bg-slate-900/70 px-3 py-2 text-sm text-slate-100 ring-1 ring-slate-700 outline-none focus:ring-sky-500 ${props.className || ''}`}
    />
  )
}

export function Select({ children, ...props }) {
  return (
    <select
      {...props}
      className={`w-full rounded-xl bg-slate-900/70 px-3 py-2 text-sm text-slate-100 ring-1 ring-slate-700 outline-none focus:ring-sky-500 ${props.className || ''}`}
    >
      {children}
    </select>
  )
}

export function Modal({ open, onClose, title, children, wide }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4" onClick={onClose}>
      <div
        className={`max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-slate-800 p-5 ring-1 ring-slate-700 sm:rounded-3xl ${wide ? 'sm:max-w-2xl' : 'sm:max-w-md'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-100">{title}</h3>
          <button onClick={onClose} className="rounded-lg px-2 py-1 text-slate-400 hover:bg-slate-700 hover:text-slate-200">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function StatTile({ label, value, sub, tone }) {
  const ring =
    tone === 'green' ? 'ring-green-500/40' : tone === 'amber' ? 'ring-amber-500/40' : tone === 'red' ? 'ring-red-500/40' : 'ring-slate-700/60'
  return (
    <div className={`rounded-2xl bg-slate-800/60 p-4 ring-1 ${ring}`}>
      <div className="text-xs uppercase tracking-wide text-slate-400">{label}</div>
      <div className="mt-1 text-2xl font-bold text-slate-100">{value}</div>
      {sub && <div className="mt-0.5 text-xs text-slate-400">{sub}</div>}
    </div>
  )
}

export const LIGHT_STYLES = {
  GREEN: { dot: 'bg-green-500', text: 'text-green-300', label: 'Green', tone: 'green' },
  YELLOW: { dot: 'bg-amber-500', text: 'text-amber-300', label: 'Yellow', tone: 'amber' },
  RED: { dot: 'bg-red-500', text: 'text-red-300', label: 'Red', tone: 'red' },
}
