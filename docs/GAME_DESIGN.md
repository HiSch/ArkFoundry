# Ark Foundry – Game Design

Game name: **Ark Foundry** (store subtitle candidate: "Idle Colony Ship Builder").

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

| Tier | Resource      | Source                           | Unlocked    |
| ---- | ------------- | -------------------------------- | ----------- |
| 1    | Ore           | Clicking, later mining drones    | immediately |
| 2    | Energy        | Solar fields                     | ~5 min      |
| 3    | Metal         | Refinery (ore + energy)          | ~15 min     |
| 4    | Credits       | Trading / selling metal          | ~30 min     |
| 5    | Research      | Labs; research runs in real time | ~1 h        |
| 6    | Alloys        | Smelter (metal + energy)         | ~4 h        |
| 7    | Components    | Orbital shipyard                 | ~10 h       |
| 8    | Helium-3      | Lunar / asteroid mining          | ~20 h       |
| 9    | Exotic matter | From module 3 / later prestiges  | prestige 2+ |

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

Events (implemented): one appears every 6–12 minutes of live play (the first
after 5 minutes) and disappears after 3 minutes if not collected. Rewards are
10–15 minutes of the gross production of a resource, or a 10-minute ×1.5
boost to all buildings. Events never appear during offline time. The story
is told through one-time radio messages at milestones and a short intro.

| Time (active) | Phase                                                 |
| ------------- | ----------------------------------------------------- |
| 0–15 min      | Click ore, first drones, solar field                  |
| 15 min – 2 h  | Refinery, credits, first automation                   |
| 2 – 8 h       | Labs, research tree, smelter                          |
| 8 – 24 h      | Orbital shipyard (research), storage upgrades, events |
| 24 – 40 h     | Helium-3 mining, component production                 |
| 40 – 48 h     | Build hull module → **first prestige available**      |

Starting cost curve: building cost `base × 1.12^n`, production multipliers in
steps (×2 at 25/50/100 buildings). Numbers will be tuned later with a
simulation (active vs. casual player).

#### Simulated pacing (phase 7)

`npm run simulate` plays the first run with three player profiles
(`src/sim/profiles.ts`) and a bot that plays reasonably (`src/sim/bot.ts`):

| Profile   | Play pattern                           | Hull complete     | Star Charts |
| --------- | -------------------------------------- | ----------------- | ----------- |
| Active    | Game open 08:00–23:00, asleep at night | ~47 h (1 d 23 h)  | 14          |
| Casual    | Four 15-minute check-ins a day         | ~85 h (3 d 13 h)  | 11          |
| Idle only | Two 5-minute check-ins a day           | ~155 h (6 d 11 h) | 12          |

Both targets are met: about 2 days for active and 3–4 days for casual
players. For active players the research gate decides (the Hull is complete
as soon as its research is); casual players additionally lose production to
full storage between check-ins.

### 2.3 Prestige: "Launch module"

On prestige:

- **Kept:** Ark modules in the dock, prestige points, purchased prestige
  upgrades, auto-buyer switches, statistics / achievements.
- **Reset:** resources, buildings, research.

**Prestige points = Star Charts (SC)**

```
SC = floor( sqrt( alloys produced this run / 50,000 ) ) + 5 (launch bonus)
```

- The first prestige yields about **10–15 SC** (simulation: 11 SC after ~41 h).
- The second run is noticeably faster (simulation with 3 prestige upgrades:
  Reactor after ~33 h instead of ~41 h for the Hull).
- Staying longer in a run yields more SC (square root → diminishing returns),
  so prestiging too early or too late are both suboptimal.
- Each SC passively grants **+1 % production** (small but noticeable). SC can
  additionally be spent in the prestige tree; spent SC keep their passive
  bonus (no dilemma between saving and spending).

### 2.4 Prestige tree (small advantages)

| Upgrade               | Effect                                                    | Cost (SC) |
| --------------------- | --------------------------------------------------------- | --------- |
| Seed Capital          | Start with 5 drones, 500 ore and 500 credits              | 2         |
| Veteran Engineers     | Research +10 % faster (stacks 5×)                         | 3 / level |
| Bigger Silos          | Storage +1 h (stacks 4×)                                  | 3 / level |
| Auto-Buyer: Drones    | Buys drones while they cost ≤ 10 % of the stock           | 5         |
| Blueprint Archive     | Three basic research projects known from the start        | 5         |
| Auto-Pause            | Buildings pause when output storage is full               | 3         |
| Trade Contacts        | Event rewards +50 %                                       | 4         |
| Efficient Refining    | Refineries use 10 % less input (stacks 3×)                | 4 / level |
| Dock Synergy          | Each module in orbit: +5 % to all buildings               | 8         |
| Auto-Buyer: Producers | Buys solar fields, excavators and solar arrays            | 12        |
| Exotic Research       | Opens exotic matter research (needed from the Habitat on) | 15        |

Further permanent bonuses: every Star Chart ever earned +1 % to all
buildings, every achievement (18) +1 %, and research completed in an earlier
run takes half the time.

Each advantage is small on its own, but together they noticeably shorten the
early phases – the game feels faster after every prestige.

### 2.5 Long-term arc towards the goal

| Module (run) | New mechanic                                                        |
| ------------ | ------------------------------------------------------------------- |
| 1 Hull       | Components, Helium-3                                                |
| 2 Reactor    | Fusion Reactors (Helium-3 → energy); the module needs 2.5e7 energy  |
| 3 Engine     | Gas Giant Skimmers (large Helium-3 supply)                          |
| 4 Habitat    | Exotic matter from Particle Colliders (Exotic Research upgrade)     |
| 5 Cryo Deck  | Colonists from Survivor Camps (credits + energy → colonists)        |
| 6 Shield     | Needs every production chain at once                                |
| 7 Navigation | At most 34 % can be delivered per run → three runs, supply launches |

Every module's blueprint research requires the previous module in orbit.

Campaign simulation (`npm run campaign`, phase 8):

| Run | Module     | Active   | Casual   |
| --- | ---------- | -------- | -------- |
| 1   | Hull       | 1 d 23 h | 3 d 13 h |
| 2   | Reactor    | 2 d 0 h  | 5 d 20 h |
| 3   | Engine     | 1 d 12 h | 4 d 18 h |
| 4   | Habitat    | 2 d 11 h | 3 d 19 h |
| 5   | Cryo Deck  | 2 d 0 h  | 4 d 14 h |
| 6   | Shield     | 2 d 1 h  | 5 d 0 h  |
| 7–9 | Navigation | 7 d 2 h  | 9 d 20 h |
|     | **Total**  | **19 d** | **37 d** |

The Ark is complete after 9 launches (6 modules, 2 supply launches, the
final Navigation launch): about 2.7 weeks for active and 5.3 weeks for
casual players, around the 3–5 week target. Active players are limited by
research; casual players also by research progress between check-ins. The
casual results vary by several days between simulation settings, so later
tuning should rely on playtests.

→ Target: the Ark is complete after roughly **9–12 prestiges**, about
**3–5 weeks** of play.

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

| #   | Topic               | Decision                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| --- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Platform            | Browser, **mobile first** (portrait layout; desktop must also work). A native mobile app can follow later via a wrapper such as Capacitor.                                                                                                                                                                                                                                                                                               |
| 2   | Tech stack          | TypeScript + Vite + Svelte. No game engine.                                                                                                                                                                                                                                                                                                                                                                                              |
| 3   | Prototype scope     | Phases 0–5 of `docs/ROADMAP.md`: first run up to the Hull module plus one prestige.                                                                                                                                                                                                                                                                                                                                                      |
| 4   | Debug time controls | Yes: time scale (×10, ×100) and "skip +1 h", needed to test the 48 h pacing.                                                                                                                                                                                                                                                                                                                                                             |
| 5   | Offline progress    | Production continues offline at 100 % until storage is full; output beyond capacity is lost. The Auto-Pause prestige upgrade (3 SC) makes buildings with full output storage pause and keep their inputs instead. Each resource's capacity is 4 h of its gross production (minimum 1,000); run upgrades raise it to 8 h. Absences up to 30 days are caught up.                                                                           |
| 6   | Clicking            | Manual mining matters at the very start; its value diminishes as automated production takes over. Later, active play is rewarded through manually collected events instead.                                                                                                                                                                                                                                                              |
| 7   | Saving              | Autosave to browser storage, plus export/import as text string. Every save carries a version number so old saves can be migrated.                                                                                                                                                                                                                                                                                                        |
| 8   | Presentation        | **Text only** for now (panels, lists, buttons). No graphics in the prototype; the Ark is shown as a text list of its 7 module slots. Resources have emoji symbols for compact views. The resource bar has three views (full, mini, collapsed), remembered per device. Sections live in a bottom tab bar (Colony, Research, Upgrades, Ark, More); tabs appear once their system is discovered and show a dot when an action is available. |
| 9   | Number format       | **Scientific notation** with three significant digits, e.g. `1.23e6`. Values below 1,000 are shown as plain numbers. Plain JavaScript numbers until values can exceed ~1e308, then `break_infinity.js`.                                                                                                                                                                                                                                  |
| 10  | Story tone          | Serious with a note of hope ("the last chance of humanity"). Delivered through short radio messages and log entries, not long texts.                                                                                                                                                                                                                                                                                                     |
| 11  | Test hosting        | GitHub Pages, deployed automatically on every push.                                                                                                                                                                                                                                                                                                                                                                                      |

### Clicking design note

The click value should be a fixed amount that grows only slowly (e.g. via a few
early upgrades), while automated production grows exponentially. This makes
clicking dominant in the first ~15 minutes and negligible after a few hours,
without needing an explicit cutoff.

## 4. Open questions

- Monetization (not needed for the prototype).
