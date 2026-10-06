import { describe, expect, it } from 'vitest'
import { getBuilding } from '../content/buildings'
import { catchUp, MAX_OFFLINE_SECONDS } from './offline'
import { createInitialState } from './state'
import { BASE_STORAGE_HOURS, capacities } from './storage'
import { advance } from './tick'

const droneOre = getBuilding('drone').produces.ore!

describe('catchUp', () => {
  it('produces like live play for the time away', () => {
    const state = createInitialState()
    state.buildings.drone.count = 10
    const report = catchUp(state, 3600)
    expect(report.seconds).toBe(3600)
    expect(report.change.ore).toBeCloseTo(10 * droneOre * 3600)
    expect(report.missed.ore).toBe(0)
    expect(state.playTime).toBeCloseTo(3600)
  })

  it('matches step-by-step simulation for converter chains', () => {
    const setup = () => {
      const state = createInitialState()
      state.buildings.drone.count = 20
      state.buildings.solarField.count = 5
      state.buildings.refinery.count = 2
      return state
    }
    const live = setup()
    advance(live, 8 * 3600)
    const offline = setup()
    catchUp(offline, 8 * 3600)
    for (const id of ['ore', 'energy', 'metal'] as const) {
      expect(offline.resources[id]).toBeCloseTo(live.resources[id], 0)
    }
  })

  it('stops production once storage is full', () => {
    const state = createInitialState()
    state.buildings.drone.count = 10
    const hours = BASE_STORAGE_HOURS + 4
    const report = catchUp(state, hours * 3600)
    expect(state.resources.ore).toBeCloseTo(capacities(state).ore)
    expect(report.missed.ore).toBeCloseTo(10 * droneOre * 4 * 3600, -1)
  })

  it('ignores negative time and limits very long absences', () => {
    const state = createInitialState()
    expect(catchUp(state, -100).seconds).toBe(0)
    expect(catchUp(state, MAX_OFFLINE_SECONDS * 2).seconds).toBe(MAX_OFFLINE_SECONDS)
  })
})
