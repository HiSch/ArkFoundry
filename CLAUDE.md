# Ark Foundry

Repository: SpaceCraftIdle. Idle game about building the generation ship "Ark"; launching Ark modules is
the prestige mechanic. See `docs/GAME_DESIGN.md`.

## Language

- The game is primarily in **English** (all in-game text).
- All documentation, code comments, commit messages and identifiers are in
  **English**.
- Only the chat with the project owner may be in German.

## Development

- Commands: `npm run dev`, `npm test`, `npm run lint`, `npm run check`, `npm run build`.
  Run lint, check and tests before every commit.
- Game rules live in `src/core/` (plain TypeScript, no Svelte/DOM imports).
  The UI in `src/ui/` only reads state and calls core functions.
- Time only passes through `tick(state, dt)` / `advance(state, seconds)`.
- Any change to the saved state format requires bumping `SAVE_VERSION` and
  adding a migration in `src/core/save.ts`.
