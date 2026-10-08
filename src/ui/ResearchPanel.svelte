<script lang="ts">
  import { getResearch, RESEARCH } from '../content/research'
  import { canAfford } from '../core/amounts'
  import { formatDuration } from '../core/format'
  import {
    availableResearch,
    maxQueueLength,
    projectTimeRemaining,
    queueTimeRemaining,
    researchDiscovered,
    researchCompletions,
    researchCost,
    researchDuration,
    researchSpeed,
    researchTimeFactor,
  } from '../core/research'
  import { game } from './game.svelte'
  import { formatAmounts } from './names'

  const BAR_WIDTH = 20

  const discovered = $derived(researchDiscovered(game.state))
  const queue = $derived(game.state.research.queue)
  const available = $derived(availableResearch(game.state))
  const completed = $derived(RESEARCH.filter((r) => game.state.research.completed.includes(r.id)))
  const queueLimit = $derived(maxQueueLength(game.state))
  const queueFull = $derived(queue.length >= queueLimit)

  /** Text progress bar, e.g. "[#######-------------] 35 %". */
  function bar(share: number): string {
    const filled = Math.round(share * BAR_WIDTH)
    return `[${'#'.repeat(filled)}${'-'.repeat(BAR_WIDTH - filled)}] ${Math.floor(share * 100)} %`
  }
</script>

{#if discovered}
  <section class="panel">
    <h2>Research</h2>
    <p class="label">Projects run in real time, also while you are away.</p>

    {#if queue.length}
      <h3>Queue ({queue.length}/{queueLimit})</h3>
      {#each queue as entry, index (entry.id)}
        {@const def = getResearch(entry.id)}
        <article>
          <h4>{def.name}</h4>
          {#if index === 0}
            <p class="progress">
              {bar(entry.progress / researchDuration(game.state, entry.id))}
            </p>
            <p class="detail">{formatDuration(projectTimeRemaining(game.state, entry.id))} left</p>
          {:else}
            <p class="detail">
              Waiting · takes {formatDuration(projectTimeRemaining(game.state, entry.id))}
            </p>
          {/if}
          <div class="row">
            <button onclick={() => game.cancelResearch(entry.id)}>Cancel (refund)</button>
          </div>
        </article>
      {/each}
      <p class="detail">All done in {formatDuration(queueTimeRemaining(game.state))}</p>
    {/if}

    <h3>Available</h3>
    {#each available as def (def.id)}
      {@const cost = researchCost(game.state, def.id)}
      <article>
        <h4>{def.name}</h4>
        <p class="detail">{def.description}</p>
        <p class="detail">
          Takes {formatDuration(researchDuration(game.state, def.id) / researchSpeed(game.state))}
          {#if researchCompletions(game.state, def.id) > 0}
            {@const times = researchCompletions(game.state, def.id)}
            <span class="known">
              · researched {times}× before ({Math.round(
                researchTimeFactor(game.state, def.id) * 1000,
              ) / 10} % time)
            </span>
          {/if}
        </p>
        <div class="row">
          <button
            class="buy"
            disabled={queueFull || !canAfford(game.state, cost)}
            onclick={() => game.startResearch(def.id)}
          >
            {queueFull ? 'Queue full' : 'Research'}
            <span class="cost">{formatAmounts(cost)}</span>
          </button>
        </div>
      </article>
    {:else}
      <p class="detail">No projects available right now.</p>
    {/each}

    {#if completed.length}
      <details>
        <summary>Completed ({completed.length})</summary>
        <ul>
          {#each completed as def (def.id)}
            <li>{def.name} – {def.description}</li>
          {/each}
        </ul>
      </details>
    {/if}
  </section>
{/if}

<style>
  h3 {
    margin: 0.75rem 0 0;
    font-size: 0.875rem;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  article {
    border-top: 1px solid var(--border);
    margin-top: 0.75rem;
    padding-top: 0.75rem;
  }

  h4 {
    margin: 0;
    font-size: 1rem;
  }

  .detail {
    margin: 0.25rem 0 0;
    color: var(--muted);
    font-size: 0.875rem;
  }

  .known {
    color: var(--accent);
  }

  .progress {
    margin: 0.25rem 0 0;
    color: var(--accent);
    font-size: 0.8125rem;
    white-space: pre;
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
