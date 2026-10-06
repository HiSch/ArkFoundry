import { RESOURCE_IDS } from '../content/resources'
import { computeFlows, type Flows } from './production'
import type { GameState } from './state'
import { updateUnlocks } from './unlocks'

/**
 * Advances the game by `dt` seconds. This is the single entry point for
 * time passing: live play, offline catch-up, debug skips and simulation all
 * go through it so they behave identically. Returns what was produced and
 * consumed.
 */
export function tick(state: GameState, dt: number): Flows | null {
  if (dt <= 0) return null
  const flows = computeFlows(state, dt)
  for (const id of RESOURCE_IDS) {
    state.resources[id] = Math.max(0, state.resources[id] + flows.produced[id] - flows.consumed[id])
    state.stats.produced[id] += flows.produced[id]
  }
  state.playTime += dt
  updateUnlocks(state)
  return flows
}

/** Largest step passed to `tick` at once, keeps long catch-ups accurate. */
export const MAX_STEP_SECONDS = 1

/** Total amounts produced and consumed over a period. */
export type Totals = Pick<Flows, 'produced' | 'consumed'>

/**
 * Advances by `seconds`, split into steps of at most `MAX_STEP_SECONDS`.
 * Returns the summed production and consumption.
 */
export function advance(state: GameState, seconds: number): Totals {
  const totals: Totals = { produced: zero(), consumed: zero() }
  let remaining = seconds
  while (remaining > 0) {
    const step = Math.min(remaining, MAX_STEP_SECONDS)
    const flows = tick(state, step)
    if (flows) {
      for (const id of RESOURCE_IDS) {
        totals.produced[id] += flows.produced[id]
        totals.consumed[id] += flows.consumed[id]
      }
    }
    remaining -= step
  }
  return totals
}

function zero(): Totals['produced'] {
  return Object.fromEntries(RESOURCE_IDS.map((id) => [id, 0])) as Totals['produced']
}
