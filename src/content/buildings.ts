import type { BuildingDef } from '../core/types'

export type BuildingId =
  | 'drone'
  | 'solarField'
  | 'refinery'
  | 'tradePost'
  | 'excavator'
  | 'solarArray'
  | 'arcRefinery'
  | 'lab'
  | 'smelter'
  | 'he3Extractor'
  | 'shipyard'
  | 'fusionReactor'
  | 'gasSkimmer'
  | 'collider'
  | 'survivorCamp'

/**
 * All buildings. The order is also the processing order each tick: a
 * building can use what the buildings before it produced in the same tick.
 */
export const BUILDINGS: BuildingDef[] = [
  {
    id: 'drone',
    name: 'Mining Drone',
    description: 'Small autonomous drone that chips ore from the crust.',
    cost: { ore: 12 },
    costGrowth: 1.15,
    produces: { ore: 0.4 },
    unlock: { type: 'always' },
  },
  {
    id: 'solarField',
    name: 'Solar Field',
    description: 'Panels on the dusty plains. The dying sun still gives enough.',
    cost: { ore: 100 },
    costGrowth: 1.15,
    produces: { energy: 0.6 },
    unlock: { type: 'produced', resource: 'ore', amount: 150 },
  },
  {
    id: 'refinery',
    name: 'Refinery',
    description: 'Melts ore into usable metal.',
    cost: { ore: 800, energy: 150 },
    costGrowth: 1.16,
    consumes: { ore: 3, energy: 1 },
    produces: { metal: 0.5 },
    unlock: { type: 'building', building: 'solarField', count: 3 },
  },
  {
    id: 'tradePost',
    name: 'Trade Post',
    description: 'Sells metal to the last cities still standing.',
    cost: { ore: 3000, metal: 100 },
    costGrowth: 1.18,
    consumes: { metal: 0.5 },
    produces: { credits: 2 },
    unlock: { type: 'produced', resource: 'metal', amount: 50 },
  },
  {
    id: 'excavator',
    name: 'Excavator',
    description: 'Heavy machine that strips whole hillsides.',
    cost: { credits: 1000, metal: 300 },
    costGrowth: 1.17,
    produces: { ore: 4 },
    unlock: { type: 'produced', resource: 'credits', amount: 300 },
  },
  {
    id: 'solarArray',
    name: 'Solar Array',
    description: 'Orbital mirrors focus sunlight onto collectors.',
    cost: { credits: 3000, metal: 1000 },
    costGrowth: 1.17,
    produces: { energy: 6 },
    unlock: { type: 'building', building: 'excavator', count: 3 },
  },
  {
    id: 'arcRefinery',
    name: 'Arc Refinery',
    description: 'Plasma arcs refine ore far faster than old furnaces.',
    cost: { credits: 15000, metal: 5000 },
    costGrowth: 1.18,
    consumes: { ore: 20, energy: 8 },
    produces: { metal: 6 },
    unlock: { type: 'building', building: 'solarArray', count: 3 },
  },
  {
    id: 'lab',
    name: 'Research Lab',
    description: 'Scientists study the old Ark blueprints. Labs need a lot of power.',
    cost: { credits: 2000, metal: 500 },
    costGrowth: 1.17,
    consumes: { energy: 3 },
    produces: { research: 0.2 },
    unlock: { type: 'produced', resource: 'credits', amount: 2000 },
  },
  {
    id: 'smelter',
    name: 'Alloy Smelter',
    description: 'Fuses metal into alloys strong enough for a starship hull.',
    cost: { credits: 20000, metal: 8000 },
    costGrowth: 1.18,
    consumes: { metal: 5, energy: 10 },
    produces: { alloys: 1 },
    unlock: { type: 'research', research: 'metallurgy' },
  },
  {
    id: 'he3Extractor',
    name: 'Helium-3 Extractor',
    description: 'Lunar crawlers bake Helium-3 out of the regolith. Fuel for the Ark.',
    cost: { credits: 150000, alloys: 1500 },
    costGrowth: 1.2,
    consumes: { energy: 15 },
    produces: { helium3: 0.5 },
    unlock: { type: 'research', research: 'lunarMining' },
  },
  {
    id: 'shipyard',
    name: 'Orbital Shipyard',
    description: 'Assembles starship components in zero gravity.',
    cost: { credits: 200000, alloys: 2000 },
    costGrowth: 1.2,
    consumes: { alloys: 2, metal: 10, energy: 20 },
    produces: { components: 0.5 },
    unlock: { type: 'research', research: 'orbitalConstruction' },
  },
  {
    id: 'fusionReactor',
    name: 'Fusion Reactor',
    description: 'Burns Helium-3 for enormous amounts of energy.',
    cost: { credits: 500000, components: 2000 },
    costGrowth: 1.2,
    consumes: { helium3: 1 },
    produces: { energy: 400 },
    unlock: { type: 'research', research: 'fusionPower' },
  },
  {
    id: 'gasSkimmer',
    name: 'Gas Giant Skimmer',
    description: 'Dives through the clouds of the outer giant to scoop up Helium-3.',
    cost: { credits: 1000000, components: 5000 },
    costGrowth: 1.2,
    consumes: { energy: 60 },
    produces: { helium3: 6 },
    unlock: { type: 'research', research: 'gasGiantMining' },
  },
  {
    id: 'collider',
    name: 'Particle Collider',
    description: 'Smashes Helium-3 nuclei until exotic matter falls out.',
    cost: { credits: 2000000, components: 10000, alloys: 50000 },
    costGrowth: 1.22,
    consumes: { energy: 800, helium3: 4 },
    produces: { exotic: 0.02 },
    unlock: { type: 'research', research: 'exoticPhysics' },
  },
  {
    id: 'survivorCamp',
    name: 'Survivor Camp',
    description: 'Shelter and food for refugees from the dying cities. Some join the Ark.',
    cost: { credits: 500000, alloys: 10000 },
    costGrowth: 1.18,
    consumes: { credits: 40, energy: 100 },
    produces: { colonists: 0.02 },
    unlock: { type: 'research', research: 'colonyOutreach' },
  },
]

export const BUILDING_IDS: BuildingId[] = BUILDINGS.map((b) => b.id)

export function getBuilding(id: BuildingId): BuildingDef {
  const def = BUILDINGS.find((b) => b.id === id)
  if (!def) throw new Error(`Unknown building ${id}`)
  return def
}
