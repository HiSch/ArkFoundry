import type { GameState } from './state'
import { canAfford, entries } from './amounts'
import { effectProduct } from './effects'
import type { Amounts, BuildingDef } from './types'

/** Multiplier on all building costs from prestige upgrades. */
export function buildingCostFactor(state: GameState): number {
  return effectProduct(state, 'buildingCost', 'factor')
}

/**
 * Total cost of buying `quantity` more buildings when `owned` already exist,
 * scaled by `costFactor` (see `buildingCostFactor`).
 */
export function buildingCost(
  def: BuildingDef,
  owned: number,
  quantity: number,
  costFactor = 1,
): Amounts {
  const g = def.costGrowth
  // Geometric series: base * g^owned * (g^quantity - 1) / (g - 1)
  const factor = (costFactor * (Math.pow(g, owned) * (Math.pow(g, quantity) - 1))) / (g - 1)
  const cost: Amounts = {}
  for (const [id, base] of entries(def.cost)) cost[id] = base * factor
  return cost
}

/** Largest number of buildings that can be bought right now (may be 0). */
export function maxAffordable(state: GameState, def: BuildingDef): number {
  const owned = state.buildings[def.id].count
  const g = def.costGrowth
  const costFactor = buildingCostFactor(state)
  let max = Infinity
  for (const [id, cost] of entries(def.cost)) {
    const base = cost * costFactor
    const have = state.resources[id]
    const k = Math.floor(Math.log((have * (g - 1)) / (base * Math.pow(g, owned)) + 1) / Math.log(g))
    max = Math.min(max, k)
  }
  if (!Number.isFinite(max)) return 0
  // Correct floating point rounding at the boundary in both directions.
  if (max >= 0 && canAfford(state, buildingCost(def, owned, max + 1, costFactor))) max += 1
  while (max > 0 && !canAfford(state, buildingCost(def, owned, max, costFactor))) max -= 1
  return Math.max(0, max)
}
