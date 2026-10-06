<script lang="ts">
  import { onMount } from 'svelte'
  import AchievementsPanel from './ui/AchievementsPanel.svelte'
  import ArkPanel from './ui/ArkPanel.svelte'
  import BuildingsPanel from './ui/BuildingsPanel.svelte'
  import DebugPanel from './ui/DebugPanel.svelte'
  import EndingPanel from './ui/EndingPanel.svelte'
  import EventBanner from './ui/EventBanner.svelte'
  import IntroPanel from './ui/IntroPanel.svelte'
  import MinePanel from './ui/MinePanel.svelte'
  import NoticePanel from './ui/NoticePanel.svelte'
  import OfflineReport from './ui/OfflineReport.svelte'
  import PrestigePanel from './ui/PrestigePanel.svelte'
  import RadioLog from './ui/RadioLog.svelte'
  import ResearchPanel from './ui/ResearchPanel.svelte'
  import ResourcePanel from './ui/ResourcePanel.svelte'
  import SavePanel from './ui/SavePanel.svelte'
  import TabBar from './ui/TabBar.svelte'
  import TransmissionBanner from './ui/TransmissionBanner.svelte'
  import UpgradesPanel from './ui/UpgradesPanel.svelte'
  import { game } from './ui/game.svelte'
  import { preferences } from './ui/preferences.svelte'
  import { visibleTabs } from './ui/tabs'

  // Fall back to the colony tab if the stored tab is not available (e.g. after a launch).
  const tab = $derived(
    visibleTabs(game.state).some((t) => t.id === preferences.tab) ? preferences.tab : 'colony',
  )

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
  <IntroPanel />
  <EndingPanel />
  <NoticePanel />
  <OfflineReport />
  <EventBanner />
  <TransmissionBanner />
  {#if tab === 'colony'}
    <MinePanel />
    <BuildingsPanel />
  {:else if tab === 'research'}
    <ResearchPanel />
  {:else if tab === 'upgrades'}
    <UpgradesPanel />
  {:else if tab === 'ark'}
    <ArkPanel />
    <PrestigePanel />
  {:else}
    <RadioLog />
    <AchievementsPanel />
    <SavePanel />
    <DebugPanel />
  {/if}
</main>

<TabBar />
