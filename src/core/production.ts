import { BUILDINGS, type BuildingId } from '../content/buildings'
import { RESOURCE_IDS, type ResourceId } from '../content/resources'
import { entries } from './amounts'
import { activeEffects } from './effects'
import type { GameState } from './state'

/** Building counts at which a building type doubles its throughput. */
export const MILESTONES = [25, 50, 100, 150, 200, 300, 400, 500]

export interface Multipliers {
  /** Scales inputs and outputs. */
  throughput: number
  /** Scales outputs only. */
  output: number
}

export function multipliers(state: GameState, id: BuildingId): Multipliers {
  const count = state.buildings[id].count
  let throughput = Math.pow(2, MILESTONES.filter((m) => count >= m).length)
  let output = 1
  for (const effect of activeEffects(state)) {
    if (effect.type === 'throughput' && effect.building === id) throughput *= effect.factor
    if (effect.type === 'output' && effect.building === id) output *= effect.factor
  }
  return { throughput, output }
}

/** Next milestone count for a building, or null if all are reached. */
export function nextMilestone(count: number): number | null {
  return MILESTONES.find((m) => m > count) ?? null
}

export interface Flows {
  /** Amount gained per resource during the step. */
  produced: Record<ResourceId, number>
  /** Amount used per resource during the step. */
  consumed: Record<ResourceId, number>
  /** Share of full speed each building ran at (0–1), limited by inputs. */
  efficiency: Partial<Record<BuildingId, number>>
}

function zero(): Record<ResourceId, number> {
  return Object.fromEntries(RESOURCE_IDS.map((id) => [id, 0])) as Record<ResourceId, number>
}

/**
 * Computes what all buildings produce and consume during `dt` seconds,
 * without changing the state. Buildings run in content order; a building
 * whose inputs are short runs at reduced efficiency.
 */
export function computeFlows(state: GameState, dt: number): Flows {
  const available = { ...state.resources }
  const flows: Flows = { produced: zero(), consumed: zero(), efficiency: {} }
  for (const def of BUILDINGS) {
    const building = state.buildings[def.id]
    if (building.count === 0 || !building.enabled) continue
    const m = multipliers(state, def.id)
    const scale = building.count * m.throughput * dt

    let efficiency = 1
    for (const [id, amount] of entries(def.consumes ?? {})) {
      const need = amount * scale
      if (need > 0) efficiency = Math.min(efficiency, available[id] / need)
    }
    efficiency = Math.max(0, Math.min(1, efficiency))
    flows.efficiency[def.id] = efficiency
    if (efficiency === 0) continue

    for (const [id, amount] of entries(def.consumes ?? {})) {
      const used = amount * scale * efficiency
      available[id] = Math.max(0, available[id] - used)
      flows.consumed[id] += used
    }
    for (const [id, amount] of entries(def.produces)) {
      const made = amount * scale * efficiency * m.output
      available[id] += made
      flows.produced[id] += made
    }
  }
  return flows
}

/** Production per second of one building at full efficiency, including multipliers. */
export function perBuildingRates(
  state: GameState,
  id: BuildingId,
): { consumes: [ResourceId, number][]; produces: [ResourceId, number][] } {
  const def = BUILDINGS.find((b) => b.id === id)!
  const m = multipliers(state, id)
  return {
    consumes: entries(def.consumes ?? {}).map(([r, a]) => [r, a * m.throughput]),
    produces: entries(def.produces).map(([r, a]) => [r, a * m.throughput * m.output]),
  }
}
