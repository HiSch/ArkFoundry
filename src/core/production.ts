import { BUILDINGS, type BuildingId } from '../content/buildings'
import { RESOURCE_IDS, type ResourceId } from '../content/resources'
import { entries } from './amounts'
import { activeEffects, effectSum } from './effects'
import type { GameState } from './state'

/** Passive throughput bonus per spent Star Chart (see `core/prestige.ts`). */
export const SPENT_STAR_CHART_BONUS = 0.01
/** Passive throughput bonus per unspent Star Chart: saving them pays off too. */
export const UNSPENT_STAR_CHART_BONUS = 0.02

/** Multiplier on all buildings from Star Charts: spent ones give less than unspent ones. */
export function starChartMultiplier(state: GameState): number {
  const unspent = state.meta.starCharts
  const spent = state.meta.starChartsEarned - unspent
  return 1 + SPENT_STAR_CHART_BONUS * spent + UNSPENT_STAR_CHART_BONUS * unspent
}

/** Building counts at which a building type doubles its throughput. */
export const MILESTONES = [25, 50, 100, 150, 200, 300, 400, 500]

export interface Multipliers {
  /** Scales inputs and outputs. */
  throughput: number
  /** Scales outputs only. */
  output: number
  /** Scales inputs only (below 1 = more efficient). */
  input: number
}

/** Throughput bonus from each unlocked achievement. */
export const ACHIEVEMENT_BONUS = 0.01

/** Multiplier on all buildings from Star Charts, achievements, modules in orbit and boosts. */
export function globalMultiplier(state: GameState): number {
  const launched = Object.values(state.ark.modules).filter((m) => m.launched).length
  let synergy = 0
  for (const effect of activeEffects(state)) {
    if (effect.type === 'dockSynergy') synergy += effect.add * launched
  }
  return (
    starChartMultiplier(state) *
    (1 + ACHIEVEMENT_BONUS * state.meta.achievements.length) *
    (1 + synergy) *
    state.boosts.reduce((product, boost) => product * boost.factor, 1)
  )
}

export function multipliers(state: GameState, id: BuildingId): Multipliers {
  const count = state.buildings[id].count
  let throughput =
    Math.pow(2, MILESTONES.filter((m) => count >= m).length) * globalMultiplier(state)
  let output = 1
  let input = 1
  if (BUILDINGS.find((b) => b.id === id)?.consumes) {
    output *= 1 + effectSum(state, 'converterOutput', 'add')
  }
  for (const effect of activeEffects(state)) {
    if (effect.type === 'throughput' && effect.building === id) throughput *= effect.factor
    if (effect.type === 'output' && effect.building === id) output *= effect.factor
    if (effect.type === 'inputs' && effect.building === id) input *= effect.factor
  }
  return { throughput, output, input }
}

/** Next milestone count for a building, or null if all are reached. */
export function nextMilestone(count: number): number | null {
  return MILESTONES.find((m) => m > count) ?? null
}

/**
 * Why a building needs attention: it runs below full speed because inputs
 * are short ('inputs') or it was paused for full storage ('storage'), or it
 * runs at full speed but part of its output is lost to full storage
 * ('overflow', only without the Auto-Pause prestige upgrade).
 */
export type Limit = 'inputs' | 'storage' | 'overflow'

export interface Flows {
  /** Amount gained per resource during the step. */
  produced: Record<ResourceId, number>
  /** Amount used per resource during the step. */
  consumed: Record<ResourceId, number>
  /** Output that was not produced because storage was full. */
  missed: Record<ResourceId, number>
  /** Share of full speed each building ran at (0–1). */
  efficiency: Partial<Record<BuildingId, number>>
  /** What slows a building down or wastes its output, if anything. */
  limit: Partial<Record<BuildingId, Limit>>
}

function zero(): Record<ResourceId, number> {
  return Object.fromEntries(RESOURCE_IDS.map((id) => [id, 0])) as Record<ResourceId, number>
}

/**
 * Computes what all buildings produce and consume during `dt` seconds,
 * without changing the state. Buildings run in content order and slow down
 * when their inputs are short. When `capacities` are given, buildings whose
 * output does not fit into storage are reported; with the Auto-Pause
 * prestige upgrade they also slow down (or pause) to the free room, so they
 * do not use up inputs for output that would be lost. Without it, the
 * surplus is lost when the step is applied.
 */
export function computeFlows(
  state: GameState,
  dt: number,
  capacities?: Record<ResourceId, number>,
): Flows {
  const available = { ...state.resources }
  const pauseWhenFull = activeEffects(state).some((e) => e.type === 'pauseWhenFull')
  const flows: Flows = {
    produced: zero(),
    consumed: zero(),
    missed: zero(),
    efficiency: {},
    limit: {},
  }
  for (const def of BUILDINGS) {
    const building = state.buildings[def.id]
    if (building.count === 0 || !building.enabled) continue
    const m = multipliers(state, def.id)
    const scale = building.count * m.throughput * dt

    let byInputs = 1
    for (const [id, amount] of entries(def.consumes ?? {})) {
      const need = amount * scale * m.input
      if (need > 0) byInputs = Math.min(byInputs, available[id] / need)
    }
    byInputs = Math.max(0, Math.min(1, byInputs))

    // Share of the output that still fits into storage.
    let byStorage = 1
    if (capacities) {
      for (const [id, amount] of entries(def.produces)) {
        const output = amount * scale * m.output * byInputs
        const room = Math.max(0, capacities[id] - available[id])
        if (output > 0) byStorage = Math.min(byStorage, room / output)
      }
    }
    const efficiency = pauseWhenFull ? byInputs * Math.min(1, byStorage) : byInputs
    flows.efficiency[def.id] = efficiency
    if (byInputs < 0.995) flows.limit[def.id] = 'inputs'
    else if (byStorage < 0.995) flows.limit[def.id] = pauseWhenFull ? 'storage' : 'overflow'
    if (pauseWhenFull) {
      for (const [id, amount] of entries(def.produces)) {
        flows.missed[id] += amount * scale * m.output * (byInputs - efficiency)
      }
    }
    if (efficiency === 0) continue

    for (const [id, amount] of entries(def.consumes ?? {})) {
      const used = amount * scale * efficiency * m.input
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
    consumes: entries(def.consumes ?? {}).map(([r, a]) => [r, a * m.throughput * m.input]),
    produces: entries(def.produces).map(([r, a]) => [r, a * m.throughput * m.output]),
  }
}
