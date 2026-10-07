import type { ModuleDef } from '../core/types'

export type ModuleId =
  'hull' | 'reactor' | 'engine' | 'habitat' | 'cryoDeck' | 'shield' | 'navigation'

/** The seven modules of the Ark in build order. */
export const MODULES: ModuleDef[] = [
  {
    id: 'hull',
    name: 'Hull',
    description: 'The spine of the Ark. Everything else is mounted on it.',
    cost: { alloys: 700000, components: 85000, helium3: 140000 },
    unlock: { type: 'research', research: 'hullEngineering' },
    lockedHint: 'Requires Ark Hull Engineering research.',
  },
  {
    id: 'reactor',
    name: 'Reactor',
    description: 'Powers the Ark for a journey of centuries.',
    cost: { energy: 2.5e7, alloys: 600000, components: 100000 },
    unlock: { type: 'research', research: 'reactorEngineering' },
    lockedHint: 'Requires the Hull in orbit and Reactor Engineering research.',
  },
  {
    id: 'engine',
    name: 'Engine',
    description: 'Helium-3 fusion drive to leave the dying system.',
    cost: { helium3: 2e6, alloys: 800000, components: 150000 },
    unlock: { type: 'research', research: 'driveEngineering' },
    lockedHint: 'Requires the Reactor in orbit and Drive Engineering research.',
  },
  {
    id: 'habitat',
    name: 'Habitat',
    description: 'Living space for the crew that stays awake.',
    cost: { exotic: 400, alloys: 1.5e6, components: 200000 },
    unlock: { type: 'research', research: 'habitatDesign' },
    lockedHint: 'Requires the Engine in orbit and Habitat Design research.',
  },
  {
    id: 'cryoDeck',
    name: 'Cryo Deck',
    description: 'Sleeping chambers for 10,000 colonists.',
    cost: { colonists: 10000, exotic: 600, components: 250000 },
    unlock: { type: 'research', research: 'cryogenics' },
    lockedHint: 'Requires the Habitat in orbit and Cryogenics research.',
  },
  {
    id: 'shield',
    name: 'Shield',
    description: 'Protects the Ark from radiation and debris.',
    cost: {
      ore: 1e8,
      energy: 1e8,
      metal: 2.5e7,
      alloys: 2e6,
      components: 300000,
      helium3: 2e6,
      exotic: 1000,
    },
    unlock: { type: 'research', research: 'shieldTheory' },
    lockedHint: 'Requires the Cryo Deck in orbit and Shield Theory research.',
  },
  {
    id: 'navigation',
    name: 'Navigation',
    description: 'Charts the course to a new home. Too big for one run: built over three runs.',
    cost: { exotic: 6000, components: 1.5e6, alloys: 6e6, helium3: 6e6, research: 6e6 },
    unlock: { type: 'research', research: 'starNavigation' },
    lockedHint: 'Requires the Shield in orbit and Star Navigation research.',
    supplyLaunchShare: 0.34,
  },
]

export const MODULE_IDS: ModuleId[] = MODULES.map((m) => m.id)

export function getModule(id: ModuleId): ModuleDef {
  const def = MODULES.find((m) => m.id === id)
  if (!def) throw new Error(`Unknown module ${id}`)
  return def
}
