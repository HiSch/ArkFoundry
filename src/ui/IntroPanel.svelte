<script lang="ts">
  import { game } from './game.svelte'
</script>

{#if !game.state.meta.introSeen}
  <section class="panel intro" aria-label="Introduction">
    <h2>The last foundry</h2>
    <p>
      The sun is dying. In a few generations the home world will be frozen rock, and humanity with
      it.
    </p>
    <p>
      The last hope is the <strong>Ark</strong>: a generation ship for ten thousand colonists,
      assembled in orbit from <strong>seven modules</strong>.
    </p>
    <p>
      You command the last foundry. Start with a pick. Finish with a starship. Every module you
      launch costs you your colony – but what you learned stays, and the next run goes faster.
    </p>
    <div class="row">
      <button class="buy" onclick={() => game.dismissIntro()}>Begin</button>
    </div>
  </section>
{/if}

<style>
  .intro {
    border-color: var(--accent);
  }

  p {
    margin: 0.5rem 0 0;
  }

  strong {
    color: var(--accent);
  }

  .buy {
    flex: 1;
  }
</style>
