import type { GameState } from './state'

/** Placeholder production rate until buildings exist (phase 1). */
const ORE_PER_SECOND = 1

/**
 * Advances the game by `dt` seconds. This is the single entry point for
 * time passing: live play, offline catch-up, debug skips and simulation all
 * go through it so they behave identically.
 */
export function tick(state: GameState, dt: number): void {
  if (dt <= 0) return
  state.resources.ore += ORE_PER_SECOND * dt
  state.playTime += dt
}

/** Largest step passed to `tick` at once, keeps long catch-ups accurate. */
export const MAX_STEP_SECONDS = 1

/** Advances by `seconds`, split into steps of at most `MAX_STEP_SECONDS`. */
export function advance(state: GameState, seconds: number): void {
  let remaining = seconds
  while (remaining > 0) {
    const step = Math.min(remaining, MAX_STEP_SECONDS)
    tick(state, step)
    remaining -= step
  }
}
