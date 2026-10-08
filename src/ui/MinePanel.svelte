<script lang="ts">
  import { clickPower } from '../core/actions'
  import { formatNumber } from './format'
  import { game } from './game.svelte'
</script>

<button class="mine" onclick={() => game.mine()}>
  Mine ore <span>+{formatNumber(clickPower(game.state))}</span>
</button>

<style>
  .mine {
    width: 100%;
    min-height: 3.5rem;
    font-size: 1.125rem;
    border-color: var(--accent);
    color: var(--accent);
  }

  .mine:active {
    background: var(--border);
  }

  span {
    color: var(--muted);
  }
</style>
