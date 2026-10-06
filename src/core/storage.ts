import { BUILDINGS } from '../content/buildings'
import { RESOURCE_IDS, type ResourceId } from '../content/resources'
import { entries } from './amounts'
import { activeEffects } from './effects'
import type { Amounts } from './types'
import { multipliers } from './production'
import type { GameState } from './state'

/** Hours of production storage holds before upgrades. */
export const BASE_STORAGE_HOURS = 4
/** Minimum capacity per resource, so early purchases are always possible. */
export const BASE_CAPACITY = 1000

/** How many hours of gross production the storage can hold. */
export function storageHours(state: GameState): number {
  let hours = BASE_STORAGE_HOURS
  for (const effect of activeEffects(state)) {
    if (effect.type === 'storageHours') hours += effect.add
  }
  return hours
}

/**
 * Gross production per second at full speed, ignoring consumption, input
 * shortages and on/off switches. Storage is sized from this, so switching a
 * building off never shrinks storage.
 */
export function grossRates(state: GameState): Record<ResourceId, number> {
  const rates = Object.fromEntries(RESOURCE_IDS.map((id) => [id, 0])) as Record<ResourceId, number>
  for (const def of BUILDINGS) {
    const count = state.buildings[def.id].count
    if (count === 0) continue
    const m = multipliers(state, def.id)
    for (const [id, amount] of entries(def.produces)) {
      rates[id] += amount * count * m.throughput * m.output
    }
  }
  return rates
}

/** Maximum amount of each resource that can be stored. */
export function capacities(state: GameState): Record<ResourceId, number> {
  const seconds = storageHours(state) * 3600
  const rates = grossRates(state)
  return Object.fromEntries(
    RESOURCE_IDS.map((id) => [id, Math.max(BASE_CAPACITY, rates[id] * seconds)]),
  ) as Record<ResourceId, number>
}

/**
 * Applies a change to a stock while respecting capacity. Gains above the
 * capacity are lost; a stock that is already above capacity (e.g. after
 * capacity shrank) is kept but cannot grow. Returns the new stock and the
 * amount lost.
 */
export function clampToCapacity(
  stock: number,
  change: number,
  capacity: number,
): { value: number; lost: number } {
  const raw = Math.max(0, stock + change)
  const limit = Math.max(capacity, Math.min(stock, raw))
  const value = Math.min(raw, limit)
  return { value, lost: raw - value }
}

/**
 * Adds gains (e.g. from manual mining) to the stock, respecting capacity,
 * and records what was kept in the lifetime statistics.
 */
export function addResources(state: GameState, gains: Amounts): void {
  const caps = capacities(state)
  for (const [id, amount] of entries(gains)) {
    const { value, lost } = clampToCapacity(state.resources[id], amount, caps[id])
    state.resources[id] = value
    if (amount > 0) state.stats.produced[id] += amount - lost
  }
}
