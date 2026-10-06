import { getPrestigeUpgrade, PRESTIGE_UPGRADE_IDS } from '../content/prestige'
import { getResearch } from '../content/research'
import { getUpgrade } from '../content/upgrades'
import type { GameState } from './state'
import type { Effect } from './types'

/** Effects of prestige upgrades, repeated once per purchased level. */
export function prestigeEffects(state: GameState): Effect[] {
  return PRESTIGE_UPGRADE_IDS.flatMap((id) => {
    const level = state.meta.prestigeUpgrades[id] ?? 0
    const effects = getPrestigeUpgrade(id).effects
    return Array.from({ length: level }, () => effects).flat()
  })
}

/** All effects currently in force: from upgrades, completed research and prestige upgrades. */
export function activeEffects(state: GameState): Effect[] {
  return [
    ...state.upgrades.flatMap((id) => getUpgrade(id).effects),
    ...state.research.completed.flatMap((id) => getResearch(id).effects),
    ...prestigeEffects(state),
  ]
}
