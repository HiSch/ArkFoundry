<script lang="ts">
  import { game } from './game.svelte'

  const scales = [1, 10, 100]
  const skips = [
    { label: '+1 min', seconds: 60 },
    { label: '+1 h', seconds: 3600 },
    { label: '+8 h', seconds: 8 * 3600 },
  ]

  function reset(): void {
    if (confirm('Reset all progress? This cannot be undone.')) game.reset()
  }
</script>

<details class="panel">
  <summary>Debug</summary>
  <p class="label">Time scale</p>
  <div class="row">
    {#each scales as scale (scale)}
      <button aria-pressed={game.timeScale === scale} onclick={() => (game.timeScale = scale)}>
        ×{scale}
      </button>
    {/each}
  </div>
  <p class="label">Skip time</p>
  <div class="row">
    {#each skips as skip (skip.seconds)}
      <button onclick={() => game.skip(skip.seconds)}>{skip.label}</button>
    {/each}
  </div>
  <div class="row">
    <button class="danger" onclick={reset}>Reset game</button>
  </div>
</details>
