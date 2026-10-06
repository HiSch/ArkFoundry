import type { ModuleDef } from '../core/types'

export type ModuleId =
  'hull' | 'reactor' | 'engine' | 'habitat' | 'cryoDeck' | 'shield' | 'navigation'

const LATER = 'Blueprints not recovered yet.'

/** The seven modules of the Ark in build order. */
export const MODULES: ModuleDef[] = [
  {
    id: 'hull',
    name: 'Hull',
    description: 'The spine of the Ark. Everything else is mounted on it.',
    cost: { alloys: 1000000, components: 120000, helium3: 200000 },
    unlock: { type: 'research', research: 'hullEngineering' },
    lockedHint: 'Requires Ark Hull Engineering research.',
  },
  {
    id: 'reactor',
    name: 'Reactor',
    description: 'Powers the Ark for a journey of centuries.',
    // Placeholder cost until the reactor gets its own mechanic (phase 8).
    cost: { alloys: 1200000, components: 150000, helium3: 250000 },
    unlock: {
      type: 'all',
      conditions: [
        { type: 'moduleLaunched', module: 'hull' },
        { type: 'research', research: 'fusionContainment' },
      ],
    },
    lockedHint: 'Requires the Hull in orbit and Fusion Containment research.',
  },
  {
    id: 'engine',
    name: 'Engine',
    description: 'Helium-3 fusion drive to leave the dying system.',
    cost: {},
    unlock: { type: 'never' },
    lockedHint: LATER,
  },
  {
    id: 'habitat',
    name: 'Habitat',
    description: 'Living space for the crew that stays awake.',
    cost: {},
    unlock: { type: 'never' },
    lockedHint: LATER,
  },
  {
    id: 'cryoDeck',
    name: 'Cryo Deck',
    description: 'Sleeping chambers for 10,000 colonists.',
    cost: {},
    unlock: { type: 'never' },
    lockedHint: LATER,
  },
  {
    id: 'shield',
    name: 'Shield',
    description: 'Protects the Ark from radiation and debris.',
    cost: {},
    unlock: { type: 'never' },
    lockedHint: LATER,
  },
  {
    id: 'navigation',
    name: 'Navigation',
    description: 'Charts the course to a new home.',
    cost: {},
    unlock: { type: 'never' },
    lockedHint: LATER,
  },
]

export const MODULE_IDS: ModuleId[] = MODULES.map((m) => m.id)

export function getModule(id: ModuleId): ModuleDef {
  const def = MODULES.find((m) => m.id === id)
  if (!def) throw new Error(`Unknown module ${id}`)
  return def
}
