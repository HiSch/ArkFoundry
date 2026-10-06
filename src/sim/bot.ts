import { BUILDINGS } from '../content/buildings'
import { MODULES } from '../content/modules'
import { UPGRADES } from '../content/upgrades'
import { buyBuilding, buyUpgrade } from '../core/actions'
import { canBuildModule, deliverToModule } from '../core/ark'
import { collectEvent } from '../core/events'
import { computeFlows } from '../core/production'
import { availableResearch, MAX_QUEUE_LENGTH, startResearch } from '../core/research'
import type { GameState } from '../core/state'
import { capacities } from '../core/storage'

/** Research on the way to the Hull, done first. */
const CRITICAL_RESEARCH = [
  'automation',
  'metallurgy',
  'alloyProcessing',
  'orbitalMechanics',
  'orbitalConstruction',
  'lunarMining',
  'fusionContainment',
  'hullEngineering',
]

/**
 * One round of decisions by a reasonable player: collect the event, buy
 * affordable upgrades, keep the research queue full (critical path first),
 * buy buildings without starving converters, and deliver to the Ark.
 */
export function playRound(state: GameState): void {
  collectEvent(state)
  for (const upgrade of UPGRADES) buyUpgrade(state, upgrade.id)

  const available = availableResearch(state)
  const ordered = [
    ...available.filter((r) => CRITICAL_RESEARCH.includes(r.id)),
    ...available.filter((r) => !CRITICAL_RESEARCH.includes(r.id)),
  ].sort((a, b) => critIndex(a.id) - critIndex(b.id))
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

  for (const module of MODULES) {
    if (canBuildModule(state, module.id)) deliverToModule(state, module.id)
  }
}

function critIndex(id: string): number {
  const index = CRITICAL_RESEARCH.indexOf(id)
  return index === -1 ? CRITICAL_RESEARCH.length : index
}
