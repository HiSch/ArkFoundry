import { describe, expect, it } from 'vitest'
import { launchModule } from './prestige'
import { createInitialState } from './state'
import { markMessagesRead, unreadMessages, updateStory } from './story'
import { tick } from './tick'

describe('story', () => {
  it('sends a message once its trigger is met', () => {
    const state = createInitialState()
    updateStory(state)
    expect(state.meta.storyLog).toEqual([])
    state.buildings.drone.count = 1
    tick(state, 0.1)
    expect(state.meta.storyLog).toEqual(['firstDrone'])
    expect(unreadMessages(state)).toBe(1)
    markMessagesRead(state)
    expect(unreadMessages(state)).toBe(0)
  })

  it('never repeats a message in later runs', () => {
    const state = createInitialState()
    state.buildings.drone.count = 1
    state.ark.modules.hull.completed = true
    tick(state, 0.1)
    launchModule(state, 'hull')
    state.buildings.drone.count = 1
    tick(state, 0.1)
    expect(state.meta.storyLog.filter((id) => id === 'firstDrone')).toHaveLength(1)
    expect(state.meta.storyLog).toContain('hullLaunched')
  })
})
