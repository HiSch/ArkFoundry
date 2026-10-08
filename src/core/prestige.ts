import { getBuilding, type BuildingId } from '../content/buildings'
import type { ModuleId } from '../content/modules'
import { getPrestigeUpgrade, type PrestigeUpgradeId } from '../content/prestige'
import { canSupplyLaunch } from './ark'
import { buildingCost, buildingCostFactor } from './costs'
import { activeEffects, effectSum, prestigeEffects } from './effects'
import { starChartMultiplier } from './production'
import { createInitialState, type GameState } from './state'
import { updateUnlocks } from './unlocks'

/** Alloys produced in a run per Star Chart squared: SC = floor(sqrt(alloys / divisor)). */
export const ALLOY_DIVISOR = 5e4
/** Star Charts for launching a module for the first time. */
export const LAUNCH_BONUS = 5
/** An auto-buyer only buys when the next building costs at most this share of the stock. */
export const AUTO_BUY_SHARE = 0.1

/** Star Charts from this run's production; grows with the square root of alloys produced. */
export function runStarCharts(state: GameState): number {
  return Math.floor(Math.sqrt(state.stats.produced.alloys / ALLOY_DIVISOR))
}

/** Star Charts that launching the given module now would earn. */
export function launchReward(state: GameState): number {
  const gain = 1 + effectSum(state, 'starChartGain', 'add')
  return Math.floor((runStarCharts(state) + LAUNCH_BONUS) * gain)
}

/** Multiplier on all building throughput from Star Charts (spent and unspent). */
export function starChartBonus(state: GameState): number {
  return starChartMultiplier(state)
}

export function canLaunch(state: GameState, id: ModuleId): boolean {
  const module = state.ark.modules[id]
  return module.completed && !module.launched
}

/**
 * Launches a completed module into orbit: earns Star Charts and starts a new
 * run. Kept: the Ark, Star Charts, prestige upgrades and auto-buyer switches.
 * Everything else is reset. Returns the Star Charts earned, or 0 if the
 * module cannot be launched.
 */
export function launchModule(state: GameState, id: ModuleId): number {
  if (!canLaunch(state, id)) return 0
  state.ark.modules[id].launched = true
  return finishRun(state)
}

/**
 * Launches supplies for a module that is too big for one run: earns Star
 * Charts and starts a new run like a normal launch, but the module stays in
 * the dock with its deliveries. Returns the Star Charts earned, or 0.
 */
export function supplyLaunch(state: GameState, id: ModuleId): number {
  if (!canSupplyLaunch(state, id)) return 0
  return finishRun(state)
}

/** Rewards the run and starts a new one. */
function finishRun(state: GameState): number {
  const reward = launchReward(state)
  state.meta.starCharts += reward
  state.meta.starChartsEarned += reward
  state.meta.launches += 1
  state.meta.pastPlayTime += state.playTime
  for (const id of state.research.completed) {
    state.meta.researchCompletions[id] = (state.meta.researchCompletions[id] ?? 0) + 1
  }
  startNewRun(state)
  return reward
}

/** Resets the run in place and applies start-of-run prestige effects. */
export function startNewRun(state: GameState): void {
  const fresh = createInitialState()
  const { ark, meta } = state
  Object.assign(state, fresh, { ark, meta })
  for (const module of Object.values(state.ark.modules)) module.deliveredThisRun = {}
  for (const effect of prestigeEffects(state)) {
    if (effect.type === 'startResources') {
      for (const [r, amount] of Object.entries(effect.resources)) {
        state.resources[r as keyof typeof state.resources] += amount ?? 0
      }
    }
    if (effect.type === 'startBuildings') state.buildings[effect.building].count += effect.count
    if (effect.type === 'startResearch') {
      for (const id of effect.research) {
        if (!state.research.completed.includes(id)) state.research.completed.push(id)
      }
    }
  }
  updateUnlocks(state)
}

export function prestigeLevel(state: GameState, id: PrestigeUpgradeId): number {
  return state.meta.prestigeUpgrades[id] ?? 0
}

export function canBuyPrestigeUpgrade(state: GameState, id: PrestigeUpgradeId): boolean {
  const def = getPrestigeUpgrade(id)
  return prestigeLevel(state, id) < def.maxLevel && state.meta.starCharts >= def.cost
}

/**
 * Buys one level of a prestige upgrade. Start-of-run effects apply from the
 * next run; all other effects apply immediately.
 */
export function buyPrestigeUpgrade(state: GameState, id: PrestigeUpgradeId): boolean {
  if (!canBuyPrestigeUpgrade(state, id)) return false
  state.meta.starCharts -= getPrestigeUpgrade(id).cost
  state.meta.prestigeUpgrades[id] = prestigeLevel(state, id) + 1
  return true
}

/** Buildings the player owns an auto-buyer for. */
export function availableAutoBuyers(state: GameState): BuildingId[] {
  return activeEffects(state).flatMap((e) => (e.type === 'autoBuy' ? [e.building] : []))
}

export function setAutoBuy(state: GameState, id: BuildingId, enabled: boolean): void {
  state.meta.autoBuy[id] = enabled
}

/**
 * Runs the enabled auto-buyers: each buys one building whenever its cost is
 * at most a small share of the stock, so it never drains the player's savings.
 */
export function runAutoBuyers(state: GameState): void {
  for (const id of availableAutoBuyers(state)) {
    if (!state.meta.autoBuy[id] || !state.unlockedBuildings.includes(id)) continue
    const def = getBuilding(id)
    const cost = buildingCost(def, state.buildings[id].count, 1, buildingCostFactor(state))
    const cheap = Object.entries(cost).every(
      ([r, amount]) => (amount ?? 0) <= state.resources[r as keyof typeof cost] * AUTO_BUY_SHARE,
    )
    if (!cheap) continue
    for (const [r, amount] of Object.entries(cost)) {
      state.resources[r as keyof typeof cost] -= amount ?? 0
    }
    state.buildings[id].count += 1
  }
}
