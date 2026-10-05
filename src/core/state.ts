/** Identifiers of all resources. Phase 0 only has a placeholder resource. */
export type ResourceId = 'ore'

export interface GameState {
  /** Amount held per resource. */
  resources: Record<ResourceId, number>
  /** Total simulated game time in seconds (includes debug time skips). */
  playTime: number
}

export function createInitialState(): GameState {
  return {
    resources: { ore: 0 },
    playTime: 0,
  }
}
