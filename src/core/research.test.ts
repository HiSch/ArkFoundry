import { describe, expect, it } from 'vitest'
import { getResearch } from '../content/research'
import { multipliers } from './production'
import {
  availableResearch,
  cancelResearch,
  canStartResearch,
  MAX_QUEUE_LENGTH,
  queueTimeRemaining,
  researchDiscovered,
  startResearch,
} from './research'
import { createInitialState } from './state'
import { advance } from './tick'
import { updateUnlocks } from './unlocks'

function labState() {
  const state = createInitialState()
  state.buildings.lab.count = 1
  state.resources.research = 1e6
  return state
}

const automation = getResearch('automation')

describe('availability', () => {
  it('is hidden until the first lab is built', () => {
    const state = createInitialState()
    expect(researchDiscovered(state)).toBe(false)
    state.resources.research = 1e6
    expect(startResearch(state, 'automation')).toBe(false)
  })

  it('offers only projects whose prerequisites are done', () => {
    const state = labState()
    expect(availableResearch(state).map((r) => r.id)).toEqual(['automation'])
    state.research.completed.push('automation')
    const ids = availableResearch(state).map((r) => r.id)
    expect(ids).toContain('metallurgy')
    expect(ids).not.toContain('automation')
    expect(ids).not.toContain('alloyProcessing')
  })
})

describe('queue', () => {
  it('pays when queueing and refunds when cancelling', () => {
    const state = labState()
    const before = state.resources.research
    expect(startResearch(state, 'automation')).toBe(true)
    expect(state.resources.research).toBe(before - automation.cost.research!)
    expect(availableResearch(state).map((r) => r.id)).not.toContain('automation')
    expect(cancelResearch(state, 'automation')).toBe(true)
    expect(state.resources.research).toBe(before)
    expect(state.research.queue).toEqual([])
  })

  it('refuses unaffordable projects and a full queue', () => {
    const state = labState()
    state.resources.research = 0
    expect(canStartResearch(state, 'automation')).toBe(false)
    state.resources.research = 1e6
    state.research.completed.push('automation')
    const ids = availableResearch(state).map((r) => r.id)
    for (const id of ids.slice(0, MAX_QUEUE_LENGTH)) expect(startResearch(state, id)).toBe(true)
    expect(startResearch(state, ids[MAX_QUEUE_LENGTH])).toBe(false)
  })

  it('advances only the first project and carries over leftover time', () => {
    const state = labState()
    state.research.completed.push('automation')
    startResearch(state, 'marketAnalysis')
    startResearch(state, 'metallurgy')
    const first = getResearch('marketAnalysis').duration
    advance(state, first + 100)
    expect(state.research.completed).toContain('marketAnalysis')
    expect(state.research.queue).toEqual([{ id: 'metallurgy', progress: 100 }])
    expect(queueTimeRemaining(state)).toBeCloseTo(getResearch('metallurgy').duration - 100)
  })

  it('completes during long offline steps as well', () => {
    const state = labState()
    startResearch(state, 'automation')
    advance(state, automation.duration * 2, 60)
    expect(state.research.completed).toEqual(['automation'])
  })
})

describe('effects', () => {
  it('applies completed research to production', () => {
    const state = labState()
    expect(multipliers(state, 'drone').throughput).toBe(1)
    state.research.completed.push('automation')
    const effect = automation.effects[0]
    if (effect.type !== 'throughput') throw new Error('unexpected effect')
    expect(multipliers(state, 'drone').throughput).toBe(effect.factor)
  })

  it('unlocks buildings', () => {
    const state = labState()
    updateUnlocks(state)
    expect(state.unlockedBuildings).not.toContain('smelter')
    state.research.completed.push('automation')
    startResearch(state, 'metallurgy')
    advance(state, getResearch('metallurgy').duration)
    expect(state.unlockedBuildings).toContain('smelter')
  })
})
