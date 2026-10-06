import { EVENTS, getEvent } from '../content/events'
import { activeEffects } from './effects'
import type { GameState } from './state'
import { addResources, grossRates } from './storage'
import type { Amounts, EventDef } from './types'

/** Seconds of live play between two events (uniformly random in this range). */
export const EVENT_INTERVAL = { min: 6 * 60, max: 12 * 60 }
/** Seconds an event stays before it disappears. */
export const EVENT_LIFETIME = 3 * 60

/** Events that can happen in the current run. */
export function eligibleEvents(state: GameState): EventDef[] {
  return EVENTS.filter((e) => !e.requires || state.stats.produced[e.requires] > 0)
}

/**
 * Advances event timers. New events only appear during live play
 * (`spawn` = true); offline time and debug skips only let an active event
 * expire. `random` returns numbers in [0, 1).
 */
export function updateEvents(
  state: GameState,
  dt: number,
  random: () => number,
  spawn: boolean,
): void {
  const events = state.events
  if (events.active) {
    events.active.remaining -= dt
    if (events.active.remaining <= 0) events.active = null
    return
  }
  if (!spawn) return
  events.nextIn -= dt
  if (events.nextIn > 0) return
  const pool = eligibleEvents(state)
  const def = pool[Math.min(pool.length - 1, Math.floor(random() * pool.length))]
  events.active = { id: def.id, remaining: EVENT_LIFETIME }
  events.nextIn = EVENT_INTERVAL.min + random() * (EVENT_INTERVAL.max - EVENT_INTERVAL.min)
}

/** Resources an event would give right now (empty for boosts). */
export function eventResources(state: GameState, def: EventDef): Amounts {
  if (def.reward.type !== 'resource') return {}
  const { resource, seconds, minimum } = def.reward
  let factor = 1
  for (const effect of activeEffects(state)) {
    if (effect.type === 'eventRewards') factor += effect.add
  }
  return { [resource]: Math.max(minimum, grossRates(state)[resource] * seconds) * factor }
}

/** Collects the active event. Returns its definition, or null if there was none. */
export function collectEvent(state: GameState): EventDef | null {
  const active = state.events.active
  if (!active) return null
  const def = getEvent(active.id)
  if (def.reward.type === 'resource') addResources(state, eventResources(state, def))
  else state.boosts.push({ factor: def.reward.factor, remaining: def.reward.duration })
  state.events.active = null
  state.meta.eventsCollected += 1
  return def
}

/** Combined factor of all running boosts. */
export function boostFactor(state: GameState): number {
  return state.boosts.reduce((product, boost) => product * boost.factor, 1)
}

/** Counts down boosts and removes expired ones. */
export function progressBoosts(state: GameState, dt: number): void {
  for (const boost of state.boosts) boost.remaining -= dt
  state.boosts = state.boosts.filter((b) => b.remaining > 0)
}
