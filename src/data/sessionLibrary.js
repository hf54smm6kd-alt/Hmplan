// Session library: each type carries
//   - detail: a one-line summary
//   - prescription: a structured, do-this list (sets × reps × distance/time)
//   - why: the Part-1 evidence rationale ("Explain this session")
//   - zone: the pace-zone key so the card can show a target pace band
// The token {km} in a prescription line is replaced with the session's planned km.

export const SESSION_META = {
  EASY: {
    label: 'Easy run',
    color: '#22c55e',
    icon: '🏃',
    detail: 'Conversational pace only — the 80% of polarised training.',
    zone: 'easy',
    prescription: [
      { title: 'Main', body: 'Run {km} km continuous at easy/conversational pace — you should be able to talk in full sentences.' },
      { title: 'Optional finisher', body: '4–6 × 80 m relaxed strides (walk back between) to keep turnover crisp.' },
    ],
    why: 'The dominant amateur error is running easy days too hard (§1.1). Easy volume is the single biggest half-marathon lever (§1.2), and only works if it stays genuinely easy.',
  },
  RECOVERY: {
    label: 'Recovery jog',
    color: '#4ade80',
    icon: '🚶',
    detail: 'Very easy shakeout — purely circulation.',
    zone: 'recovery',
    prescription: [
      { title: 'Main', body: '{km} km (≈20–30 min) very easy — slower than your easy pace. Day-after-hard or day-after-match legs.' },
    ],
    why: 'Active recovery between hard stimuli; protects the easy/hard separation that makes polarised training work (§1.1).',
  },
  LONG_RUN: {
    label: 'Long run',
    color: '#16a34a',
    icon: '🛣️',
    detail: "The week's longest run, easy.",
    zone: 'easy',
    prescription: [
      { title: 'Main', body: '{km} km at easy pace (drift to steady/long-run float in the back half if fresh).' },
      { title: 'Later in the block', body: 'Add HM-pace finishing segments — e.g. last 3–5 km at goal pace — when the week’s note calls for it.' },
      { title: 'Fuel', body: 'Practise race fuelling/hydration on runs over ~90 min.' },
    ],
    why: 'A longest run >21 km is independently linked to faster finishing and less in-race fade, with no added injury risk (§1.2).',
  },
  THRESHOLD: {
    label: 'Threshold / tempo',
    color: '#f59e0b',
    icon: '⚡',
    detail: 'Comfortably-hard ~1-hour race effort.',
    zone: 'threshold',
    prescription: [
      { title: 'Warm-up', body: '15 min easy + 4 × 100 m strides.' },
      { title: 'Main set (progress across the phase)', body: 'Start ~3 × 8 min at threshold w/ 2 min jog recovery → build toward 2 × 15–20 min w/ 3 min jog. Total ~24–35 min at threshold.' },
      { title: 'Cool-down', body: '10 min easy.' },
    ],
    why: 'Threshold raises the pace you hold before lactate accumulates — a top-three distance determinant (§1.3).',
  },
  HM_PACE: {
    label: 'HM-pace work',
    color: '#f97316',
    icon: '🎯',
    detail: 'Rehearse goal pace and feel.',
    zone: 'hm',
    prescription: [
      { title: 'Warm-up', body: '15 min easy + 4 × 100 m strides.' },
      { title: 'Main set', body: '5–6 × 1 km at HM goal pace w/ 60–90 s jog, OR 3 × 2 km w/ 2 min jog. (Race-week openers: 3–4 × 2 min at HM pace.)' },
      { title: 'Cool-down', body: '10 min easy.' },
    ],
    why: 'Race specificity. The long-run HM-pace segments are the pacing rehearsal for race day (§2.5/§2.6).',
  },
  VO2MAX: {
    label: 'VO₂max intervals',
    color: '#ef4444',
    icon: '🔥',
    detail: 'Short reps at 3k–5k effort.',
    zone: 'vo2max',
    prescription: [
      { title: 'Warm-up', body: '15 min easy + 4 × 100 m build-ups.' },
      { title: 'Main set (pick one)', body: '5 × 3 min hard w/ 2–3 min jog · or 8–10 × 2 min w/ 90 s jog · or 6–8 × 800 m w/ 90 s jog. ~12–18 min hard total.' },
      { title: 'Cool-down', body: '10 min easy.' },
    ],
    why: 'Develops the aerobic ceiling once a volume base exists (§1.3). Alternating weeks only — not every week.',
  },
  STRIDES: {
    label: 'Strides',
    color: '#a3e635',
    icon: '💨',
    detail: 'Relaxed accelerations, neuromuscular upkeep.',
    zone: 'strides',
    prescription: [
      { title: 'Main', body: '4–6 × 80–100 m: accelerate smoothly to ~95%, hold a few seconds, decelerate. Full walk-back recovery (45–60 s).' },
      { title: 'Cue', body: 'Tall, relaxed, fast feet — not a max sprint. By feel, not timed.' },
    ],
    why: 'Low-cost neuromuscular upkeep; max speed decays in ~5 days so it must stay in the week (§1.5).',
  },
  SPEED_DAY: {
    label: 'Speed Day (keystone)',
    color: '#8b5cf6',
    icon: '🚀',
    detail: 'Flying sprints + bilateral plyos + heavy lower. Always fresh, low-volume/high-quality.',
    zone: 'sprint',
    prescription: [
      { title: '1 · Warm-up (non-negotiable)', body: '10 min easy jog → dynamic mobility, leg swings, A/B skips → build-ups 4–5 × 60 m ramping 60% → 80% → 90%. Never sprint cold.' },
      { title: '2 · Plyometrics (bilateral, ~40–80 contacts)', body: '3 × 8 pogos · 3 × 6 line/ankle hops · 3 × 5 low box jumps · 2 × 5 hurdle hops (two-footed). Phase 3: add 3 × 5 bilateral depth/drop jumps. Full recovery between sets. No single-leg bounding.' },
      { title: '3 · Flying sprints (max velocity)', body: '4–6 reps: 20–30 m rolling build-up into a 20–30 m max-velocity FLY zone (~120–180 m true top-speed total). Full 3–4+ min recovery between reps. Build reps gradually week to week. Alt weeks: 4–6 × 8–20 m hill sprints / sled for acceleration.' },
      { title: '4 · Heavy lower (maintenance dose)', body: 'Back squat or trap-bar deadlift 3–5 × 3–5 @ ≥80% 1RM (~3 min rest) · Nordic hamstring 2–3 × 4–6 · hip-hinge accessory (RDL) 3 × 6.' },
    ],
    why: 'The keystone (§2.7). Plyos + heavy load + flying sprints hit the three qualities endurance erodes first (RFD, reactive strength, max velocity); Nordics + progressive high-speed exposure are the hamstring stack (§1.4–§1.7). Order matters: nervous-system work first, never after endurance.',
  },
  PLYO: {
    label: 'Plyometrics',
    color: '#7c3aed',
    icon: '🦘',
    detail: 'Bilateral only, done fresh.',
    zone: 'sprint',
    prescription: [
      { title: 'Warm-up', body: 'Easy jog + ankle/calf prep + a few sub-max hops.' },
      { title: 'Main (~40–80 foot contacts)', body: '3 × 8 pogos · 3 × 6 line/ankle hops · 3 × 5 low box jumps · 2 × 5 hurdle hops. Full recovery between sets. No single-leg bounding.' },
    ],
    why: 'Plyos improve running economy at lower speeds and maintain reactive strength / sprint stiffness (§1.6). Bilateral-only given hamstring history.',
  },
  STRENGTH_LOWER: {
    label: 'Lower strength (heavy)',
    color: '#0ea5e9',
    icon: '🏋️',
    detail: 'Heavy + low volume = strength kept, minimal soreness.',
    zone: null,
    prescription: [
      { title: 'Main compound', body: 'Back squat or trap-bar deadlift — 3–5 × 3–5 @ ≥80% 1RM, ~3 min rest. Heavy, crisp reps.' },
      { title: 'Hamstring insurance', body: 'Nordic hamstring 2–3 × 4–6 — lower as slowly as you can control.' },
      { title: 'Posterior-chain accessory', body: 'RDL or hip thrust 3 × 6–8.' },
    ],
    why: '3–6 hard sets/wk >80% 1RM maintains and can build max strength on minimal time (§1.5). Heavy load is what preserves force/RFD.',
  },
  STRENGTH_UPPER: {
    label: 'Upper strength',
    color: '#38bdf8',
    icon: '💪',
    detail: 'Maintenance upper session.',
    zone: null,
    prescription: [
      { title: 'Push', body: 'Bench press or overhead press — 3–4 × 5–8.' },
      { title: 'Pull', body: 'Row + chin-up/pulldown — 3–4 × 6–10.' },
      { title: 'Finisher (optional)', body: 'Core or loaded carry. Moderate, maintenance volume.' },
    ],
    why: 'Maintains overall strength alongside the heavy lower work — concurrent training does not compromise strength when managed (§1.4).',
  },
  GAA_PITCH: {
    label: 'GAA pitch session',
    color: '#10b981',
    icon: '🥅',
    detail: 'Team training. This is your in-season high-speed exposure.',
    zone: null,
    prescription: [
      { title: 'Order', body: 'Put any speed/acceleration drills early, while fresh — not at the end on tired legs.' },
      { title: 'Counts as', body: 'A weekly high-speed exposure — log it on the speed-exposure tracker.' },
    ],
    why: 'In-season the pitch covers max-velocity/high-speed exposure — even one ≥95% max-velocity exposure per week lowers hamstring-injury risk (§1.7–§1.8).',
  },
  GAA_MATCH: {
    label: 'Match',
    color: '#059669',
    icon: '🏆',
    detail: 'The match always wins.',
    zone: null,
    prescription: [
      { title: 'Priority', body: 'Never compromise match performance for running. If load was high, drop the next easy run to a jog or rest.' },
      { title: 'Demands', body: '~8–9 km incl. ~1.7 km high-speed at ~85% HRmax. Counts as a high-speed exposure.' },
    ],
    why: 'Football is the Phase-1 priority; higher aerobic power also lowers injury risk and speeds between-effort recovery (§1.8).',
  },
  REST: {
    label: 'Rest',
    color: '#64748b',
    icon: '😴',
    detail: 'Full rest or light mobility.',
    zone: null,
    prescription: [
      { title: 'Main', body: 'Full rest or 10–15 min light mobility/walk. Pre-match freshness / recovery.' },
    ],
    why: 'Recovery is where adaptation lands. Planned rest protects the hard/easy contrast and tissue health.',
  },
  CROSS_TRAIN: {
    label: 'Cross-train',
    color: '#14b8a6',
    icon: '🚴',
    detail: 'Low-impact aerobic substitute.',
    zone: 'easy',
    prescription: [
      { title: 'Main', body: '30–50 min low-impact aerobic (bike/pool) at easy effort.' },
      { title: 'Use when', body: 'A hamstring flag is up, or to keep aerobic stimulus while reducing impact load.' },
    ],
    why: 'Maintains aerobic stimulus with less tissue load; cycling interferes with power less than running (§1.4).',
  },
  RACE: {
    label: 'RACE — Half Marathon',
    color: '#eab308',
    icon: '🏁',
    detail: 'Even / slight-negative split off recalibrated goal pace.',
    zone: 'hm',
    prescription: [
      { title: 'Warm-up', body: '15–20 min easy jog + 4 strides + a few seconds at HM pace. Be on the line ready, not over-warmed.' },
      { title: 'Race · 21.1 km', body: 'Even pacing or a slight negative split off your recalibrated goal pace. Bank nothing in the first 5 km — the long-run HM-pace segments were the rehearsal.' },
      { title: 'Targets', body: 'Goal 1:21 (3:50/km) · 1:23–1:24 a strong realistic day · sub-1:20 the stretch (§0).' },
    ],
    why: 'The 2-week taper freshens the fast-twitch system while aerobic fitness barely fades (§1.5/§1.10).',
  },
}

export function metaFor(type) {
  return SESSION_META[type] || { label: type, color: '#94a3b8', icon: '•', detail: '', why: '', zone: null, prescription: [] }
}

export const RUN_TYPES = ['EASY', 'RECOVERY', 'LONG_RUN', 'THRESHOLD', 'HM_PACE', 'VO2MAX', 'STRIDES']
export const SPEED_TYPES = ['SPEED_DAY', 'STRIDES', 'GAA_MATCH', 'GAA_PITCH']
