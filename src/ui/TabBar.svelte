<script lang="ts">
  import { game } from './game.svelte'
  import { preferences } from './preferences.svelte'
  import { tabNeedsAttention, visibleTabs } from './tabs'

  const tabs = $derived(visibleTabs(game.state))
</script>

<nav class="tabbar" aria-label="Sections">
  {#each tabs as tab (tab.id)}
    {@const attention = tabNeedsAttention(game.state, tab.id)}
    <button
      class="tab"
      aria-current={preferences.tab === tab.id ? 'page' : undefined}
      onclick={() => preferences.setTab(tab.id)}
    >
      <span class="icon" aria-hidden="true">{tab.icon}</span>
      <span class="label">{tab.label}</span>
      {#if attention}<span class="dot" aria-label="(action available)"></span>{/if}
    </button>
  {/each}
</nav>

<style>
  .tabbar {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 2;
    display: flex;
    justify-content: center;
    background: var(--panel);
    border-top: 1px solid var(--border);
    padding-bottom: env(safe-area-inset-bottom);
  }

  .tab {
    position: relative;
    flex: 1;
    max-width: 8rem;
    min-height: 3.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.125rem;
    padding: 0.25rem;
    border: none;
    border-radius: 0;
    color: var(--muted);
    font-size: 0.75rem;
  }

  .tab[aria-current='page'] {
    color: var(--accent);
    box-shadow: inset 0 2px 0 var(--accent);
  }

  .icon {
    font-size: 1.25rem;
    line-height: 1;
  }

  .label {
    white-space: nowrap;
  }

  .dot {
    position: absolute;
    top: 0.5rem;
    right: calc(50% - 1.25rem);
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    background: var(--warning);
  }
</style>
