# HM Plan — Half-Marathon Training App

A single-user, offline-first training app that delivers a **31-week periodised
plan** for a Gaelic-football full-back targeting **1:21:00 on 24 Jan 2027**,
while protecting acceleration, max velocity (9.5 m/s) and a recurrent-hamstring
history. Built from the spec & evidence base in the project brief.

## What it does

- **Today** — the day's session(s), a readiness traffic-light, and an
  **auto-regulated recommendation** (green = as planned, yellow = trim ~30% /
  downgrade VO₂max→threshold, red = convert to easy/rest). A **hamstring flag**
  hard-overrides all fast/eccentric work. Surfaces the "two flags in 10 days"
  escalation.
- **Plan** — the whole plan by phase → week → day, with volume/long-run targets,
  down-week and tune-up markers, and "Explain this session" rationale linked to
  the evidence base.
- **Load** — weekly volume (planned vs actual), ACWR trend with a shaded
  0.8–1.3 band (captioned *guide, not gospel*), rolling/EWMA toggle, sRPE, and a
  speed-exposure counter. Week-on-week %Δ ramp/spike flags are the headline.
- **Paces** — Riegel-based zone calculator showing **goal (1:21) vs current
  fitness** side by side; updates off any logged tune-up.
- **Progress** — projected HM vs goal (honest on-track / close / stretch
  readout), pace progression toward goal, tune-up log, and heavy-lower/Nordic
  strength history.
- **Settings** — goal time, race date, and **season-end date that re-flows the
  phases** (Phase 1 ends at season end; the HM-specific block stays ~14–16 wk).

## Phase map (default config)

| Phase | Weeks | Focus |
|---|---|---|
| 1 — In-Season Aerobic Bridge | W1–16 | GAA priority; build easy volume |
| 2 — Base / Volume | W17–22 | Ramp volume; install the Speed Day |
| 3 — HM Specific | W23–29 | Peak volume; threshold/HM-pace/VO₂max; tune-up |
| 4 — Taper & Race | W30–31 | −40–60% volume, keep intensity, race |

The **Tuesday Speed Day** (flying sprints + bilateral plyos + heavy lower +
Nordics) is the keystone that keeps speed and the hamstring robust while volume
climbs.

## Stack

React 18 + Vite + Tailwind + Recharts. State persists to `localStorage` via a
thin wrapper (`src/lib/storage.js`) that falls back to in-memory if storage is
unavailable, so the data layer can later move to a real backend without touching
components.

## Run

```bash
npm install
npm run dev      # local dev server
npm run build    # production build to dist/
npm run preview  # preview the build
```

## Project layout

```
src/
  lib/        dates, storage, paces (Riegel + zones), load (sRPE/ACWR/EWMA),
              autoRegulation (the coach brain), selectors, store (context)
  data/       plan.js (generator + re-flow), planTemplates.js (canonical weeks),
              sessionLibrary.js (session detail + rationale)
  components/ Today, PlanView, LoadDashboard, PaceCalculator, Progress,
              Settings, LogSession, Readiness, SessionCard, ui primitives
```

> The numbers are starting targets, not commandments — the auto-regulation is
> what keeps the plan honest against how your body and hamstring actually
> respond. Recalibrate paces off the **W25 10k tune-up**, not the goal alone.
