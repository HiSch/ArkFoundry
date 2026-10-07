import type { BuildingId } from '../content/buildings'
import { getEvent } from '../content/events'
import { getModule, type ModuleId } from '../content/modules'
import type { PrestigeUpgradeId } from '../content/prestige'
import type { ResearchId } from '../content/research'
import { RESOURCE_IDS, type ResourceId } from '../content/resources'
import type { UpgradeId } from '../content/upgrades'
import { buyBuilding, buyUpgrade, mine, setBuildingEnabled, type BuyAmount } from '../core/actions'
import { deliverToModule } from '../core/ark'
import { collectEvent, eventResources, updateEvents } from '../core/events'
import { catchUp, REPORT_THRESHOLD_SECONDS, type OfflineReport } from '../core/offline'
import { buyPrestigeUpgrade, launchModule, setAutoBuy, supplyLaunch } from '../core/prestige'
import { computeFlows, type Limit } from '../core/production'
import { cancelResearch, startResearch } from '../core/research'
import { clearSave, createSave, exportSave, importSave, readSave, writeSave } from '../core/save'
import { createInitialState, type GameState } from '../core/state'
import { capacities } from '../core/storage'
import { markMessagesRead } from '../core/story'
import { advance, type Totals } from '../core/tick'
import { updateUnlocks } from '../core/unlocks'

const AUTOSAVE_INTERVAL_MS = 10_000
/**
 * Frames further apart than this (tab in background, device asleep) are
 * treated as an absence and handled by offline catch-up.
 */
const MAX_FRAME_SECONDS = 2
/** How often the displayed rates are recalculated, in real milliseconds. */
const RATE_WINDOW_MS = 1000

function zeroRates(): Record<ResourceId, number> {
  return Object.fromEntries(RESOURCE_IDS.map((id) => [id, 0])) as Record<ResourceId, number>
}

/**
 * Browser-side game controller. Holds the reactive game state, runs the
 * frame loop and handles saving. All rules live in `src/core`.
 */
class Game {
  state: GameState = $state(createInitialState())
  /** Debug time multiplier applied to real time. */
  timeScale = $state(1)
  lastSavedAt: number | null = $state(null)
  /** Selected quantity for building purchases. */
  buyAmount: BuyAmount = $state(1)
  /** Net change per second of game time, averaged over the last rate window. */
  rates: Record<ResourceId, number> = $state(zeroRates())
  /** Share of full speed per building (0–1), limited by inputs. */
  efficiency: Partial<Record<BuildingId, number>> = $state({})
  /** What slows down each building that runs below full speed. */
  limits: Partial<Record<BuildingId, Limit>> = $state({})
  /** Summary of the last absence, shown until dismissed. */
  offlineReport: OfflineReport | null = $state(null)
  /** Short message shown at the top until dismissed (e.g. after a launch). */
  notice: string | null = $state(null)

  private frameHandle = 0
  private lastFrame = 0
  /** Wall-clock time of the last frame; unlike `performance.now` it keeps running during sleep. */
  private lastWallClock = 0
  private autosaveHandle = 0
  private window = { started: 0, seconds: 0, net: zeroRates() }

  start(): void {
    const save = readSave(localStorage)
    if (save) {
      this.state = save.state
      this.lastSavedAt = save.savedAt
      updateUnlocks(this.state)
      this.handleAbsence((Date.now() - save.savedAt) / 1000)
    }
    updateUnlocks(this.state)
    this.lastFrame = performance.now()
    this.lastWallClock = Date.now()
    this.window.started = this.lastFrame
    this.frameHandle = requestAnimationFrame(this.frame)
    this.autosaveHandle = window.setInterval(() => this.save(), AUTOSAVE_INTERVAL_MS)
    document.addEventListener('visibilitychange', this.onVisibilityChange)
    window.addEventListener('pagehide', this.onPageHide)
  }

  stop(): void {
    cancelAnimationFrame(this.frameHandle)
    clearInterval(this.autosaveHandle)
    document.removeEventListener('visibilitychange', this.onVisibilityChange)
    window.removeEventListener('pagehide', this.onPageHide)
  }

  private frame = (now: number): void => {
    const wallClock = Date.now()
    const gap = Math.max((now - this.lastFrame) / 1000, (wallClock - this.lastWallClock) / 1000)
    this.lastFrame = now
    this.lastWallClock = wallClock
    if (gap > MAX_FRAME_SECONDS) {
      this.handleAbsence(gap)
    } else {
      const gameSeconds = gap * this.timeScale
      this.record(advance(this.state, gameSeconds), gameSeconds)
      updateEvents(this.state, gameSeconds, Math.random, true)
    }
    if (now - this.window.started >= RATE_WINDOW_MS) this.publishRates(now)
    this.frameHandle = requestAnimationFrame(this.frame)
  }

  private record(totals: Totals, seconds: number): void {
    this.window.seconds += seconds
    for (const id of RESOURCE_IDS) {
      this.window.net[id] += totals.produced[id] - totals.consumed[id]
    }
  }

  /** Catches up on time the player was away and shows a summary for longer absences. */
  private handleAbsence(seconds: number): void {
    if (seconds <= 0) return
    const report = catchUp(this.state, seconds)
    updateEvents(this.state, seconds, Math.random, false)
    if (report.seconds >= REPORT_THRESHOLD_SECONDS) this.offlineReport = report
  }

  dismissReport(): void {
    this.offlineReport = null
  }

  private publishRates(now: number): void {
    const { seconds, net } = this.window
    if (seconds > 0) {
      this.rates = Object.fromEntries(RESOURCE_IDS.map((id) => [id, net[id] / seconds])) as Record<
        ResourceId,
        number
      >
    }
    const flows = computeFlows(this.state, 0.1, capacities(this.state))
    this.efficiency = flows.efficiency
    this.limits = flows.limit
    this.window = { started: now, seconds: 0, net: zeroRates() }
  }

  private onVisibilityChange = (): void => {
    if (document.visibilityState === 'hidden') this.save()
  }

  private onPageHide = (): void => this.save()

  mine(): void {
    mine(this.state)
  }

  buy(id: BuildingId): void {
    buyBuilding(this.state, id, this.buyAmount)
  }

  buyUpgrade(id: UpgradeId): void {
    buyUpgrade(this.state, id)
  }

  deliver(id: ModuleId): void {
    deliverToModule(this.state, id)
  }

  /** Launches a completed module: earns Star Charts and starts a new run. */
  launch(id: ModuleId): void {
    const reward = launchModule(this.state, id)
    if (reward === 0) return
    this.rates = zeroRates()
    this.efficiency = {}
    this.limits = {}
    this.notice =
      `The ${getModule(id).name} is in orbit. You earned ${reward} Star Charts. ` +
      'A new run begins – spend them in the Ark tab.'
    this.save()
  }

  /** Sends a supply launch for a module that spans several runs. */
  supplyLaunch(id: ModuleId): void {
    const reward = supplyLaunch(this.state, id)
    if (reward === 0) return
    this.rates = zeroRates()
    this.efficiency = {}
    this.limits = {}
    this.notice =
      `Supplies for the ${getModule(id).name} are in orbit. You earned ${reward} Star Charts. ` +
      'A new run begins – spend them in the Ark tab.'
    this.save()
  }

  dismissEnding(): void {
    this.state.meta.endingSeen = true
  }

  dismissNotice(): void {
    this.notice = null
  }

  buyPrestigeUpgrade(id: PrestigeUpgradeId): void {
    buyPrestigeUpgrade(this.state, id)
  }

  setAutoBuy(id: BuildingId, enabled: boolean): void {
    setAutoBuy(this.state, id, enabled)
  }

  startResearch(id: ResearchId): void {
    startResearch(this.state, id)
  }

  cancelResearch(id: ResearchId): void {
    cancelResearch(this.state, id)
  }

  setEnabled(id: BuildingId, enabled: boolean): void {
    setBuildingEnabled(this.state, id, enabled)
  }

  save(): void {
    // Stamp the save with the time the state was last advanced, not with
    // "now": in a background tab frames pause while autosave keeps running,
    // and that paused time must still be caught up on the next load.
    const advancedUntil = this.lastWallClock || Date.now()
    writeSave(localStorage, createSave(this.state, advancedUntil))
    this.lastSavedAt = Date.now()
  }

  /** Debug: simulate `seconds` of game time instantly. */
  skip(seconds: number): void {
    advance(this.state, seconds)
    updateEvents(this.state, seconds, Math.random, false)
  }

  /** Debug: make the next event appear right away. */
  spawnEvent(): void {
    this.state.events.active = null
    this.state.events.nextIn = 0
    updateEvents(this.state, 0, Math.random, true)
  }

  collectEvent(): void {
    collectEvent(this.state)
  }

  /** Preview of what collecting the active event gives. */
  eventPreview(): ReturnType<typeof eventResources> {
    const active = this.state.events.active
    if (!active) return {}
    return eventResources(this.state, getEvent(active.id))
  }

  readMessages(): void {
    markMessagesRead(this.state)
  }

  dismissIntro(): void {
    this.state.meta.introSeen = true
  }

  /** Debug: pretend the player was away for `seconds`, including the summary. */
  simulateAbsence(seconds: number): void {
    this.handleAbsence(seconds)
  }

  /** Wipes all progress and starts over. */
  reset(): void {
    clearSave(localStorage)
    this.state = createInitialState()
    updateUnlocks(this.state)
    this.timeScale = 1
    this.rates = zeroRates()
    this.offlineReport = null
    this.notice = null
    this.save()
  }

  exportString(): string {
    return exportSave(createSave(this.state, Date.now()))
  }

  /** Replaces the current game with an imported save. Throws on invalid input. */
  importString(text: string): void {
    const save = importSave(text)
    this.state = save.state
    updateUnlocks(this.state)
    this.save()
  }
}

export const game = new Game()
