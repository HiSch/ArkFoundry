<script lang="ts">
  import { RESOURCES } from '../content/resources'
  import { formatDuration, formatNumber, formatRate } from '../core/format'
  import { game } from './game.svelte'

  const visible = $derived(
    RESOURCES.filter(
      (r) =>
        r.id === 'ore' || game.state.stats.produced[r.id] > 0 || game.state.resources[r.id] > 0,
    ),
  )

  function signed(rate: number): string {
    const text = formatRate(rate)
    return rate > 0 ? `+${text}` : text
  }
</script>

<section class="panel resources" aria-label="Resources">
  <dl>
    {#each visible as resource (resource.id)}
      <dt>{resource.name}</dt>
      <dd>
        {formatNumber(game.state.resources[resource.id])}
        <span class="rate" class:negative={game.rates[resource.id] < -1e-9}>
          {signed(game.rates[resource.id])}/s
        </span>
      </dd>
    {/each}
  </dl>
  <p class="label">
    Day {Math.floor(game.state.playTime / 86400) + 1} · {formatDuration(game.state.playTime)}
  </p>
</section>

<style>
  .resources {
    position: sticky;
    top: 0;
    z-index: 1;
  }

  .rate {
    display: inline-block;
    min-width: 6.5em;
    color: var(--muted);
    font-size: 0.875rem;
  }

  .negative {
    color: var(--danger);
  }

  .label {
    margin-bottom: 0;
  }
</style>
