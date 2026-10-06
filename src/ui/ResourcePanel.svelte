<script lang="ts">
  import { RESOURCES } from '../content/resources'
  import { formatDuration, formatNumber, formatRate } from '../core/format'
  import { capacities, storageHours } from '../core/storage'
  import { game } from './game.svelte'

  const visible = $derived(
    RESOURCES.filter(
      (r) =>
        r.id === 'ore' || game.state.stats.produced[r.id] > 0 || game.state.resources[r.id] > 0,
    ),
  )
  const caps = $derived(capacities(game.state))

  function signed(rate: number): string {
    const text = formatRate(rate)
    return rate > 0 ? `+${text}` : text
  }
</script>

<section class="panel resources" aria-label="Resources">
  <dl>
    {#each visible as resource (resource.id)}
      {@const amount = game.state.resources[resource.id]}
      {@const full = amount >= caps[resource.id] * 0.999}
      <dt>
        {resource.name}
        {#if full}<span class="full">FULL</span>{/if}
      </dt>
      <dd>
        <span class:full>{formatNumber(amount)}</span><span class="cap"
          >/{formatNumber(caps[resource.id])}</span
        >
        <span class="rate" class:negative={game.rates[resource.id] < -1e-9}>
          {signed(game.rates[resource.id])}/s
        </span>
      </dd>
    {/each}
  </dl>
  <p class="label">
    Day {Math.floor(game.state.playTime / 86400) + 1} · {formatDuration(game.state.playTime)} · Storage:
    {storageHours(game.state)} h
  </p>
</section>

<style>
  .resources {
    position: sticky;
    top: 0;
    z-index: 1;
  }

  .cap {
    color: var(--muted);
    font-size: 0.75rem;
  }

  .rate {
    display: inline-block;
    min-width: 6em;
    color: var(--muted);
    font-size: 0.875rem;
  }

  .negative {
    color: var(--danger);
  }

  .full {
    color: var(--warning);
  }

  dt .full {
    margin-left: 0.25rem;
    font-size: 0.6875rem;
    border: 1px solid var(--warning);
    border-radius: 0.25rem;
    padding: 0 0.25rem;
  }

  .label {
    margin-bottom: 0;
  }
</style>
