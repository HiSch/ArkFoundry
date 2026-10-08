import { BUILDING_IDS, type BuildingId } from '../content/buildings'
import { MODULE_IDS, type ModuleId } from '../content/modules'
import type { AchievementId } from '../content/achievements'
import type { EventId } from '../content/events'
import type { PrestigeUpgradeId } from '../content/prestige'
import type { ResearchId } from '../content/research'
import type { StoryId } from '../content/story'
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
  /** Delivered in the current run; decides when a supply launch is possible. */
  deliveredThisRun: Amounts
  completed: boolean
  /** Launched into orbit. Launching a module is the prestige. */
  launched: boolean
}

/** Progress that survives launches (prestige). */
export interface MetaState {
  /** Unspent Star Charts. */
  starCharts: number
  /** All Star Charts ever earned; each gives a passive production bonus. */
  starChartsEarned: number
  prestigeUpgrades: Partial<Record<PrestigeUpgradeId, number>>
  /** Automatic buyers the player switched on. */
  autoBuy: Partial<Record<BuildingId, boolean>>
  /** Automated Logistics switched on. */
  autoDeliver: boolean
  launches: number
  /** Play time of all finished runs, in seconds. */
  pastPlayTime: number
  /** Radio messages received, in order. Each is sent once per game. */
  storyLog: StoryId[]
  /** Number of messages in `storyLog` the player has read. */
  storyRead: number
  introSeen: boolean
  /** How often each research project was completed in earlier runs; repeats go faster. */
  researchCompletions: Partial<Record<ResearchId, number>>
  achievements: AchievementId[]
  eventsCollected: number
  /** The ending was shown after the last module was launched. */
  endingSeen: boolean
}

export interface ActiveEvent {
  id: EventId
  /** Seconds until the event disappears if it is not collected. */
  remaining: number
}

/** Temporary speed-up of all buildings, e.g. from an event. */
export interface Boost {
  factor: number
  remaining: number
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
  events: {
    active: ActiveEvent | null
    /** Seconds of live play until the next event appears. */
    nextIn: number
  }
  boosts: Boost[]
  /** Simulated game time of this run in seconds (includes debug time skips). */
  playTime: number
  meta: MetaState
}

function perResource(value: number): Record<ResourceId, number> {
  return Object.fromEntries(RESOURCE_IDS.map((id) => [id, value])) as Record<ResourceId, number>
}

/** Seconds of live play before the first event of a run. */
export const FIRST_EVENT_SECONDS = 5 * 60

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
        MODULE_IDS.map((id) => [
          id,
          { delivered: {}, deliveredThisRun: {}, completed: false, launched: false },
        ]),
      ) as Record<ModuleId, ModuleState>,
    },
    stats: { produced: perResource(0), clicks: 0 },
    events: { active: null, nextIn: FIRST_EVENT_SECONDS },
    boosts: [],
    playTime: 0,
    meta: {
      starCharts: 0,
      starChartsEarned: 0,
      prestigeUpgrades: {},
      autoBuy: {},
      autoDeliver: false,
      launches: 0,
      pastPlayTime: 0,
      storyLog: [],
      storyRead: 0,
      introSeen: false,
      researchCompletions: {},
      achievements: [],
      eventsCollected: 0,
      endingSeen: false,
    },
  }
}
