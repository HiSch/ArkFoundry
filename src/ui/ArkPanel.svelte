<script lang="ts">
  import { MODULES } from '../content/modules'
  import { entries } from '../core/amounts'
  import {
    canBuildModule,
    canSupplyLaunch,
    launchedModules,
    moduleProgress,
    runProgress,
  } from '../core/ark'
  import { launchReward } from '../core/prestige'
  import { formatNumber } from '../core/format'
  import { game } from './game.svelte'
  import { resourceName } from './names'

  const BAR_WIDTH = 20

  const built = $derived(launchedModules(game.state))

  function bar(share: number): string {
    const filled = Math.floor(share * BAR_WIDTH)
    // One decimal: module costs are large, so progress moves slowly.
    const percent = (Math.floor(share * 1000) / 10).toFixed(1)
    return `[${'#'.repeat(filled)}${'-'.repeat(BAR_WIDTH - filled)}] ${percent} %`
  }

  function launch(id: (typeof MODULES)[number]['id'], name: string): void {
    const reward = launchReward(game.state)
    const message =
      `Launch the ${name} into orbit?\n\nYou earn ${reward} Star Charts. ` +
      'Your colony starts over: resources, buildings, upgrades and research are reset. ' +
      'The Ark, Star Charts and prestige upgrades stay.'
    if (confirm(message)) game.launch(id)
  }

  function supply(id: (typeof MODULES)[number]['id'], name: string): void {
    const reward = launchReward(game.state)
    const message =
      `Send this run's deliveries for the ${name} into orbit?\n\nYou earn ${reward} Star Charts ` +
      'and start a new run. The deliveries stay in the dock; finish the module in a later run.'
    if (confirm(message)) game.supplyLaunch(id)
  }

  function canDeliver(cost: [string, number][], delivered: Record<string, number | undefined>) {
    return cost.some(
      ([r, need]) =>
        (delivered[r] ?? 0) < need &&
        game.state.resources[r as keyof typeof game.state.resources] > 0,
    )
  }
</script>

<section class="panel ark">
  <h2>The Ark · {built}/{MODULES.length} modules in orbit</h2>
  <p class="story">
    The sun is dying. Ten thousand colonists wait for a ship that does not exist yet. Build it.
  </p>
  <details open>
    <summary>Modules</summary>
    {#each MODULES as def (def.id)}
      {@const module = game.state.ark.modules[def.id]}
      {@const buildable = canBuildModule(game.state, def.id)}
      <article>
        <h3>
          <span class="mark">{module.launched ? '[x]' : module.completed ? '[+]' : '[ ]'}</span>
          {def.name}
        </h3>
        <p class="detail">{def.description}</p>
        {#if module.launched}
          <p class="done">In orbit.</p>
        {:else if module.completed}
          <p class="done">Complete and ready for launch.</p>
          <p class="detail">
            Launching earns {launchReward(game.state)} Star Charts and starts a new run. More alloys produced
            in this run mean more Star Charts.
          </p>
          <div class="row">
            <button class="buy launch" onclick={() => launch(def.id, def.name)}>
              Launch {def.name}
            </button>
          </div>
        {:else if buildable}
          {@const cost = entries(def.cost)}
          <p class="progress">{bar(moduleProgress(game.state, def.id))}</p>
          <ul>
            {#each cost as [resource, need] (resource)}
              <li>
                {resourceName(resource)}: {formatNumber(module.delivered[resource] ?? 0)} / {formatNumber(
                  need,
                )}
              </li>
            {/each}
          </ul>
          <div class="row">
            <button
              class="buy"
              disabled={!canDeliver(cost, module.delivered)}
              onclick={() => game.deliver(def.id)}
            >
              Deliver resources
            </button>
          </div>
          {#if def.supplyLaunchShare}
            {@const share = def.supplyLaunchShare}
            <p class="detail">
              Too big for one run: at most {Math.round(share * 100)} % can be delivered per run. Delivered
              this run: {(Math.floor(runProgress(game.state, def.id) * 1000) / 10).toFixed(1)} %. Once
              the run's share is delivered, a supply launch keeps it in orbit.
            </p>
            <div class="row">
              <button
                class="buy launch"
                disabled={!canSupplyLaunch(game.state, def.id)}
                onclick={() => supply(def.id, def.name)}
              >
                Supply launch ({launchReward(game.state)} Star Charts)
              </button>
            </div>
          {/if}
        {:else}
          <p class="detail locked">{def.lockedHint}</p>
        {/if}
      </article>
    {/each}
  </details>
</section>

<style>
  .ark {
    border-color: var(--accent);
  }

  .story {
    margin: 0.25rem 0 0.5rem;
    color: var(--muted);
    font-size: 0.875rem;
    font-style: italic;
  }

  summary {
    cursor: pointer;
    color: var(--muted);
    font-size: 0.875rem;
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

  .mark {
    color: var(--accent);
  }

  .detail {
    margin: 0.25rem 0 0;
    color: var(--muted);
    font-size: 0.875rem;
  }

  .locked {
    font-style: italic;
  }

  .done {
    margin: 0.25rem 0 0;
    color: var(--accent);
    font-size: 0.875rem;
  }

  .progress {
    margin: 0.25rem 0 0;
    color: var(--accent);
    font-size: 0.8125rem;
    white-space: pre;
  }

  ul {
    margin: 0.25rem 0 0;
    padding-left: 1.25rem;
    font-size: 0.875rem;
  }

  .buy {
    flex: 1;
  }

  .launch {
    font-weight: bold;
  }
</style>
