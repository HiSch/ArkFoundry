import type { UnlockCondition } from '../core/types'

export type AchievementId =
  | 'handsDirty'
  | 'droneSwarm'
  | 'droneArmada'
  | 'firstLight'
  | 'scholar'
  | 'alloyAge'
  | 'eventHunter'
  | 'eventVeteran'
  | 'hullInOrbit'
  | 'reactorInOrbit'
  | 'engineInOrbit'
  | 'habitatInOrbit'
  | 'cryoInOrbit'
  | 'shieldInOrbit'
  | 'arkComplete'
  | 'cartographer'
  | 'navigator'
  | 'frequentFlyer'

export interface AchievementDef {
  id: AchievementId
  name: string
  description: string
  condition: UnlockCondition
}

/** Achievements; each one gives a small permanent bonus (see `ACHIEVEMENT_BONUS`). */
export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'handsDirty',
    name: 'Hands Dirty',
    description: 'Mine ore by hand 500 times in one run.',
    condition: { type: 'clicks', count: 500 },
  },
  {
    id: 'droneSwarm',
    name: 'Drone Swarm',
    description: 'Own 50 mining drones.',
    condition: { type: 'building', building: 'drone', count: 50 },
  },
  {
    id: 'droneArmada',
    name: 'Drone Armada',
    description: 'Own 150 mining drones.',
    condition: { type: 'building', building: 'drone', count: 150 },
  },
  {
    id: 'firstLight',
    name: 'First Light',
    description: 'Build 25 solar fields.',
    condition: { type: 'building', building: 'solarField', count: 25 },
  },
  {
    id: 'scholar',
    name: 'Scholar',
    description: 'Complete Metallurgy research.',
    condition: { type: 'research', research: 'metallurgy' },
  },
  {
    id: 'alloyAge',
    name: 'Alloy Age',
    description: 'Produce one million alloys in one run.',
    condition: { type: 'produced', resource: 'alloys', amount: 1e6 },
  },
  {
    id: 'eventHunter',
    name: 'Event Hunter',
    description: 'Collect 10 events.',
    condition: { type: 'eventsCollected', count: 10 },
  },
  {
    id: 'eventVeteran',
    name: 'Event Veteran',
    description: 'Collect 100 events.',
    condition: { type: 'eventsCollected', count: 100 },
  },
  {
    id: 'hullInOrbit',
    name: 'Spine of the Ark',
    description: 'Launch the Hull.',
    condition: { type: 'moduleLaunched', module: 'hull' },
  },
  {
    id: 'reactorInOrbit',
    name: 'A Beating Heart',
    description: 'Launch the Reactor.',
    condition: { type: 'moduleLaunched', module: 'reactor' },
  },
  {
    id: 'engineInOrbit',
    name: 'Ready to Fly',
    description: 'Launch the Engine.',
    condition: { type: 'moduleLaunched', module: 'engine' },
  },
  {
    id: 'habitatInOrbit',
    name: 'A Place to Live',
    description: 'Launch the Habitat.',
    condition: { type: 'moduleLaunched', module: 'habitat' },
  },
  {
    id: 'cryoInOrbit',
    name: 'Sweet Dreams',
    description: 'Launch the Cryo Deck.',
    condition: { type: 'moduleLaunched', module: 'cryoDeck' },
  },
  {
    id: 'shieldInOrbit',
    name: 'Safe Passage',
    description: 'Launch the Shield.',
    condition: { type: 'moduleLaunched', module: 'shield' },
  },
  {
    id: 'arkComplete',
    name: 'Exodus',
    description: 'Launch the Navigation module and complete the Ark.',
    condition: { type: 'moduleLaunched', module: 'navigation' },
  },
  {
    id: 'cartographer',
    name: 'Cartographer',
    description: 'Earn 50 Star Charts.',
    condition: { type: 'starCharts', count: 50 },
  },
  {
    id: 'navigator',
    name: 'Navigator',
    description: 'Earn 200 Star Charts.',
    condition: { type: 'starCharts', count: 200 },
  },
  {
    id: 'frequentFlyer',
    name: 'Frequent Flyer',
    description: 'Launch 5 times (supply launches count).',
    condition: { type: 'launches', count: 5 },
  },
]

export const ACHIEVEMENT_IDS = ACHIEVEMENTS.map((a) => a.id)
