# Ark Foundry

An idle game about building the generation ship **Ark** to save humanity from
a dying world. Each completed Ark module is launched into orbit – that launch
is the prestige.

- Game design: [`docs/GAME_DESIGN.md`](docs/GAME_DESIGN.md)
- Development roadmap: [`docs/ROADMAP.md`](docs/ROADMAP.md)

## Development

Requires Node.js 22.

```sh
npm install
npm run dev      # start dev server
npm test         # unit tests (Vitest)
npm run lint     # ESLint + Prettier check
npm run check    # type check (svelte-check + tsc)
npm run build    # production build into dist/
npm run simulate # pacing report: first run with three player profiles
```

## Project structure

- `src/core/` – game logic in plain TypeScript (state, tick, production, purchases,
  unlocks, saving, formatting).
  No UI or browser dependencies, so it can be unit tested and simulated headless.
- `src/content/` – game content as data (resources, buildings, upgrades).
  Balancing means editing numbers here; the values are preliminary until the
  balancing phase.
- `src/sim/` – headless pacing simulation: player profiles and a bot that
  plays the first run (`npm run simulate`).
- `src/ui/` – Svelte components and the browser game controller (frame loop,
  autosave).

## Deployment

Every push to `main` is built and deployed to GitHub Pages by
`.github/workflows/ci.yml`. GitHub Pages must be enabled once under
Settings → Pages → Source: "GitHub Actions".
