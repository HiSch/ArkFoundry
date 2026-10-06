<script lang="ts">
  import { UPGRADES } from '../content/upgrades'
  import { canAfford } from '../core/amounts'
  import { game } from './game.svelte'
  import { formatAmounts } from './names'

  const available = $derived(
    UPGRADES.filter(
      (u) => game.state.unlockedUpgrades.includes(u.id) && !game.state.upgrades.includes(u.id),
    ),
  )
  const purchased = $derived(UPGRADES.filter((u) => game.state.upgrades.includes(u.id)))
</script>

{#if available.length || purchased.length}
  <section class="panel">
    <h2>Upgrades</h2>
    {#each available as def (def.id)}
      <article>
        <h3>{def.name}</h3>
        <p class="description">{def.description}</p>
        <div class="row">
          <button
            class="buy"
            disabled={!canAfford(game.state, def.cost)}
            onclick={() => game.buyUpgrade(def.id)}
          >
            Buy <span class="cost">{formatAmounts(def.cost)}</span>
          </button>
        </div>
      </article>
    {:else}
      <p class="description">No upgrades available right now.</p>
    {/each}
    {#if purchased.length}
      <details>
        <summary>Purchased ({purchased.length})</summary>
        <ul>
          {#each purchased as def (def.id)}
            <li>{def.name} – {def.description}</li>
          {/each}
        </ul>
      </details>
    {/if}
  </section>
{/if}

<style>
  article {
    border-top: 1px solid var(--border);
    margin-top: 0.75rem;
    padding-top: 0.75rem;
  }

  h3 {
    margin: 0;
    font-size: 1rem;
  }

  .description {
    margin: 0.25rem 0 0;
    color: var(--muted);
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

  details {
    margin-top: 0.75rem;
    color: var(--muted);
    font-size: 0.875rem;
  }

  summary {
    cursor: pointer;
  }

  ul {
    margin: 0.5rem 0 0;
    padding-left: 1.25rem;
  }
</style>
