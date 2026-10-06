import { RESOURCES, type ResourceId } from '../content/resources'
import { formatCost, formatRate } from '../core/format'
import type { Amounts } from '../core/types'

const names = Object.fromEntries(RESOURCES.map((r) => [r.id, r.name])) as Record<ResourceId, string>

export function resourceName(id: ResourceId): string {
  return names[id]
}

/** "250 Ore, 40 Energy" */
export function formatAmounts(amounts: Amounts | [ResourceId, number][]): string {
  const list = Array.isArray(amounts)
    ? amounts
    : (Object.entries(amounts) as [ResourceId, number][])
  return list.map(([id, value]) => `${formatCost(value)} ${names[id]}`).join(', ')
}

/** "0.4 Ore/s, 1 Energy/s" */
export function formatRates(list: [ResourceId, number][]): string {
  return list.map(([id, value]) => `${formatRate(value)} ${names[id]}/s`).join(', ')
}
