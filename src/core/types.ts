import type { BuildingId } from '../content/buildings'
import type { ModuleId } from '../content/modules'
import type { PrestigeUpgradeId } from '../content/prestige'
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
}

export interface PrestigeUpgradeDef {
  id: PrestigeUpgradeId
  name: string
  description: string
  /** Star Charts per level. */
  cost: number
  maxLevel: number
  /** Effects granted per level. */
  effects: Effect[]
}
