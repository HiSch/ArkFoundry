import type { ResourceId } from '../content/resources'
import type { GameState } from './state'
import type { Amounts } from './types'

/** Iterates the non-zero entries of an `Amounts` object with typed keys. */
export function entries(amounts: Amounts): [ResourceId, number][] {
  return (Object.entries(amounts) as [ResourceId, number][]).filter(([, v]) => v !== 0)
}

/** Relative tolerance so that costs computed with floating point rounding stay affordable. */
const COST_EPSILON = 1e-9

export function canAfford(state: GameState, cost: Amounts): boolean {
  return entries(cost).every(([id, amount]) => state.resources[id] >= amount * (1 - COST_EPSILON))
}

/** Subtracts a cost. Callers must check `canAfford` first. */
export function pay(state: GameState, cost: Amounts): void {
  for (const [id, amount] of entries(cost)) {
    state.resources[id] = Math.max(0, state.resources[id] - amount)
  }
}
