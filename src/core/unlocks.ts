import { BUILDINGS } from '../content/buildings'
import { UPGRADES } from '../content/upgrades'
import type { GameState } from './state'
import type { UnlockCondition } from './types'

export function isMet(state: GameState, condition: UnlockCondition): boolean {
  switch (condition.type) {
    case 'always':
      return true
    case 'produced':
      return state.stats.produced[condition.resource] >= condition.amount
    case 'building':
      return state.buildings[condition.building].count >= condition.count
    case 'upgrade':
      return state.upgrades.includes(condition.upgrade)
    case 'research':
      return state.research.completed.includes(condition.research)
    case 'never':
      return false
  }
}

/** Reveals every building and upgrade whose unlock condition is now met. */
export function updateUnlocks(state: GameState): void {
  for (const def of BUILDINGS) {
    if (!state.unlockedBuildings.includes(def.id) && isMet(state, def.unlock)) {
      state.unlockedBuildings.push(def.id)
    }
  }
  for (const def of UPGRADES) {
    if (!state.unlockedUpgrades.includes(def.id) && isMet(state, def.unlock)) {
      state.unlockedUpgrades.push(def.id)
    }
  }
}
