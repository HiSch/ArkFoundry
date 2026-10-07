import { ACHIEVEMENT_IDS } from '../content/achievements'
import { BUILDING_IDS } from '../content/buildings'
import { PRESTIGE_UPGRADE_IDS, type PrestigeUpgradeId } from '../content/prestige'
import { RESEARCH_IDS, type ResearchId } from '../content/research'
import { STORY_IDS } from '../content/story'
import { UPGRADE_IDS } from '../content/upgrades'
import { createInitialState, type GameState } from './state'

/** Current save format version. Bump it and add a migration on every format change. */
export const SAVE_VERSION = 8

export interface SaveData {
  version: number
  /** Unix time in milliseconds when the save was written. */
  savedAt: number
  state: GameState
}

/**
 * Migrations from version N to N + 1, indexed by N. Each one receives the raw
 * save object of version N and returns the object for version N + 1.
 */
const migrations: Record<number, (save: Record<string, unknown>) => Record<string, unknown>> = {
  // v1 (phase 0) only had a placeholder ore counter. Keep play time, start the economy fresh.
  1: (save) => {
    const old = (save.state ?? {}) as { playTime?: number }
    const state = createInitialState()
    state.playTime = typeof old.playTime === 'number' ? old.playTime : 0
    return { ...save, state }
  },
  // v3 adds research.
  2: (save) => {
    const state = (save.state ?? {}) as Record<string, unknown>
    return { ...save, state: { ...state, research: { completed: [], queue: [] } } }
  },
  // v4 adds the Ark and its modules.
  3: (save) => {
    const state = (save.state ?? {}) as Record<string, unknown>
    return { ...save, state: { ...state, ark: createInitialState().ark } }
  },
  // v5 adds prestige progress; module launch flags are filled in by normalize.
  4: (save) => {
    const state = (save.state ?? {}) as Record<string, unknown>
    return { ...save, state: { ...state, meta: createInitialState().meta } }
  },
  // v6 adds events, boosts and the story log. Existing players skip the intro.
  5: (save) => {
    const state = (save.state ?? {}) as Record<string, unknown>
    const fresh = createInitialState()
    const meta = { ...fresh.meta, ...(state.meta as object), introSeen: true }
    return { ...save, state: { ...state, events: fresh.events, boosts: [], meta } }
  },
  // v7 adds known research, achievements, an event counter, the ending flag
  // and per-run module deliveries (filled in by normalize).
  6: (save) => {
    const state = (save.state ?? {}) as Record<string, unknown>
    const fresh = createInitialState().meta
    const meta = {
      ...(state.meta as object),
      knownResearch: [],
      achievements: [],
      eventsCollected: 0,
      endingSeen: fresh.endingSeen,
    }
    return { ...save, state: { ...state, meta } }
  },
  // v8 counts research completions instead of only remembering known research.
  7: (save) => {
    const state = (save.state ?? {}) as Record<string, unknown>
    const { knownResearch = [], ...meta } = (state.meta ?? {}) as Record<string, unknown> & {
      knownResearch?: string[]
    }
    const researchCompletions = Object.fromEntries(knownResearch.map((id) => [id, 1]))
    return { ...save, state: { ...state, meta: { ...meta, researchCompletions } } }
  },
}

export function createSave(state: GameState, now: number): SaveData {
  // JSON round trip instead of structuredClone: it also works on reactive proxies.
  return { version: SAVE_VERSION, savedAt: now, state: JSON.parse(JSON.stringify(state)) }
}

export function serialize(save: SaveData): string {
  return JSON.stringify(save)
}

/** Parses a save string, migrating older versions. Throws on invalid input. */
export function deserialize(text: string): SaveData {
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    throw new Error('Save data is not valid JSON')
  }
  if (typeof raw !== 'object' || raw === null || typeof (raw as SaveData).version !== 'number') {
    throw new Error('Save data has no version')
  }
  let save = raw as Record<string, unknown>
  let version = save.version as number
  if (version > SAVE_VERSION) throw new Error(`Save version ${version} is newer than the game`)
  while (version < SAVE_VERSION) {
    const migrate = migrations[version]
    if (!migrate) throw new Error(`No migration from save version ${version}`)
    save = migrate(save)
    version += 1
    save.version = version
  }
  return normalize(save as unknown as SaveData)
}

/**
 * Fills in fields missing from hand-edited saves or added by new content
 * (e.g. a new building) with defaults. Structural changes still need a migration.
 */
function normalize(save: SaveData): SaveData {
  const defaults = createInitialState()
  const state: Partial<GameState> = save.state ?? {}
  const buildings = { ...defaults.buildings }
  for (const id of Object.keys(buildings) as (keyof typeof buildings)[]) {
    buildings[id] = { ...defaults.buildings[id], ...state.buildings?.[id] }
  }
  const modules = { ...defaults.ark.modules }
  for (const id of Object.keys(modules) as (keyof typeof modules)[]) {
    modules[id] = { ...defaults.ark.modules[id], ...state.ark?.modules?.[id] }
  }
  return {
    version: SAVE_VERSION,
    savedAt: typeof save.savedAt === 'number' ? save.savedAt : Date.now(),
    state: {
      ...defaults,
      ...state,
      resources: { ...defaults.resources, ...state.resources },
      buildings,
      // Drop ids of content that no longer exists.
      upgrades: (state.upgrades ?? []).filter((id) => UPGRADE_IDS.includes(id)),
      unlockedBuildings: (state.unlockedBuildings ?? []).filter((id) => BUILDING_IDS.includes(id)),
      unlockedUpgrades: (state.unlockedUpgrades ?? []).filter((id) => UPGRADE_IDS.includes(id)),
      research: {
        completed: (state.research?.completed ?? []).filter((id) => RESEARCH_IDS.includes(id)),
        queue: (state.research?.queue ?? []).filter((entry) => RESEARCH_IDS.includes(entry.id)),
      },
      ark: { modules },
      meta: {
        ...defaults.meta,
        ...state.meta,
        storyLog: (state.meta?.storyLog ?? []).filter((id) => STORY_IDS.includes(id)),
        researchCompletions: Object.fromEntries(
          Object.entries(state.meta?.researchCompletions ?? {}).filter(([id]) =>
            RESEARCH_IDS.includes(id as ResearchId),
          ),
        ),
        achievements: (state.meta?.achievements ?? []).filter((id) => ACHIEVEMENT_IDS.includes(id)),
        prestigeUpgrades: Object.fromEntries(
          Object.entries(state.meta?.prestigeUpgrades ?? {}).filter(([id]) =>
            PRESTIGE_UPGRADE_IDS.includes(id as PrestigeUpgradeId),
          ),
        ),
      },
      stats: {
        ...defaults.stats,
        ...state.stats,
        produced: { ...defaults.stats.produced, ...state.stats?.produced },
      },
    },
  }
}

/** Encodes a save as a compact text string for export (base64 of JSON). */
export function exportSave(save: SaveData): string {
  const bytes = new TextEncoder().encode(serialize(save))
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary)
}

/** Decodes an exported save string. Throws on invalid input. */
export function importSave(text: string): SaveData {
  let json: string
  try {
    const binary = atob(text.trim())
    json = new TextDecoder().decode(Uint8Array.from(binary, (c) => c.charCodeAt(0)))
  } catch {
    throw new Error('Save string is not valid')
  }
  return deserialize(json)
}

/** Minimal storage interface so saving can be tested without a browser. */
export interface SaveStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

export const SAVE_KEY = 'ark-foundry-save'
/** Unreadable saves are moved here instead of being overwritten silently. */
export const BROKEN_SAVE_KEY = 'ark-foundry-save-broken'

export function writeSave(storage: SaveStorage, save: SaveData): void {
  storage.setItem(SAVE_KEY, serialize(save))
}

/** Returns the stored save, or null if there is none or it cannot be read. */
export function readSave(storage: SaveStorage): SaveData | null {
  const text = storage.getItem(SAVE_KEY)
  if (text === null) return null
  try {
    return deserialize(text)
  } catch (error) {
    console.error('Failed to load save, keeping a copy', error)
    storage.setItem(BROKEN_SAVE_KEY, text)
    return null
  }
}

export function clearSave(storage: SaveStorage): void {
  storage.removeItem(SAVE_KEY)
}
