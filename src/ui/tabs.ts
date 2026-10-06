import { MODULES } from '../content/modules'
import { PRESTIGE_UPGRADE_IDS } from '../content/prestige'
import { UPGRADES } from '../content/upgrades'
import { canAfford } from '../core/amounts'
import { canBuildModule, launchedModules } from '../core/ark'
import { canBuyPrestigeUpgrade, canLaunch } from '../core/prestige'
import { availableResearch, researchDiscovered } from '../core/research'
import type { GameState } from '../core/state'
import type { TabId } from './preferences.svelte'

export interface Tab {
  id: TabId
  label: string
  icon: string
}

export function upgradesDiscovered(state: GameState): boolean {
  return state.unlockedUpgrades.length > 0
}

/** Tabs to show; tabs for systems the player has not discovered yet are hidden. */
export function visibleTabs(state: GameState): Tab[] {
  const tabs: Tab[] = [{ id: 'colony', label: 'Colony', icon: '🏭' }]
  if (researchDiscovered(state)) tabs.push({ id: 'research', label: 'Research', icon: '🔬' })
  if (upgradesDiscovered(state)) tabs.push({ id: 'upgrades', label: 'Upgrades', icon: '⬆️' })
  tabs.push({
    id: 'ark',
    label: `Ark ${launchedModules(state)}/${MODULES.length}`,
    icon: '🚀',
  })
  tabs.push({ id: 'more', label: 'More', icon: '⚙️' })
  return tabs
}

/**
 * Whether a tab has something for the player to do: an affordable upgrade,
 * an idle research queue with an affordable project, or Ark progress to make.
 */
export function tabNeedsAttention(state: GameState, id: TabId): boolean {
  switch (id) {
    case 'research':
      return (
        state.research.queue.length === 0 &&
        availableResearch(state).some((def) => canAfford(state, def.cost))
      )
    case 'upgrades':
      return UPGRADES.some(
        (u) =>
          state.unlockedUpgrades.includes(u.id) &&
          !state.upgrades.includes(u.id) &&
          canAfford(state, u.cost),
      )
    case 'ark':
      return (
        MODULES.some((m) => canLaunch(state, m.id)) ||
        MODULES.some(
          (m) =>
            canBuildModule(state, m.id) &&
            Object.entries(m.cost).some(
              ([r, need]) =>
                (state.ark.modules[m.id].delivered[r as keyof typeof m.cost] ?? 0) < (need ?? 0) &&
                state.resources[r as keyof typeof m.cost] > 0,
            ),
        ) ||
        PRESTIGE_UPGRADE_IDS.some((p) => canBuyPrestigeUpgrade(state, p))
      )
    default:
      return false
  }
}
