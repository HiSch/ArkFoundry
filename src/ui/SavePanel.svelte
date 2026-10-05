<script lang="ts">
  import { game } from './game.svelte'

  let text = $state('')
  let message = $state('')

  function save(): void {
    game.save()
    message = 'Game saved.'
  }

  function exportGame(): void {
    text = game.exportString()
    message = 'Copy this text to keep a backup.'
  }

  function importGame(): void {
    if (!text.trim()) {
      message = 'Paste a save string first.'
      return
    }
    if (!confirm('Replace the current game with the imported save?')) return
    try {
      game.importString(text)
      message = 'Save imported.'
    } catch (error) {
      message = error instanceof Error ? error.message : 'Import failed.'
    }
  }

  const lastSaved = $derived(
    game.lastSavedAt === null ? 'never' : new Date(game.lastSavedAt).toLocaleTimeString(),
  )
</script>

<details class="panel">
  <summary>Save</summary>
  <p class="label">Last saved: {lastSaved}</p>
  <div class="row">
    <button onclick={save}>Save now</button>
    <button onclick={exportGame}>Export</button>
    <button onclick={importGame}>Import</button>
  </div>
  <textarea bind:value={text} rows="4" placeholder="Save string" aria-label="Save string"
  ></textarea>
  {#if message}<p class="label" role="status">{message}</p>{/if}
</details>
