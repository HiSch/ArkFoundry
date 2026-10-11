<script lang="ts">
  import { ACHIEVEMENTS } from '../content/achievements'
  import { MODULES } from '../content/modules'
  import { RESOURCES } from '../content/resources'
  import { launchedModules } from '../core/ark'
  import { formatDuration } from '../core/format'
  import { formatNumber } from './format'
  import { game } from './game.svelte'
  import { runNumber, runResult } from './runs'

  /** Most recent runs shown in the history. */
  const HISTORY_LENGTH = 20

  const state = $derived(game.state)
  const meta = $derived(state.meta)
  const produced = $derived(
    RESOURCES.map((r) => ({
      id: r.id,
      name: r.name,
      amount: meta.lifetime.produced[r.id] + state.stats.produced[r.id],
    })).filter((r) => r.amount > 0),
  )
  const launchRuns = $derived(meta.runs.filter((r) => r.end !== 'abandon'))
  const fastest = $derived(
    launchRuns.length ? Math.min(...launchRuns.map((r) => r.duration)) : null,
  )
  const history = $derived(
    meta.runs
      .map((run, index) => ({ run, number: runNumber(state, index) }))
      .slice(-HISTORY_LENGTH)
      .reverse(),
  )
  const missingHistory = $derived(meta.launches + meta.abandons > meta.runs.length)
</script>

<details class="panel">
  <summary>Statistics</summary>

  <p class="label">All runs</p>
  <dl>
    <dt>Total play time</dt>
    <dd>{formatDuration(meta.pastPlayTime + state.playTime)}</dd>
    <dt>Current run</dt>
    <dd>Run {meta.launches + meta.abandons + 1} · {formatDuration(state.playTime)}</dd>
    <dt>Modules in orbit</dt>
    <dd>{launchedModules(state)}/{MODULES.length}</dd>
    <dt>Launches</dt>
    <dd>{meta.launches}</dd>
    <dt>Colonies abandoned</dt>
    <dd>{meta.abandons}</dd>
    {#if fastest !== null}
      <dt>Fastest launch run</dt>
      <dd>{formatDuration(fastest)}</dd>
    {/if}
    <dt>Star Charts earned</dt>
    <dd>{meta.starChartsEarned}</dd>
    <dt>Star Charts unspent</dt>
    <dd>{meta.starCharts}</dd>
    <dt>Achievements</dt>
    <dd>{meta.achievements.length}/{ACHIEVEMENTS.length}</dd>
    <dt>Events collected</dt>
    <dd>{meta.eventsCollected}</dd>
    <dt>Clicks</dt>
    <dd>{formatNumber(meta.lifetime.clicks + state.stats.clicks)}</dd>
  </dl>

  {#if produced.length}
    <p class="label">Produced in all runs</p>
    <dl>
      {#each produced as r (r.id)}
        <dt>{r.name}</dt>
        <dd>{formatNumber(r.amount)}</dd>
      {/each}
    </dl>
  {/if}

  {#if history.length}
    <p class="label">Run history</p>
    <table>
      <thead>
        <tr><th>#</th><th>Result</th><th>Time</th><th>SC</th></tr>
      </thead>
      <tbody>
        {#each history as { run, number } (number)}
          <tr>
            <td>{number}</td>
            <td>{runResult(run)}</td>
            <td>{formatDuration(run.duration)}</td>
            <td>{run.starCharts}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
  {#if missingHistory}
    <p class="detail">
      Runs finished before statistics were recorded are counted above but have no details. Totals
      produced and clicks only include recorded runs.
    </p>
  {/if}
</details>

<style>
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.875rem;
    font-variant-numeric: tabular-nums;
  }

  th {
    color: var(--muted);
    font-weight: normal;
    text-align: left;
  }

  th,
  td {
    padding: 0.125rem 0.25rem;
    border-bottom: 1px solid var(--border);
  }

  th:not(:nth-child(2)),
  td:not(:nth-child(2)) {
    text-align: right;
  }

  .detail {
    margin: 0.5rem 0 0;
    color: var(--muted);
    font-size: 0.8125rem;
  }
</style>
