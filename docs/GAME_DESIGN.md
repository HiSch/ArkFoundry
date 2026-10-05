# Ark Foundry – Game Design

Game name: **Ark Foundry** (store subtitle candidate: "Idle Colony Ship Builder").
Repository name: SpaceCraftIdle.

Design goals:

- The **goal of the game is visible right away**,
- but it can **only be reached after several prestiges**.
- The **first prestige** takes about **2 days of active play** or **3–4 days of
  casual / idle play**.
- Every prestige grants **points that buy small, permanent advantages**.

**Decision:** The game uses the **Ark** story (concept A below). Building and
launching Ark modules is the prestige mechanic.

---

## 1. Concepts considered

### Concept A – "The Ark" (chosen)
The home world is dying. The goal: build the generation ship **ARK** and send
10,000 colonists to a distant planet.

- From the very first screen the player sees the Ark blueprint with
  **7 empty module slots** (Hull, Reactor, Engine, Habitat, Cryo Deck, Shield,
  Navigation).
- In each run the player builds up an economy (mining → refinery → shipyard)
  and at the end can **complete one module and launch it into the orbital dock**.
- Launching a module **is the prestige**: the colony resets, but the module
  stays in the dock. The goal fills up visibly with every prestige.
- Later modules need more resources or new resource types than a run without
  prestige bonuses can produce.

**Strength:** goal and progress are a single picture – the player watches the
Ark grow. A prestige feels like an achievement, not a loss.

### Concept B – "Jump into the Unknown"
Start in one star system and travel to the **galactic core**. The star map
(e.g. 10 systems) is visible from the start. Each prestige is a jump to the
next system, which has modifiers (e.g. "Ice-rich: +50 % water, −30 % metal",
"Neutron star: energy ×3, buildings decay").

**Use:** candidate for the **endgame / New Game+** after the Ark launches.

### Concept C – "Time Loop"
The sun goes supernova in 72 h; the player fails to escape and the loop
restarts, keeping knowledge. Strong story, but a countdown can stress casual
players. Not pursued.

---

## 2. Detailed design: "The Ark"

### 2.1 Resource chain

| Tier | Resource       | Source                                 | Unlocked     |
|------|----------------|----------------------------------------|--------------|
| 1    | Ore            | Clicking, later mining drones          | immediately  |
| 2    | Energy         | Solar fields                           | ~5 min       |
| 3    | Metal          | Refinery (ore + energy)                | ~15 min      |
| 4    | Credits        | Trading / selling metal                | ~30 min      |
| 5    | Research       | Labs; research runs in real time       | ~1 h         |
| 6    | Alloys         | Smelter (metal + energy)               | ~4 h         |
| 7    | Components     | Orbital shipyard                       | ~10 h        |
| 8    | Helium-3       | Lunar / asteroid mining                | ~20 h        |
| 9    | Exotic matter  | From module 3 / later prestiges        | prestige 2+  |

Each Ark module costs a mix of components and alloys, and from module 3 on
also Helium-3 / exotic matter.

### 2.2 Pacing of the first run (target: 2 days active / 3–4 days casual)

Pacing is controlled by **two levers**:

1. **Real-time research (lower bound):** the critical research path to the
   orbital shipyard takes about **36–40 h of real time** in total. Research
   continues offline. Even a very active player cannot reach the first
   prestige much earlier than ~1.5–2 days.
2. **Storage capacity / offline limit (cost of inactivity):** production runs
   offline at 100 %, but only until storage is full (initially ~4 h of
   capacity, upgradable to ~8 h). Players who check in rarely lose production
   and need more like 3–4 days.

Active players get small extra bonuses that do not dominate: clicking early on,
random events (meteor showers, traders, distress calls) that must be collected
manually, and emptying storage in time.

| Time (active)  | Phase                                                      |
|----------------|------------------------------------------------------------|
| 0–15 min       | Click ore, first drones, solar field                       |
| 15 min – 2 h   | Refinery, credits, first automation                        |
| 2 – 8 h        | Labs, research tree, smelter                               |
| 8 – 24 h       | Orbital shipyard (research), storage upgrades, events      |
| 24 – 40 h      | Helium-3 mining, component production                      |
| 40 – 48 h      | Build hull module → **first prestige available**           |

Starting cost curve: building cost `base × 1.12^n`, production multipliers in
steps (×2 at 25/50/100 buildings). Numbers will be tuned later with a
simulation (active vs. casual player).

### 2.3 Prestige: "Launch module"

On prestige:

- **Kept:** Ark modules in the dock, prestige points, purchased prestige
  upgrades, statistics / achievements.
- **Reset:** resources, buildings, research.

**Prestige points = Star Charts (SC)**

```
SC = floor( 10 × sqrt( total alloys produced this run / 1e9 ) ) + module bonus
```

- The first prestige yields about **10–15 SC**.
- Staying longer in a run yields more SC (square root → diminishing returns),
  so prestiging too early or too late are both suboptimal.
- Each SC passively grants **+1 % production** (small but noticeable). SC can
  additionally be spent in the prestige tree; spent SC keep their passive
  bonus (no dilemma between saving and spending).

### 2.4 Prestige tree (small advantages)

| Upgrade                 | Effect                                          | Cost (SC)  |
|-------------------------|-------------------------------------------------|------------|
| Seed Capital            | Start with 5 drones and 500 credits             | 2          |
| Veteran Engineers       | Research +10 % faster (stacks 5×)               | 3 / level  |
| Bigger Silos            | Offline / storage capacity +1 h (stacks 4×)     | 3 / level  |
| Auto-Buyer: Drones      | Buys drones automatically                       | 5          |
| Blueprint Archive       | First 3 research projects complete instantly    | 5          |
| Trade Contacts          | Trade events more frequent and better           | 4          |
| Efficient Refinery      | Refinery uses 10 % less ore                     | 4          |
| Dock Synergy            | Each completed module: +5 % to everything       | 8          |
| Auto-Buyer: Buildings   | Automatically builds all basic buildings        | 12         |
| Exotic Research         | Unlocks exotic matter (needed for module 4+)    | 15         |

Each advantage is small on its own, but together they noticeably shorten the
early phases – the game feels faster after every prestige.

### 2.5 Long-term arc towards the goal

| Module (prestige) | New requirement                  | Approx. run length   |
|-------------------|----------------------------------|----------------------|
| 1 Hull            | Components                       | 2 days (3–4 casual)  |
| 2 Reactor         | Much more energy                 | ~1.5 days            |
| 3 Engine          | Helium-3 in large amounts        | ~1.5 days            |
| 4 Habitat         | Exotic matter                    | ~1–2 days            |
| 5 Cryo Deck       | Colonists (new resource)         | ~1–2 days            |
| 6 Shield          | All production chains at once    | ~2 days              |
| 7 Navigation      | Mega project, spans several runs | 2–3 runs             |

→ The Ark is complete after roughly **9–12 prestiges**, about **3–5 weeks** of
play. Optional extra prestiges (upgrading modules, farming SC) help with
modules the player is stuck on.

Because each later module introduces a **new mechanic**, a run is more than
"the same thing, just faster".

### 2.6 Endgame ideas
- **The Ark launch:** credits + statistics, then New Game+ based on concept B
  (journey through star systems with modifiers, second prestige currency).
- **Challenge runs:** e.g. "no solar power", "half storage" – grant one-time
  special SC bonuses.
- **Achievements** with small permanent bonuses (+1 % per 10 achievements).

---

## 3. Technical and prototype decisions

| # | Topic             | Decision                                                                 |
|---|-------------------|--------------------------------------------------------------------------|
| 1 | Platform          | Browser, **mobile first** (portrait layout; desktop must also work). A native mobile app can follow later via a wrapper such as Capacitor. |
| 2 | Tech stack        | TypeScript + Vite + Svelte. No game engine.                              |
| 3 | Prototype scope   | **Open** – to be decided later.                                          |
| 4 | Debug time controls | Yes: time scale (×10, ×100) and "skip +1 h", needed to test the 48 h pacing. |
| 5 | Offline progress  | Production continues offline at 100 % until storage is full (initially ~4 h capacity, upgradable to ~8 h). |
| 6 | Clicking          | Manual mining matters at the very start; its value diminishes as automated production takes over. Later, active play is rewarded through manually collected events instead. |
| 7 | Saving            | Autosave to browser storage, plus export/import as text string. Every save carries a version number so old saves can be migrated. |

### Clicking design note
The click value should be a fixed amount that grows only slowly (e.g. via a few
early upgrades), while automated production grows exponentially. This makes
clicking dominant in the first ~15 minutes and negligible after a few hours,
without needing an explicit cutoff.

## 4. Open questions
- Prototype scope (see decision 3).
- Visual presentation: UI panels only, or panels plus a simple Ark graphic with
  the 7 module slots?
- Number formatting: suffixes (K, M, B, T) and/or scientific notation. Plain
  JavaScript numbers suffice until values can exceed ~1e308; then
  `break_infinity.js`.
- Story tone: serious (dying Earth) or light-hearted?
- Test hosting: e.g. GitHub Pages, deployed on every push.
- Monetization (not needed for the prototype).
