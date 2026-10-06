import type { StoryDef } from '../core/types'

export type StoryId =
  | 'firstDrone'
  | 'firstSolar'
  | 'firstRefinery'
  | 'firstTrade'
  | 'firstLab'
  | 'metallurgy'
  | 'orbitalMechanics'
  | 'firstShipyard'
  | 'firstHelium'
  | 'hullBlueprints'
  | 'hullComplete'
  | 'hullLaunched'
  | 'reactorComplete'

const CONTROL = 'Mission Control'
const ENGINEER = 'Chief Engineer Okafor'
const SCIENCE = 'Dr. Lindqvist, Science'

/**
 * Radio messages, each sent once when its trigger is first met. They tell
 * the story and hint at what to do next.
 */
export const STORY: StoryDef[] = [
  {
    id: 'firstDrone',
    from: CONTROL,
    title: 'First drone online',
    text: 'The first drone is digging. It is a small start, but every Ark begins with a single shovel.',
    trigger: { type: 'building', building: 'drone', count: 1 },
  },
  {
    id: 'firstSolar',
    from: ENGINEER,
    title: 'Power on the plains',
    text: 'The sun is dying, but it still gives us light. The panels will feed the refineries we need next.',
    trigger: { type: 'building', building: 'solarField', count: 1 },
  },
  {
    id: 'firstRefinery',
    from: ENGINEER,
    title: 'Metal at last',
    text: 'The refinery runs. Keep it fed with ore and energy – a hungry refinery stands still.',
    trigger: { type: 'building', building: 'refinery', count: 1 },
  },
  {
    id: 'firstTrade',
    from: CONTROL,
    title: 'The cities still pay',
    text: 'The last cities buy our metal. Credits will not save anyone, but they buy the machines that will.',
    trigger: { type: 'building', building: 'tradePost', count: 1 },
  },
  {
    id: 'firstLab',
    from: SCIENCE,
    title: 'The old blueprints',
    text: 'We found fragments of the original Ark plans. Give us time and power, and we will make sense of them.',
    trigger: { type: 'building', building: 'lab', count: 1 },
  },
  {
    id: 'metallurgy',
    from: SCIENCE,
    title: 'Stronger than steel',
    text: 'Our smelters can now make alloys. A starship hull needs them by the million.',
    trigger: { type: 'research', research: 'metallurgy' },
  },
  {
    id: 'orbitalMechanics',
    from: CONTROL,
    title: 'Eyes on the sky',
    text: 'We can reach orbit reliably now. The Ark will be assembled up there, far from the dust.',
    trigger: { type: 'research', research: 'orbitalMechanics' },
  },
  {
    id: 'firstShipyard',
    from: ENGINEER,
    title: 'Shipyard in orbit',
    text: 'The shipyard is live. Components roll out of zero gravity – the bones of the Ark.',
    trigger: { type: 'building', building: 'shipyard', count: 1 },
  },
  {
    id: 'firstHelium',
    from: SCIENCE,
    title: 'Fuel from the moon',
    text: 'Helium-3 from the lunar regolith. Enough of it, and the Ark will outrun the dying sun.',
    trigger: { type: 'building', building: 'he3Extractor', count: 1 },
  },
  {
    id: 'hullBlueprints',
    from: ENGINEER,
    title: 'The hull takes shape',
    text: 'The hull blueprints are complete. Deliver alloys, components and Helium-3 in the Ark tab.',
    trigger: { type: 'research', research: 'hullEngineering' },
  },
  {
    id: 'hullComplete',
    from: CONTROL,
    title: 'Ready for launch',
    text: 'The hull is finished. Launching it will cost us this colony – we start over, wiser and faster.',
    trigger: { type: 'moduleCompleted', module: 'hull' },
  },
  {
    id: 'hullLaunched',
    from: CONTROL,
    title: 'One down, six to go',
    text: 'The hull is in orbit. Down here we begin again, with the star charts of everything we learned.',
    trigger: { type: 'moduleLaunched', module: 'hull' },
  },
  {
    id: 'reactorComplete',
    from: ENGINEER,
    title: 'A heart for the Ark',
    text: 'The reactor is built. Once it is mounted, the Ark will have power for centuries.',
    trigger: { type: 'moduleCompleted', module: 'reactor' },
  },
]

export const STORY_IDS = STORY.map((s) => s.id)
