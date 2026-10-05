<script lang="ts">
  import { formatDuration, formatNumber } from '../core/format'
  import { game } from './game.svelte'
</script>

<section class="panel">
  <h2>Resources</h2>
  <dl>
    <dt>Ore</dt>
    <dd>{formatNumber(game.state.resources.ore)}</dd>
    <dt>Play time</dt>
    <dd>{formatDuration(game.state.playTime)}</dd>
  </dl>
</section>
