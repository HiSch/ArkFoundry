<script lang="ts">
  import { MODULES } from '../content/modules'
  import { EVENT_INTERVAL, EVENT_LIFETIME } from '../core/events'
  import { MAX_OFFLINE_SECONDS } from '../core/offline'
  import { AUTO_BUY_SHARE, LAUNCH_BONUS, ALLOY_DIVISOR } from '../core/prestige'
  import {
    ACHIEVEMENT_BONUS,
    MILESTONES,
    SPENT_STAR_CHART_BONUS,
    UNSPENT_STAR_CHART_BONUS,
  } from '../core/production'
  import { KNOWN_RESEARCH_FACTOR, MAX_QUEUE_LENGTH } from '../core/research'
  import { BASE_CAPACITY, BASE_STORAGE_HOURS } from '../core/storage'
  import { formatAmounts } from './names'

  const percent = (share: number) => `${Math.round(share * 100)} %`
  const minutes = (seconds: number) => Math.round(seconds / 60)
  const days = (seconds: number) => Math.round(seconds / 86400)
</script>

<details class="panel help">
  <summary>Help</summary>

  <details>
    <summary>The goal</summary>
    <p>
      Build the Ark from {MODULES.length} modules and launch each one into orbit. Every launch restarts
      your colony, but you keep what matters (see "Launching and Star Charts"). Each run builds the next
      module, and each run goes faster than the last.
    </p>
  </details>

  <details>
    <summary>Production chains</summary>
    <ul>
      <li>Producers (drones, solar fields, …) create resources from nothing.</li>
      <li>
        Converters (refineries, smelters, …) turn inputs into outputs. If an input runs short, they
        slow down – the building list shows "Running at … % – not enough …". Converters can be
        switched off to save their inputs for something else.
      </li>
      <li>
        Each building type doubles its output at {MILESTONES.slice(0, 4).join(', ')}, … buildings
        owned.
      </li>
      <li>Buildings run in list order, so later buildings can use what earlier ones just made.</li>
      <li>A red amount in the resource bar means that stock is shrinking.</li>
    </ul>
  </details>

  <details>
    <summary>Storage and offline progress</summary>
    <ul>
      <li>
        Each resource can hold {BASE_STORAGE_HOURS} hours of its gross production (at least {BASE_CAPACITY.toLocaleString(
          'en',
        )}). Upgrades, research and prestige upgrades raise the hours.
      </li>
      <li>
        When storage is full, buildings keep running and the surplus is lost. The Auto-Pause
        prestige upgrade makes them pause instead and keep their inputs.
      </li>
      <li>
        While you are away, the colony keeps producing and research keeps running – for up to {days(
          MAX_OFFLINE_SECONDS,
        )} days. Check in before storage fills up to lose nothing.
      </li>
    </ul>
  </details>

  <details>
    <summary>Research</summary>
    <ul>
      <li>
        Labs turn energy into research points. Projects cost research points and take real time.
      </li>
      <li>
        Up to {MAX_QUEUE_LENGTH} projects can be queued; only the first one progresses. Cancelling refunds
        the full cost.
      </li>
      <li>A project appears once its prerequisites are done.</li>
      <li>
        Research completed in an earlier run takes {percent(KNOWN_RESEARCH_FACTOR)} of its time.
      </li>
    </ul>
  </details>

  <details>
    <summary>Events</summary>
    <p>
      While you play, an event appears every {minutes(EVENT_INTERVAL.min)}–{minutes(
        EVENT_INTERVAL.max,
      )} minutes. Collect it within {minutes(EVENT_LIFETIME)} minutes for a bonus. Events do not happen
      while you are away.
    </p>
  </details>

  <details>
    <summary>Ark modules and what they need</summary>
    <p>
      Deliver resources to a module in the Ark tab, in as many steps as you like. Delivered
      resources leave storage, so a module can cost more than storage holds. Every module needs the
      previous one in orbit and its own blueprint research.
    </p>
    <ul>
      {#each MODULES as def (def.id)}
        <li>
          <strong>{def.name}</strong>: {formatAmounts(def.cost)}. {def.lockedHint}
          {#if def.supplyLaunchShare}
            At most {percent(def.supplyLaunchShare)} can be delivered per run; a supply launch keeps the
            run's share in orbit.
          {/if}
        </li>
      {/each}
    </ul>
  </details>

  <details>
    <summary>Launching and Star Charts</summary>
    <ul>
      <li>
        Launching a finished module is the prestige. Reset: resources, buildings, upgrades and
        research. Kept: the Ark, Star Charts, prestige upgrades, achievements and known research.
      </li>
      <li>
        Star Charts earned = √(alloys produced this run ÷ {ALLOY_DIVISOR.toLocaleString('en')}),
        rounded down, + {LAUNCH_BONUS}. Staying longer in a run pays off, but less and less.
      </li>
      <li>
        Each unspent Star Chart speeds up all buildings by {percent(UNSPENT_STAR_CHART_BONUS)}, each
        spent one by {percent(SPENT_STAR_CHART_BONUS)}. Spending trades some of the bonus for a
        permanent upgrade.
      </li>
      <li>
        Prestige upgrades can be bought at any time. None of them is required to progress, so no
        choice can lock you out.
      </li>
      <li>
        Auto-buyers buy a building whenever it costs at most {percent(AUTO_BUY_SHARE)} of your stock.
      </li>
    </ul>
  </details>

  <details>
    <summary>Achievements</summary>
    <p>
      Each achievement permanently speeds up all buildings by {percent(ACHIEVEMENT_BONUS)}. The list
      is below.
    </p>
  </details>
</details>

<style>
  .help > summary {
    cursor: pointer;
    color: var(--accent);
  }

  details details {
    border-top: 1px solid var(--border);
    margin-top: 0.5rem;
    padding-top: 0.5rem;
  }

  details details summary {
    cursor: pointer;
    font-weight: bold;
  }

  p,
  ul {
    margin: 0.5rem 0 0;
    font-size: 0.875rem;
  }

  ul {
    padding-left: 1.25rem;
  }

  li {
    margin-top: 0.25rem;
  }
</style>
