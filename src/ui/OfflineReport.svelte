<script lang="ts">
  import { RESOURCES } from '../content/resources'
  import { formatDuration, formatNumber } from './format'
  import { game } from './game.svelte'

  const report = $derived(game.offlineReport)
  const changes = $derived(
    report ? RESOURCES.filter((r) => Math.abs(report.change[r.id]) >= 1) : [],
  )
  const losses = $derived(report ? RESOURCES.filter((r) => report.missed[r.id] >= 1) : [])

  function signed(value: number): string {
    return value > 0 ? `+${formatNumber(value)}` : `-${formatNumber(-value)}`
  }
</script>

{#if report}
  <section class="panel report" role="status" aria-label="While you were away">
    <h2>While you were away</h2>
    <p class="label">Your colony kept working for {formatDuration(report.seconds)}.</p>
    {#if changes.length}
      <dl>
        {#each changes as resource (resource.id)}
          <dt>{resource.name}</dt>
          <dd>{signed(report.change[resource.id])}</dd>
        {/each}
      </dl>
    {:else}
      <p class="label">Nothing was produced.</p>
    {/if}
    {#if losses.length}
      <p class="warning">Missed because storage was full:</p>
      <dl class="lost">
        {#each losses as resource (resource.id)}
          <dt>{resource.name}</dt>
          <dd>{formatNumber(report.missed[resource.id])}</dd>
        {/each}
      </dl>
      <p class="label">Check in more often or upgrade your storage.</p>
    {/if}
    <div class="row">
      <button onclick={() => game.dismissReport()}>Continue</button>
    </div>
  </section>
{/if}

<style>
  .report {
    border-color: var(--accent);
  }

  .warning {
    margin: 0.75rem 0 0;
    color: var(--warning);
  }

  .lost dd {
    color: var(--warning);
  }
</style>
