import { RESOURCE_IDS, type ResourceId } from '../content/resources'
import { computeFlows } from './production'
import type { GameState } from './state'
import { capacities, clampToCapacity } from './storage'
import { updateUnlocks } from './unlocks'

/** What happened to the resources during a period of time. */
export interface Totals {
  /** Amount gained per resource, including what was lost to full storage. */
  produced: Record<ResourceId, number>
  /** Amount used per resource by buildings. */
  consumed: Record<ResourceId, number>
  /** Amount lost because storage was full. */
  lost: Record<ResourceId, number>
}

function perResource(): Record<ResourceId, number> {
  return Object.fromEntries(RESOURCE_IDS.map((id) => [id, 0])) as Record<ResourceId, number>
}

export function emptyTotals(): Totals {
  return { produced: perResource(), consumed: perResource(), lost: perResource() }
}

/**
 * Advances the game by `dt` seconds. This is the single entry point for
 * time passing: live play, offline catch-up, debug skips and simulation all
 * go through it so they behave identically. Returns what was produced,
 * consumed and lost to full storage, or null if no time passed.
 */
export function tick(state: GameState, dt: number): Totals | null {
  if (dt <= 0) return null
  const flows = computeFlows(state, dt)
  const caps = capacities(state)
  const totals: Totals = { produced: flows.produced, consumed: flows.consumed, lost: perResource() }
  for (const id of RESOURCE_IDS) {
    const change = flows.produced[id] - flows.consumed[id]
    const { value, lost } = clampToCapacity(state.resources[id], change, caps[id])
    state.resources[id] = value
    totals.lost[id] = lost
    state.stats.produced[id] += Math.max(0, flows.produced[id] - lost)
  }
  state.playTime += dt
  updateUnlocks(state)
  return totals
}

/** Largest step passed to `tick` during live play, keeps results accurate. */
export const MAX_STEP_SECONDS = 1

/**
 * Advances by `seconds`, split into steps of at most `maxStep` seconds.
 * Returns the summed totals.
 */
export function advance(state: GameState, seconds: number, maxStep = MAX_STEP_SECONDS): Totals {
  const totals = emptyTotals()
  let remaining = seconds
  while (remaining > 0) {
    const step = Math.min(remaining, maxStep)
    const result = tick(state, step)
    if (result) addTotals(totals, result)
    remaining -= step
  }
  return totals
}

export function addTotals(target: Totals, source: Totals): void {
  for (const id of RESOURCE_IDS) {
    target.produced[id] += source.produced[id]
    target.consumed[id] += source.consumed[id]
    target.lost[id] += source.lost[id]
  }
}
