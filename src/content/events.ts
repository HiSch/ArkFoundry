import type { EventDef } from '../core/types'

export type EventId =
  'meteorShower' | 'solarFlare' | 'trader' | 'distressCall' | 'derelictProbe' | 'stationWreck'

const MINUTE = 60

/** Random events that appear while playing and must be collected by hand. */
export const EVENTS: EventDef[] = [
  {
    id: 'meteorShower',
    name: 'Meteor Shower',
    icon: '☄️',
    description: 'Fragments rich in ore came down near the colony.',
    reward: { type: 'resource', resource: 'ore', seconds: 10 * MINUTE, minimum: 100 },
  },
  {
    id: 'solarFlare',
    name: 'Solar Flare',
    icon: '🌞',
    description: 'The dying sun flares up. Capture the surge before the grid burns out.',
    reward: { type: 'resource', resource: 'energy', seconds: 10 * MINUTE, minimum: 100 },
    requires: 'energy',
  },
  {
    id: 'trader',
    name: 'Trader Convoy',
    icon: '🚚',
    description: 'A convoy from the last cities pays well for your surplus.',
    reward: { type: 'resource', resource: 'credits', seconds: 15 * MINUTE, minimum: 200 },
    requires: 'credits',
  },
  {
    id: 'distressCall',
    name: 'Distress Call',
    icon: '📡',
    description: 'Survivors of a fallen city ask to join you. Extra hands for a while.',
    reward: { type: 'boost', factor: 1.5, duration: 10 * MINUTE },
    requires: 'metal',
  },
  {
    id: 'derelictProbe',
    name: 'Derelict Probe',
    icon: '🛰️',
    description: 'An old survey probe crashed nearby. Its data cores are intact.',
    reward: { type: 'resource', resource: 'research', seconds: 15 * MINUTE, minimum: 50 },
    requires: 'research',
  },
  {
    id: 'stationWreck',
    name: 'Station Wreck',
    icon: '🛸',
    description: 'Wreckage of an old orbital station drifts down. Good alloys inside.',
    reward: { type: 'resource', resource: 'alloys', seconds: 15 * MINUTE, minimum: 20 },
    requires: 'alloys',
  },
]

export function getEvent(id: EventId): EventDef {
  const def = EVENTS.find((e) => e.id === id)
  if (!def) throw new Error(`Unknown event ${id}`)
  return def
}
