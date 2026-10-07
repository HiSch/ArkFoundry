/**
 * Pacing report for the whole game: plays every run with a player profile
 * until the Ark is complete and prints how long each run (launch or supply
 * launch) took.
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

const pad = (text: string | number, width: number) => String(text).padEnd(width)
console.log(`Profile: ${profile.name} – ${profile.description}`)
console.log(
  [
    pad('Run', 4),
    pad('Module', 11),
    pad('Type', 7),
    pad('Duration', 10),
    pad('Total', 10),
    pad('SC', 4),
    'SC total',
  ].join(' '),
)
console.log('-'.repeat(60))
let total = 0
let starCharts = 0
result.runs.forEach((run, index) => {
  total += run.seconds
  starCharts += run.starCharts
  console.log(
    [
      pad(index + 1, 4),
      pad(getModule(run.module as ModuleId).name, 11),
      pad(run.supply ? 'supply' : 'launch', 7),
      pad(formatDuration(run.seconds), 10),
      pad(formatDuration(total), 10),
      pad(run.starCharts, 4),
      starCharts,
    ].join(' '),
  )
})
console.log('-'.repeat(60))
console.log(
  result.completedAt === null
    ? `Ark not complete after ${formatDuration(total)} (${result.runs.length} runs)`
    : `Ark complete after ${formatDuration(result.completedAt)} (${result.runs.length} runs)`,
)
console.log(`Achievements: ${result.state.meta.achievements.length}`)
