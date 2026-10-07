<script lang="ts">
  // A Voronoi section divider: server-rendered SVG (so it shows without JS) that becomes a button
  // once hydrated, regenerating with a new random seed on click.
  import { onMount } from 'svelte';
  import { mulberry32 } from '../lib/random.ts';
  import { randomSites, voronoiCells } from '../lib/voronoi.ts';

  let { seed: initialSeed = 7, sites: count = 44 }: { seed?: number; sites?: number } = $props();

  const W = 1200;
  const H = 120;

  let mounted = $state(false);
  let seed = $state(initialSeed);

  const diagram = $derived.by(() => {
    const rand = mulberry32(seed);
    const sites = randomSites(count, W, H, rand);
    const cells = voronoiCells(sites, W, H).map((cell, i) => ({
      d: `M${cell.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' L')} Z`,
      filled: rand() < 0.16,
      site: sites[i],
    }));
    return cells;
  });

  onMount(() => (mounted = true));
</script>

{#snippet art()}
  <svg class="voronoi__svg" viewBox="0 0 {W} {H}" preserveAspectRatio="none" aria-hidden="true">
    {#key seed}
      <g class="voronoi__cells" class:voronoi__cells--fresh={mounted}>
        {#each diagram as cell, i (i)}
          <path d={cell.d} class:voronoi__fill={cell.filled}></path>
        {/each}
        {#each diagram as cell, i (i)}
          <circle cx={cell.site.x} cy={cell.site.y} r="1.6"></circle>
        {/each}
      </g>
    {/key}
  </svg>
{/snippet}

{#if mounted}
  <button type="button" class="voronoi" onclick={() => (seed = Math.floor(Math.random() * 1e9))}>
    {@render art()}
    <span class="voronoi__hint label">Voronoi diagram · click to regenerate</span>
  </button>
{:else}
  <div class="voronoi" role="img" aria-label="A Voronoi diagram used as a decorative divider">
    {@render art()}
  </div>
{/if}

<style>
  .voronoi {
    position: relative;
    display: block;
    width: 100%;
    padding: 0;
    border: 0;
    background: none;
    color: inherit;
    font: inherit;
    text-align: start;
    cursor: pointer;
  }

  .voronoi__svg {
    display: block;
    width: 100%;
    height: clamp(5rem, 10vw, 7.5rem);
    /* Fade the edges so the bounding box doesn't read as a frame. */
    -webkit-mask-image: radial-gradient(ellipse 52% 60% at 50% 50%, black 60%, transparent 100%);
    mask-image: radial-gradient(ellipse 52% 60% at 50% 50%, black 60%, transparent 100%);
  }

  path {
    fill: none;
    stroke: var(--color-border);
    stroke-width: 1;
    vector-effect: non-scaling-stroke;
    transition: fill var(--dur) var(--ease);
  }

  .voronoi__fill {
    fill: var(--color-accent);
    fill-opacity: 0.22;
  }

  circle {
    fill: var(--color-muted);
  }

  .voronoi__cells--fresh {
    animation: voronoi-in var(--dur-slow) var(--ease) both;
  }

  @keyframes voronoi-in {
    from {
      opacity: 0;
    }
  }

  .voronoi__hint {
    position: absolute;
    inset-inline-end: var(--space-2xs);
    inset-block-end: var(--space-3xs);
    padding: 0 var(--space-3xs);
    background: var(--color-bg);
    opacity: 0;
    transition: opacity var(--dur) var(--ease);
  }

  .voronoi:hover .voronoi__hint,
  .voronoi:focus-visible .voronoi__hint {
    opacity: 1;
  }
</style>
