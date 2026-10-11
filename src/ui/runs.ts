import { getModule } from '../content/modules'
import { formatDuration } from '../core/format'
import type { GameState, RunRecord } from '../core/state'

/** "Hull launched", "Navigation supplies", "Abandoned (Hull)". */
export function runResult(run: RunRecord): string {
  const name = run.module ? getModule(run.module).name : 'colony'
  if (run.end === 'launch') return `${name} launched`
  if (run.end === 'supply') return `${name} supplies`
  return run.module ? `Abandoned (${name})` : 'Abandoned'
}

/** Number of the run (1-based) for an index into `meta.runs`. */
export function runNumber(state: GameState, index: number): number {
  const finished = state.meta.launches + state.meta.abandons
  return finished - state.meta.runs.length + index + 1
}

/** "2h 5m faster" / "10m slower" compared with an earlier duration. */
export function durationChange(now: number, before: number): string {
  const diff = now - before
  if (Math.abs(diff) < 1) return 'same time'
  return `${formatDuration(Math.abs(diff))} ${diff < 0 ? 'faster' : 'slower'}`
}

/** "+3" / "−2" / "±0". */
export function signed(diff: number): string {
  if (diff === 0) return '±0'
  return diff > 0 ? `+${diff}` : `−${-diff}`
}
