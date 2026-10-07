import { describe, expect, it } from 'vitest'
import {
  BROKEN_SAVE_KEY,
  SAVE_KEY,
  SAVE_VERSION,
  createSave,
  deserialize,
  exportSave,
  importSave,
  readSave,
  serialize,
  writeSave,
  type SaveStorage,
} from './save'
import { createInitialState } from './state'

function memoryStorage(): SaveStorage & { data: Map<string, string> } {
  const data = new Map<string, string>()
  return {
    data,
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
    removeItem: (key) => void data.delete(key),
  }
}

describe('save', () => {
  it('round-trips through serialize and deserialize', () => {
    const state = createInitialState()
    state.resources.ore = 123.5
    state.buildings.drone.count = 3
    state.upgrades.push('plasmaPick')
    state.playTime = 99
    const save = createSave(state, 1000)
    const loaded = deserialize(serialize(save))
    expect(loaded).toEqual({ version: SAVE_VERSION, savedAt: 1000, state })
  })

  it('copies the state instead of keeping a reference', () => {
    const state = createInitialState()
    const save = createSave(state, 0)
    state.resources.ore = 50
    expect(save.state.resources.ore).toBe(0)
  })

  it('round-trips through export and import', () => {
    const state = createInitialState()
    state.resources.ore = 4.2e9
    const text = exportSave(createSave(state, 5))
    expect(text).toMatch(/^[A-Za-z0-9+/=]+$/)
    expect(importSave(`  ${text}\n`).state.resources.ore).toBe(4.2e9)
  })

  it('fills in missing fields with defaults', () => {
    const loaded = deserialize(JSON.stringify({ version: SAVE_VERSION, savedAt: 1, state: {} }))
    expect(loaded.state).toEqual(createInitialState())
  })

  it('migrates phase 0 saves (version 1)', () => {
    const v1 = { version: 1, savedAt: 3, state: { resources: { ore: 500 }, playTime: 42 } }
    const loaded = deserialize(JSON.stringify(v1))
    expect(loaded.version).toBe(SAVE_VERSION)
    expect(loaded.state.playTime).toBe(42)
    expect(loaded.state.resources.ore).toBe(0)
    expect(loaded.state.buildings.drone.count).toBe(0)
  })

  it('migrates version 2 saves by adding research', () => {
    const state = createInitialState() as unknown as Record<string, unknown>
    delete state.research
    const loaded = deserialize(JSON.stringify({ version: 2, savedAt: 1, state }))
    expect(loaded.state.research).toEqual({ completed: [], queue: [] })
  })

  it('migrates version 3 saves by adding the Ark', () => {
    const state = createInitialState() as unknown as Record<string, unknown>
    delete state.ark
    const loaded = deserialize(JSON.stringify({ version: 3, savedAt: 1, state }))
    expect(loaded.state.ark).toEqual(createInitialState().ark)
  })

  it('migrates version 4 saves by adding prestige progress', () => {
    const state = createInitialState() as unknown as Record<string, unknown>
    delete state.meta
    const ark = state.ark as { modules: Record<string, Record<string, unknown>> }
    delete ark.modules.hull.launched
    const loaded = deserialize(JSON.stringify({ version: 4, savedAt: 1, state }))
    // Later migrations mark the intro as seen for existing players.
    expect(loaded.state.meta).toEqual({ ...createInitialState().meta, introSeen: true })
    expect(loaded.state.ark.modules.hull.launched).toBe(false)
  })

  it('migrates version 5 saves by adding events and the story log', () => {
    const state = createInitialState() as unknown as Record<string, unknown>
    delete state.events
    delete state.boosts
    const meta = state.meta as Record<string, unknown>
    delete meta.storyLog
    delete meta.storyRead
    delete meta.introSeen
    const loaded = deserialize(JSON.stringify({ version: 5, savedAt: 1, state }))
    expect(loaded.state.events).toEqual(createInitialState().events)
    expect(loaded.state.boosts).toEqual([])
    expect(loaded.state.meta.storyLog).toEqual([])
    expect(loaded.state.meta.introSeen).toBe(true)
  })

  it('migrates version 6 saves by adding late-game progress', () => {
    const state = createInitialState() as unknown as Record<string, unknown>
    const meta = state.meta as Record<string, unknown>
    delete meta.researchCompletions
    delete meta.achievements
    delete meta.eventsCollected
    delete meta.endingSeen
    const ark = state.ark as { modules: Record<string, Record<string, unknown>> }
    delete ark.modules.hull.deliveredThisRun
    const loaded = deserialize(JSON.stringify({ version: 6, savedAt: 1, state }))
    expect(loaded.state.meta.researchCompletions).toEqual({})
    expect(loaded.state.meta.achievements).toEqual([])
    expect(loaded.state.meta.eventsCollected).toBe(0)
    expect(loaded.state.meta.endingSeen).toBe(false)
    expect(loaded.state.ark.modules.hull.deliveredThisRun).toEqual({})
  })

  it('migrates version 7 saves by counting known research once', () => {
    const state = createInitialState() as unknown as Record<string, unknown>
    const meta = state.meta as Record<string, unknown>
    delete meta.researchCompletions
    meta.knownResearch = ['automation', 'metallurgy']
    const loaded = deserialize(JSON.stringify({ version: 7, savedAt: 1, state }))
    expect(loaded.state.meta.researchCompletions).toEqual({ automation: 1, metallurgy: 1 })
    expect('knownResearch' in loaded.state.meta).toBe(false)
  })

  it('drops ids of removed content', () => {
    const state = { ...createInitialState(), upgrades: ['plasmaPick', 'removedUpgrade'] }
    const loaded = deserialize(JSON.stringify({ version: SAVE_VERSION, savedAt: 1, state }))
    expect(loaded.state.upgrades).toEqual(['plasmaPick'])
  })

  it('rejects invalid input', () => {
    expect(() => deserialize('not json')).toThrow()
    expect(() => deserialize('{}')).toThrow(/version/)
    expect(() => deserialize(JSON.stringify({ version: SAVE_VERSION + 1 }))).toThrow(/newer/)
    expect(() => importSave('%%%')).toThrow()
  })

  it('writes to and reads from storage', () => {
    const storage = memoryStorage()
    expect(readSave(storage)).toBeNull()
    const state = createInitialState()
    state.resources.ore = 7
    writeSave(storage, createSave(state, 2))
    expect(readSave(storage)?.state.resources.ore).toBe(7)
  })

  it('keeps a copy of an unreadable save', () => {
    const storage = memoryStorage()
    storage.setItem(SAVE_KEY, 'garbage')
    expect(readSave(storage)).toBeNull()
    expect(storage.data.get(BROKEN_SAVE_KEY)).toBe('garbage')
  })
})
