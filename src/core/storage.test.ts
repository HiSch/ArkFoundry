import { describe, expect, it } from 'vitest'
import { getBuilding } from '../content/buildings'
import { getUpgrade } from '../content/upgrades'
import { mine } from './actions'
import { computeFlows } from './production'
import { createInitialState } from './state'
import {
  BASE_CAPACITY,
  BASE_STORAGE_HOURS,
  capacities,
  clampToCapacity,
  grossRates,
  storageHours,
} from './storage'
import { tick } from './tick'

const droneOre = getBuilding('drone').produces.ore!

describe('clampToCapacity', () => {
  it('applies changes below capacity', () => {
    expect(clampToCapacity(100, 50, 1000)).toEqual({ value: 150, lost: 0 })
    expect(clampToCapacity(100, -150, 1000)).toEqual({ value: 0, lost: 0 })
  })

  it('loses gains above capacity', () => {
    expect(clampToCapacity(900, 300, 1000)).toEqual({ value: 1000, lost: 200 })
  })

  it('keeps a stock that is already above capacity but stops it growing', () => {
    expect(clampToCapacity(1500, 100, 1000)).toEqual({ value: 1500, lost: 100 })
    expect(clampToCapacity(1500, -200, 1000)).toEqual({ value: 1300, lost: 0 })
  })
})

describe('capacities', () => {
  it('has a minimum capacity', () => {
    const caps = capacities(createInitialState())
    expect(caps.ore).toBe(BASE_CAPACITY)
    expect(caps.credits).toBe(BASE_CAPACITY)
  })

  it('holds a number of hours of gross production', () => {
    const state = createInitialState()
    state.buildings.drone.count = 100
    const expected = 100 * droneOre * multiplierFor100() * BASE_STORAGE_HOURS * 3600
    expect(capacities(state).ore).toBeCloseTo(expected)
  })

  it('does not shrink when a building is switched off', () => {
    const state = createInitialState()
    state.buildings.refinery.count = 2000
    const before = capacities(state).metal
    state.buildings.refinery.enabled = false
    expect(capacities(state).metal).toBe(before)
    expect(grossRates(state).metal).toBeGreaterThan(0)
  })

  it('grows with storage upgrades', () => {
    const state = createInitialState()
    state.upgrades.push('expandedSilos', 'deepVaults')
    const added = ['expandedSilos', 'deepVaults'].reduce((sum, id) => {
      const effect = getUpgrade(id as 'deepVaults').effects[0]
      return sum + (effect.type === 'storageHours' ? effect.add : 0)
    }, 0)
    expect(storageHours(state)).toBe(BASE_STORAGE_HOURS + added)
  })
})

describe('storage limits', () => {
  it('stops production at capacity and reports what was missed', () => {
    const state = createInitialState()
    state.buildings.drone.count = 1
    const cap = capacities(state).ore
    state.resources.ore = cap - 0.1
    const totals = tick(state, 1)!
    expect(state.resources.ore).toBe(cap)
    expect(totals.missed.ore).toBeCloseTo(droneOre - 0.1)
    expect(state.stats.produced.ore).toBeCloseTo(0.1)
  })

  it('by default keeps converters running and loses the surplus', () => {
    const state = createInitialState()
    state.buildings.refinery.count = 1
    state.resources.ore = 500
    state.resources.energy = 500
    const cap = capacities(state).metal
    state.resources.metal = cap
    const totals = tick(state, 1)!
    expect(totals.consumed.ore).toBeGreaterThan(0)
    expect(state.resources.metal).toBe(cap)
    expect(totals.missed.metal).toBeCloseTo(getBuilding('refinery').produces.metal!)
    const flows = computeFlows(state, 1, capacities(state))
    expect(flows.efficiency.refinery).toBe(1)
    expect(flows.limit.refinery).toBe('overflow')
  })

  it('pauses converters with full output storage with the Auto-Pause upgrade', () => {
    const state = createInitialState()
    state.meta.prestigeUpgrades.autoPause = 1
    state.buildings.refinery.count = 1
    state.resources.ore = 500
    state.resources.energy = 500
    state.resources.metal = capacities(state).metal
    const totals = tick(state, 1)!
    expect(totals.consumed.ore).toBe(0)
    expect(totals.consumed.energy).toBe(0)
    expect(state.resources.ore).toBe(500)
    expect(totals.missed.metal).toBeGreaterThan(0)
    const flows = computeFlows(state, 1, capacities(state))
    expect(flows.efficiency.refinery).toBe(0)
    expect(flows.limit.refinery).toBe('storage')
  })

  it('with Auto-Pause runs converters only as far as there is room for the output', () => {
    const state = createInitialState()
    state.meta.prestigeUpgrades.autoPause = 1
    state.buildings.refinery.count = 1
    state.resources.ore = 500
    state.resources.energy = 500
    const metalOut = getBuilding('refinery').produces.metal!
    state.resources.metal = capacities(state).metal - metalOut / 2
    const flows = computeFlows(state, 1, capacities(state))
    expect(flows.efficiency.refinery).toBeCloseTo(0.5)
    expect(flows.produced.metal).toBeCloseTo(metalOut / 2)
  })

  it('reports input shortages as the limit when storage has room', () => {
    const state = createInitialState()
    state.buildings.refinery.count = 1
    const flows = computeFlows(state, 1, capacities(state))
    expect(flows.efficiency.refinery).toBe(0)
    expect(flows.limit.refinery).toBe('inputs')
  })

  it('also limits manual mining', () => {
    const state = createInitialState()
    state.resources.ore = BASE_CAPACITY
    mine(state)
    expect(state.resources.ore).toBe(BASE_CAPACITY)
    expect(state.stats.produced.ore).toBe(0)
  })
})

function multiplierFor100(): number {
  // 100 drones have passed the 25, 50 and 100 milestones.
  return 8
}
