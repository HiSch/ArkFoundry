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
