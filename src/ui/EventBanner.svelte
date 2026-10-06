<script lang="ts">
  import { getEvent } from '../content/events'
  import { formatDuration } from '../core/format'
  import { game } from './game.svelte'
  import { formatAmounts } from './names'

  const active = $derived(game.state.events.active)
  const def = $derived(active ? getEvent(active.id) : null)
</script>

{#if active && def}
  <section class="panel event" role="status" aria-live="polite">
    <h2><span aria-hidden="true">{def.icon}</span> {def.name}</h2>
    <p class="detail">{def.description}</p>
    <div class="row">
      <button class="buy collect" onclick={() => game.collectEvent()}>
        Collect
        <span class="cost">
          {#if def.reward.type === 'boost'}
            All buildings ×{def.reward.factor} for {formatDuration(def.reward.duration)}
          {:else}
            +{formatAmounts(game.eventPreview())}
          {/if}
        </span>
      </button>
    </div>
    <p class="detail">Gone in {formatDuration(active.remaining)}</p>
  </section>
{/if}

<style>
  .event {
    border-color: var(--warning);
  }

  h2 {
    color: var(--warning);
  }

  .detail {
    margin: 0.25rem 0 0;
    color: var(--muted);
    font-size: 0.875rem;
  }

  .collect {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
    border-color: var(--warning);
  }

  .cost {
    font-size: 0.8125rem;
    color: var(--muted);
  }
</style>
