<script lang="ts">
  import { getEvent } from '../content/events'
  import { formatDuration } from '../core/format'
  import { game } from './game.svelte'
  import { formatAmounts } from './names'

  const active = $derived(game.state.events.active)
  const def = $derived(active ? getEvent(active.id) : null)
</script>

<!--
  Floats above the tab bar instead of sitting in the page flow, so the page
  does not jump when an event appears or disappears.
-->
{#if active && def}
  <aside class="event" role="status" aria-live="polite" aria-label="Event">
    <div class="text">
      <p class="title">
        <span aria-hidden="true">{def.icon}</span>
        {def.name} <span class="timer">· {formatDuration(active.remaining)}</span>
      </p>
      <p class="reward" title={def.description}>
        {#if def.reward.type === 'boost'}
          All buildings ×{def.reward.factor} for {formatDuration(def.reward.duration)}
        {:else}
          +{formatAmounts(game.eventPreview())}
        {/if}
      </p>
    </div>
    <button class="collect" onclick={() => game.collectEvent()}>Collect</button>
  </aside>
{/if}

<style>
  .event {
    position: fixed;
    z-index: 3;
    left: 50%;
    bottom: calc(4.75rem + env(safe-area-inset-bottom));
    transform: translateX(-50%);
    width: min(38rem, calc(100% - 1.5rem));
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem 0.75rem;
    background: var(--panel);
    border: 1px solid var(--warning);
    border-radius: 0.5rem;
    box-shadow: 0 0.25rem 1rem rgba(0, 0, 0, 0.5);
  }

  .text {
    flex: 1;
    min-width: 0;
  }

  p {
    margin: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .title {
    color: var(--warning);
    font-size: 0.9375rem;
  }

  .timer,
  .reward {
    color: var(--muted);
    font-size: 0.8125rem;
  }

  .collect {
    flex-shrink: 0;
    border-color: var(--warning);
    color: var(--warning);
  }
</style>
