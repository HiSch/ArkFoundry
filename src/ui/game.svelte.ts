import { clearSave, createSave, exportSave, importSave, readSave, writeSave } from '../core/save'
import { createInitialState, type GameState } from '../core/state'
import { advance } from '../core/tick'

const AUTOSAVE_INTERVAL_MS = 10_000
/** Real time per frame is capped; longer gaps are handled by offline catch-up (phase 2). */
const MAX_FRAME_SECONDS = 1

/**
 * Browser-side game controller. Holds the reactive game state, runs the
 * frame loop and handles saving. All rules live in `src/core`.
 */
class Game {
  state: GameState = $state(createInitialState())
  /** Debug time multiplier applied to real time. */
  timeScale = $state(1)
  lastSavedAt: number | null = $state(null)

  private frameHandle = 0
  private lastFrame = 0
  private autosaveHandle = 0

  start(): void {
    const save = readSave(localStorage)
    if (save) {
      this.state = save.state
      this.lastSavedAt = save.savedAt
    }
    this.lastFrame = performance.now()
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
    advance(this.state, realSeconds * this.timeScale)
    this.frameHandle = requestAnimationFrame(this.frame)
  }

  private onVisibilityChange = (): void => {
    if (document.visibilityState === 'hidden') this.save()
  }

  private onPageHide = (): void => this.save()

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
    this.timeScale = 1
    this.save()
  }

  exportString(): string {
    return exportSave(createSave(this.state, Date.now()))
  }

  /** Replaces the current game with an imported save. Throws on invalid input. */
  importString(text: string): void {
    const save = importSave(text)
    this.state = save.state
    this.save()
  }
}

export const game = new Game()
