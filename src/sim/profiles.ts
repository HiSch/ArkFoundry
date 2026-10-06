/** A daily play session: starts at `hour` (0–24, local time) and lasts `minutes`. */
export interface Session {
  hour: number
  minutes: number
}

export interface PlayerProfile {
  id: string
  name: string
  description: string
  /** Sessions repeated every day. */
  sessions: Session[]
  /** Manual mining clicks per second during sessions, for the first `clickMinutes`. */
  clicksPerSecond: number
  clickMinutes: number
}

/** Typical players the pacing targets are defined for (see docs/GAME_DESIGN.md). */
export const PROFILES: PlayerProfile[] = [
  {
    id: 'active',
    name: 'Active',
    description: 'Game open from 08:00 to 23:00, asleep at night.',
    sessions: [{ hour: 8, minutes: 15 * 60 }],
    clicksPerSecond: 3,
    clickMinutes: 30,
  },
  {
    id: 'casual',
    name: 'Casual',
    description: 'Four 15-minute check-ins a day (08:00, 12:30, 18:00, 22:00).',
    sessions: [
      { hour: 8, minutes: 15 },
      { hour: 12.5, minutes: 15 },
      { hour: 18, minutes: 15 },
      { hour: 22, minutes: 15 },
    ],
    clicksPerSecond: 2,
    clickMinutes: 10,
  },
  {
    id: 'idle',
    name: 'Idle only',
    description: 'Two 5-minute check-ins a day (08:00 and 20:00).',
    sessions: [
      { hour: 8, minutes: 5 },
      { hour: 20, minutes: 5 },
    ],
    clicksPerSecond: 1,
    clickMinutes: 5,
  },
]
