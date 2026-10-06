import { RESOURCE_IDS, type ResourceId } from '../content/resources'
import type { GameState } from './state'
import { advance } from './tick'

/** Offline time beyond this is ignored. */
export const MAX_OFFLINE_SECONDS = 30 * 24 * 3600
/** Absences shorter than this are caught up silently, without a report. */
export const REPORT_THRESHOLD_SECONDS = 60
/** Upper bound for the number of ticks an offline catch-up runs. */
const MAX_OFFLINE_TICKS = 20_000
/** Offline catch-up never uses steps longer than this. */
const MAX_OFFLINE_STEP = 60

export interface OfflineReport {
  /** Simulated seconds (after applying the maximum). */
  seconds: number
  /** Net change of each resource over the absence. */
  change: Record<ResourceId, number>
  /** Amount lost because storage was full. */
  lost: Record<ResourceId, number>
}

/**
 * Simulates time the player was away. Long absences use larger steps so
 * that catching up stays fast; production rules are the same `tick`.
 */
export function catchUp(state: GameState, seconds: number): OfflineReport {
  const simulated = Math.min(Math.max(0, seconds), MAX_OFFLINE_SECONDS)
  const before = { ...state.resources }
  const step = Math.min(MAX_OFFLINE_STEP, Math.max(1, simulated / MAX_OFFLINE_TICKS))
  const totals = advance(state, simulated, step)
  const change = Object.fromEntries(
    RESOURCE_IDS.map((id) => [id, state.resources[id] - before[id]]),
  ) as Record<ResourceId, number>
  return { seconds: simulated, change, lost: totals.lost }
}
