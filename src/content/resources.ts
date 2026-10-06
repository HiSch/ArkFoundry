import type { ResourceDef } from '../core/types'

export type ResourceId =
  | 'ore'
  | 'energy'
  | 'metal'
  | 'credits'
  | 'research'
  | 'alloys'
  | 'helium3'
  | 'components'
  | 'exotic'
  | 'colonists'

/** All resources in display order. */
export const RESOURCES: ResourceDef[] = [
  { id: 'ore', name: 'Ore', icon: '⛏️' },
  { id: 'energy', name: 'Energy', icon: '⚡' },
  { id: 'metal', name: 'Metal', icon: '🔩' },
  { id: 'credits', name: 'Credits', icon: '💰' },
  { id: 'research', name: 'Research', icon: '🔬' },
  { id: 'alloys', name: 'Alloys', icon: '🧱' },
  { id: 'helium3', name: 'Helium-3', icon: '⚛️' },
  { id: 'components', name: 'Components', icon: '⚙️' },
  { id: 'exotic', name: 'Exotic Matter', icon: '🌀' },
  { id: 'colonists', name: 'Colonists', icon: '🧑‍🚀' },
]

export const RESOURCE_IDS: ResourceId[] = RESOURCES.map((r) => r.id)
