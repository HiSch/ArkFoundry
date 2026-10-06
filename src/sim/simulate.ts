import { mine } from '../core/actions'
import { updateEvents } from '../core/events'
import { catchUp } from '../core/offline'
import { createInitialState, type GameState } from '../core/state'
import { advance } from '../core/tick'
import { isMet } from '../core/unlocks'
import type { UnlockCondition } from '../core/types'
import { playRound } from './bot'
import type { PlayerProfile } from './profiles'

/** Pacing milestones of the first run, in order. */
export const MILESTONES: { name: string; condition: UnlockCondition }[] = [
  { name: 'First refinery', condition: { type: 'building', building: 'refinery', count: 1 } },
  { name: 'First trade post', condition: { type: 'building', building: 'tradePost', count: 1 } },
  { name: 'First lab', condition: { type: 'building', building: 'lab', count: 1 } },
  { name: 'Metallurgy', condition: { type: 'research', research: 'metallurgy' } },
  { name: 'First smelter', condition: { type: 'building', building: 'smelter', count: 1 } },
  { name: 'Orbital Mechanics', condition: { type: 'research', research: 'orbitalMechanics' } },
  { name: 'First shipyard', condition: { type: 'building', building: 'shipyard', count: 1 } },
  {
    name: 'First He-3 extractor',
    condition: { type: 'building', building: 'he3Extractor', count: 1 },
  },
  { name: 'Hull research', condition: { type: 'research', research: 'hullEngineering' } },
  { name: 'Hull complete', condition: { type: 'moduleCompleted', module: 'hull' } },
]

export interface SimulationResult {
  profile: string
  /** Real seconds from the start of the game until each milestone (null if not reached). */
  milestones: Record<string, number | null>
  /** Seconds spent online (in sessions). */
  onlineSeconds: number
  state: GameState
}

/** Seconds per decision round while online. */
const ROUND_SECONDS = 5
/** The game starts at 09:00 on day 1. */
const START_HOUR = 9

/** Small deterministic random generator (mulberry32) so runs are reproducible. */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Online intervals [start, end) in seconds since game start, up to `horizon`. */
function onlineIntervals(profile: PlayerProfile, horizon: number): [number, number][] {
  const intervals: [number, number][] = []
  for (let day = 0; day * 86400 < horizon + 86400; day++) {
    for (const session of profile.sessions) {
      const start = day * 86400 + (session.hour - START_HOUR) * 3600
      const end = start + session.minutes * 60
      if (end <= 0 || start >= horizon) continue
      intervals.push([Math.max(0, start), Math.min(horizon, end)])
    }
  }
  return intervals.sort((a, b) => a[0] - b[0])
}

/**
 * Plays the first run with a profile until the Hull is complete or
 * `horizonHours` have passed. The first session starts right at game start.
 */
export function simulate(
  profile: PlayerProfile,
  horizonHours = 24 * 7,
  seed = 1,
): SimulationResult {
  const horizon = horizonHours * 3600
  const state = createInitialState()
  state.meta.introSeen = true
  const random = seededRandom(seed)
  const milestones: Record<string, number | null> = Object.fromEntries(
    MILESTONES.map((m) => [m.name, null]),
  )
  const intervals = onlineIntervals(profile, horizon)
  // The player starts the game, so the first session begins immediately.
  if (intervals.length === 0 || intervals[0][0] > 0) intervals.unshift([0, 15 * 60])

  let now = 0
  let onlineSeconds = 0
  const record = () => {
    for (const m of MILESTONES) {
      if (milestones[m.name] === null && isMet(state, m.condition)) milestones[m.name] = now
    }
  }
  const done = () => state.ark.modules.hull.completed

  for (const [start, end] of intervals) {
    if (start > now) {
      catchUp(state, start - now)
      updateEvents(state, start - now, random, false)
      now = start
      record()
      if (done()) break
    }
    while (now < end && !done()) {
      if (now < profile.clickMinutes * 60) {
        for (let i = 0; i < profile.clicksPerSecond * ROUND_SECONDS; i++) mine(state)
      }
      playRound(state)
      advance(state, ROUND_SECONDS)
      updateEvents(state, ROUND_SECONDS, random, true)
      now += ROUND_SECONDS
      onlineSeconds += ROUND_SECONDS
      record()
    }
    if (done() || now >= horizon) break
  }
  return { profile: profile.id, milestones, onlineSeconds, state }
}
