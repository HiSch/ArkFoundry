import { describe, expect, it } from 'vitest'
import { PROFILES } from './profiles'
import { seededRandom, simulate } from './simulate'

describe('simulation', () => {
  it('reaches the early milestones with an active player', () => {
    const active = PROFILES.find((p) => p.id === 'active')!
    const result = simulate(active, 3)
    expect(result.milestones['First refinery']).not.toBeNull()
    expect(result.milestones['First lab']).not.toBeNull()
    // The research gate keeps the Hull far away after only a few hours.
    expect(result.milestones['Hull complete']).toBeNull()
  })

  it('uses a reproducible random generator', () => {
    const a = seededRandom(42)
    const b = seededRandom(42)
    const values = [a(), a(), a()]
    expect([b(), b(), b()]).toEqual(values)
    for (const v of values) {
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
    }
  })
})
