import type { BuildingId } from '../content/buildings'
import { RESOURCE_IDS, type ResourceId } from '../content/resources'
import type { UpgradeId } from '../content/upgrades'
import { buyBuilding, buyUpgrade, mine, setBuildingEnabled, type BuyAmount } from '../core/actions'
import { computeFlows } from '../core/production'
import { clearSave, createSave, exportSave, importSave, readSave, writeSave } from '../core/save'
import { createInitialState, type GameState } from '../core/state'
import { advance, type Totals } from '../core/tick'
import { updateUnlocks } from '../core/unlocks'

const AUTOSAVE_INTERVAL_MS = 10_000
/** Real time per frame is capped; longer gaps are handled by offline catch-up (phase 2). */
const MAX_FRAME_SECONDS = 1
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

  private frameHandle = 0
  private lastFrame = 0
  private autosaveHandle = 0
  private window = { started: 0, seconds: 0, net: zeroRates() }

  start(): void {
    const save = readSave(localStorage)
    if (save) {
      this.state = save.state
      this.lastSavedAt = save.savedAt
    }
    updateUnlocks(this.state)
    this.lastFrame = performance.now()
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
    const realSeconds = Math.min((now - this.lastFrame) / 1000, MAX_FRAME_SECONDS)
    this.lastFrame = now
    const gameSeconds = realSeconds * this.timeScale
    this.record(advance(this.state, gameSeconds), gameSeconds)
    if (now - this.window.started >= RATE_WINDOW_MS) this.publishRates(now)
    this.frameHandle = requestAnimationFrame(this.frame)
  }

  private record(totals: Totals, seconds: number): void {
    this.window.seconds += seconds
    for (const id of RESOURCE_IDS) {
      this.window.net[id] += totals.produced[id] - totals.consumed[id]
    }
  }

  private publishRates(now: number): void {
    const { seconds, net } = this.window
    if (seconds > 0) {
      this.rates = Object.fromEntries(RESOURCE_IDS.map((id) => [id, net[id] / seconds])) as Record<
        ResourceId,
        number
      >
    }
    this.efficiency = computeFlows(this.state, 0.1).efficiency
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

  setEnabled(id: BuildingId, enabled: boolean): void {
    setBuildingEnabled(this.state, id, enabled)
  }

  save(): void {
    const now = Date.now()
    writeSave(localStorage, createSave(this.state, now))
    this.lastSavedAt = now
  }

  /** Debug: simulate `seconds` of game time instantly. */
  skip(seconds: number): void {
    advance(this.state, seconds)
  }

  /** Wipes all progress and starts over. */
  reset(): void {
    clearSave(localStorage)
    this.state = createInitialState()
    updateUnlocks(this.state)
    this.timeScale = 1
    this.rates = zeroRates()
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
