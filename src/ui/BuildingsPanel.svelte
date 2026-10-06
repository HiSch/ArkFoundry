<script lang="ts">
  import { BUILDINGS, type BuildingId } from '../content/buildings'
  import { purchaseQuantity, type BuyAmount } from '../core/actions'
  import { buildingCost } from '../core/costs'
  import { nextMilestone, perBuildingRates } from '../core/production'
  import type { BuildingDef } from '../core/types'
  import { game } from './game.svelte'
  import { formatAmounts, formatRates, resourceName } from './names'

  const amounts: { label: string; value: BuyAmount }[] = [
    { label: '×1', value: 1 },
    { label: '×10', value: 10 },
    { label: 'Max', value: 'max' },
  ]

  const unlocked = $derived(BUILDINGS.filter((b) => game.state.unlockedBuildings.includes(b.id)))

  function offer(def: BuildingDef): { affordable: boolean; shown: number; cost: string } {
    const owned = game.state.buildings[def.id].count
    const quantity = purchaseQuantity(game.state, def.id, game.buyAmount)
    // For "Max" with nothing affordable, show the price of a single building.
    const shown = game.buyAmount === 'max' ? Math.max(1, quantity) : game.buyAmount
    return { affordable: quantity > 0, shown, cost: formatAmounts(buildingCost(def, owned, shown)) }
  }

  /** Explains why a building runs below full speed, or null if it runs at full speed. */
  function slowdown(def: BuildingDef, id: BuildingId): string | null {
    const efficiency = game.efficiency[id]
    const limit = game.limits[id]
    if (efficiency === undefined || limit === undefined) return null
    const outputs = Object.keys(def.produces)
      .map((r) => resourceName(r as keyof typeof def.produces & string))
      .join(' / ')
    if (limit === 'overflow') {
      return `${outputs} storage is full – output is lost (the Auto-Pause prestige upgrade prevents this)`
    }
    const status = efficiency < 0.005 ? 'Paused' : `Running at ${Math.round(efficiency * 100)} %`
    if (limit === 'storage') return `${status} – ${outputs} storage is full`
    const inputs = Object.keys(def.consumes ?? {})
      .map((r) => resourceName(r as keyof typeof def.produces & string))
      .join(' / ')
    return `${status} – not enough ${inputs}`
  }
</script>

<section class="panel">
  <div class="header">
    <h2>Buildings</h2>
    <div class="row amounts" role="group" aria-label="Buy amount">
      {#each amounts as option (option.label)}
        <button
          aria-pressed={game.buyAmount === option.value}
          onclick={() => (game.buyAmount = option.value)}
        >
          {option.label}
        </button>
      {/each}
    </div>
  </div>

  {#each unlocked as def (def.id)}
    {@const building = game.state.buildings[def.id]}
    {@const rates = perBuildingRates(game.state, def.id)}
    {@const current = offer(def)}
    {@const warning = slowdown(def, def.id)}
    {@const milestone = nextMilestone(building.count)}
    <article>
      <h3>{def.name} <span class="count">×{building.count}</span></h3>
      <p class="description">{def.description}</p>
      <p class="detail">
        Each: {#if rates.consumes.length}{formatRates(rates.consumes)} →
        {/if}{formatRates(rates.produces)}
      </p>
      {#if milestone !== null}
        <p class="detail">Double output at {milestone}</p>
      {/if}
      {#if warning}<p class="warning">{warning}</p>{/if}
      <div class="row">
        <button class="buy" disabled={!current.affordable} onclick={() => game.buy(def.id)}>
          Buy ×{current.shown}
          <span class="cost">{current.cost}</span>
        </button>
        {#if def.consumes && building.count > 0}
          <button
            aria-pressed={building.enabled}
            onclick={() => game.setEnabled(def.id, !building.enabled)}
          >
            {building.enabled ? 'On' : 'Off'}
          </button>
        {/if}
      </div>
    </article>
  {/each}
</section>

<style>
  .header {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }

  .amounts {
    margin-top: 0;
  }

  .amounts button {
    min-height: 2.25rem;
    padding: 0.25rem 0.75rem;
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

  .count {
    color: var(--accent);
  }

  .description,
  .detail {
    margin: 0.25rem 0 0;
    color: var(--muted);
    font-size: 0.875rem;
  }

  .warning {
    margin: 0.25rem 0 0;
    color: var(--warning);
    font-size: 0.875rem;
  }

  .buy {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
  }

  .cost {
    font-size: 0.8125rem;
    color: var(--muted);
  }
</style>
