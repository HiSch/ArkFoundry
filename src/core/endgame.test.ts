import { describe, expect, it } from 'vitest'
import { getBuilding } from '../content/buildings'
import { getEvent } from '../content/events'
import { getModule } from '../content/modules'
import { getResearch } from '../content/research'
import { updateAchievements } from './achievements'
import { canSupplyLaunch, deliverToModule, runProgress } from './ark'
import { eventResources } from './events'
import { ACHIEVEMENT_BONUS, globalMultiplier, multipliers, perBuildingRates } from './production'
import { launchModule, supplyLaunch } from './prestige'
import {
  availableResearch,
  KNOWN_RESEARCH_FACTOR,
  researchDuration,
  startResearch,
} from './research'
import { createInitialState } from './state'
import { advance } from './tick'

function launchedUpTo(count: number) {
  const state = createInitialState()
  const order = [
    'hull',
    'reactor',
    'engine',
    'habitat',
    'cryoDeck',
    'shield',
    'navigation',
  ] as const
  for (const id of order.slice(0, count)) state.ark.modules[id].launched = true
  return state
}

describe('known research', () => {
  it('takes half the time in later runs', () => {
    const state = createInitialState()
    state.research.completed.push('automation')
    state.ark.modules.hull.completed = true
    launchModule(state, 'hull')
    expect(state.meta.knownResearch).toContain('automation')
    expect(researchDuration(state, 'automation')).toBe(
      getResearch('automation').duration * KNOWN_RESEARCH_FACTOR,
    )
    expect(researchDuration(state, 'metallurgy')).toBe(getResearch('metallurgy').duration)
    state.buildings.lab.count = 1
    state.resources.research = 1e6
    startResearch(state, 'automation')
    advance(state, getResearch('automation').duration * KNOWN_RESEARCH_FACTOR + 1)
    expect(state.research.completed).toContain('automation')
  })
})

describe('module-gated research', () => {
  it('requires the previous module in orbit', () => {
    const state = createInitialState()
    state.buildings.lab.count = 1
    state.research.completed.push('automation', 'lunarMining', 'fusionContainment')
    expect(availableResearch(state).map((r) => r.id)).not.toContain('fusionPower')
    state.ark.modules.hull.launched = true
    expect(availableResearch(state).map((r) => r.id)).toContain('fusionPower')
  })

  it('requires the Exotic Research prestige upgrade for exotic physics', () => {
    const state = launchedUpTo(3)
    state.research.completed.push('fusionContainment', 'orbitalConstruction')
    expect(availableResearch(state).map((r) => r.id)).not.toContain('exoticPhysics')
    state.meta.prestigeUpgrades.exoticResearch = 1
    expect(availableResearch(state).map((r) => r.id)).toContain('exoticPhysics')
  })
})

describe('supply launches', () => {
  it('keep deliveries of a module that spans several runs', () => {
    const state = launchedUpTo(6)
    state.research.completed.push('starNavigation')
    const cost = getModule('navigation').cost
    const share = getModule('navigation').supplyLaunchShare!
    for (const [r, need] of Object.entries(cost)) {
      state.resources[r as keyof typeof cost] = (need ?? 0) * (share / 2)
    }
    deliverToModule(state, 'navigation')
    expect(canSupplyLaunch(state, 'navigation')).toBe(false)
    for (const [r, need] of Object.entries(cost)) {
      state.resources[r as keyof typeof cost] = (need ?? 0) * (share / 2)
    }
    deliverToModule(state, 'navigation')
    expect(runProgress(state, 'navigation')).toBeCloseTo(share)
    expect(canSupplyLaunch(state, 'navigation')).toBe(true)
    expect(supplyLaunch(state, 'navigation')).toBeGreaterThan(0)
    expect(state.meta.launches).toBe(1)
    expect(state.ark.modules.navigation.launched).toBe(false)
    expect(state.ark.modules.navigation.delivered.exotic).toBeCloseTo(cost.exotic! * share)
    expect(runProgress(state, 'navigation')).toBe(0)
  })

  it('cap deliveries per run so the module takes several runs', () => {
    const state = launchedUpTo(6)
    state.research.completed.push('starNavigation')
    const cost = getModule('navigation').cost
    const share = getModule('navigation').supplyLaunchShare!
    for (const [r, need] of Object.entries(cost)) {
      state.resources[r as keyof typeof cost] = (need ?? 0) * 10
    }
    deliverToModule(state, 'navigation')
    expect(runProgress(state, 'navigation')).toBeCloseTo(share)
    expect(state.ark.modules.navigation.completed).toBe(false)
    expect(state.resources.exotic).toBeCloseTo(cost.exotic! * (10 - share))
    // Three runs complete it (each new run needs the research again).
    supplyLaunch(state, 'navigation')
    state.research.completed.push('starNavigation')
    for (const [r, need] of Object.entries(cost)) {
      state.resources[r as keyof typeof cost] = (need ?? 0) * 10
    }
    deliverToModule(state, 'navigation')
    supplyLaunch(state, 'navigation')
    state.research.completed.push('starNavigation')
    for (const [r, need] of Object.entries(cost)) {
      state.resources[r as keyof typeof cost] = (need ?? 0) * 10
    }
    deliverToModule(state, 'navigation')
    expect(state.ark.modules.navigation.completed).toBe(true)
  })

  it('are not possible for normal modules', () => {
    const state = createInitialState()
    state.research.completed.push('hullEngineering')
    state.resources.alloys = 1e9
    deliverToModule(state, 'hull')
    expect(canSupplyLaunch(state, 'hull')).toBe(false)
  })
})

describe('late prestige upgrades', () => {
  it('Efficient Refining lowers refinery inputs', () => {
    const state = createInitialState()
    state.meta.prestigeUpgrades.efficientRefining = 2
    expect(multipliers(state, 'refinery').input).toBeCloseTo(0.81)
    const oreIn = getBuilding('refinery').consumes!.ore!
    expect(perBuildingRates(state, 'refinery').consumes[0][1]).toBeCloseTo(oreIn * 0.81)
  })

  it('Dock Synergy speeds up everything per module in orbit', () => {
    const state = launchedUpTo(3)
    expect(globalMultiplier(state)).toBe(1)
    state.meta.prestigeUpgrades.dockSynergy = 1
    expect(globalMultiplier(state)).toBeCloseTo(1.15)
  })

  it('Trade Contacts enlarge event rewards', () => {
    const state = createInitialState()
    const def = getEvent('meteorShower')
    const base = eventResources(state, def).ore!
    state.meta.prestigeUpgrades.tradeContacts = 1
    expect(eventResources(state, def).ore).toBeCloseTo(base * 1.5)
  })
})

describe('achievements', () => {
  it('unlock once and give a permanent bonus', () => {
    const state = createInitialState()
    updateAchievements(state)
    expect(state.meta.achievements).toEqual([])
    state.buildings.drone.count = 50
    updateAchievements(state)
    updateAchievements(state)
    expect(state.meta.achievements).toEqual(['droneSwarm'])
    expect(globalMultiplier(state)).toBeCloseTo(1 + ACHIEVEMENT_BONUS)
  })

  it('survive a launch', () => {
    const state = createInitialState()
    state.meta.achievements.push('droneSwarm')
    state.ark.modules.hull.completed = true
    launchModule(state, 'hull')
    expect(state.meta.achievements).toContain('droneSwarm')
  })
})
