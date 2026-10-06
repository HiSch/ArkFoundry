<script lang="ts">
  import { onMount } from 'svelte'
  import ArkPanel from './ui/ArkPanel.svelte'
  import BuildingsPanel from './ui/BuildingsPanel.svelte'
  import DebugPanel from './ui/DebugPanel.svelte'
  import MinePanel from './ui/MinePanel.svelte'
  import OfflineReport from './ui/OfflineReport.svelte'
  import ResearchPanel from './ui/ResearchPanel.svelte'
  import ResourcePanel from './ui/ResourcePanel.svelte'
  import SavePanel from './ui/SavePanel.svelte'
  import UpgradesPanel from './ui/UpgradesPanel.svelte'
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
  <OfflineReport />
  <ArkPanel />
  <MinePanel />
  <BuildingsPanel />
  <ResearchPanel />
  <UpgradesPanel />
  <SavePanel />
  <DebugPanel />
</main>
