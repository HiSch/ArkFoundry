import { describe, expect, it } from 'vitest'
import { getBuilding } from '../content/buildings'
import { getUpgrade } from '../content/upgrades'
import { computeFlows, multipliers, nextMilestone, perBuildingRates } from './production'
import { createInitialState } from './state'
import { tick } from './tick'

const refinery = getBuilding('refinery')
const oreIn = refinery.consumes!.ore!
const energyIn = refinery.consumes!.energy!
const metalOut = refinery.produces.metal!

describe('computeFlows', () => {
  it('runs converters at full speed when inputs are plentiful', () => {
    const state = createInitialState()
    state.buildings.refinery.count = 2
    state.resources.ore = 1000
    state.resources.energy = 1000
    const flows = computeFlows(state, 1)
    expect(flows.efficiency.refinery).toBe(1)
    expect(flows.consumed.ore).toBeCloseTo(2 * oreIn)
    expect(flows.consumed.energy).toBeCloseTo(2 * energyIn)
    expect(flows.produced.metal).toBeCloseTo(2 * metalOut)
  })

  it('throttles converters by the scarcest input', () => {
    const state = createInitialState()
    state.buildings.refinery.count = 2
    state.resources.ore = 1000
    state.resources.energy = energyIn / 2
    const flows = computeFlows(state, 1)
    expect(flows.efficiency.refinery).toBeCloseTo(0.25)
    expect(flows.produced.metal).toBeCloseTo(0.5 * metalOut)
  })

  it('lets later buildings use what earlier ones produced in the same step', () => {
    const state = createInitialState()
    const solarOut = getBuilding('solarField').produces.energy!
    state.buildings.solarField.count = Math.ceil(energyIn / solarOut)
    state.buildings.refinery.count = 1
    state.resources.ore = 1000
    const flows = computeFlows(state, 1)
    expect(flows.efficiency.refinery).toBe(1)
    expect(flows.produced.metal).toBeCloseTo(metalOut)
  })

  it('skips switched-off buildings', () => {
    const state = createInitialState()
    state.buildings.tradePost.count = 1
    state.buildings.tradePost.enabled = false
    state.resources.metal = 10
    expect(computeFlows(state, 1).consumed.metal).toBe(0)
  })

  it('does not change the state', () => {
    const state = createInitialState()
    state.buildings.drone.count = 3
    computeFlows(state, 10)
    expect(state.resources.ore).toBe(0)
  })

  it('never drives resources negative', () => {
    const state = createInitialState()
    state.buildings.refinery.count = 50
    state.resources.ore = 3
    state.resources.energy = 3
    tick(state, 1)
    expect(state.resources.ore).toBeGreaterThanOrEqual(0)
    expect(state.resources.energy).toBeGreaterThanOrEqual(0)
  })
})

describe('multipliers', () => {
  it('doubles throughput at count milestones', () => {
    const state = createInitialState()
    state.buildings.drone.count = 24
    expect(multipliers(state, 'drone').throughput).toBe(1)
    state.buildings.drone.count = 25
    expect(multipliers(state, 'drone').throughput).toBe(2)
    state.buildings.drone.count = 100
    expect(multipliers(state, 'drone').throughput).toBe(8)
  })

  it('applies throughput and output upgrades', () => {
    const state = createInitialState()
    state.upgrades.push('drillBits', 'catalysts')
    const drill = getUpgrade('drillBits').effects[0]
    const catalysts = getUpgrade('catalysts').effects[0]
    if (drill.type !== 'throughput' || catalysts.type !== 'output') throw new Error('unexpected')
    expect(multipliers(state, 'drone').throughput).toBe(drill.factor)
    expect(multipliers(state, 'refinery')).toEqual({
      throughput: 1,
      output: catalysts.factor,
      input: 1,
    })
  })

  it('shows per-building rates with multipliers', () => {
    const state = createInitialState()
    state.upgrades.push('catalysts')
    const { output } = multipliers(state, 'refinery')
    expect(perBuildingRates(state, 'refinery')).toEqual({
      consumes: [
        ['ore', oreIn],
        ['energy', energyIn],
      ],
      produces: [['metal', metalOut * output]],
    })
  })

  it('finds the next milestone', () => {
    expect(nextMilestone(0)).toBe(25)
    expect(nextMilestone(25)).toBe(50)
    expect(nextMilestone(1000)).toBeNull()
  })
})
