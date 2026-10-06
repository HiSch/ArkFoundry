import type { ResourceDef } from '../core/types'

export type ResourceId =
  'ore' | 'energy' | 'metal' | 'credits' | 'research' | 'alloys' | 'helium3' | 'components'

/** All resources in display order. */
export const RESOURCES: ResourceDef[] = [
  { id: 'ore', name: 'Ore' },
  { id: 'energy', name: 'Energy' },
  { id: 'metal', name: 'Metal' },
  { id: 'credits', name: 'Credits' },
  { id: 'research', name: 'Research' },
  { id: 'alloys', name: 'Alloys' },
  { id: 'helium3', name: 'Helium-3' },
  { id: 'components', name: 'Components' },
]

export const RESOURCE_IDS: ResourceId[] = RESOURCES.map((r) => r.id)
