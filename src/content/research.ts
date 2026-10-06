import type { ResearchDef } from '../core/types'

export type ResearchId =
  | 'automation'
  | 'marketAnalysis'
  | 'deepCoreScans'
  | 'metallurgy'
  | 'gridTheory'
  | 'appliedPhysics'
  | 'alloyProcessing'
  | 'orbitalLogistics'

const MINUTE = 60
const HOUR = 3600

/** All research projects in display order. */
export const RESEARCH: ResearchDef[] = [
  {
    id: 'automation',
    name: 'Basic Automation',
    description: 'Mining drones work 50 % faster.',
    cost: { research: 50 },
    duration: 10 * MINUTE,
    requires: [],
    effects: [{ type: 'throughput', building: 'drone', factor: 1.5 }],
  },
  {
    id: 'marketAnalysis',
    name: 'Market Analysis',
    description: 'Trade posts earn 50 % more credits per metal.',
    cost: { research: 150 },
    duration: 30 * MINUTE,
    requires: ['automation'],
    effects: [{ type: 'output', building: 'tradePost', factor: 1.5 }],
  },
  {
    id: 'metallurgy',
    name: 'Metallurgy',
    description: 'Unlocks the Alloy Smelter. Alloys are needed for the Ark.',
    cost: { research: 300 },
    duration: 45 * MINUTE,
    requires: ['automation'],
    effects: [],
  },
  {
    id: 'deepCoreScans',
    name: 'Deep Core Scans',
    description: 'Excavators work 50 % faster.',
    cost: { research: 400 },
    duration: 1 * HOUR,
    requires: ['automation'],
    effects: [{ type: 'throughput', building: 'excavator', factor: 1.5 }],
  },
  {
    id: 'gridTheory',
    name: 'Power Grid Theory',
    description: 'Solar fields and solar arrays produce 50 % more.',
    cost: { research: 600 },
    duration: 1 * HOUR,
    requires: ['automation'],
    effects: [
      { type: 'throughput', building: 'solarField', factor: 1.5 },
      { type: 'throughput', building: 'solarArray', factor: 1.5 },
    ],
  },
  {
    id: 'appliedPhysics',
    name: 'Applied Physics',
    description: 'Research labs work twice as fast.',
    cost: { research: 1200 },
    duration: 90 * MINUTE,
    requires: ['gridTheory'],
    effects: [{ type: 'throughput', building: 'lab', factor: 2 }],
  },
  {
    id: 'alloyProcessing',
    name: 'Alloy Processing',
    description: 'Smelters get 50 % more alloys from the same input.',
    cost: { research: 2000 },
    duration: 2 * HOUR,
    requires: ['metallurgy'],
    effects: [{ type: 'output', building: 'smelter', factor: 1.5 }],
  },
  {
    id: 'orbitalLogistics',
    name: 'Orbital Logistics',
    description: 'Storage holds 1 more hour of production.',
    cost: { research: 3000 },
    duration: 2 * HOUR,
    requires: ['deepCoreScans'],
    effects: [{ type: 'storageHours', add: 1 }],
  },
]

export const RESEARCH_IDS: ResearchId[] = RESEARCH.map((r) => r.id)

export function getResearch(id: ResearchId): ResearchDef {
  const def = RESEARCH.find((r) => r.id === id)
  if (!def) throw new Error(`Unknown research ${id}`)
  return def
}
