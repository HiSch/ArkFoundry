import type { PrestigeUpgradeDef } from '../core/types'

export type PrestigeUpgradeId =
  | 'seedCapital'
  | 'veteranEngineers'
  | 'biggerSilos'
  | 'autoDrones'
  | 'blueprintArchive'
  | 'autoPause'

/** Permanent upgrades bought with Star Charts. They survive every launch. */
export const PRESTIGE_UPGRADES: PrestigeUpgradeDef[] = [
  {
    id: 'seedCapital',
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
    name: 'Veteran Engineers',
    description: 'Research progresses 10 % faster per level.',
    cost: 3,
    maxLevel: 5,
    effects: [{ type: 'researchSpeed', add: 0.1 }],
  },
  {
    id: 'biggerSilos',
    name: 'Bigger Silos',
    description: 'Storage holds 1 more hour of production per level.',
    cost: 3,
    maxLevel: 4,
    effects: [{ type: 'storageHours', add: 1 }],
  },
  {
    id: 'autoDrones',
    name: 'Auto-Buyer: Drones',
    description: 'Can buy mining drones automatically while they are cheap.',
    cost: 5,
    maxLevel: 1,
    effects: [{ type: 'autoBuy', building: 'drone' }],
  },
  {
    id: 'blueprintArchive',
    name: 'Blueprint Archive',
    description: 'Basic Automation, Market Analysis and Metallurgy are known from the start.',
    cost: 5,
    maxLevel: 1,
    effects: [{ type: 'startResearch', research: ['automation', 'marketAnalysis', 'metallurgy'] }],
  },
  {
    id: 'autoPause',
    name: 'Auto-Pause',
    description:
      'Buildings pause when their output storage is full instead of wasting output, and keep their inputs.',
    cost: 3,
    maxLevel: 1,
    effects: [{ type: 'pauseWhenFull' }],
  },
]

export const PRESTIGE_UPGRADE_IDS: PrestigeUpgradeId[] = PRESTIGE_UPGRADES.map((u) => u.id)

export function getPrestigeUpgrade(id: PrestigeUpgradeId): PrestigeUpgradeDef {
  const def = PRESTIGE_UPGRADES.find((u) => u.id === id)
  if (!def) throw new Error(`Unknown prestige upgrade ${id}`)
  return def
}
