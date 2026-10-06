<script lang="ts">
  import { MODULES } from '../content/modules'
  import { formatDuration } from '../core/format'
  import { game } from './game.svelte'

  const meta = $derived(game.state.meta)
  const complete = $derived(MODULES.every((m) => game.state.ark.modules[m.id].launched))
</script>

{#if complete && !meta.endingSeen}
  <section class="panel ending" aria-label="The end">
    <h2>Exodus</h2>
    <p>
      All seven modules are joined in orbit. Ten thousand colonists sleep in the cryo deck, the
      engine burns, and the Ark leaves the dying sun behind.
    </p>
    <p>Humanity has a future because of you, Commander.</p>
    <dl>
      <dt>Total play time</dt>
      <dd>{formatDuration(meta.pastPlayTime + game.state.playTime)}</dd>
      <dt>Launches</dt>
      <dd>{meta.launches}</dd>
      <dt>Star Charts earned</dt>
      <dd>{meta.starChartsEarned}</dd>
      <dt>Achievements</dt>
      <dd>{meta.achievements.length}</dd>
      <dt>Events collected</dt>
      <dd>{meta.eventsCollected}</dd>
    </dl>
    <p class="detail">You can keep playing. A journey to new star systems is planned.</p>
    <div class="row">
      <button class="buy" onclick={() => game.dismissEnding()}>Continue</button>
    </div>
  </section>
{/if}

<style>
  .ending {
    border-color: var(--accent);
  }

  h2 {
    font-size: 1.25rem;
  }

  p {
    margin: 0.5rem 0 0;
  }

  .detail {
    color: var(--muted);
    font-size: 0.875rem;
  }

  .buy {
    flex: 1;
  }
</style>
