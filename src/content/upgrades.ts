import type { UpgradeDef } from '../core/types'

export type UpgradeId =
  | 'plasmaPick'
  | 'drillBits'
  | 'tungstenPick'
  | 'efficientPanels'
  | 'catalysts'
  | 'tradeContracts'
  | 'hydraulics'
  | 'mirrorCoating'
  | 'expandedSilos'
  | 'pressureTanks'
  | 'deepVaults'
  | 'alloyFrames'
  | 'reinforcedLabs'

/** All one-time upgrades in display order. */
export const UPGRADES: UpgradeDef[] = [
  {
    id: 'plasmaPick',
    name: 'Plasma Pick',
    description: 'Manual mining yields +2 ore.',
    cost: { ore: 50 },
    effects: [{ type: 'clickPower', add: 2 }],
    unlock: { type: 'produced', resource: 'ore', amount: 25 },
  },
  {
    id: 'drillBits',
    name: 'Diamond Drill Bits',
    description: 'Mining drones produce twice as much.',
    cost: { ore: 1500 },
    effects: [{ type: 'throughput', building: 'drone', factor: 2 }],
    unlock: { type: 'building', building: 'drone', count: 10 },
  },
  {
    id: 'tungstenPick',
    name: 'Tungsten Pick',
    description: 'Manual mining yields +10 ore.',
    cost: { metal: 50 },
    effects: [{ type: 'clickPower', add: 10 }],
    unlock: { type: 'produced', resource: 'metal', amount: 20 },
  },
  {
    id: 'efficientPanels',
    name: 'Efficient Panels',
    description: 'Solar fields produce twice as much.',
    cost: { metal: 500 },
    effects: [{ type: 'throughput', building: 'solarField', factor: 2 }],
    unlock: { type: 'building', building: 'refinery', count: 5 },
  },
  {
    id: 'catalysts',
    name: 'Refining Catalysts',
    description: 'Refineries get 50 % more metal from the same input.',
    cost: { credits: 1500 },
    effects: [{ type: 'output', building: 'refinery', factor: 1.5 }],
    unlock: { type: 'produced', resource: 'credits', amount: 500 },
  },
  {
    id: 'tradeContracts',
    name: 'Long-term Contracts',
    description: 'Trade posts earn 50 % more credits per metal.',
    cost: { credits: 5000 },
    effects: [{ type: 'output', building: 'tradePost', factor: 1.5 }],
    unlock: { type: 'building', building: 'tradePost', count: 5 },
  },
  {
    id: 'hydraulics',
    name: 'Hydraulic Arms',
    description: 'Excavators work twice as fast.',
    cost: { credits: 12000, metal: 4000 },
    effects: [{ type: 'throughput', building: 'excavator', factor: 2 }],
    unlock: { type: 'building', building: 'excavator', count: 10 },
  },
  {
    id: 'mirrorCoating',
    name: 'Mirror Coating',
    description: 'Solar arrays produce twice as much.',
    cost: { credits: 40000, metal: 12000 },
    effects: [{ type: 'throughput', building: 'solarArray', factor: 2 }],
    unlock: { type: 'building', building: 'solarArray', count: 10 },
  },
  {
    id: 'expandedSilos',
    name: 'Expanded Silos',
    description: 'Storage holds 1 more hour of production.',
    cost: { ore: 2000, metal: 200 },
    effects: [{ type: 'storageHours', add: 1 }],
    unlock: { type: 'building', building: 'refinery', count: 3 },
  },
  {
    id: 'pressureTanks',
    name: 'Pressure Tanks',
    description: 'Storage holds 1 more hour of production.',
    cost: { credits: 4000, metal: 1500 },
    effects: [{ type: 'storageHours', add: 1 }],
    unlock: { type: 'building', building: 'excavator', count: 5 },
  },
  {
    id: 'deepVaults',
    name: 'Deep Vaults',
    description: 'Storage holds 2 more hours of production.',
    cost: { credits: 25000, metal: 8000 },
    effects: [{ type: 'storageHours', add: 2 }],
    unlock: { type: 'building', building: 'arcRefinery', count: 1 },
  },
  {
    id: 'alloyFrames',
    name: 'Alloy Frames',
    description: 'Excavators work twice as fast.',
    cost: { alloys: 300, credits: 50000 },
    effects: [{ type: 'throughput', building: 'excavator', factor: 2 }],
    unlock: { type: 'produced', resource: 'alloys', amount: 50 },
  },
  {
    id: 'reinforcedLabs',
    name: 'Reinforced Labs',
    description: 'Research labs work twice as fast.',
    cost: { alloys: 800, credits: 80000 },
    effects: [{ type: 'throughput', building: 'lab', factor: 2 }],
    unlock: { type: 'produced', resource: 'alloys', amount: 300 },
  },
]

export const UPGRADE_IDS: UpgradeId[] = UPGRADES.map((u) => u.id)

export function getUpgrade(id: UpgradeId): UpgradeDef {
  const def = UPGRADES.find((u) => u.id === id)
  if (!def) throw new Error(`Unknown upgrade ${id}`)
  return def
}
