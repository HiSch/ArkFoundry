import { describe, expect, it } from 'vitest'
import { getModule } from '../content/modules'
import {
  canBuildModule,
  completedModules,
  deliverToModule,
  moduleProgress,
  moduleRemaining,
} from './ark'
import { createInitialState } from './state'

const hullCost = getModule('hull').cost

function hullState() {
  const state = createInitialState()
  state.research.completed.push('hullEngineering')
  return state
}

describe('Ark modules', () => {
  it('cannot be built before the required research', () => {
    const state = createInitialState()
    state.resources.alloys = 1e9
    expect(canBuildModule(state, 'hull')).toBe(false)
    expect(deliverToModule(state, 'hull')).toEqual({})
    expect(state.resources.alloys).toBe(1e9)
  })

  it('keeps later modules locked for now', () => {
    expect(canBuildModule(hullState(), 'reactor')).toBe(false)
  })

  it('takes partial deliveries and tracks progress', () => {
    const state = hullState()
    state.resources.alloys = hullCost.alloys! / 2
    const moved = deliverToModule(state, 'hull')
    expect(moved).toEqual({ alloys: hullCost.alloys! / 2 })
    expect(state.resources.alloys).toBe(0)
    // One of three resources is half done.
    expect(moduleProgress(state, 'hull')).toBeCloseTo(0.5 / 3)
    expect(moduleRemaining(state, 'hull').alloys).toBeCloseTo(hullCost.alloys! / 2)
    expect(state.ark.modules.hull.completed).toBe(false)
  })

  it('never takes more than needed and completes the module', () => {
    const state = hullState()
    state.resources.alloys = hullCost.alloys! * 3
    state.resources.components = hullCost.components! * 3
    state.resources.helium3 = hullCost.helium3! * 3
    deliverToModule(state, 'hull')
    expect(state.resources.alloys).toBeCloseTo(hullCost.alloys! * 2)
    expect(state.ark.modules.hull.completed).toBe(true)
    expect(moduleProgress(state, 'hull')).toBe(1)
    expect(completedModules(state)).toBe(1)
    expect(canBuildModule(state, 'hull')).toBe(false)
  })
})
