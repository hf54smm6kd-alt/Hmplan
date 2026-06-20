// Session library: canonical detail + rationale for every session type, plus
// phase-specific quality-session prescriptions. The Today view pulls `detail`
// and the "Explain this session" panel pulls `why` (the Part-1 evidence link).

export const SESSION_META = {
  EASY: {
    label: 'Easy run',
    color: '#22c55e',
    icon: '🏃',
    detail: 'Conversational pace only — the 80% of polarised training. If you can\'t chat in full sentences, slow down.',
    why: 'The dominant amateur error is running easy days too hard (§1.1). Easy volume is the single biggest half-marathon lever (§1.2), and it only works if it stays genuinely easy.',
    zone: 'easy',
  },
  RECOVERY: {
    label: 'Recovery jog',
    color: '#4ade80',
    icon: '🚶',
    detail: 'Very easy shakeout. Day-after-hard or day-after-match legs. Keep it short and slow.',
    why: 'Active recovery between hard stimuli; protects the easy/hard separation that makes polarised training work (§1.1).',
    zone: 'recovery',
  },
  LONG_RUN: {
    label: 'Long run',
    color: '#16a34a',
    icon: '🛣️',
    detail: 'The week\'s longest run, easy. Later in the block, add steady or HM-pace finishing segments.',
    why: 'A longest run >21 km is independently linked to faster finishing and less in-race fade, with no added injury risk (§1.2).',
    zone: 'easy',
  },
  THRESHOLD: {
    label: 'Threshold / tempo',
    color: '#f59e0b',
    icon: '⚡',
    detail: 'Within an easy-padded run. Build from ~3×8 min → 2×15–20 min at threshold (~1hr race effort). Start at the easy end of the band, finish strong.',
    why: 'Threshold raises the pace you hold before lactate accumulates — a top-three distance determinant (§1.3).',
    zone: 'threshold',
  },
  HM_PACE: {
    label: 'HM-pace work',
    color: '#f97316',
    icon: '🎯',
    detail: 'Race-pace segments (in a session or as long-run finish). Rehearse goal pace and feel.',
    why: 'Race specificity. The long-run HM-pace segments are the pacing rehearsal for race day (§2.5/§2.6).',
    zone: 'hm',
  },
  VO2MAX: {
    label: 'VO₂max intervals',
    color: '#ef4444',
    icon: '🔥',
    detail: 'Short reps at 3k–5k effort (e.g. 5–6×3 min or 8–10×2 min) with jog recovery. Alternating weeks only — not every week.',
    why: 'Develops the aerobic ceiling once a volume base exists (§1.3). Scaled-down version of world-class practice.',
    zone: 'vo2max',
  },
  STRIDES: {
    label: 'Strides',
    color: '#a3e635',
    icon: '💨',
    detail: '4–6 × ~80 m relaxed accelerations to ~95% with full walk-back recovery. Keeps turnover crisp.',
    why: 'Low-cost neuromuscular upkeep; max speed decays in ~5 days so it must stay in the week (§1.5).',
    zone: 'strides',
  },
  SPEED_DAY: {
    label: 'Speed Day (keystone)',
    color: '#8b5cf6',
    icon: '🚀',
    detail:
      'Always fresh, low-volume/high-quality. Order: (1) thorough warm-up + build-ups 60→90% — never sprint cold; (2) bilateral plyos ~40–80 contacts; (3) flying sprints 4–6×20–30 m fly zone, full 3–4 min recovery; (4) heavy lower 3–5×3–5 @ ≥80% 1RM + Nordics + a hinge accessory.',
    why: 'The keystone (§2.7). Plyos + heavy load + flying sprints hit the three qualities endurance erodes first (RFD, reactive strength, max velocity), while Nordics + progressive high-speed exposure are the hamstring stack (§1.4–§1.7).',
    zone: 'sprint',
  },
  PLYO: {
    label: 'Plyometrics',
    color: '#7c3aed',
    icon: '🦘',
    detail: 'Bilateral only, ~40–80 foot contacts, done fresh. Pogos, line/ankle hops, low box jumps, hurdle hops (two-footed). No single-leg bounding.',
    why: 'Plyos improve running economy at lower speeds and maintain reactive strength / sprint stiffness (§1.6). Bilateral-only given hamstring history.',
    zone: 'sprint',
  },
  STRENGTH_LOWER: {
    label: 'Lower strength (heavy)',
    color: '#0ea5e9',
    icon: '🏋️',
    detail: '1 heavy compound (back squat or trap-bar deadlift) 3–5×3–5 @ ≥80% 1RM + Nordic hamstring 2–3×4–6 + a hip-hinge accessory. Heavy + low volume = strength kept, minimal soreness.',
    why: '3–6 hard sets/wk >80% 1RM maintains and can build max strength on minimal time (§1.5). Heavy load is what preserves force/RFD.',
    zone: null,
  },
  STRENGTH_UPPER: {
    label: 'Upper strength',
    color: '#38bdf8',
    icon: '💪',
    detail: 'Maintenance upper session. Push/pull compounds, moderate volume.',
    why: 'Maintains overall strength alongside the heavy lower work (concurrent training does not compromise strength when managed — §1.4).',
    zone: null,
  },
  GAA_PITCH: {
    label: 'GAA pitch session',
    color: '#10b981',
    icon: '🥅',
    detail: 'Team training. Do any speed/acceleration work fresh, early in the session. This supplies your in-season high-speed exposure.',
    why: 'In-season the pitch covers max-velocity/high-speed exposure — even one ≥95% max-velocity exposure per week lowers hamstring-injury risk (§1.7–§1.8).',
    zone: null,
  },
  GAA_MATCH: {
    label: 'Match',
    color: '#059669',
    icon: '🏆',
    detail: 'The match always wins. Never let added running degrade match performance.',
    why: 'Football is the Phase-1 priority; ~8–9 km covered incl. ~1.7 km high-speed at ~85% HRmax (§1.8).',
    zone: null,
  },
  RACE: {
    label: 'RACE — Half Marathon',
    color: '#eab308',
    icon: '🏁',
    detail:
      'Even pacing or a slight negative split off your recalibrated goal pace. Bank nothing in the first 5 km. The long-run HM-pace segments were the rehearsal — trust them.',
    why: 'The 2-week taper freshens the fast-twitch system while aerobic fitness barely fades (§1.5/§1.10). Target 1:21, with 1:23–1:24 a strong realistic outcome and sub-1:20 a stretch (§0).',
    zone: 'hm',
  },
  REST: {
    label: 'Rest',
    color: '#64748b',
    icon: '😴',
    detail: 'Full rest or light mobility. Pre-match freshness / recovery.',
    why: 'Recovery is where adaptation lands. Planned rest protects the hard/easy contrast and tissue health.',
    zone: null,
  },
  CROSS_TRAIN: {
    label: 'Cross-train',
    color: '#14b8a6',
    icon: '🚴',
    detail: 'Low-impact aerobic (bike/pool) — useful substitute when a hamstring flag is up or impact load needs reducing.',
    why: 'Maintains aerobic stimulus with less tissue load; cycling interferes with power less than running (§1.4).',
    zone: 'easy',
  },
}

export function metaFor(type) {
  return SESSION_META[type] || { label: type, color: '#94a3b8', icon: '•', detail: '', why: '', zone: null }
}

// Quality-session counts to drive the "speed exposure" and structure expectations.
export const RUN_TYPES = ['EASY', 'RECOVERY', 'LONG_RUN', 'THRESHOLD', 'HM_PACE', 'VO2MAX', 'STRIDES']
export const SPEED_TYPES = ['SPEED_DAY', 'STRIDES', 'GAA_MATCH', 'GAA_PITCH']
