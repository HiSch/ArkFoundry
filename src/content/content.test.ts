import { describe, expect, it } from 'vitest'
import type { UnlockCondition } from '../core/types'
import { BUILDINGS } from './buildings'
import { MODULES } from './modules'
import { RESEARCH } from './research'

function usesPrestigeUpgrade(condition: UnlockCondition | undefined): boolean {
  if (!condition) return false
  if (condition.type === 'prestigeUpgrade') return true
  if (condition.type === 'all') return condition.conditions.some(usesPrestigeUpgrade)
  return false
}

describe('content', () => {
  // Star Charts are only earned by launching modules. If progress needed a
  // prestige upgrade, a player who spent their Star Charts elsewhere could
  // never finish the next module: a hard lock.
  it('never makes progress depend on a prestige upgrade', () => {
    const offenders = [
      ...RESEARCH.filter((r) => usesPrestigeUpgrade(r.condition)).map((r) => r.id),
      ...BUILDINGS.filter((b) => usesPrestigeUpgrade(b.unlock)).map((b) => b.id),
      ...MODULES.filter((m) => usesPrestigeUpgrade(m.unlock)).map((m) => m.id),
    ]
    expect(offenders).toEqual([])
  })
})
