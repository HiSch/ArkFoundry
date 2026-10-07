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
  | 'orbitalMechanics'
  | 'orbitalConstruction'
  | 'lunarMining'
  | 'fusionContainment'
  | 'hullEngineering'
  | 'fusionPower'
  | 'reactorEngineering'
  | 'gasGiantMining'
  | 'driveEngineering'
  | 'exoticPhysics'
  | 'habitatDesign'
  | 'colonyOutreach'
  | 'cryogenics'
  | 'shieldTheory'
  | 'starNavigation'

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
  {
    id: 'orbitalMechanics',
    name: 'Orbital Mechanics',
    description: 'Reliable launches to orbit. The first step towards the Ark.',
    cost: { research: 8000, alloys: 500 },
    duration: 4 * HOUR,
    requires: ['alloyProcessing'],
    effects: [],
  },
  {
    id: 'orbitalConstruction',
    name: 'Orbital Construction',
    description: 'Unlocks the Orbital Shipyard, which builds components.',
    cost: { research: 20000, alloys: 2000 },
    duration: 6 * HOUR,
    requires: ['orbitalMechanics'],
    effects: [],
  },
  {
    id: 'lunarMining',
    name: 'Lunar Mining',
    description: 'Unlocks the Helium-3 Extractor on the moon.',
    cost: { research: 25000, alloys: 2500 },
    duration: 6 * HOUR,
    requires: ['orbitalMechanics'],
    effects: [],
  },
  {
    id: 'fusionContainment',
    name: 'Fusion Containment',
    description: 'Helium-3 extractors produce 50 % more.',
    cost: { research: 50000, helium3: 500 },
    duration: 8 * HOUR,
    requires: ['lunarMining'],
    effects: [{ type: 'output', building: 'he3Extractor', factor: 1.5 }],
  },
  {
    id: 'hullEngineering',
    name: 'Ark Hull Engineering',
    description: 'Final blueprints for the Ark hull. Allows building the Hull module.',
    cost: { research: 100000, components: 500 },
    duration: 10 * HOUR,
    requires: ['orbitalConstruction', 'fusionContainment'],
    effects: [],
  },
  // --- Reactor (run 2) ---
  {
    id: 'fusionPower',
    name: 'Fusion Power',
    description: 'Unlocks the Fusion Reactor, which turns Helium-3 into energy.',
    cost: { research: 80000, helium3: 2000 },
    duration: 6 * HOUR,
    requires: ['fusionContainment'],
    condition: { type: 'moduleLaunched', module: 'hull' },
    effects: [],
  },
  {
    id: 'reactorEngineering',
    name: 'Reactor Engineering',
    description: 'Blueprints for the Ark reactor. Allows building the Reactor module.',
    cost: { research: 150000, components: 2000 },
    duration: 10 * HOUR,
    requires: ['fusionPower', 'orbitalConstruction'],
    condition: { type: 'moduleLaunched', module: 'hull' },
    effects: [],
  },
  // --- Engine (run 3) ---
  {
    id: 'gasGiantMining',
    name: 'Gas Giant Mining',
    description: 'Unlocks the Gas Giant Skimmer, a large source of Helium-3.',
    cost: { research: 200000, components: 4000 },
    duration: 8 * HOUR,
    requires: ['lunarMining', 'orbitalConstruction'],
    condition: { type: 'moduleLaunched', module: 'reactor' },
    effects: [],
  },
  {
    id: 'driveEngineering',
    name: 'Drive Engineering',
    description: 'Blueprints for the fusion drive. Allows building the Engine module.',
    cost: { research: 300000, helium3: 20000 },
    duration: 12 * HOUR,
    requires: ['gasGiantMining', 'fusionContainment'],
    condition: { type: 'moduleLaunched', module: 'reactor' },
    effects: [],
  },
  // --- Habitat (run 4) ---
  {
    id: 'exoticPhysics',
    name: 'Exotic Physics',
    description: 'Unlocks the Particle Collider, which makes exotic matter.',
    cost: { research: 400000, helium3: 30000 },
    duration: 10 * HOUR,
    requires: ['fusionContainment', 'orbitalConstruction'],
    condition: { type: 'moduleLaunched', module: 'engine' },
    effects: [],
  },
  {
    id: 'habitatDesign',
    name: 'Habitat Design',
    description: 'Blueprints for the habitat ring. Allows building the Habitat module.',
    cost: { research: 500000, exotic: 50 },
    duration: 12 * HOUR,
    requires: ['exoticPhysics'],
    condition: { type: 'moduleLaunched', module: 'engine' },
    effects: [],
  },
  // --- Cryo Deck (run 5) ---
  {
    id: 'colonyOutreach',
    name: 'Colony Outreach',
    description: 'Unlocks Survivor Camps. Refugees from the cities can join the Ark.',
    cost: { research: 300000, credits: 1000000 },
    duration: 6 * HOUR,
    requires: ['marketAnalysis', 'orbitalConstruction'],
    condition: { type: 'moduleLaunched', module: 'habitat' },
    effects: [],
  },
  {
    id: 'cryogenics',
    name: 'Cryogenics',
    description: 'Safe long-term sleep. Allows building the Cryo Deck module.',
    cost: { research: 600000, exotic: 100 },
    duration: 12 * HOUR,
    requires: ['colonyOutreach', 'exoticPhysics'],
    condition: { type: 'moduleLaunched', module: 'habitat' },
    effects: [],
  },
  // --- Shield (run 6) ---
  {
    id: 'shieldTheory',
    name: 'Shield Theory',
    description: 'Exotic matter bends radiation away. Allows building the Shield module.',
    cost: { research: 800000, exotic: 200 },
    duration: 14 * HOUR,
    requires: ['exoticPhysics', 'gridTheory', 'lunarMining'],
    condition: { type: 'moduleLaunched', module: 'cryoDeck' },
    effects: [],
  },
  // --- Navigation (runs 7+) ---
  {
    id: 'starNavigation',
    name: 'Star Navigation',
    description: 'Charts a course to a habitable world. Allows building the Navigation module.',
    cost: { research: 1000000, exotic: 300 },
    duration: 16 * HOUR,
    requires: ['shieldTheory', 'colonyOutreach'],
    condition: { type: 'moduleLaunched', module: 'shield' },
    effects: [],
  },
]

export const RESEARCH_IDS: ResearchId[] = RESEARCH.map((r) => r.id)

export function getResearch(id: ResearchId): ResearchDef {
  const def = RESEARCH.find((r) => r.id === id)
  if (!def) throw new Error(`Unknown research ${id}`)
  return def
}
