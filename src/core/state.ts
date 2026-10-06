import { BUILDING_IDS, type BuildingId } from '../content/buildings'
import { MODULE_IDS, type ModuleId } from '../content/modules'
import type { ResearchId } from '../content/research'
import { RESOURCE_IDS, type ResourceId } from '../content/resources'
import type { UpgradeId } from '../content/upgrades'
import type { Amounts } from './types'

export interface BuildingState {
  count: number
  /** Switched-off buildings neither consume nor produce. */
  enabled: boolean
}

export interface QueuedResearch {
  id: ResearchId
  /** Seconds already spent on the project; only the first queue entry advances. */
  progress: number
}

export interface ModuleState {
  /** Resources delivered so far. */
  delivered: Amounts
  completed: boolean
}

export interface GameState {
  /** Amount held per resource. */
  resources: Record<ResourceId, number>
  buildings: Record<BuildingId, BuildingState>
  /** Purchased one-time upgrades. */
  upgrades: UpgradeId[]
  /** Buildings and upgrades revealed to the player; stays revealed once shown. */
  unlockedBuildings: BuildingId[]
  unlockedUpgrades: UpgradeId[]
  research: {
    completed: ResearchId[]
    /** Paid projects in order; the first one is active. */
    queue: QueuedResearch[]
  }
  ark: {
    modules: Record<ModuleId, ModuleState>
  }
  stats: {
    /** Total amount ever gained per resource in this run. */
    produced: Record<ResourceId, number>
    clicks: number
  }
  /** Total simulated game time in seconds (includes debug time skips). */
  playTime: number
}

function perResource(value: number): Record<ResourceId, number> {
  return Object.fromEntries(RESOURCE_IDS.map((id) => [id, value])) as Record<ResourceId, number>
}

export function createInitialState(): GameState {
  return {
    resources: perResource(0),
    buildings: Object.fromEntries(
      BUILDING_IDS.map((id) => [id, { count: 0, enabled: true }]),
    ) as Record<BuildingId, BuildingState>,
    upgrades: [],
    unlockedBuildings: [],
    unlockedUpgrades: [],
    research: { completed: [], queue: [] },
    ark: {
      modules: Object.fromEntries(
        MODULE_IDS.map((id) => [id, { delivered: {}, completed: false }]),
      ) as Record<ModuleId, ModuleState>,
    },
    stats: { produced: perResource(0), clicks: 0 },
    playTime: 0,
  }
}
