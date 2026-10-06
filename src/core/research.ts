import { getResearch, RESEARCH, type ResearchId } from '../content/research'
import { canAfford, entries, pay } from './amounts'
import { activeEffects } from './effects'
import type { GameState } from './state'
import type { ResearchDef } from './types'
import { isMet, updateUnlocks } from './unlocks'

/** Research completed in an earlier run takes this share of its normal time. */
export const KNOWN_RESEARCH_FACTOR = 0.5

/** Real seconds a project takes at normal research speed, shorter if it is already known. */
export function researchDuration(state: GameState, id: ResearchId): number {
  const base = getResearch(id).duration
  return state.meta.knownResearch.includes(id) ? base * KNOWN_RESEARCH_FACTOR : base
}

/** Maximum number of projects in the queue, including the active one. */
export const MAX_QUEUE_LENGTH = 3

/** Whether the research panel should be shown at all. */
export function researchDiscovered(state: GameState): boolean {
  return state.buildings.lab.count > 0 || state.research.completed.length > 0
}

function isQueued(state: GameState, id: ResearchId): boolean {
  return state.research.queue.some((entry) => entry.id === id)
}

/** Projects whose prerequisites are done and that are neither completed nor queued. */
export function availableResearch(state: GameState): ResearchDef[] {
  const done = state.research.completed
  return RESEARCH.filter(
    (def) =>
      !done.includes(def.id) &&
      !isQueued(state, def.id) &&
      def.requires.every((required) => done.includes(required)) &&
      (!def.condition || isMet(state, def.condition)),
  )
}

export function canStartResearch(state: GameState, id: ResearchId): boolean {
  return (
    researchDiscovered(state) &&
    state.research.queue.length < MAX_QUEUE_LENGTH &&
    availableResearch(state).some((def) => def.id === id) &&
    canAfford(state, getResearch(id).cost)
  )
}

/** Pays for a project and appends it to the queue. Returns whether it was queued. */
export function startResearch(state: GameState, id: ResearchId): boolean {
  if (!canStartResearch(state, id)) return false
  pay(state, getResearch(id).cost)
  state.research.queue.push({ id, progress: 0 })
  return true
}

/**
 * Removes a project from the queue and refunds its cost (refunds may exceed
 * storage capacity). Progress on it is lost.
 */
export function cancelResearch(state: GameState, id: ResearchId): boolean {
  const index = state.research.queue.findIndex((entry) => entry.id === id)
  if (index === -1) return false
  state.research.queue.splice(index, 1)
  for (const [resource, amount] of entries(getResearch(id).cost)) {
    state.resources[resource] += amount
  }
  return true
}

/**
 * Advances the active project by `dt` seconds of real time. Time left over
 * after finishing a project goes to the next one in the queue.
 */
export function progressResearch(state: GameState, dt: number): void {
  let remaining = dt * researchSpeed(state)
  while (remaining > 0 && state.research.queue.length > 0) {
    const active = state.research.queue[0]
    const duration = researchDuration(state, active.id)
    const needed = duration - active.progress
    if (remaining < needed) {
      active.progress += remaining
      return
    }
    remaining -= needed
    state.research.queue.shift()
    state.research.completed.push(active.id)
    updateUnlocks(state)
  }
}

/** Multiplier on research progress per real second. */
export function researchSpeed(state: GameState): number {
  let speed = 1
  for (const effect of activeEffects(state)) {
    if (effect.type === 'researchSpeed') speed += effect.add
  }
  return speed
}

/** Real seconds until a queued project finishes, given the current research speed. */
export function projectTimeRemaining(state: GameState, id: ResearchId): number {
  const entry = state.research.queue.find((e) => e.id === id)
  const progress = entry?.progress ?? 0
  return (researchDuration(state, id) - progress) / researchSpeed(state)
}

/** Real seconds until every queued project is finished. */
export function queueTimeRemaining(state: GameState): number {
  return state.research.queue.reduce((sum, entry) => sum + projectTimeRemaining(state, entry.id), 0)
}
