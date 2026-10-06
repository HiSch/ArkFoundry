import { getResearch } from '../content/research'
import { getUpgrade } from '../content/upgrades'
import type { GameState } from './state'
import type { Effect } from './types'

/** All effects currently in force: from purchased upgrades and completed research. */
export function activeEffects(state: GameState): Effect[] {
  return [
    ...state.upgrades.flatMap((id) => getUpgrade(id).effects),
    ...state.research.completed.flatMap((id) => getResearch(id).effects),
  ]
}
