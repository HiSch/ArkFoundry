import { describe, expect, it } from 'vitest'
import { getUpgrade } from '../content/upgrades'
import { createInitialState } from '../core/state'
import { updateUnlocks } from '../core/unlocks'
import { tabNeedsAttention, visibleTabs } from './tabs'

describe('visibleTabs', () => {
  it('shows only the basics at the start', () => {
    const state = createInitialState()
    expect(visibleTabs(state).map((t) => t.id)).toEqual(['colony', 'ark', 'more'])
  })

  it('reveals research and upgrades once discovered', () => {
    const state = createInitialState()
    state.buildings.lab.count = 1
    state.stats.produced.ore = 1e6
    updateUnlocks(state)
    expect(visibleTabs(state).map((t) => t.id)).toEqual([
      'colony',
      'research',
      'upgrades',
      'ark',
      'more',
    ])
  })

  it('shows Ark progress in the label', () => {
    const state = createInitialState()
    state.ark.modules.hull.launched = true
    expect(visibleTabs(state).find((t) => t.id === 'ark')?.label).toBe('Ark 1/7')
  })
})

describe('tabNeedsAttention', () => {
  it('flags affordable upgrades', () => {
    const state = createInitialState()
    state.stats.produced.ore = 1e6
    updateUnlocks(state)
    expect(tabNeedsAttention(state, 'upgrades')).toBe(false)
    state.resources.ore = getUpgrade('plasmaPick').cost.ore!
    expect(tabNeedsAttention(state, 'upgrades')).toBe(true)
  })

  it('flags an idle research queue with an affordable project', () => {
    const state = createInitialState()
    state.buildings.lab.count = 1
    state.resources.research = 1e6
    expect(tabNeedsAttention(state, 'research')).toBe(true)
    state.research.queue.push({ id: 'automation', progress: 0 })
    expect(tabNeedsAttention(state, 'research')).toBe(false)
  })

  it('flags a module ready for launch', () => {
    const state = createInitialState()
    expect(tabNeedsAttention(state, 'ark')).toBe(false)
    state.ark.modules.hull.completed = true
    expect(tabNeedsAttention(state, 'ark')).toBe(true)
  })
})
