<script lang="ts">
  import { getBuilding } from '../content/buildings'
  import { getModule } from '../content/modules'
  import { PRESTIGE_CATEGORIES, PRESTIGE_UPGRADES } from '../content/prestige'
  import { AUTO_DELIVER_KEEP_SHARE, autoDeliverTarget } from '../core/ark'
  import { hasEffect } from '../core/effects'
  import {
    availableAutoBuyers,
    canBuyPrestigeUpgrade,
    prestigeLevel,
    starChartBonus,
  } from '../core/prestige'
  import { formatDuration } from '../core/format'
  import { SPENT_STAR_CHART_BONUS, UNSPENT_STAR_CHART_BONUS } from '../core/production'
  import { game } from './game.svelte'

  const meta = $derived(game.state.meta)
  const visible = $derived(
    meta.starChartsEarned > 0 || Object.values(game.state.ark.modules).some((m) => m.completed),
  )
  const autoBuyers = $derived(availableAutoBuyers(game.state))
  const logistics = $derived(hasEffect(game.state, 'autoDeliver'))
  const deliveryTarget = $derived(autoDeliverTarget(game.state))
  const categories = $derived(
    PRESTIGE_CATEGORIES.map((c) => ({
      ...c,
      upgrades: PRESTIGE_UPGRADES.filter((u) => u.category === c.id),
    })).filter((c) => c.upgrades.length > 0),
  )
</script>

{#if visible}
  <details class="panel" open>
    <summary>
      <h2>Star Charts</h2>
      <span class="summary"><strong>{meta.starCharts}</strong> to spend</span>
    </summary>
    <p class="detail">{meta.starChartsEarned} earned in total.</p>
    <p class="detail">
      Each unspent Star Chart speeds up all buildings by {UNSPENT_STAR_CHART_BONUS * 100} %, each spent
      one by {SPENT_STAR_CHART_BONUS * 100} % (now +{Math.round(
        (starChartBonus(game.state) - 1) * 100,
      )} %). Spending trades some of the bonus for an upgrade.
    </p>
    {#if meta.launches > 0}
      <p class="detail">
        Launches: {meta.launches} · Time in earlier runs: {formatDuration(meta.pastPlayTime)}
      </p>
    {/if}

    {#each categories as category (category.id)}
      <h3 class="section">{category.name}</h3>
      {#each category.upgrades as def (def.id)}
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
    {/each}

    {#if autoBuyers.length || logistics}
      <h3 class="section">Automation switches</h3>
    {/if}
    {#if logistics}
      <div class="row auto">
        <span>Automated Logistics</span>
        <button
          aria-pressed={meta.autoDeliver}
          onclick={() => game.setAutoDeliver(!meta.autoDeliver)}
        >
          {meta.autoDeliver ? 'On' : 'Off'}
        </button>
      </div>
      <p class="detail">
        Delivers everything above {AUTO_DELIVER_KEEP_SHARE * 100} % of storage to {deliveryTarget
          ? getModule(deliveryTarget).name
          : 'the next module (none can be built right now)'}.
      </p>
    {/if}
    {#if autoBuyers.length}
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
  </details>
{/if}

<style>
  summary {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 0.5rem;
    cursor: pointer;
  }

  summary h2 {
    display: inline;
    margin: 0;
    font-size: 1rem;
  }

  .summary {
    color: var(--muted);
    font-size: 0.875rem;
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
