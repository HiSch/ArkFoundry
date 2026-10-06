/**
 * Pacing report for the whole game: plays every run with a player profile
 * until the Ark is complete and prints how long each run took.
 *
 * Usage: npm run campaign [-- profileId] (default: active)
 */
import { getModule, type ModuleId } from '../src/content/modules'
import { formatDuration } from '../src/core/format'
import { PROFILES } from '../src/sim/profiles'
import { simulateCampaign } from '../src/sim/simulate'

const id = process.argv[2] ?? 'active'
const profile = PROFILES.find((p) => p.id === id)
if (!profile) throw new Error(`Unknown profile ${id}`)

const started = Date.now()
const result = simulateCampaign(profile)
console.error(`${profile.name}: simulated in ${((Date.now() - started) / 1000).toFixed(1)} s`)

let total = 0
console.log('Run  Module        Type      Duration     Star Charts')
console.log('-----------------------------------------------------')
result.runs.forEach((run, index) => {
  total += run.seconds
  const name = getModule(run.module as ModuleId).name
  console.log(
    `${String(index + 1).padEnd(4)} ${name.padEnd(13)} ${(run.supply ? 'supply' : 'launch').padEnd(9)} ${formatDuration(run.seconds).padEnd(12)} ${run.starCharts}`,
  )
})
console.log('-----------------------------------------------------')
console.log(
  result.completedAt === null
    ? `Ark not complete after ${formatDuration(total)} (${result.runs.length} runs)`
    : `Ark complete after ${formatDuration(result.completedAt)} (${result.runs.length} runs)`,
)
console.log(`Star Charts earned: ${result.state.meta.starChartsEarned}`)
console.log(`Achievements: ${result.state.meta.achievements.length}`)
