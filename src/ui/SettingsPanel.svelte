<script lang="ts">
  import type { Notation } from '../core/format'
  import { formatNumber } from '../core/format'
  import { game } from './game.svelte'
  import { AUTOSAVE_OPTIONS, preferences, type FontSize } from './preferences.svelte'

  const notations: { value: Notation; label: string }[] = [
    { value: 'scientific', label: 'Scientific' },
    { value: 'short', label: 'Short' },
    { value: 'engineering', label: 'Engineering' },
  ]
  const fontSizes: { value: FontSize; label: string }[] = [
    { value: 'small', label: 'Small' },
    { value: 'normal', label: 'Normal' },
    { value: 'large', label: 'Large' },
    { value: 'xlarge', label: 'X-Large' },
  ]
  const sample = 12_345_678

  function setAutosave(seconds: number): void {
    preferences.set('autosaveSeconds', seconds)
    game.restartAutosave()
  }
</script>

<details class="panel settings">
  <summary>Settings</summary>

  <p class="label">Number format</p>
  <div class="row" role="group" aria-label="Number format">
    {#each notations as option (option.value)}
      <button
        aria-pressed={preferences.notation === option.value}
        onclick={() => preferences.set('notation', option.value)}
      >
        {option.label}
        <span class="example">{formatNumber(sample, option.value)}</span>
      </button>
    {/each}
  </div>

  <p class="label">Font size</p>
  <div class="row" role="group" aria-label="Font size">
    {#each fontSizes as option (option.value)}
      <button
        aria-pressed={preferences.fontSize === option.value}
        onclick={() => preferences.set('fontSize', option.value)}
      >
        {option.label}
      </button>
    {/each}
  </div>

  <p class="label">Autosave every</p>
  <div class="row" role="group" aria-label="Autosave interval">
    {#each AUTOSAVE_OPTIONS as seconds (seconds)}
      <button
        aria-pressed={preferences.autosaveSeconds === seconds}
        onclick={() => setAutosave(seconds)}
      >
        {seconds} s
      </button>
    {/each}
  </div>

  <p class="label">Dialogs</p>
  <label class="toggle">
    <input
      type="checkbox"
      checked={preferences.confirmLaunch}
      onchange={(e) => preferences.set('confirmLaunch', e.currentTarget.checked)}
    />
    Ask before launching a module
  </label>
  <label class="toggle">
    <input
      type="checkbox"
      checked={preferences.showOfflineReport}
      onchange={(e) => preferences.set('showOfflineReport', e.currentTarget.checked)}
    />
    Show "While you were away" summary
  </label>
  <p class="hint">Resetting the game and importing a save always ask first.</p>
  <p class="hint">Settings are stored on this device only, not in the save.</p>
</details>

<style>
  .settings > summary {
    cursor: pointer;
    color: var(--accent);
  }

  .row button {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .example {
    font-size: 0.75rem;
    color: var(--muted);
  }

  .toggle {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    min-height: 2.75rem;
    font-size: 0.9375rem;
  }

  .toggle input {
    width: 1.25rem;
    height: 1.25rem;
    accent-color: var(--accent);
  }

  .hint {
    margin: 0.5rem 0 0;
    color: var(--muted);
    font-size: 0.8125rem;
  }
</style>
