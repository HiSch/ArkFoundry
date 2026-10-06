import { describe, expect, it } from 'vitest'
import { getBuilding } from '../content/buildings'
import { getUpgrade } from '../content/upgrades'
import { buyBuilding, buyUpgrade, clickPower, mine, purchaseQuantity } from './actions'
import { buildingCost, maxAffordable } from './costs'
import { createInitialState } from './state'
import { updateUnlocks } from './unlocks'

function freshState() {
  const state = createInitialState()
  updateUnlocks(state)
  return state
}

const drone = getBuilding('drone')
const droneCost = drone.cost.ore!
const g = drone.costGrowth

describe('mining', () => {
  it('gains ore per click and counts clicks', () => {
    const state = freshState()
    mine(state)
    mine(state)
    expect(state.resources.ore).toBe(2)
    expect(state.stats.clicks).toBe(2)
    expect(state.stats.produced.ore).toBe(2)
  })

  it('grows with click upgrades', () => {
    const state = freshState()
    state.upgrades.push('plasmaPick', 'tungstenPick')
    const bonus = ['plasmaPick', 'tungstenPick'].reduce((sum, id) => {
      const effect = getUpgrade(id as 'plasmaPick').effects[0]
      return sum + (effect.type === 'clickPower' ? effect.add : 0)
    }, 0)
    expect(clickPower(state)).toBe(1 + bonus)
  })
})

describe('building costs', () => {
  it('grows geometrically', () => {
    expect(buildingCost(drone, 0, 1).ore).toBeCloseTo(droneCost)
    expect(buildingCost(drone, 1, 1).ore).toBeCloseTo(droneCost * g)
    expect(buildingCost(drone, 0, 2).ore).toBeCloseTo(droneCost * (1 + g))
  })

  it('finds the maximum affordable amount', () => {
    const state = freshState()
    state.resources.ore = droneCost * (1 + g)
    expect(maxAffordable(state, drone)).toBe(2)
    state.resources.ore = droneCost * (1 + g) - 0.01
    expect(maxAffordable(state, drone)).toBe(1)
    state.resources.ore = 0
    expect(maxAffordable(state, drone)).toBe(0)
  })

  it('uses the scarcest resource for multi-resource costs', () => {
    const state = freshState()
    const refinery = getBuilding('refinery')
    state.resources.ore = 1e9
    state.resources.energy = refinery.cost.energy!
    expect(maxAffordable(state, refinery)).toBe(1)
  })
})

describe('buying', () => {
  it('buys buildings and pays the cost', () => {
    const state = freshState()
    state.resources.ore = droneCost + 5
    expect(buyBuilding(state, 'drone', 1)).toBe(1)
    expect(state.buildings.drone.count).toBe(1)
    expect(state.resources.ore).toBeCloseTo(5)
  })

  it('refuses unaffordable or locked purchases', () => {
    const state = freshState()
    state.resources.ore = droneCost - 1
    expect(buyBuilding(state, 'drone', 1)).toBe(0)
    state.resources.ore = 1e9
    expect(buyBuilding(state, 'solarField', 1)).toBe(0)
  })

  it('buys the maximum affordable amount', () => {
    const state = freshState()
    state.resources.ore = droneCost * 20
    const quantity = purchaseQuantity(state, 'drone', 'max')
    expect(quantity).toBeGreaterThan(1)
    expect(buyBuilding(state, 'drone', 'max')).toBe(quantity)
    expect(state.resources.ore).toBeLessThan(buildingCost(drone, quantity, 1).ore!)
  })

  it('buys an upgrade only once', () => {
    const state = freshState()
    const cost = getUpgrade('plasmaPick').cost.ore!
    state.stats.produced.ore = 1e6
    updateUnlocks(state)
    state.resources.ore = cost + 10
    expect(buyUpgrade(state, 'plasmaPick')).toBe(true)
    expect(buyUpgrade(state, 'plasmaPick')).toBe(false)
    expect(state.resources.ore).toBeCloseTo(10)
  })
})
