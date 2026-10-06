import { BUILDINGS } from '../content/buildings'
import { getModule, MODULES, type ModuleId } from '../content/modules'
import type { PrestigeUpgradeId } from '../content/prestige'
import { getResearch, RESEARCH, type ResearchId } from '../content/research'
import { UPGRADES } from '../content/upgrades'
import { buyBuilding, buyUpgrade } from '../core/actions'
import { entries } from '../core/amounts'
import { canBuildModule, deliverToModule } from '../core/ark'
import { collectEvent } from '../core/events'
import { buyPrestigeUpgrade, prestigeLevel } from '../core/prestige'
import { computeFlows } from '../core/production'
import { availableResearch, MAX_QUEUE_LENGTH, startResearch } from '../core/research'
import type { GameState } from '../core/state'
import { capacities } from '../core/storage'

/** The next module to build: the first one not in orbit yet. */
export function targetModule(state: GameState): ModuleId | null {
  return MODULES.find((m) => !state.ark.modules[m.id].launched)?.id ?? null
}

function withPrerequisites(ids: ResearchId[], into: Set<ResearchId>): void {
  for (const id of ids) {
    if (into.has(id)) continue
    into.add(id)
    withPrerequisites(getResearch(id).requires, into)
  }
}

/**
 * Research the target module needs: its own blueprint research and the
 * research that unlocks buildings producing its cost, with prerequisites.
 */
export function criticalResearch(target: ModuleId | null): Set<ResearchId> {
  const needed = new Set<ResearchId>(['automation', 'metallurgy'])
  if (!target) return needed
  const def = getModule(target)
  const roots: ResearchId[] = []
  if (def.unlock.type === 'research') roots.push(def.unlock.research)
  for (const [resource] of entries(def.cost)) {
    for (const building of BUILDINGS) {
      if (building.produces[resource] && building.unlock.type === 'research') {
        roots.push(building.unlock.research)
      }
    }
  }
  withPrerequisites(roots, needed)
  return needed
}

/** Order in which the bot spends Star Charts (repeated entries buy more levels). */
const PRESTIGE_PRIORITY: PrestigeUpgradeId[] = [
  'veteranEngineers',
  'blueprintArchive',
  'seedCapital',
  'autoPause',
  'veteranEngineers',
  'veteranEngineers',
  'exoticResearch',
  'dockSynergy',
  'veteranEngineers',
  'veteranEngineers',
  'biggerSilos',
  'biggerSilos',
  'efficientRefining',
  'tradeContacts',
  'autoDrones',
  'autoBuildings',
  'biggerSilos',
  'biggerSilos',
  'efficientRefining',
  'efficientRefining',
]

/** Spends Star Charts in priority order; stops at the first upgrade it cannot afford yet. */
export function spendStarCharts(state: GameState): void {
  const wanted = new Map<PrestigeUpgradeId, number>()
  for (const id of PRESTIGE_PRIORITY) {
    const target = (wanted.get(id) ?? 0) + 1
    wanted.set(id, target)
    if (prestigeLevel(state, id) >= target) continue
    if (!buyPrestigeUpgrade(state, id)) return
  }
  for (const id of ['autoDrones', 'autoBuildings'] as const) {
    if (prestigeLevel(state, id) > 0) {
      state.meta.autoBuy.drone = true
      state.meta.autoBuy.solarField = true
      state.meta.autoBuy.excavator = true
      state.meta.autoBuy.solarArray = true
    }
  }
}

/**
 * One round of decisions by a reasonable player: collect the event, buy
 * affordable upgrades, keep the research queue full (research the target
 * module needs first), buy buildings without starving converters, and
 * deliver to the target module.
 */
export function playRound(state: GameState): void {
  collectEvent(state)
  for (const upgrade of UPGRADES) buyUpgrade(state, upgrade.id)

  const target = targetModule(state)
  const critical = criticalResearch(target)
  const available = availableResearch(state)
  const ordered = [
    ...available.filter((r) => critical.has(r.id)),
    ...available.filter((r) => !critical.has(r.id)),
  ]
  for (const def of ordered) {
    if (state.research.queue.length >= MAX_QUEUE_LENGTH) break
    startResearch(state, def.id)
  }

  const flows = computeFlows(state, 1, capacities(state))
  for (const def of BUILDINGS) {
    if (!state.unlockedBuildings.includes(def.id)) continue
    // Do not add converters that already lack inputs.
    if (def.consumes && flows.limit[def.id] === 'inputs') continue
    while (buyBuilding(state, def.id, 1) > 0) {
      if (def.consumes) break
    }
  }

  if (target && canBuildModule(state, target)) deliverToModule(state, target)
}

/** All research in content order, for reports. */
export const ALL_RESEARCH = RESEARCH.map((r) => r.id)
