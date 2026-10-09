<script lang="ts">
  // A Voronoi section divider: server-rendered SVG (so it shows without JS) that becomes a button
  // once hydrated, regenerating with a new random seed on click.
  //
  // A Voronoi diagram splits the plane into one cell per dot ("site"): each cell is every point
  // closer to its dot than to any other. Hovering shows that rule directly: the site nearest the
  // pointer is found, and its cell (which, by definition, is the cell under the pointer) is tinted,
  // its dot enlarged, and a dashed line drawn from the pointer to it. Distances are measured in the
  // diagram's own coordinates, since the SVG is stretched to fit and screen distances would not match
  // the cells as drawn.
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
    // At least 28 units apart (the average spacing is about 57), so no two dots nearly coincide.
    const sites = randomSites(count, W, H, rand, 28);
    const cells = voronoiCells(sites, W, H).map((cell, i) => ({
      d: `M${cell.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' L')} Z`,
      site: sites[i],
    }));
    return cells;
  });

  // Pointer position in diagram coordinates while hovering, or null.
  let pointer = $state<{ x: number; y: number } | null>(null);
  const nearest = $derived.by(() => {
    if (!pointer) return -1;
    let best = -1;
    let bestDistance = Infinity;
    diagram.forEach((cell, i) => {
      const distance = (cell.site.x - pointer!.x) ** 2 + (cell.site.y - pointer!.y) ** 2;
      if (distance < bestDistance) {
        bestDistance = distance;
        best = i;
      }
    });
    return best;
  });

  function track(event: PointerEvent) {
    const svg = (event.currentTarget as HTMLElement).querySelector('svg');
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    pointer = { x: ((event.clientX - rect.left) / rect.width) * W, y: ((event.clientY - rect.top) / rect.height) * H };
  }

  onMount(() => (mounted = true));
</script>

{#snippet art()}
  <svg class="voronoi__svg" viewBox="0 0 {W} {H}" preserveAspectRatio="none" aria-hidden="true">
    {#key seed}
      <g class="voronoi__cells" class:voronoi__cells--fresh={mounted}>
        {#each diagram as cell, i (i)}
          <path d={cell.d} class:voronoi__fill={i === nearest}></path>
        {/each}
        {#if pointer && nearest >= 0}
          <line class="voronoi__ray" x1={pointer.x} y1={pointer.y} x2={diagram[nearest].site.x} y2={diagram[nearest].site.y}></line>
        {/if}
        {#each diagram as cell, i (i)}
          <circle cx={cell.site.x} cy={cell.site.y} r={i === nearest ? 3.2 : 1.6} class:voronoi__site--nearest={i === nearest}></circle>
        {/each}
      </g>
    {/key}
  </svg>
{/snippet}

{#if mounted}
  <button
    type="button"
    class="voronoi"
    onclick={() => (seed = Math.floor(Math.random() * 1e9))}
    onpointermove={track}
    onpointerleave={() => (pointer = null)}
  >
    {@render art()}
    <span class="voronoi__hint label">Each cell is the area nearest its dot · click to regenerate</span>
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

  .voronoi__site--nearest {
    fill: var(--color-accent);
  }

  .voronoi__ray {
    stroke: var(--color-accent);
    stroke-width: 1;
    stroke-dasharray: 3 3;
    vector-effect: non-scaling-stroke;
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
