<script lang="ts">
  import { STORY } from '../content/story'
  import { game } from './game.svelte'

  /** All received messages, newest first. */
  const messages = $derived(
    [...game.state.meta.storyLog].reverse().map((id) => STORY.find((s) => s.id === id)!),
  )
</script>

<details class="panel">
  <summary>Radio log ({messages.length})</summary>
  {#each messages as message (message.id)}
    <article>
      <h3>{message.title}</h3>
      <p class="from">{message.from}</p>
      <p class="text">{message.text}</p>
    </article>
  {:else}
    <p class="from">No transmissions yet.</p>
  {/each}
</details>

<style>
  summary {
    cursor: pointer;
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

  .from {
    margin: 0;
    color: var(--muted);
    font-size: 0.8125rem;
  }

  .text {
    margin: 0.25rem 0 0;
    font-style: italic;
  }
</style>
