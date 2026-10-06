import { describe, expect, it } from 'vitest'
import { getBuilding } from '../content/buildings'
import { createInitialState } from './state'
import { advance, tick } from './tick'
import { updateUnlocks } from './unlocks'

const droneOre = getBuilding('drone').produces.ore!

describe('tick', () => {
  it('only counts play time without buildings', () => {
    const state = createInitialState()
    tick(state, 2.5)
    expect(state.resources.ore).toBe(0)
    expect(state.playTime).toBeCloseTo(2.5)
  })

  it('ignores non-positive time', () => {
    const state = createInitialState()
    state.buildings.drone.count = 1
    expect(tick(state, 0)).toBeNull()
    tick(state, -1)
    expect(state.resources.ore).toBe(0)
    expect(state.playTime).toBe(0)
  })

  it('produces from buildings and records statistics', () => {
    const state = createInitialState()
    state.buildings.drone.count = 4
    tick(state, 1)
    expect(state.resources.ore).toBeCloseTo(4 * droneOre)
    expect(state.stats.produced.ore).toBeCloseTo(4 * droneOre)
  })

  it('reveals buildings when their unlock condition is met', () => {
    const state = createInitialState()
    updateUnlocks(state)
    expect(state.unlockedBuildings).toEqual(['drone'])
    const solar = getBuilding('solarField').unlock
    if (solar.type !== 'produced') throw new Error('test expects a production unlock')
    state.stats.produced[solar.resource] = solar.amount
    tick(state, 0.1)
    expect(state.unlockedBuildings).toContain('solarField')
  })
})

describe('advance', () => {
  it('sums production over long periods', () => {
    const state = createInitialState()
    state.buildings.drone.count = 2
    const totals = advance(state, 3600)
    expect(state.resources.ore).toBeCloseTo(2 * droneOre * 3600)
    expect(totals.produced.ore).toBeCloseTo(2 * droneOre * 3600)
    expect(state.playTime).toBeCloseTo(3600)
  })

  it('handles fractional remainders', () => {
    const state = createInitialState()
    advance(state, 2.25)
    expect(state.playTime).toBeCloseTo(2.25)
  })
})
