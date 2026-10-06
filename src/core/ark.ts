import { getModule, MODULES, type ModuleId } from '../content/modules'
import { entries } from './amounts'
import type { GameState } from './state'
import type { Amounts } from './types'
import { isMet } from './unlocks'

/** Whether resources can be delivered to a module right now. */
export function canBuildModule(state: GameState, id: ModuleId): boolean {
  return !state.ark.modules[id].completed && isMet(state, getModule(id).unlock)
}

/** Share of the module's cost delivered so far, averaged over its resources (0–1). */
export function moduleProgress(state: GameState, id: ModuleId): number {
  const cost = entries(getModule(id).cost)
  if (state.ark.modules[id].completed) return 1
  if (cost.length === 0) return 0
  const delivered = state.ark.modules[id].delivered
  const sum = cost.reduce((total, [r, need]) => total + Math.min(1, (delivered[r] ?? 0) / need), 0)
  return sum / cost.length
}

/** Resources still missing to complete a module. */
export function moduleRemaining(state: GameState, id: ModuleId): Amounts {
  const delivered = state.ark.modules[id].delivered
  const remaining: Amounts = {}
  for (const [r, need] of entries(getModule(id).cost)) {
    remaining[r] = Math.max(0, need - (delivered[r] ?? 0))
  }
  return remaining
}

/**
 * Moves as much of each missing resource as possible from storage into the
 * module. Delivered resources no longer count against storage. Completes the
 * module when everything has been delivered. Returns what was delivered.
 */
export function deliverToModule(state: GameState, id: ModuleId): Amounts {
  const moved: Amounts = {}
  if (!canBuildModule(state, id)) return moved
  const module = state.ark.modules[id]
  for (const [r, missing] of entries(moduleRemaining(state, id))) {
    const amount = Math.min(missing, state.resources[r])
    if (amount <= 0) continue
    state.resources[r] -= amount
    module.delivered[r] = (module.delivered[r] ?? 0) + amount
    moved[r] = amount
  }
  if (entries(moduleRemaining(state, id)).every(([, missing]) => missing <= 1e-9)) {
    module.completed = true
  }
  return moved
}

export function completedModules(state: GameState): number {
  return MODULES.filter((m) => state.ark.modules[m.id].completed).length
}

/** Modules launched into orbit; they make up the Ark. */
export function launchedModules(state: GameState): number {
  return MODULES.filter((m) => state.ark.modules[m.id].launched).length
}
