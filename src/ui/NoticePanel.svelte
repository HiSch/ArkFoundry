<script lang="ts">
  import { formatDuration } from '../core/format'
  import { formatNumber } from './format'
  import { game } from './game.svelte'
  import { durationChange, runNumber, runResult, signed } from './runs'

  const runs = $derived(game.state.meta.runs)
  const last = $derived(game.runSummary ? runs.at(-1) : undefined)
  const previous = $derived(runs.at(-2))
</script>

{#if game.notice}
  <section class="panel notice" role="status">
    <p>{game.notice}</p>
    {#if last}
      <h3>Run {runNumber(game.state, runs.length - 1)}: {runResult(last)}</h3>
      <dl>
        <dt>Duration</dt>
        <dd>
          {formatDuration(last.duration)}
          {#if previous}<span class="change"
              >({durationChange(last.duration, previous.duration)})</span
            >{/if}
        </dd>
        <dt>Star Charts earned</dt>
        <dd>
          {last.starCharts}
          {#if previous}<span class="change">({signed(last.starCharts - previous.starCharts)})</span
            >{/if}
        </dd>
        <dt>Alloys produced</dt>
        <dd>{formatNumber(last.produced.alloys ?? 0)}</dd>
        <dt>Buildings</dt>
        <dd>{formatNumber(last.buildings)}</dd>
        <dt>Events collected</dt>
        <dd>{last.eventsCollected}</dd>
        <dt>Clicks</dt>
        <dd>{formatNumber(last.clicks)}</dd>
      </dl>
      {#if previous}
        <p class="detail">Compared with the run before.</p>
      {/if}
    {/if}
    <div class="row">
      <button onclick={() => game.dismissNotice()}>Continue</button>
    </div>
  </section>
{/if}

<style>
  .notice {
    border-color: var(--accent);
  }

  p {
    margin: 0;
  }

  h3 {
    margin: 0.75rem 0 0;
    font-size: 1rem;
  }

  .change {
    color: var(--muted);
    font-size: 0.8125rem;
  }

  .detail {
    margin-top: 0.25rem;
    color: var(--muted);
    font-size: 0.8125rem;
  }
</style>
