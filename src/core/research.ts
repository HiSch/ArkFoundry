import { getResearch, RESEARCH, type ResearchId } from '../content/research'
import { canAfford, entries, pay } from './amounts'
import { activeEffects, effectProduct, effectSum } from './effects'
import type { GameState } from './state'
import type { Amounts, ResearchDef } from './types'
import { isMet, updateUnlocks } from './unlocks'

/** Each earlier completion of a project multiplies its time by this factor (100 %, 50 %, 25 %, …). */
export const REPEAT_RESEARCH_FACTOR = 0.5

/** How often a project was completed in earlier runs. */
export function researchCompletions(state: GameState, id: ResearchId): number {
  return state.meta.researchCompletions[id] ?? 0
}

/** Share of the normal time a project takes, halved for every earlier completion. */
export function researchTimeFactor(state: GameState, id: ResearchId): number {
  return Math.pow(REPEAT_RESEARCH_FACTOR, researchCompletions(state, id))
}

/** Real seconds a project takes at normal research speed. */
export function researchDuration(state: GameState, id: ResearchId): number {
  return getResearch(id).duration * researchTimeFactor(state, id)
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

/** Queue slots: the base size plus prestige upgrades. */
export function maxQueueLength(state: GameState): number {
  return MAX_QUEUE_LENGTH + effectSum(state, 'researchQueue', 'add')
}

/** Cost of a project after prestige discounts. */
export function researchCost(state: GameState, id: ResearchId): Amounts {
  const factor = effectProduct(state, 'researchCost', 'factor')
  const cost: Amounts = {}
  for (const [resource, amount] of entries(getResearch(id).cost)) cost[resource] = amount * factor
  return cost
}

export function canStartResearch(state: GameState, id: ResearchId): boolean {
  return (
    researchDiscovered(state) &&
    state.research.queue.length < maxQueueLength(state) &&
    availableResearch(state).some((def) => def.id === id) &&
    canAfford(state, researchCost(state, id))
  )
}

/** Pays for a project and appends it to the queue. Returns whether it was queued. */
export function startResearch(state: GameState, id: ResearchId): boolean {
  if (!canStartResearch(state, id)) return false
  pay(state, researchCost(state, id))
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
  for (const [resource, amount] of entries(researchCost(state, id))) {
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
