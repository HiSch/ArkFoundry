import type { Notation } from '../core/format'

/**
 * Per-device display preferences. They are kept in their own localStorage
 * key, separate from the game save, and are not part of exports.
 */

export type ResourceView = 'expanded' | 'mini' | 'collapsed'

export type TabId = 'colony' | 'research' | 'upgrades' | 'ark' | 'more'

export type FontSize = 'small' | 'normal' | 'large' | 'xlarge'

/** Root font size in pixels per setting; the whole interface scales with it. */
export const FONT_SIZES: Record<FontSize, number> = { small: 14, normal: 16, large: 18, xlarge: 20 }

/** Allowed autosave intervals in seconds. */
export const AUTOSAVE_OPTIONS = [5, 10, 30, 60] as const

const KEY = 'ark-foundry-preferences'

interface Preferences {
  resourceView: ResourceView
  /** View to restore when a collapsed resource bar is opened again. */
  lastOpenResourceView: Exclude<ResourceView, 'collapsed'>
  /** Tab shown in the main area. */
  tab: TabId
  notation: Notation
  /** Seconds between automatic saves. */
  autosaveSeconds: number
  /** Ask before launching a module (the launch restarts the colony). */
  confirmLaunch: boolean
  /** Show the "While you were away" summary after an absence. */
  showOfflineReport: boolean
  fontSize: FontSize
}

const defaults: Preferences = {
  resourceView: 'expanded',
  lastOpenResourceView: 'expanded',
  tab: 'colony',
  notation: 'scientific',
  autosaveSeconds: 10,
  confirmLaunch: true,
  showOfflineReport: true,
  fontSize: 'normal',
}

function load(): Preferences {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? { ...defaults, ...JSON.parse(raw) } : { ...defaults }
  } catch {
    return { ...defaults }
  }
}

class PreferenceStore {
  private values: Preferences = $state(load())

  get resourceView(): ResourceView {
    return this.values.resourceView
  }

  setResourceView(view: ResourceView): void {
    this.values.resourceView = view
    if (view !== 'collapsed') this.values.lastOpenResourceView = view
    this.persist()
  }

  get tab(): TabId {
    return this.values.tab
  }

  setTab(tab: TabId): void {
    this.values.tab = tab
    this.persist()
  }

  get notation(): Notation {
    return this.values.notation
  }

  get autosaveSeconds(): number {
    return this.values.autosaveSeconds
  }

  get confirmLaunch(): boolean {
    return this.values.confirmLaunch
  }

  get showOfflineReport(): boolean {
    return this.values.showOfflineReport
  }

  get fontSize(): FontSize {
    return this.values.fontSize
  }

  /** Changes one of the settings shown in the Settings panel. */
  set<
    K extends 'notation' | 'autosaveSeconds' | 'confirmLaunch' | 'showOfflineReport' | 'fontSize',
  >(key: K, value: Preferences[K]): void {
    this.values[key] = value
    this.persist()
  }

  /** Opens a collapsed resource bar in the view used before collapsing it. */
  expandResources(): void {
    this.setResourceView(this.values.lastOpenResourceView)
  }

  private persist(): void {
    try {
      localStorage.setItem(KEY, JSON.stringify(this.values))
    } catch {
      // Storage unavailable (private mode etc.): keep the choice for this session only.
    }
  }
}

export const preferences = new PreferenceStore()
