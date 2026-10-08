import type { BuildingId } from '../content/buildings'
import type { ModuleId } from '../content/modules'
import type { EventId } from '../content/events'
import type { PrestigeUpgradeId } from '../content/prestige'
import type { StoryId } from '../content/story'
import type { ResearchId } from '../content/research'
import type { ResourceId } from '../content/resources'
import type { UpgradeId } from '../content/upgrades'

/** A set of resource amounts, e.g. a cost or a production rate. */
export type Amounts = Partial<Record<ResourceId, number>>

/** Condition under which a building or upgrade becomes visible. */
export type UnlockCondition =
  | { type: 'always' }
  /** Lifetime production of a resource in the current run. */
  | { type: 'produced'; resource: ResourceId; amount: number }
  | { type: 'building'; building: BuildingId; count: number }
  | { type: 'upgrade'; upgrade: UpgradeId }
  | { type: 'research'; research: ResearchId }
  /** Content that exists in the design but is not available yet. */
  | { type: 'never' }
  | { type: 'moduleLaunched'; module: ModuleId }
  | { type: 'moduleCompleted'; module: ModuleId }
  | { type: 'prestigeUpgrade'; upgrade: PrestigeUpgradeId }
  /** Number of modules launched over the whole game. */
  | { type: 'launches'; count: number }
  /** Star Charts earned over the whole game. */
  | { type: 'starCharts'; count: number }
  /** Events collected over the whole game. */
  | { type: 'eventsCollected'; count: number }
  | { type: 'clicks'; count: number }
  /** All of the listed conditions. */
  | { type: 'all'; conditions: UnlockCondition[] }

export interface ResourceDef {
  id: ResourceId
  name: string
  /** Short symbol for compact views. */
  icon: string
}

export interface BuildingDef {
  id: BuildingId
  name: string
  description: string
  /** Cost of the first building; each further one costs `costGrowth` times more. */
  cost: Amounts
  costGrowth: number
  /** Inputs per second per building. Buildings with inputs can be switched off. */
  consumes?: Amounts
  /** Outputs per second per building. */
  produces: Amounts
  unlock: UnlockCondition
}

/** A permanent bonus granted by an upgrade or a completed research project. */
export type Effect =
  /** Adds to the ore gained per manual mining click. */
  | { type: 'clickPower'; add: number }
  /** Multiplies inputs and outputs of a building type (it simply runs faster). */
  | { type: 'throughput'; building: BuildingId; factor: number }
  /** Multiplies only the outputs of a building type (better efficiency). */
  | { type: 'output'; building: BuildingId; factor: number }
  /** Adds hours of production that storage can hold. */
  | { type: 'storageHours'; add: number }
  /** Research progresses faster by this share (0.1 = 10 % faster). */
  | { type: 'researchSpeed'; add: number }
  /** Resources granted at the start of every run. */
  | { type: 'startResources'; resources: Amounts }
  /** Buildings granted at the start of every run. */
  | { type: 'startBuildings'; building: BuildingId; count: number }
  /** Research projects completed at the start of every run. */
  | { type: 'startResearch'; research: ResearchId[] }
  /** Allows switching on an automatic buyer for a building type. */
  | { type: 'autoBuy'; building: BuildingId }
  /** Buildings pause instead of wasting output when their output storage is full. */
  | { type: 'pauseWhenFull' }
  /** Multiplies the inputs of a building type (0.9 = uses 10 % less). */
  | { type: 'inputs'; building: BuildingId; factor: number }
  /** All buildings run faster by this share per module in orbit. */
  | { type: 'dockSynergy'; add: number }
  /** Event rewards are larger by this share. */
  | { type: 'eventRewards'; add: number }
  /** Each manual mining click also yields this many seconds of gross ore production. */
  | { type: 'clickProduction'; seconds: number }
  /** Events appear more often by this share. */
  | { type: 'eventFrequency'; add: number }
  /** Events stay longer by this share before they disappear. */
  | { type: 'eventLifetime'; add: number }
  /** More slots in the research queue. */
  | { type: 'researchQueue'; add: number }
  /** Multiplies the cost of research projects. */
  | { type: 'researchCost'; factor: number }
  /** Buildings that consume inputs produce more output by this share. */
  | { type: 'converterOutput'; add: number }
  /** Multiplies the cost of all buildings. */
  | { type: 'buildingCost'; factor: number }
  /** Launches earn more Star Charts by this share. */
  | { type: 'starChartGain'; add: number }
  /** Allows switching on automatic deliveries of surplus to the Ark. */
  | { type: 'autoDeliver' }

export interface UpgradeDef {
  id: UpgradeId
  name: string
  description: string
  cost: Amounts
  effects: Effect[]
  unlock: UnlockCondition
}

export interface ResearchDef {
  id: ResearchId
  name: string
  description: string
  /** Paid when the project is queued; refunded if it is cancelled. */
  cost: Amounts
  /** Real time in seconds the project takes once it is active. */
  duration: number
  /** Projects that must be completed before this one becomes available. */
  requires: ResearchId[]
  /** Further condition, e.g. a module that must be in orbit first. */
  condition?: UnlockCondition
  effects: Effect[]
}

export interface ModuleDef {
  id: ModuleId
  name: string
  description: string
  /** Resources that must be delivered to complete the module. */
  cost: Amounts
  /** When construction may start. */
  unlock: UnlockCondition
  /** Shown while the module cannot be built yet. */
  lockedHint: string
  /**
   * Too big for one run: at most this share of the cost can be delivered per
   * run. Once it is delivered, a supply launch (a prestige) keeps the
   * deliveries for later runs.
   */
  supplyLaunchShare?: number
}

/** Groups of prestige upgrades, each serving a play style. */
export type PrestigeCategory =
  'start' | 'production' | 'research' | 'idle' | 'active' | 'automation' | 'ark'

export interface PrestigeUpgradeDef {
  id: PrestigeUpgradeId
  category: PrestigeCategory
  name: string
  description: string
  /** Star Charts per level. */
  cost: number
  maxLevel: number
  /** Effects granted per level. */
  effects: Effect[]
}

export type EventReward =
  /** A lump sum worth `seconds` of the resource's gross production, at least `minimum`. */
  | { type: 'resource'; resource: ResourceId; seconds: number; minimum: number }
  /** All buildings run `factor` times faster for `duration` seconds. */
  | { type: 'boost'; factor: number; duration: number }

export interface EventDef {
  id: EventId
  name: string
  icon: string
  description: string
  reward: EventReward
  /** The event only happens once this resource has been produced in the run. */
  requires?: ResourceId
}

export interface StoryDef {
  id: StoryId
  /** Who is speaking, e.g. "Mission Control". */
  from: string
  title: string
  text: string
  trigger: UnlockCondition
}
