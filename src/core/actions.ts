import { getBuilding, type BuildingId } from '../content/buildings'
import { getUpgrade, type UpgradeId } from '../content/upgrades'
import { canAfford, gain, pay } from './amounts'
import { buildingCost, maxAffordable } from './costs'
import type { GameState } from './state'
import { updateUnlocks } from './unlocks'

/** Ore gained per manual mining click. */
export function clickPower(state: GameState): number {
  let power = 1
  for (const id of state.upgrades) {
    for (const effect of getUpgrade(id).effects) {
      if (effect.type === 'clickPower') power += effect.add
    }
  }
  return power
}

/** Manual mining: one click on the "Mine ore" button. */
export function mine(state: GameState): void {
  gain(state, { ore: clickPower(state) })
  state.stats.clicks += 1
  updateUnlocks(state)
}

export type BuyAmount = number | 'max'

/** Number of buildings a purchase would buy (0 if not affordable). */
export function purchaseQuantity(state: GameState, id: BuildingId, amount: BuyAmount): number {
  const def = getBuilding(id)
  if (amount === 'max') return maxAffordable(state, def)
  return canAfford(state, buildingCost(def, state.buildings[id].count, amount)) ? amount : 0
}

/** Buys buildings. Returns how many were bought. */
export function buyBuilding(state: GameState, id: BuildingId, amount: BuyAmount): number {
  if (!state.unlockedBuildings.includes(id)) return 0
  const quantity = purchaseQuantity(state, id, amount)
  if (quantity <= 0) return 0
  const def = getBuilding(id)
  pay(state, buildingCost(def, state.buildings[id].count, quantity))
  state.buildings[id].count += quantity
  updateUnlocks(state)
  return quantity
}

/** Buys a one-time upgrade. Returns whether it was bought. */
export function buyUpgrade(state: GameState, id: UpgradeId): boolean {
  if (!state.unlockedUpgrades.includes(id) || state.upgrades.includes(id)) return false
  const def = getUpgrade(id)
  if (!canAfford(state, def.cost)) return false
  pay(state, def.cost)
  state.upgrades.push(id)
  updateUnlocks(state)
  return true
}

/** Switches a building type on or off. */
export function setBuildingEnabled(state: GameState, id: BuildingId, enabled: boolean): void {
  state.buildings[id].enabled = enabled
}
