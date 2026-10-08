import type { PrestigeUpgradeDef } from '../core/types'

export type PrestigeUpgradeId =
  | 'seedCapital'
  | 'veteranEngineers'
  | 'biggerSilos'
  | 'autoDrones'
  | 'blueprintArchive'
  | 'autoPause'
  | 'tradeContacts'
  | 'efficientRefining'
  | 'dockSynergy'
  | 'autoBuildings'
  | 'exoticResearch'
  | 'deepCoreDrills'
  | 'eventBeacon'
  | 'longRangeComms'
  | 'parallelResearch'
  | 'researchGrants'
  | 'industrialDoctrine'
  | 'massProduction'
  | 'prefabColony'
  | 'autoLogistics'
  | 'cartography'

/** Permanent upgrades bought with Star Charts. They survive every launch. */
export const PRESTIGE_UPGRADES: PrestigeUpgradeDef[] = [
  {
    id: 'seedCapital',
    category: 'start',
    name: 'Seed Capital',
    description: 'Start every run with 5 mining drones, 500 ore and 500 credits.',
    cost: 2,
    maxLevel: 1,
    effects: [
      { type: 'startBuildings', building: 'drone', count: 5 },
      { type: 'startResources', resources: { ore: 500, credits: 500 } },
    ],
  },
  {
    id: 'veteranEngineers',
    category: 'research',
    name: 'Veteran Engineers',
    description: 'Research progresses 10 % faster per level.',
    cost: 3,
    maxLevel: 5,
    effects: [{ type: 'researchSpeed', add: 0.1 }],
  },
  {
    id: 'biggerSilos',
    category: 'idle',
    name: 'Bigger Silos',
    description: 'Storage holds 1 more hour of production per level.',
    cost: 3,
    maxLevel: 4,
    effects: [{ type: 'storageHours', add: 1 }],
  },
  {
    id: 'autoDrones',
    category: 'automation',
    name: 'Auto-Buyer: Drones',
    description: 'Can buy mining drones automatically while they are cheap.',
    cost: 5,
    maxLevel: 1,
    effects: [{ type: 'autoBuy', building: 'drone' }],
  },
  {
    id: 'blueprintArchive',
    category: 'start',
    name: 'Blueprint Archive',
    description: 'Basic Automation, Market Analysis and Metallurgy are known from the start.',
    cost: 5,
    maxLevel: 1,
    effects: [{ type: 'startResearch', research: ['automation', 'marketAnalysis', 'metallurgy'] }],
  },
  {
    id: 'autoPause',
    category: 'idle',
    name: 'Auto-Pause',
    description:
      'Buildings pause when their output storage is full instead of wasting output, and keep their inputs.',
    cost: 3,
    maxLevel: 1,
    effects: [{ type: 'pauseWhenFull' }],
  },
  {
    id: 'tradeContacts',
    category: 'active',
    name: 'Trade Contacts',
    description: 'Event rewards are 50 % larger.',
    cost: 4,
    maxLevel: 1,
    effects: [{ type: 'eventRewards', add: 0.5 }],
  },
  {
    id: 'efficientRefining',
    category: 'production',
    name: 'Efficient Refining',
    description: 'Refineries and arc refineries use 10 % less ore and energy per level.',
    cost: 4,
    maxLevel: 3,
    effects: [
      { type: 'inputs', building: 'refinery', factor: 0.9 },
      { type: 'inputs', building: 'arcRefinery', factor: 0.9 },
    ],
  },
  {
    id: 'dockSynergy',
    category: 'ark',
    name: 'Dock Synergy',
    description: 'Every module in orbit speeds up all buildings by 5 %.',
    cost: 8,
    maxLevel: 1,
    effects: [{ type: 'dockSynergy', add: 0.05 }],
  },
  {
    id: 'autoBuildings',
    category: 'automation',
    name: 'Auto-Buyer: Producers',
    description:
      'Can buy solar fields, excavators and solar arrays automatically while they are cheap.',
    cost: 12,
    maxLevel: 1,
    effects: [
      { type: 'autoBuy', building: 'solarField' },
      { type: 'autoBuy', building: 'excavator' },
      { type: 'autoBuy', building: 'solarArray' },
    ],
  },
  {
    id: 'exoticResearch',
    category: 'production',
    name: 'Exotic Research',
    description: 'Particle colliders produce 50 % more exotic matter.',
    cost: 15,
    maxLevel: 1,
    effects: [{ type: 'output', building: 'collider', factor: 1.5 }],
  },
  // --- Active play ---
  {
    id: 'deepCoreDrills',
    category: 'active',
    name: 'Deep Core Drills',
    description: 'Each manual mining click also yields 2 seconds of ore production per level.',
    cost: 3,
    maxLevel: 3,
    effects: [{ type: 'clickProduction', seconds: 2 }],
  },
  {
    id: 'eventBeacon',
    category: 'active',
    name: 'Event Beacon',
    description: 'Events appear 25 % more often per level.',
    cost: 4,
    maxLevel: 2,
    effects: [{ type: 'eventFrequency', add: 0.25 }],
  },
  {
    id: 'longRangeComms',
    category: 'active',
    name: 'Long-Range Comms',
    description: 'Events stay twice as long before they disappear.',
    cost: 3,
    maxLevel: 1,
    effects: [{ type: 'eventLifetime', add: 1 }],
  },
  // --- Research ---
  {
    id: 'parallelResearch',
    category: 'research',
    name: 'Parallel Research',
    description: 'One more slot in the research queue per level.',
    cost: 6,
    maxLevel: 2,
    effects: [{ type: 'researchQueue', add: 1 }],
  },
  {
    id: 'researchGrants',
    category: 'research',
    name: 'Research Grants',
    description: 'Research projects cost 20 % less per level.',
    cost: 4,
    maxLevel: 2,
    effects: [{ type: 'researchCost', factor: 0.8 }],
  },
  // --- Production ---
  {
    id: 'industrialDoctrine',
    category: 'production',
    name: 'Industrial Doctrine',
    description: 'Buildings that consume inputs produce 10 % more output per level.',
    cost: 5,
    maxLevel: 3,
    effects: [{ type: 'converterOutput', add: 0.1 }],
  },
  {
    id: 'massProduction',
    category: 'production',
    name: 'Mass Production',
    description: 'All buildings cost 5 % less per level.',
    cost: 4,
    maxLevel: 3,
    effects: [{ type: 'buildingCost', factor: 0.95 }],
  },
  // --- Run start ---
  {
    id: 'prefabColony',
    category: 'start',
    name: 'Prefab Colony',
    description:
      'Start every run with 10 solar fields, 3 refineries, 2 trade posts and 2,000 credits.',
    cost: 8,
    maxLevel: 1,
    effects: [
      { type: 'startBuildings', building: 'solarField', count: 10 },
      { type: 'startBuildings', building: 'refinery', count: 3 },
      { type: 'startBuildings', building: 'tradePost', count: 2 },
      { type: 'startResources', resources: { credits: 2000 } },
    ],
  },
  // --- Automation ---
  {
    id: 'autoLogistics',
    category: 'automation',
    name: 'Automated Logistics',
    description:
      'Can deliver surplus to the Ark automatically: everything above half of the storage goes to the module being built.',
    cost: 8,
    maxLevel: 1,
    effects: [{ type: 'autoDeliver' }],
  },
  // --- Ark ---
  {
    id: 'cartography',
    category: 'ark',
    name: 'Cartography',
    description: 'Launches earn 10 % more Star Charts per level.',
    cost: 6,
    maxLevel: 3,
    effects: [{ type: 'starChartGain', add: 0.1 }],
  },
]

/** Category headings in display order. */
export const PRESTIGE_CATEGORIES: { id: PrestigeUpgradeDef['category']; name: string }[] = [
  { id: 'start', name: 'Run start' },
  { id: 'production', name: 'Production' },
  { id: 'research', name: 'Research' },
  { id: 'idle', name: 'Storage & idle play' },
  { id: 'active', name: 'Active play & events' },
  { id: 'automation', name: 'Automation' },
  { id: 'ark', name: 'Ark & Star Charts' },
]

export const PRESTIGE_UPGRADE_IDS: PrestigeUpgradeId[] = PRESTIGE_UPGRADES.map((u) => u.id)

export function getPrestigeUpgrade(id: PrestigeUpgradeId): PrestigeUpgradeDef {
  const def = PRESTIGE_UPGRADES.find((u) => u.id === id)
  if (!def) throw new Error(`Unknown prestige upgrade ${id}`)
  return def
}
