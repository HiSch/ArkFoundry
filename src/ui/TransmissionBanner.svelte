<script lang="ts">
  import { STORY } from '../content/story'
  import { unreadMessages } from '../core/story'
  import { game } from './game.svelte'

  const unread = $derived(unreadMessages(game.state))
  /** Unread messages, oldest first. */
  const messages = $derived(
    game.state.meta.storyLog
      .slice(game.state.meta.storyRead)
      .map((id) => STORY.find((s) => s.id === id)!),
  )
</script>

{#if unread > 0}
  <section class="panel transmission" aria-live="polite">
    <h2>📡 Incoming transmission{unread > 1 ? `s (${unread})` : ''}</h2>
    {#each messages as message (message.id)}
      <article>
        <h3>{message.title}</h3>
        <p class="from">{message.from}</p>
        <p class="text">{message.text}</p>
      </article>
    {/each}
    <div class="row">
      <button onclick={() => game.readMessages()}>Acknowledge</button>
    </div>
  </section>
{/if}

<style>
  .transmission {
    border-color: var(--accent);
  }

  article {
    margin-top: 0.5rem;
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
