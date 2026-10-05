import { describe, expect, it } from 'vitest'
import { createInitialState } from './state'
import { advance, tick } from './tick'

describe('tick', () => {
  it('produces ore and counts play time', () => {
    const state = createInitialState()
    tick(state, 2.5)
    expect(state.resources.ore).toBeCloseTo(2.5)
    expect(state.playTime).toBeCloseTo(2.5)
  })

  it('ignores non-positive time', () => {
    const state = createInitialState()
    tick(state, 0)
    tick(state, -1)
    expect(state.resources.ore).toBe(0)
    expect(state.playTime).toBe(0)
  })
})

describe('advance', () => {
  it('gives the same result as one tick for linear production', () => {
    const state = createInitialState()
    advance(state, 3600)
    expect(state.resources.ore).toBeCloseTo(3600)
    expect(state.playTime).toBeCloseTo(3600)
  })

  it('handles fractional remainders', () => {
    const state = createInitialState()
    advance(state, 2.25)
    expect(state.playTime).toBeCloseTo(2.25)
  })
})
