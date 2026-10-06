/**
 * Per-device display preferences. They are kept in their own localStorage
 * key, separate from the game save, and are not part of exports.
 */

export type ResourceView = 'expanded' | 'mini' | 'collapsed'

export type TabId = 'colony' | 'research' | 'upgrades' | 'ark' | 'more'

const KEY = 'ark-foundry-preferences'

interface Preferences {
  resourceView: ResourceView
  /** View to restore when a collapsed resource bar is opened again. */
  lastOpenResourceView: Exclude<ResourceView, 'collapsed'>
  /** Tab shown in the main area. */
  tab: TabId
}

const defaults: Preferences = {
  resourceView: 'expanded',
  lastOpenResourceView: 'expanded',
  tab: 'colony',
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
