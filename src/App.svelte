<script lang="ts">
  import { onMount } from 'svelte'
  import DebugPanel from './ui/DebugPanel.svelte'
  import ResourcePanel from './ui/ResourcePanel.svelte'
  import SavePanel from './ui/SavePanel.svelte'
  import { game } from './ui/game.svelte'

  onMount(() => {
    game.start()
    return () => game.stop()
  })
</script>

<header>
  <h1>Ark Foundry</h1>
  <p class="tagline">Build the Ark. Save humanity.</p>
</header>

<main>
  <ResourcePanel />
  <SavePanel />
  <DebugPanel />
</main>
