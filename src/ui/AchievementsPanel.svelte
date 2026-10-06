<script lang="ts">
  import { ACHIEVEMENTS } from '../content/achievements'
  import { ACHIEVEMENT_BONUS } from '../core/production'
  import { game } from './game.svelte'

  const unlocked = $derived(game.state.meta.achievements)
</script>

<details class="panel">
  <summary>Achievements ({unlocked.length}/{ACHIEVEMENTS.length})</summary>
  <p class="detail">
    Each achievement speeds up all buildings by {ACHIEVEMENT_BONUS * 100} % (now +{Math.round(
      unlocked.length * ACHIEVEMENT_BONUS * 100,
    )} %).
  </p>
  <ul>
    {#each ACHIEVEMENTS as def (def.id)}
      {@const done = unlocked.includes(def.id)}
      <li class:done>
        <span class="mark">{done ? '[x]' : '[ ]'}</span>
        <strong>{def.name}</strong> – {def.description}
      </li>
    {/each}
  </ul>
</details>

<style>
  summary {
    cursor: pointer;
    color: var(--accent);
  }

  .detail {
    margin: 0.5rem 0 0;
    color: var(--muted);
    font-size: 0.875rem;
  }

  ul {
    margin: 0.5rem 0 0;
    padding: 0;
    list-style: none;
    font-size: 0.875rem;
  }

  li {
    margin-top: 0.375rem;
    color: var(--muted);
  }

  li.done {
    color: var(--text);
  }

  .mark {
    color: var(--accent);
  }
</style>
