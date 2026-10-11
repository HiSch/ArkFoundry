import { describe, expect, it } from 'vitest'
import { getModule } from '../content/modules'
import { RESOURCE_IDS, type ResourceId } from '../content/resources'
import {
  canBuildModule,
  completedModules,
  deliverToModule,
  moduleBottleneck,
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

describe('moduleBottleneck', () => {
  function hullState() {
    const state = createInitialState()
    state.research.completed.push('hullEngineering')
    return state
  }

  function rates(values: Partial<Record<ResourceId, number>>): Record<ResourceId, number> {
    return Object.fromEntries(RESOURCE_IDS.map((id) => [id, values[id] ?? 0])) as Record<
      ResourceId,
      number
    >
  }

  it('picks the resource that takes longest at the current rates', () => {
    const state = hullState()
    // Hull: 700k alloys, 85k components, 140k Helium-3.
    const result = moduleBottleneck(
      state,
      'hull',
      rates({ alloys: 100, components: 100, helium3: 10 }),
    )
    expect(result?.resource).toBe('helium3')
    expect(result?.missing).toBe(140000)
    expect(result?.seconds).toBe(14000)
  })

  it('counts the stock and reports resources that are not produced', () => {
    const state = hullState()
    state.resources.helium3 = 140000
    const result = moduleBottleneck(state, 'hull', rates({ alloys: 100 }))
    expect(result?.resource).toBe('components')
    expect(result?.seconds).toBe(Infinity)
  })

  it('is null when the stock covers everything or the module is locked', () => {
    const state = hullState()
    state.resources.alloys = 7e5
    state.resources.components = 85000
    state.resources.helium3 = 140000
    expect(moduleBottleneck(state, 'hull', rates({}))).toBeNull()
    expect(moduleBottleneck(createInitialState(), 'hull', rates({ alloys: 1 }))).toBeNull()
  })
})
