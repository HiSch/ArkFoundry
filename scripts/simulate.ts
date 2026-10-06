/**
 * Pacing report for the first run: plays it with every player profile and
 * prints when each milestone is reached (real time since game start).
 *
 * Usage: npm run simulate
 */
import { formatDuration } from '../src/core/format'
import { launchReward } from '../src/core/prestige'
import { PROFILES } from '../src/sim/profiles'
import { MILESTONES, simulate } from '../src/sim/simulate'

const results = PROFILES.map((profile) => {
  const started = Date.now()
  const result = simulate(profile)
  console.error(`${profile.name}: simulated in ${((Date.now() - started) / 1000).toFixed(1)} s`)
  return result
})

const pad = (text: string, width: number) => text.padEnd(width)
const header = [pad('Milestone', 22), ...PROFILES.map((p) => pad(p.name, 12))].join(' ')
console.log(header)
console.log('-'.repeat(header.length))
for (const m of MILESTONES) {
  const cells = results.map((r) => {
    const t = r.milestones[m.name]
    return pad(t === null ? '–' : formatDuration(t), 12)
  })
  console.log([pad(m.name, 22), ...cells].join(' '))
}
console.log('-'.repeat(header.length))
console.log(
  [pad('Time online', 22), ...results.map((r) => pad(formatDuration(r.onlineSeconds), 12))].join(
    ' ',
  ),
)
console.log(
  [
    pad('Star Charts at Hull', 22),
    ...results.map((r) =>
      pad(r.state.ark.modules.hull.completed ? String(launchReward(r.state)) : '–', 12),
    ),
  ].join(' '),
)
