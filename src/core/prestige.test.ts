import { describe, expect, it } from 'vitest'
import { getBuilding } from '../content/buildings'
import { getPrestigeUpgrade } from '../content/prestige'
import { getResearch } from '../content/research'
import { buildingCost } from './costs'
import { canBuildModule } from './ark'
import { multipliers } from './production'
import {
  ABANDON_MIN_STAR_CHARTS,
  abandonColony,
  abandonReward,
  ALLOY_DIVISOR,
  AUTO_BUY_SHARE,
  availableAutoBuyers,
  buyPrestigeUpgrade,
  canAbandon,
  canLaunch,
  LAUNCH_BONUS,
  launchModule,
  launchReward,
  runAutoBuyers,
  runStarCharts,
  startNewRun,
} from './prestige'
import { researchSpeed, startResearch } from './research'
import { createInitialState } from './state'
import { storageHours } from './storage'
import { advance } from './tick'

function completedHullState() {
  const state = createInitialState()
  state.ark.modules.hull.completed = true
  state.stats.produced.alloys = 25 * ALLOY_DIVISOR
  state.buildings.drone.count = 50
  state.resources.ore = 12345
  state.upgrades.push('plasmaPick')
  state.research.completed.push('automation')
  state.playTime = 1000
  return state
}

describe('Star Charts', () => {
  it('grow with the square root of alloys produced', () => {
    const state = createInitialState()
    expect(runStarCharts(state)).toBe(0)
    state.stats.produced.alloys = 4 * ALLOY_DIVISOR
    expect(runStarCharts(state)).toBe(2)
    state.stats.produced.alloys = 100 * ALLOY_DIVISOR
    expect(runStarCharts(state)).toBe(10)
    expect(launchReward(state)).toBe(10 + LAUNCH_BONUS)
  })

  it('give a passive throughput bonus', () => {
    const state = createInitialState()
    state.meta.starChartsEarned = 20
    expect(multipliers(state, 'drone').throughput).toBeCloseTo(1.2)
  })
})

describe('launching a module', () => {
  it('requires a completed module that is not launched yet', () => {
    const state = createInitialState()
    expect(canLaunch(state, 'hull')).toBe(false)
    expect(launchModule(state, 'hull')).toBe(0)
  })

  it('earns Star Charts, keeps the Ark and resets the run', () => {
    const state = completedHullState()
    const reward = launchModule(state, 'hull')
    expect(reward).toBe(5 + LAUNCH_BONUS)
    expect(state.meta.starCharts).toBe(reward)
    expect(state.meta.starChartsEarned).toBe(reward)
    expect(state.meta.launches).toBe(1)
    expect(state.meta.pastPlayTime).toBe(1000)
    expect(state.ark.modules.hull.launched).toBe(true)
    expect(canLaunch(state, 'hull')).toBe(false)
    // Run progress is gone.
    expect(state.buildings.drone.count).toBe(0)
    expect(state.resources.ore).toBe(0)
    expect(state.upgrades).toEqual([])
    expect(state.research.completed).toEqual([])
    expect(state.stats.produced.alloys).toBe(0)
    expect(state.playTime).toBe(0)
    expect(state.unlockedBuildings).toEqual(['drone'])
  })

  it('makes the reactor buildable in the next run once its research is done', () => {
    const state = completedHullState()
    launchModule(state, 'hull')
    expect(canBuildModule(state, 'reactor')).toBe(false)
    state.research.completed.push('reactorEngineering')
    expect(canBuildModule(state, 'reactor')).toBe(true)
  })
})

describe('prestige upgrades', () => {
  it('cost Star Charts and respect the maximum level', () => {
    const state = createInitialState()
    state.meta.starCharts = 100
    const def = getPrestigeUpgrade('seedCapital')
    expect(buyPrestigeUpgrade(state, 'seedCapital')).toBe(true)
    expect(buyPrestigeUpgrade(state, 'seedCapital')).toBe(false)
    expect(state.meta.starCharts).toBe(100 - def.cost)
    state.meta.starCharts = 0
    expect(buyPrestigeUpgrade(state, 'veteranEngineers')).toBe(false)
  })

  it('apply start-of-run effects on a new run', () => {
    const state = createInitialState()
    state.meta.prestigeUpgrades = { seedCapital: 1, blueprintArchive: 1 }
    startNewRun(state)
    expect(state.buildings.drone.count).toBe(5)
    expect(state.resources.ore).toBe(500)
    expect(state.resources.credits).toBe(500)
    expect(state.research.completed).toEqual(['automation', 'marketAnalysis', 'metallurgy'])
    expect(state.unlockedBuildings).toContain('smelter')
  })

  it('speed up research and enlarge storage per level', () => {
    const state = createInitialState()
    state.meta.prestigeUpgrades = { veteranEngineers: 3, biggerSilos: 2 }
    expect(researchSpeed(state)).toBeCloseTo(1.3)
    expect(storageHours(state)).toBe(4 + 2)
    state.buildings.lab.count = 1
    state.resources.research = 1e6
    startResearch(state, 'automation')
    advance(state, getResearch('automation').duration / 1.3 + 1)
    expect(state.research.completed).toContain('automation')
  })
})

describe('auto-buyers', () => {
  it('are only available with the upgrade and only buy when switched on and cheap', () => {
    const state = createInitialState()
    state.unlockedBuildings.push('drone')
    state.resources.ore = 1e6
    expect(availableAutoBuyers(state)).toEqual([])
    state.meta.prestigeUpgrades = { autoDrones: 1 }
    expect(availableAutoBuyers(state)).toEqual(['drone'])
    runAutoBuyers(state)
    expect(state.buildings.drone.count).toBe(0)
    state.meta.autoBuy.drone = true
    runAutoBuyers(state)
    expect(state.buildings.drone.count).toBe(1)
  })

  it('never spend more than a small share of the stock', () => {
    const state = createInitialState()
    state.unlockedBuildings.push('drone')
    state.meta.prestigeUpgrades = { autoDrones: 1 }
    state.meta.autoBuy.drone = true
    const cost = buildingCost(getBuilding('drone'), 0, 1).ore!
    state.resources.ore = (cost / AUTO_BUY_SHARE) * 0.99
    runAutoBuyers(state)
    expect(state.buildings.drone.count).toBe(0)
  })
})

describe('Star Chart bonus', () => {
  it('gives 2 % per unspent and 1 % per spent Star Chart', () => {
    const state = createInitialState()
    state.meta.starChartsEarned = 30
    state.meta.starCharts = 10
    // 20 spent × 1 % + 10 unspent × 2 % = 40 %
    expect(multipliers(state, 'drone').throughput).toBeCloseTo(1.4)
  })

  it('shrinks when Star Charts are spent', () => {
    const state = createInitialState()
    state.meta.starChartsEarned = 10
    state.meta.starCharts = 10
    expect(multipliers(state, 'drone').throughput).toBeCloseTo(1.2)
    buyPrestigeUpgrade(state, 'seedCapital')
    expect(multipliers(state, 'drone').throughput).toBeCloseTo(1.18)
  })
})

describe('Abandoning the colony', () => {
  function productiveRun(starCharts: number) {
    const state = createInitialState()
    state.stats.produced.alloys = starCharts * starCharts * ALLOY_DIVISOR
    state.research.completed.push('hullEngineering')
    state.ark.modules.hull.delivered.alloys = 1000
    state.playTime = 500
    return state
  }

  it('needs enough production for the minimum Star Charts', () => {
    expect(canAbandon(productiveRun(ABANDON_MIN_STAR_CHARTS - 1))).toBe(false)
    expect(canAbandon(productiveRun(ABANDON_MIN_STAR_CHARTS))).toBe(true)
  })

  it('is replaced by the launch once a module is complete', () => {
    const state = productiveRun(20)
    state.ark.modules.hull.completed = true
    expect(canAbandon(state)).toBe(false)
  })

  it('earns Star Charts without the launch bonus and keeps deliveries', () => {
    const state = productiveRun(12)
    expect(abandonReward(state)).toBe(launchReward(state) - LAUNCH_BONUS)
    expect(abandonColony(state)).toBe(12)
    expect(state.meta.starCharts).toBe(12)
    expect(state.meta.abandons).toBe(1)
    expect(state.meta.launches).toBe(0)
    expect(state.meta.pastPlayTime).toBe(500)
    expect(state.stats.produced.alloys).toBe(0)
    expect(state.ark.modules.hull.delivered.alloys).toBe(1000)
    expect(state.ark.modules.hull.launched).toBe(false)
    expect(abandonColony(state)).toBe(0)
  })
})
