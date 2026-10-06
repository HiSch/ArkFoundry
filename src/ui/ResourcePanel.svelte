<script lang="ts">
  import { RESOURCES } from '../content/resources'
  import { formatDuration, formatNumber, formatRate } from '../core/format'
  import { capacities, storageHours } from '../core/storage'
  import { game } from './game.svelte'
  import { preferences, type ResourceView } from './preferences.svelte'

  const views: { value: ResourceView; label: string; title: string }[] = [
    { value: 'expanded', label: 'Full', title: 'Show amounts, storage and rates' },
    { value: 'mini', label: 'Mini', title: 'Show only symbols and amounts' },
    { value: 'collapsed', label: 'Hide', title: 'Collapse to a single line' },
  ]

  const visible = $derived(
    RESOURCES.filter(
      (r) =>
        r.id === 'ore' || game.state.stats.produced[r.id] > 0 || game.state.resources[r.id] > 0,
    ),
  )
  const caps = $derived(capacities(game.state))
  const view = $derived(preferences.resourceView)

  function isFull(id: (typeof RESOURCES)[number]['id']): boolean {
    return game.state.resources[id] >= caps[id] * 0.999
  }

  function signed(rate: number): string {
    const text = formatRate(rate)
    return rate > 0 ? `+${text}` : text
  }
</script>

<section class="panel resources {view}" aria-label="Resources">
  {#if view === 'collapsed'}
    <button class="expand" onclick={() => preferences.expandResources()} aria-expanded="false">
      ▸ Resources ({visible.length})
      {#if visible.some((r) => isFull(r.id))}<span class="full">FULL</span>{/if}
    </button>
  {:else}
    <div class="header">
      <span class="title">Resources</span>
      <div class="views" role="group" aria-label="Resource view">
        {#each views as option (option.value)}
          <button
            aria-pressed={view === option.value}
            title={option.title}
            onclick={() => preferences.setResourceView(option.value)}
          >
            {option.label}
          </button>
        {/each}
      </div>
    </div>

    {#if view === 'mini'}
      <ul class="chips">
        {#each visible as resource (resource.id)}
          <li class:full={isFull(resource.id)} title={resource.name}>
            <span class="icon" aria-hidden="true">{resource.icon}</span>
            <span class="sr-only">{resource.name}</span>
            {formatNumber(game.state.resources[resource.id])}
          </li>
        {/each}
      </ul>
    {:else}
      <dl>
        {#each visible as resource (resource.id)}
          {@const full = isFull(resource.id)}
          <dt>
            <span class="icon" aria-hidden="true">{resource.icon}</span>{resource.name}
          </dt>
          <dd>
            <span class:full title={full ? 'Storage full' : undefined}
              >{formatNumber(game.state.resources[resource.id])}</span
            ><span class="cap">/{formatNumber(caps[resource.id])}</span>
            <span class="rate" class:negative={game.rates[resource.id] < -1e-9}>
              {signed(game.rates[resource.id])}/s
            </span>
          </dd>
        {/each}
      </dl>
      <p class="label">
        Run {game.state.meta.launches + 1} · {formatDuration(game.state.playTime)} · Storage:
        {storageHours(game.state)} h
      </p>
    {/if}
  {/if}
</section>

<style>
  .resources {
    position: sticky;
    top: 0;
    z-index: 1;
  }

  .resources.collapsed,
  .resources.mini {
    padding: 0.375rem 0.75rem;
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }

  .title {
    color: var(--muted);
    font-size: 0.875rem;
  }

  .views {
    display: flex;
    gap: 0.25rem;
  }

  .views button {
    min-height: 2rem;
    padding: 0.125rem 0.5rem;
    font-size: 0.8125rem;
  }

  .expand {
    width: 100%;
    min-height: 2.25rem;
    padding: 0.25rem 0.25rem;
    border: none;
    text-align: left;
    color: var(--muted);
  }

  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem 0.875rem;
    margin: 0.375rem 0 0.125rem;
    padding: 0;
    list-style: none;
    font-variant-numeric: tabular-nums;
  }

  .icon {
    display: inline-block;
    width: 1.25em;
    margin-right: 0.25em;
    text-align: center;
  }

  .cap {
    color: var(--muted);
    font-size: 0.75rem;
  }

  .rate {
    display: inline-block;
    min-width: 4.5em;
    color: var(--muted);
    font-size: 0.875rem;
  }

  .negative {
    color: var(--danger);
  }

  .full {
    color: var(--warning);
  }

  dl {
    grid-template-columns: minmax(0, 1fr) auto;
  }

  dt {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  dd {
    white-space: nowrap;
  }

  .expand .full {
    margin-left: 0.25rem;
    font-size: 0.6875rem;
    color: var(--warning);
    border: 1px solid var(--warning);
    border-radius: 0.25rem;
    padding: 0 0.25rem;
  }

  .label {
    margin-bottom: 0;
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }
</style>
