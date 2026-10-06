<script lang="ts">
  import { getBuilding } from '../content/buildings'
  import { PRESTIGE_UPGRADES } from '../content/prestige'
  import {
    availableAutoBuyers,
    canBuyPrestigeUpgrade,
    prestigeLevel,
    starChartBonus,
  } from '../core/prestige'
  import { formatDuration } from '../core/format'
  import { game } from './game.svelte'

  const meta = $derived(game.state.meta)
  const visible = $derived(
    meta.starChartsEarned > 0 || Object.values(game.state.ark.modules).some((m) => m.completed),
  )
  const autoBuyers = $derived(availableAutoBuyers(game.state))
</script>

{#if visible}
  <section class="panel">
    <h2>Star Charts</h2>
    <p class="summary">
      <strong>{meta.starCharts}</strong> to spend · {meta.starChartsEarned} earned in total
    </p>
    <p class="detail">
      Every Star Chart ever earned speeds up all buildings by 1 % (now +{Math.round(
        (starChartBonus(game.state) - 1) * 100,
      )} %). Spending them keeps the bonus.
    </p>
    {#if meta.launches > 0}
      <p class="detail">
        Launches: {meta.launches} · Time in earlier runs: {formatDuration(meta.pastPlayTime)}
      </p>
    {/if}

    {#each PRESTIGE_UPGRADES as def (def.id)}
      {@const level = prestigeLevel(game.state, def.id)}
      <article>
        <h3>
          {def.name}
          {#if def.maxLevel > 1}<span class="level">{level}/{def.maxLevel}</span>{/if}
        </h3>
        <p class="detail">{def.description}</p>
        <div class="row">
          {#if level >= def.maxLevel}
            <p class="owned">Owned</p>
          {:else}
            <button
              class="buy"
              disabled={!canBuyPrestigeUpgrade(game.state, def.id)}
              onclick={() => game.buyPrestigeUpgrade(def.id)}
            >
              Buy <span class="cost">{def.cost} Star Charts</span>
            </button>
          {/if}
        </div>
      </article>
    {/each}

    {#if autoBuyers.length}
      <h3 class="section">Auto-buyers</h3>
      {#each autoBuyers as id (id)}
        <div class="row auto">
          <span>{getBuilding(id).name}</span>
          <button
            aria-pressed={!!meta.autoBuy[id]}
            onclick={() => game.setAutoBuy(id, !meta.autoBuy[id])}
          >
            {meta.autoBuy[id] ? 'On' : 'Off'}
          </button>
        </div>
      {/each}
      <p class="detail">Buys one building whenever it costs at most 10 % of your stock.</p>
    {/if}
  </section>
{/if}

<style>
  .summary {
    margin: 0.5rem 0 0;
  }

  strong {
    color: var(--accent);
  }

  article {
    border-top: 1px solid var(--border);
    margin-top: 0.75rem;
    padding-top: 0.75rem;
  }

  h3 {
    margin: 0;
    font-size: 1rem;
  }

  .section {
    margin-top: 1rem;
    font-size: 0.875rem;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .level {
    color: var(--accent);
    font-size: 0.875rem;
  }

  .detail {
    margin: 0.25rem 0 0;
    color: var(--muted);
    font-size: 0.875rem;
  }

  .owned {
    margin: 0;
    color: var(--accent);
    font-size: 0.875rem;
  }

  .buy {
    flex: 1;
    text-align: left;
  }

  .cost {
    color: var(--muted);
    font-size: 0.8125rem;
  }

  .auto {
    align-items: center;
    justify-content: space-between;
  }
</style>
