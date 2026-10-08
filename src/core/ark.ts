import { getModule, MODULES, type ModuleId } from '../content/modules'
import { RESOURCE_IDS } from '../content/resources'
import { entries } from './amounts'
import { hasEffect } from './effects'
import type { GameState } from './state'
import { capacities } from './storage'
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
export function deliverToModule(state: GameState, id: ModuleId, keep: Amounts = {}): Amounts {
  const moved: Amounts = {}
  if (!canBuildModule(state, id)) return moved
  const module = state.ark.modules[id]
  const def = getModule(id)
  for (const [r, missing] of entries(moduleRemaining(state, id))) {
    let amount = Math.min(missing, state.resources[r] - (keep[r] ?? 0))
    if (def.supplyLaunchShare) {
      // Only a share of a multi-run module can be delivered per run.
      const allowed = (def.cost[r] ?? 0) * def.supplyLaunchShare - (module.deliveredThisRun[r] ?? 0)
      amount = Math.min(amount, Math.max(0, allowed))
    }
    if (amount <= 0) continue
    state.resources[r] -= amount
    module.delivered[r] = (module.delivered[r] ?? 0) + amount
    module.deliveredThisRun[r] = (module.deliveredThisRun[r] ?? 0) + amount
    moved[r] = amount
  }
  if (entries(moduleRemaining(state, id)).every(([, missing]) => missing <= 1e-9)) {
    module.completed = true
  }
  return moved
}

/** Share of storage Automated Logistics keeps in stock before delivering. */
export const AUTO_DELIVER_KEEP_SHARE = 0.5

/** The module Automated Logistics delivers to: the first one that can be built. */
export function autoDeliverTarget(state: GameState): ModuleId | null {
  return MODULES.find((m) => canBuildModule(state, m.id))?.id ?? null
}

/**
 * Automated Logistics: delivers everything above half of the storage capacity
 * to the module being built, if the upgrade is owned and switched on.
 */
export function runAutoDeliver(state: GameState): void {
  if (!state.meta.autoDeliver || !hasEffect(state, 'autoDeliver')) return
  const id = autoDeliverTarget(state)
  if (!id) return
  const caps = capacities(state)
  const keep: Amounts = {}
  for (const r of RESOURCE_IDS) keep[r] = caps[r] * AUTO_DELIVER_KEEP_SHARE
  deliverToModule(state, id, keep)
}

export function setAutoDeliver(state: GameState, enabled: boolean): void {
  state.meta.autoDeliver = enabled
}

export function completedModules(state: GameState): number {
  return MODULES.filter((m) => state.ark.modules[m.id].completed).length
}

/** Modules launched into orbit; they make up the Ark. */
export function launchedModules(state: GameState): number {
  return MODULES.filter((m) => state.ark.modules[m.id].launched).length
}

/** Share of the module's cost delivered in the current run, averaged over its resources. */
export function runProgress(state: GameState, id: ModuleId): number {
  const cost = entries(getModule(id).cost)
  if (cost.length === 0) return 0
  const delivered = state.ark.modules[id].deliveredThisRun
  const sum = cost.reduce((total, [r, need]) => total + Math.min(1, (delivered[r] ?? 0) / need), 0)
  return sum / cost.length
}

/**
 * Whether a supply launch is possible: the module is too big for one run and
 * enough has been delivered in this run. A supply launch is a prestige that
 * keeps the deliveries.
 */
export function canSupplyLaunch(state: GameState, id: ModuleId): boolean {
  const share = getModule(id).supplyLaunchShare
  const module = state.ark.modules[id]
  return !!share && !module.completed && runProgress(state, id) >= share - 1e-9
}
