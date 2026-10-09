<script lang="ts">
  // Optimiser race (maths and concept in src/lib/optimizers.ts): gradient descent, momentum and
  // Adam descend the same loss surface from the same start. Click to choose the start.
  //
  // How it works: the surface is drawn once per landscape, theme and size into an offscreen canvas:
  // log-scaled shading plus contour lines traced by marching squares (for each grid cell and level,
  // find where the level crosses the cell's edges and join the crossings). Each frame copies that
  // image and draws the three trails on top, advancing two optimiser steps per frame up to 1,500.
  // The optimisers differ in line style and marker shape as well as colour. A runner that leaves
  // the map is marked as diverged. The learning-rate slider multiplies every optimiser's default
  // rate by 2^k, so you can push them into instability.
  import { onMount, tick, type Snippet } from 'svelte';
  import { LANDSCAPES, OPTIMIZERS, initState, optimizerStep, type OptState, type OptimizerId, type P } from '../lib/optimizers.ts';
  import { createLoop, fitCanvas, prefersReducedMotion, rgb, watchTheme, withAlpha, type Loop, type ThemeColors } from './canvas-kit.ts';

  let { children }: { children?: Snippet } = $props();

  const STEPS_PER_FRAME = 2;
  const MAX_STEPS = 1500;
  const STYLE: Record<OptimizerId, { dash: number[]; marker: 'circle' | 'square' | 'triangle' }> = {
    sgd: { dash: [], marker: 'circle' },
    momentum: { dash: [7, 4], marker: 'square' },
    adam: { dash: [2, 3], marker: 'triangle' },
  };

  let mounted = $state(false);
  let root: HTMLDivElement | undefined = $state();
  let canvas: HTMLCanvasElement | undefined = $state();
  let landscapeId = $state(LANDSCAPES[0].id);
  let lrPower = $state(0); // learning-rate multiplier = 2^lrPower
  let playing = $state(false);
  let readout = $state('');

  const landscape = $derived(LANDSCAPES.find((l) => l.id === landscapeId) ?? LANDSCAPES[0]);

  type Runner = { id: OptimizerId; state: OptState; trail: P[]; diverged: boolean };
  let runners: Runner[] = [];
  let start: P = [...LANDSCAPES[0].start] as P;
  let steps = 0;
  let ctx: CanvasRenderingContext2D | null = null;
  let cssWidth = 640;
  let cssHeight = 400;
  let dpr = 1;
  let colors: ThemeColors | null = null;
  let loop: Loop | null = null;
  let heat: HTMLCanvasElement | null = null;
  let view = { x0: 0, x1: 1, y0: 0, y1: 1 };
  let sized = false; // skip work until the canvas has its real size

  /** Expand the landscape's bounds to the canvas aspect ratio so the axes share one scale. */
  function fitView() {
    const [xmin, xmax, ymin, ymax] = landscape.bounds;
    const cx = (xmin + xmax) / 2;
    const cy = (ymin + ymax) / 2;
    let w = xmax - xmin;
    let h = ymax - ymin;
    const aspect = cssWidth / cssHeight;
    if (w / h < aspect) w = h * aspect;
    else h = w / aspect;
    view = { x0: cx - w / 2, x1: cx + w / 2, y0: cy - h / 2, y1: cy + h / 2 };
  }

  const toScreen = ([x, y]: P) => [((x - view.x0) / (view.x1 - view.x0)) * cssWidth, ((view.y1 - y) / (view.y1 - view.y0)) * cssHeight];
  const toWorld = (sx: number, sy: number): P => [view.x0 + (sx / cssWidth) * (view.x1 - view.x0), view.y1 - (sy / cssHeight) * (view.y1 - view.y0)];

  /**
   * Loss surface (log scale): smooth shading plus contour lines traced by marching squares.
   * Rendered once per landscape/theme/size into an offscreen canvas at device resolution.
   */
  function renderHeat() {
    if (!colors) return;
    const STEP = 4; // sample spacing in CSS px
    const LEVELS = 16;
    const gw = Math.ceil(cssWidth / STEP) + 1;
    const gh = Math.ceil(cssHeight / STEP) + 1;
    const values = new Float64Array(gw * gh);
    let min = Infinity;
    let max = -Infinity;
    for (let j = 0; j < gh; j++) {
      for (let i = 0; i < gw; i++) {
        const v = Math.log1p(landscape.f(toWorld(i * STEP, j * STEP)));
        values[j * gw + i] = v;
        min = Math.min(min, v);
        max = Math.max(max, v);
      }
    }
    // Shading: one pixel per sample, scaled up smoothly so each pixel centre lands on its sample.
    const shade = document.createElement('canvas');
    shade.width = gw;
    shade.height = gh;
    const sctx = shade.getContext('2d')!;
    const img = sctx.createImageData(gw, gh);
    const bg = rgb(colors.bg);
    const rule = rgb(colors.rule);
    for (let k = 0; k < values.length; k++) {
      const mix = ((values[k] - min) / (max - min)) * 0.8;
      for (let c = 0; c < 3; c++) img.data[k * 4 + c] = bg[c] + (rule[c] - bg[c]) * mix;
      img.data[k * 4 + 3] = 255;
    }
    sctx.putImageData(img, 0, 0);
    heat = document.createElement('canvas');
    heat.width = Math.round(cssWidth * dpr);
    heat.height = Math.round(cssHeight * dpr);
    const hctx = heat.getContext('2d')!;
    hctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    hctx.imageSmoothingEnabled = true;
    hctx.drawImage(shade, -STEP / 2, -STEP / 2, gw * STEP, gh * STEP);
    // Contours: for each cell and level, find where the level crosses the cell's four edges.
    hctx.strokeStyle = withAlpha(colors.muted, 0.45);
    hctx.lineWidth = 1;
    hctx.beginPath();
    const span = (max - min) / LEVELS;
    const pts = new Float64Array(8);
    let count = 0;
    let level = 0;
    const cross = (v0: number, v1: number, x0: number, y0: number, x1: number, y1: number) => {
      if (v0 < level === v1 < level) return;
      const t = (level - v0) / (v1 - v0);
      pts[count++] = (x0 + (x1 - x0) * t) * STEP;
      pts[count++] = (y0 + (y1 - y0) * t) * STEP;
    };
    for (let j = 0; j < gh - 1; j++) {
      for (let i = 0; i < gw - 1; i++) {
        const a = values[j * gw + i];
        const b = values[j * gw + i + 1];
        const c = values[(j + 1) * gw + i + 1];
        const d = values[(j + 1) * gw + i];
        // Only the levels that pass through this cell.
        const first = Math.max(1, Math.ceil((Math.min(a, b, c, d) - min) / span));
        const lastLevel = Math.min(LEVELS - 1, Math.floor((Math.max(a, b, c, d) - min) / span));
        for (let n = first; n <= lastLevel; n++) {
          level = min + span * n;
          count = 0;
          cross(a, b, i, j, i + 1, j); // top
          cross(b, c, i + 1, j, i + 1, j + 1); // right
          cross(d, c, i, j + 1, i + 1, j + 1); // bottom
          cross(a, d, i, j, i, j + 1); // left
          for (let k = 0; k + 3 < count; k += 4) {
            hctx.moveTo(pts[k], pts[k + 1]);
            hctx.lineTo(pts[k + 2], pts[k + 3]);
          }
        }
      }
    }
    hctx.stroke();
  }

  function reset(newStart: P = start) {
    start = newStart;
    steps = 0;
    runners = OPTIMIZERS.map((o) => ({ id: o.id, state: initState(start), trail: [start], diverged: false }));
    if (prefersReducedMotion()) {
      // Show the finished race instead of animating it.
      while (steps < MAX_STEPS) advance();
    }
    updateReadout();
    draw();
  }

  function advance() {
    steps++;
    const mult = 2 ** lrPower;
    for (const r of runners) {
      if (r.diverged) continue;
      const next = optimizerStep(r.id, r.state, landscape.grad(r.state.p), landscape.lr[r.id] * mult);
      if (!next.p.every(Number.isFinite) || Math.abs(next.p[0]) > 1e3 || Math.abs(next.p[1]) > 1e3) {
        r.diverged = true;
        continue;
      }
      r.state = next;
      r.trail.push(next.p);
    }
  }

  function updateReadout() {
    readout =
      `Step ${steps} · ` +
      runners
        .map((r) => {
          const label = OPTIMIZERS.find((o) => o.id === r.id)!.label;
          return r.diverged ? `${label}: diverged` : `${label}: loss ${landscape.f(r.state.p).toExponential(1)}`;
        })
        .join(' · ');
  }

  function marker(c: CanvasRenderingContext2D, kind: 'circle' | 'square' | 'triangle', x: number, y: number, r: number) {
    c.beginPath();
    if (kind === 'circle') c.arc(x, y, r, 0, Math.PI * 2);
    else if (kind === 'square') c.rect(x - r, y - r, 2 * r, 2 * r);
    else {
      c.moveTo(x, y - r * 1.2);
      c.lineTo(x + r * 1.1, y + r * 0.8);
      c.lineTo(x - r * 1.1, y + r * 0.8);
      c.closePath();
    }
    c.fill();
    c.stroke();
  }

  function draw() {
    if (!ctx || !colors) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (heat) ctx.drawImage(heat, 0, 0);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // Minima.
    ctx.strokeStyle = colors.text;
    ctx.lineWidth = 1.5;
    for (const m of landscape.minima) {
      const [x, y] = toScreen(m);
      ctx.beginPath();
      ctx.moveTo(x - 5, y - 5);
      ctx.lineTo(x + 5, y + 5);
      ctx.moveTo(x + 5, y - 5);
      ctx.lineTo(x - 5, y + 5);
      ctx.stroke();
    }
    const palette: Record<OptimizerId, string> = { sgd: colors.text, momentum: colors.accent, adam: colors.muted };
    for (const r of runners) {
      ctx.strokeStyle = withAlpha(palette[r.id], 0.9);
      ctx.lineWidth = 2;
      ctx.setLineDash(STYLE[r.id].dash);
      ctx.beginPath();
      r.trail.forEach((p, i) => {
        const [x, y] = toScreen(p);
        if (i === 0) ctx!.moveTo(x, y);
        else ctx!.lineTo(x, y);
      });
      ctx.stroke();
      ctx.setLineDash([]);
      const [x, y] = toScreen(r.state.p);
      ctx.fillStyle = palette[r.id];
      ctx.strokeStyle = colors.bg;
      ctx.lineWidth = 1.5;
      marker(ctx, STYLE[r.id].marker, x, y, 5);
    }
    const [sx, sy] = toScreen(start);
    ctx.strokeStyle = colors.text;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(sx, sy, 7, 0, Math.PI * 2);
    ctx.stroke();
  }

  function setPlaying(next: boolean) {
    playing = next;
    loop?.setPlaying(next);
  }

  function chooseLandscape(id: string) {
    landscapeId = id;
    fitView();
    renderHeat();
    reset([...(LANDSCAPES.find((l) => l.id === id) ?? LANDSCAPES[0]).start] as P);
    if (!prefersReducedMotion()) setPlaying(true);
  }

  function onClick(event: MouseEvent) {
    const rect = canvas!.getBoundingClientRect();
    reset(toWorld(event.clientX - rect.left, event.clientY - rect.top));
    if (!prefersReducedMotion()) setPlaying(true);
  }

  onMount(() => {
    mounted = true;
    const cleanups: Array<() => void> = [];
    tick().then(() => {
      if (!canvas || !root) return;
      ctx = canvas.getContext('2d');
      cleanups.push(
        watchTheme(root, (c) => {
          colors = c;
          if (!sized) return;
          renderHeat();
          draw();
        }),
      );
      cleanups.push(
        fitCanvas(canvas, (w, h, ratio) => {
          cssWidth = w;
          cssHeight = h;
          dpr = ratio;
          sized = true;
          fitView();
          renderHeat();
          draw();
        }),
      );
      loop = createLoop(root, () => {
        for (let k = 0; k < STEPS_PER_FRAME && steps < MAX_STEPS; k++) advance();
        if (steps % 6 === 0 || steps >= MAX_STEPS) updateReadout();
        draw();
        if (steps >= MAX_STEPS) setPlaying(false);
      });
      cleanups.push(() => loop?.destroy());
      reset([...landscape.start] as P);
      setPlaying(!prefersReducedMotion());
    });
    return () => cleanups.forEach((fn) => fn());
  });
</script>

<div class="piece-body" bind:this={root}>
  {#if !mounted}
    {@render children?.()}
  {:else}
    <canvas bind:this={canvas} class="piece-canvas race__canvas" role="img" aria-label={`Contour map of the ${landscape.label} loss surface with three optimisers' paths. Click to choose a new start.`} onclick={onClick}></canvas>
    <ul class="race__legend" role="list">
      {#each OPTIMIZERS as o (o.id)}
        <li><span class="race__swatch race__swatch--{o.id}" aria-hidden="true"></span>{o.label}</li>
      {/each}
      <li><span aria-hidden="true">✕</span> minimum</li>
    </ul>
    <p class="piece-status" aria-live="polite">{readout}</p>
    <p class="piece-status">{landscape.note} Click anywhere to start from there.</p>
    <div class="controls">
      <div class="controls__group" role="group" aria-label="Loss surface">
        {#each LANDSCAPES as l (l.id)}
          <button type="button" class="chip" aria-pressed={landscapeId === l.id} onclick={() => chooseLandscape(l.id)}>{l.label}</button>
        {/each}
      </div>
      <label class="range">
        <span class="label">Learning rate</span>
        <input type="range" min="-2" max="2" step="0.5" bind:value={lrPower} onchange={() => (reset(), setPlaying(!prefersReducedMotion()))} />
        <output>×{(2 ** lrPower).toFixed(2).replace(/\.?0+$/, '')}</output>
      </label>
      <div class="controls__group" role="group" aria-label="Playback">
        <button type="button" class="button button--primary race__play" onclick={() => setPlaying(!playing)}>{playing ? 'Pause' : 'Race'}</button>
        <button type="button" class="button button--secondary" onclick={() => (reset(), setPlaying(!prefersReducedMotion()))}>Restart</button>
      </div>
    </div>
  {/if}
</div>

<style>
  .race__canvas {
    aspect-ratio: 8 / 5;
    cursor: crosshair;
  }

  .race__legend {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2xs) var(--space-m);
    margin: 0;
    padding: 0;
    list-style: none;
    font-size: var(--step--1);
  }

  .race__legend li {
    display: inline-flex;
    align-items: center;
    gap: 0.45em;
  }

  .race__swatch {
    display: inline-block;
    width: 1.6em;
    border-top: 2px solid var(--color-text);
  }

  .race__swatch--momentum {
    border-top: 2px dashed var(--color-accent);
  }

  .race__swatch--adam {
    border-top: 2px dotted var(--color-muted);
  }

  .race__play {
    min-width: 6.5em;
  }
</style>
