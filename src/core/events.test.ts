import { describe, expect, it } from 'vitest'
import { getEvent } from '../content/events'
import {
  boostFactor,
  collectEvent,
  eligibleEvents,
  EVENT_INTERVAL,
  EVENT_LIFETIME,
  eventResources,
  updateEvents,
} from './events'
import { multipliers } from './production'
import { createInitialState, FIRST_EVENT_SECONDS } from './state'
import { grossRates } from './storage'
import { advance } from './tick'

const first = () => 0

describe('event spawning', () => {
  it('spawns the first event after a fixed time of live play', () => {
    const state = createInitialState()
    updateEvents(state, FIRST_EVENT_SECONDS - 1, first, true)
    expect(state.events.active).toBeNull()
    updateEvents(state, 1, first, true)
    expect(state.events.active).toEqual({ id: 'meteorShower', remaining: EVENT_LIFETIME })
    expect(state.events.nextIn).toBe(EVENT_INTERVAL.min)
  })

  it('does not spawn during offline time or debug skips', () => {
    const state = createInitialState()
    updateEvents(state, 10 * FIRST_EVENT_SECONDS, first, false)
    expect(state.events.active).toBeNull()
    expect(state.events.nextIn).toBe(FIRST_EVENT_SECONDS)
  })

  it('lets an uncollected event expire', () => {
    const state = createInitialState()
    state.events.active = { id: 'meteorShower', remaining: 10 }
    updateEvents(state, 11, first, false)
    expect(state.events.active).toBeNull()
  })

  it('only offers events for resources produced in this run', () => {
    const state = createInitialState()
    expect(eligibleEvents(state).map((e) => e.id)).toEqual(['meteorShower'])
    state.stats.produced.credits = 1
    expect(eligibleEvents(state).map((e) => e.id)).toContain('trader')
  })
})

describe('collecting', () => {
  it('gives a lump sum based on gross production', () => {
    const state = createInitialState()
    state.buildings.drone.count = 100
    const def = getEvent('meteorShower')
    if (def.reward.type !== 'resource') throw new Error('unexpected reward')
    const expected = grossRates(state).ore * def.reward.seconds
    expect(eventResources(state, def).ore).toBeCloseTo(expected)
    state.events.active = { id: 'meteorShower', remaining: 5 }
    expect(collectEvent(state)?.id).toBe('meteorShower')
    expect(state.resources.ore).toBeCloseTo(expected)
    expect(state.events.active).toBeNull()
    expect(collectEvent(state)).toBeNull()
  })

  it('gives at least the minimum early in the game', () => {
    const state = createInitialState()
    const def = getEvent('meteorShower')
    if (def.reward.type !== 'resource') throw new Error('unexpected reward')
    expect(eventResources(state, def).ore).toBe(def.reward.minimum)
  })

  it('boosts all buildings for a while', () => {
    const state = createInitialState()
    const def = getEvent('distressCall')
    if (def.reward.type !== 'boost') throw new Error('unexpected reward')
    state.events.active = { id: 'distressCall', remaining: 5 }
    collectEvent(state)
    expect(boostFactor(state)).toBe(def.reward.factor)
    expect(multipliers(state, 'drone').throughput).toBeCloseTo(def.reward.factor)
    advance(state, def.reward.duration + 1)
    expect(state.boosts).toEqual([])
    expect(multipliers(state, 'drone').throughput).toBe(1)
  })
})
