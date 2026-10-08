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

interface CacheEntry {
  upgrades: unknown
  upgradeCount: number
  research: unknown
  researchCount: number
  prestigeLevels: number
  effects: Effect[]
}

/**
 * The effect list is needed many times per tick but changes rarely, so it is
 * cached per state. Upgrades, completed research and prestige levels only
 * grow within a run, and a new run replaces the arrays, so array identity
 * plus lengths and the sum of prestige levels detect every change.
 */
const cache = new WeakMap<object, CacheEntry>()

function prestigeLevelSum(state: GameState): number {
  let sum = 0
  for (const level of Object.values(state.meta.prestigeUpgrades)) sum += level ?? 0
  return sum
}

/** All effects currently in force: from upgrades, completed research and prestige upgrades. */
export function activeEffects(state: GameState): Effect[] {
  const entry = cache.get(state)
  const levels = prestigeLevelSum(state)
  if (
    entry &&
    entry.upgrades === state.upgrades &&
    entry.upgradeCount === state.upgrades.length &&
    entry.research === state.research.completed &&
    entry.researchCount === state.research.completed.length &&
    entry.prestigeLevels === levels
  ) {
    return entry.effects
  }
  const effects = [
    ...state.upgrades.flatMap((id) => getUpgrade(id).effects),
    ...state.research.completed.flatMap((id) => getResearch(id).effects),
    ...prestigeEffects(state),
  ]
  cache.set(state, {
    upgrades: state.upgrades,
    upgradeCount: state.upgrades.length,
    research: state.research.completed,
    researchCount: state.research.completed.length,
    prestigeLevels: levels,
    effects,
  })
  return effects
}

/** Sum of a numeric field over all active effects of one type. */
export function effectSum<T extends Effect['type']>(
  state: GameState,
  type: T,
  field: keyof Extract<Effect, { type: T }>,
): number {
  let sum = 0
  for (const effect of activeEffects(state)) {
    if (effect.type === type) sum += (effect as Record<string, unknown>)[field as string] as number
  }
  return sum
}

/** Product of a numeric field over all active effects of one type (1 if none). */
export function effectProduct<T extends Effect['type']>(
  state: GameState,
  type: T,
  field: keyof Extract<Effect, { type: T }>,
): number {
  let product = 1
  for (const effect of activeEffects(state)) {
    if (effect.type === type)
      product *= (effect as Record<string, unknown>)[field as string] as number
  }
  return product
}

export function hasEffect(state: GameState, type: Effect['type']): boolean {
  return activeEffects(state).some((effect) => effect.type === type)
}
