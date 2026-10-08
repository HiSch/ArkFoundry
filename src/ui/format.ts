import * as core from '../core/format'
import { preferences } from './preferences.svelte'

/*
 * Number formatting in the notation the player chose. Reading the preference
 * here makes every number re-render when the setting changes.
 */

export function formatNumber(value: number): string {
  return core.formatNumber(value, preferences.notation)
}

export function formatCost(value: number): string {
  return core.formatCost(value, preferences.notation)
}

export function formatRate(value: number): string {
  return core.formatRate(value, preferences.notation)
}

export { formatDuration } from '../core/format'
