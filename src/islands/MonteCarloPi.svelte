<script lang="ts">
  // Estimate π by throwing random darts at a square: the share landing inside the quarter circle
  // tends to π/4. Maths in src/lib/montecarlo.ts.
  import { onMount, tick, type Snippet } from 'svelte';
  import { estimatePi, sample, standardError } from '../lib/montecarlo.ts';
  import { createLoop, fitCanvas, prefersReducedMotion, watchTheme, withAlpha, type Loop, type ThemeColors } from './canvas-kit.ts';

  let { children }: { children?: Snippet } = $props();

  const MAX = 40000;
  const PER_SECOND = 2400;

  let mounted = $state(false);
  let root: HTMLDivElement | undefined = $state();
  let canvas: HTMLCanvasElement | undefined = $state();
  let playing = $state(false);
  let total = $state(0);
  let inside = $state(0);

  const estimate = $derived(estimatePi(inside, total));

  let ctx: CanvasRenderingContext2D | null = null;
  let size = 300;
  let dpr = 1;
  let colors: ThemeColors | null = null;
  let loop: Loop | null = null;
  let pending = 0;

  function clear() {
    if (!ctx || !colors) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, size, size);
    ctx.strokeStyle = colors.text;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, size, size, -Math.PI / 2, 0);
    ctx.stroke();
  }

  function reset() {
    total = 0;
    inside = 0;
    clear();
  }

  function throwDarts(n: number) {
    if (!ctx || !colors) return;
    let hits = 0;
    for (let i = 0; i < n && total + i < MAX; i++) {
      const s = sample(Math.random);
      if (s.inside) hits++;
      ctx.fillStyle = s.inside ? withAlpha(colors.accent, 0.7) : withAlpha(colors.muted, 0.5);
      ctx.fillRect(s.x * size - 0.75, size - s.y * size - 0.75, 1.5, 1.5);
    }
    const thrown = Math.min(n, MAX - total);
    total += thrown;
    inside += hits;
    if (total >= MAX) setPlaying(false);
  }

  function setPlaying(next: boolean) {
    playing = next;
    loop?.setPlaying(next);
  }

  onMount(() => {
    mounted = true;
    const cleanups: Array<() => void> = [];
    tick().then(() => {
      if (!canvas || !root) return;
      ctx = canvas.getContext('2d');
      cleanups.push(watchTheme(root, (c) => ((colors = c), reset())));
      cleanups.push(fitCanvas(canvas, (w, _h, ratio) => ((size = w), (dpr = ratio), reset())));
      loop = createLoop(root, (ms) => {
        pending += (PER_SECOND * ms) / 1000;
        const n = Math.floor(pending);
        pending -= n;
        throwDarts(n);
      });
      cleanups.push(() => loop?.destroy());
      if (prefersReducedMotion()) throwDarts(4000);
      setPlaying(!prefersReducedMotion());
    });
    return () => cleanups.forEach((fn) => fn());
  });
</script>

<div class="piece-body" bind:this={root}>
  {#if !mounted}
    {@render children?.()}
  {:else}
    <div class="mc">
      <canvas bind:this={canvas} class="piece-canvas mc__canvas" role="img" aria-label="Random points in a square; those inside the quarter circle are highlighted."></canvas>
      <dl class="mc__stats">
        <div><dt class="label">Darts</dt><dd>{total.toLocaleString()}</dd></div>
        <div><dt class="label">Inside</dt><dd>{inside.toLocaleString()}</dd></div>
        <div><dt class="label mc__formula">π ≈ 4 × inside ÷ darts</dt><dd class="mc__pi">{total ? estimate.toFixed(5) : '—'}</dd></div>
        <div><dt class="label">Error</dt><dd>{total ? Math.abs(estimate - Math.PI).toFixed(5) : '—'} <span class="mc__se">(typical ±{total ? standardError(total).toFixed(4) : '—'})</span></dd></div>
      </dl>
    </div>
    <div class="controls">
      <div class="controls__group" role="group" aria-label="Playback">
        <button type="button" class="button button--primary mc__play" onclick={() => setPlaying(!playing)} disabled={total >= MAX}>{playing ? 'Pause' : 'Throw'}</button>
        <button type="button" class="button button--secondary" onclick={() => (reset(), setPlaying(true))}>Restart</button>
      </div>
    </div>
  {/if}
</div>

<style>
  .mc {
    display: grid;
    gap: var(--space-m);
    align-items: center;
  }

  .mc__canvas {
    aspect-ratio: 1;
    max-width: 20rem;
  }

  .mc__stats {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-s);
    margin: 0;
    font-variant-numeric: tabular-nums;
  }

  .mc__stats dd {
    margin: 0;
    font-size: var(--step-1);
    font-weight: 600;
  }

  .mc__pi {
    font-family: var(--font-display);
    font-size: var(--step-3) !important;
    color: var(--color-accent);
  }

  /* Small caps would turn π into Π (the product sign): keep this label in normal case. */
  .mc__formula {
    font-variant-caps: normal;
    letter-spacing: 0.02em;
  }

  .mc__se {
    font-size: var(--step--1);
    font-weight: 400;
    color: var(--color-muted);
  }

  .mc__play {
    min-width: 6.5em;
  }

  @media (min-width: 40rem) {
    .mc {
      grid-template-columns: minmax(0, 20rem) minmax(0, 1fr);
    }
  }
</style>
