<script lang="ts">
  import { game } from './game.svelte'
</script>

{#if game.notice}
  <section class="panel notice" role="status">
    <p>{game.notice}</p>
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
</style>
