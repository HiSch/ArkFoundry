import { ACHIEVEMENTS } from '../content/achievements'
import type { GameState } from './state'
import { isMet } from './unlocks'

/** Unlocks every achievement whose condition is met. They are kept forever. */
export function updateAchievements(state: GameState): void {
  for (const def of ACHIEVEMENTS) {
    if (!state.meta.achievements.includes(def.id) && isMet(state, def.condition)) {
      state.meta.achievements.push(def.id)
    }
  }
}
