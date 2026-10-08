import { describe, expect, it } from 'vitest'
import { getBuilding } from '../content/buildings'
import { getResearch } from '../content/research'
import { clickYield, clickPower, mine } from './actions'
import { AUTO_DELIVER_KEEP_SHARE, runAutoDeliver } from './ark'
import { buildingCost, buildingCostFactor } from './costs'
import { EVENT_INTERVAL, EVENT_LIFETIME, updateEvents } from './events'
import { buyPrestigeUpgrade, launchReward, runStarCharts, startNewRun } from './prestige'
import { multipliers } from './production'
import { MAX_QUEUE_LENGTH, maxQueueLength, researchCost, startResearch } from './research'
import { createInitialState, type GameState } from './state'
import { capacities, grossRates } from './storage'
import { tick } from './tick'

/** A state with enough Star Charts to buy any upgrade. */
function richState(): GameState {
  const state = createInitialState()
  state.meta.starCharts = 1000
  state.meta.starChartsEarned = 1000
  return state
}

describe('new prestige upgrades', () => {
  it('Deep-Core Drills add seconds of ore production to each click', () => {
    const state = richState()
    state.buildings.drone.count = 100
    const before = clickYield(state)
    expect(before).toBe(clickPower(state))
    expect(buyPrestigeUpgrade(state, 'deepCoreDrills')).toBe(true)
    const rate = grossRates(state).ore
    expect(clickYield(state)).toBeCloseTo(clickPower(state) + rate * 2)
    const ore = state.resources.ore
    mine(state)
    expect(state.resources.ore).toBeCloseTo(ore + clickYield(state))
  })

  it('Event Beacon and Long-Range Comms make events more frequent and longer', () => {
    const state = richState()
    buyPrestigeUpgrade(state, 'eventBeacon')
    buyPrestigeUpgrade(state, 'eventBeacon')
    buyPrestigeUpgrade(state, 'longRangeComms')
    state.events.nextIn = 0
    updateEvents(state, 1, () => 0, true)
    expect(state.events.active?.remaining).toBe(EVENT_LIFETIME * 2)
    expect(state.events.nextIn).toBeCloseTo(EVENT_INTERVAL.min / 1.5)
  })

  it('Parallel Research adds queue slots', () => {
    const state = richState()
    expect(maxQueueLength(state)).toBe(MAX_QUEUE_LENGTH)
    buyPrestigeUpgrade(state, 'parallelResearch')
    buyPrestigeUpgrade(state, 'parallelResearch')
    expect(maxQueueLength(state)).toBe(MAX_QUEUE_LENGTH + 2)
  })

  it('Research Grants make projects cheaper', () => {
    const state = richState()
    buyPrestigeUpgrade(state, 'researchGrants')
    const full = getResearch('automation').cost
    const cost = researchCost(state, 'automation')
    for (const [r, amount] of Object.entries(full)) {
      expect(cost[r as keyof typeof cost]).toBeCloseTo((amount ?? 0) * 0.8)
    }
    // Starting pays the discounted price.
    state.buildings.lab.count = 1
    for (const [r, amount] of Object.entries(cost)) {
      state.resources[r as keyof typeof cost] = amount ?? 0
    }
    expect(startResearch(state, 'automation')).toBe(true)
    {
      for (const r of Object.keys(cost))
        expect(state.resources[r as keyof typeof cost]).toBeCloseTo(0)
    }
  })

  it('Industrial Doctrine raises the output of converters only', () => {
    const state = richState()
    const refinery = multipliers(state, 'refinery').output
    const drone = multipliers(state, 'drone').output
    buyPrestigeUpgrade(state, 'industrialDoctrine')
    expect(multipliers(state, 'refinery').output).toBeCloseTo(refinery * 1.1)
    expect(multipliers(state, 'drone').output).toBe(drone)
  })

  it('Mass Production lowers building costs', () => {
    const state = richState()
    const def = getBuilding('drone')
    buyPrestigeUpgrade(state, 'massProduction')
    expect(buildingCostFactor(state)).toBeCloseTo(0.95)
    const full = buildingCost(def, 10, 1)
    const cheap = buildingCost(def, 10, 1, buildingCostFactor(state))
    for (const [r, amount] of Object.entries(full)) {
      expect(cheap[r as keyof typeof cheap]).toBeCloseTo((amount ?? 0) * 0.95)
    }
  })

  it('Prefab Colony starts runs with buildings that are shown right away', () => {
    const state = richState()
    buyPrestigeUpgrade(state, 'prefabColony')
    startNewRun(state)
    expect(state.buildings.solarField.count).toBe(10)
    expect(state.buildings.refinery.count).toBe(3)
    expect(state.buildings.tradePost.count).toBe(2)
    expect(state.resources.credits).toBeGreaterThanOrEqual(2000)
    expect(state.unlockedBuildings).toEqual(
      expect.arrayContaining(['solarField', 'refinery', 'tradePost']),
    )
  })

  it('Cartography adds Star Charts to each launch', () => {
    const state = richState()
    state.stats.produced.alloys = 1e9
    const base = launchReward(state)
    buyPrestigeUpgrade(state, 'cartography')
    expect(runStarCharts(state)).toBeGreaterThan(0)
    expect(launchReward(state)).toBe(Math.floor(base * 1.1))
  })
})

describe('Automated Logistics', () => {
  function buildableHull(): GameState {
    const state = richState()
    state.research.completed.push('hullEngineering')
    const caps = capacities(state)
    state.resources.alloys = caps.alloys
    return state
  }

  it('does nothing without the upgrade or while switched off', () => {
    const state = buildableHull()
    state.meta.autoDeliver = true
    runAutoDeliver(state)
    expect(state.ark.modules.hull.delivered.alloys).toBeUndefined()
    buyPrestigeUpgrade(state, 'autoLogistics')
    state.meta.autoDeliver = false
    runAutoDeliver(state)
    expect(state.ark.modules.hull.delivered.alloys).toBeUndefined()
  })

  it('delivers everything above half of the storage', () => {
    const state = buildableHull()
    buyPrestigeUpgrade(state, 'autoLogistics')
    state.meta.autoDeliver = true
    const cap = capacities(state).alloys
    runAutoDeliver(state)
    expect(state.resources.alloys).toBeCloseTo(cap * AUTO_DELIVER_KEEP_SHARE)
    expect(state.ark.modules.hull.delivered.alloys).toBeCloseTo(cap * (1 - AUTO_DELIVER_KEEP_SHARE))
  })

  it('runs as part of the tick', () => {
    const state = buildableHull()
    buyPrestigeUpgrade(state, 'autoLogistics')
    state.meta.autoDeliver = true
    tick(state, 1)
    expect(state.ark.modules.hull.delivered.alloys ?? 0).toBeGreaterThan(0)
  })
})
