# Ark Foundry – Development Roadmap

This roadmap splits the project into phases. Each phase consists of small
modules that can be built and reviewed one at a time. Every phase ends with a
**milestone** that can be tried out in the browser (via GitHub Pages).

Design reference: `docs/GAME_DESIGN.md`.

## Guiding principles

- **Engine separate from UI.** All game logic (state, production, research,
  prestige) lives in plain TypeScript under `src/core/` with no Svelte or DOM
  dependency. The Svelte UI only reads state and dispatches actions. This
  allows unit tests and a headless balancing simulation (phase 7).
- **Data-driven content.** Resources, buildings, research and modules are
  defined as data (`src/content/`), not hard-coded logic. Balancing means
  editing numbers, not code.
- **Deterministic tick.** The game advances by `tick(state, dtSeconds)`. Live
  play, offline catch-up, debug time skip and simulation all use the same
  function.
- **Always deployable.** `main` stays playable; every phase is merged when its
  milestone works.

---

## Phase 0 – Foundation (not yet a game)

| Module | Content |
|--------|---------|
| 0.1 Project setup | Vite + Svelte + TypeScript, ESLint, Prettier, Vitest |
| 0.2 CI & hosting | GitHub Actions: lint, test, build; deploy to GitHub Pages on push |
| 0.3 Game state & tick loop | State model, `tick(state, dt)`, fixed-timestep loop in the browser |
| 0.4 Number formatting | Plain numbers below 1,000, scientific notation above (`1.23e6`) |
| 0.5 Save system | Autosave to localStorage, versioned save format with migrations, export/import as text |
| 0.6 Debug panel | Time scale ×1/×10/×100, "skip +1 h", reset save |

**Milestone:** A deployed page with a single ticking counter. Time controls
work and the value survives a page reload.

---

## Phase 1 – Core loop (first noticeable gameplay)

| Module | Content |
|--------|---------|
| 1.1 Resources | Ore, Energy, Metal, Credits |
| 1.2 Manual mining | Click to mine ore; a few click upgrades with slow growth |
| 1.3 Buildings | Mining drone, solar field, refinery, trade post; cost `base × 1.12^n` |
| 1.4 Production chain | Buildings consume inputs (refinery: ore + energy → metal); shows rate per second |
| 1.5 Unlocks | Resources and buildings appear when first affordable or when prerequisites are met |
| 1.6 Mobile-first text UI | Portrait layout: resource bar, building list, buy buttons (×1 / ×10 / max) |

**Milestone:** The first ~2 hours of the game are playable. Clicking matters
at the start and becomes irrelevant as drones take over.

---

## Phase 2 – Offline progress & storage

| Module | Content |
|--------|---------|
| 2.1 Storage caps | Each resource has a capacity; production stops when full |
| 2.2 Storage upgrades | Silos / warehouses raise capacity (~4 h → ~8 h of production) |
| 2.3 Offline catch-up | On load, simulate elapsed time with `tick()` (in chunks) |
| 2.4 Welcome-back summary | "While you were away" text: what was produced, what was lost to full storage |

**Milestone:** Close the tab, come back later, and see the offline gains.
Full storage visibly costs production.

---

## Phase 3 – Research

| Module | Content |
|--------|---------|
| 3.1 Research resource | Labs produce research points |
| 3.2 Real-time research queue | Projects take real time (also offline); one active slot, more later |
| 3.3 Research tree | Data-driven tree; projects unlock buildings and multipliers |
| 3.4 Alloys | Smelter (metal + energy → alloys), unlocked by research |

**Milestone:** Research gates progress; the game now has a lower bound on
how fast it can be played.

---

## Phase 4 – Shipyard & first Ark module

| Module | Content |
|--------|---------|
| 4.1 Components | Orbital shipyard produces components |
| 4.2 Helium-3 | Lunar mining as late-game resource of run 1 |
| 4.3 Ark panel | Text view of the Ark with its 7 module slots, visible from the start |
| 4.4 Module construction | Hull module: multi-resource cost, build progress |

**Milestone:** A complete first run from the first click to the finished Hull
module (with time scale for testing).

---

## Phase 5 – Prestige (prototype complete)

| Module | Content |
|--------|---------|
| 5.1 Launch & reset | Launching the module resets the run; dock, Star Charts and upgrades persist |
| 5.2 Star Charts | SC formula, preview "you would get X SC" before launching, passive +1 % per SC |
| 5.3 Prestige tree | First 4–5 upgrades (Seed Capital, Veteran Engineers, Bigger Silos, Auto-Buyer: Drones, Blueprint Archive) |
| 5.4 Second run | Module 2 (Reactor) can be started; content may still be placeholder |

**Milestone = prototype:** The full core loop works: build up → launch module
→ prestige → faster second run.

---

## Phase 6 – Events & story

| Module | Content |
|--------|---------|
| 6.1 Event system | Random events that must be collected manually (meteor shower, trader, distress call) |
| 6.2 Radio log | Short story messages tied to milestones; log history |
| 6.3 Intro & goal | Short intro that presents the Ark and the dying home world |

**Milestone:** Active play is rewarded beyond clicking, and the story carries
the player through run 1.

---

## Phase 7 – Balancing

| Module | Content |
|--------|---------|
| 7.1 Headless simulation | Node script running the core with player profiles (active, casual, idle-only) |
| 7.2 Pacing reports | Time to each milestone per profile; target 2 days active / 3–4 days casual |
| 7.3 Tuning pass | Adjust content data until the targets are met |
| 7.4 Playtest | Real players on GitHub Pages; collect feedback |

**Milestone:** First run hits the target pacing in simulation and playtests.

---

## Phase 8 – Full content (modules 2–7)

| Module | Content |
|--------|---------|
| 8.1 Reactor & Engine | Energy scaling, Helium-3 at scale |
| 8.2 Habitat | Exotic matter (new resource chain) |
| 8.3 Cryo Deck | Colonists as a new resource |
| 8.4 Shield | Requires all chains at once |
| 8.5 Navigation | Mega project spanning several runs |
| 8.6 Full prestige tree | All upgrades from the design doc, more automation |
| 8.7 Achievements | Achievements with small permanent bonuses |
| 8.8 Ending | Ark launch, credits, statistics |

**Milestone:** The game can be completed (~9–12 prestiges).

---

## Phase 9 – Polish & release

| Module | Content |
|--------|---------|
| 9.1 Settings | Notation options, autosave interval, confirmations |
| 9.2 Visuals | Optional graphics on top of the text UI (Ark view) |
| 9.3 PWA / mobile app | Installable PWA, optionally Capacitor for app stores |
| 9.4 Accessibility | Font sizes, contrast, screen reader labels |
| 9.5 Release | itch.io page, store subtitle "Idle Colony Ship Builder" |
| 9.6 Monetization | Decision and implementation (if any) |

## Later (post-release)

- New Game+: journey through star systems with modifiers (concept B).
- Challenge runs.
- Sound and music, more languages, cloud saves.
