<script lang="ts">
  // "Grow a bone": SIMP topology optimisation (maths and concept in src/lib/topopt.ts). Material is
  // moved, iteration by iteration, to where the load path needs it, converging on strut patterns
  // much like trabecular bone (Wolff's law: bone remodels along the lines of stress it carries).
  //
  // How it works: the solver runs in a Web Worker (topopt.worker.ts); this component only sends
  // setup/run/pause/step messages and draws each design it gets back, shading every element from
  // paper (empty) to ink (solid), with supports and load arrows on top. Clicking moves the load and
  // restarts. It pauses itself while scrolled out of view.
  import { onMount, tick, type Snippet } from 'svelte';
  import { TOPO_PRESETS, node } from '../lib/topopt.ts';
  import { fitCanvas, prefersReducedMotion, rgb, watchTheme, withAlpha, type ThemeColors } from './canvas-kit.ts';
  import type { SetupMessage, StateMessage } from './topopt.worker.ts';

  let { children }: { children?: Snippet } = $props();

  const NELX = 60;
  const NELY = 20;

  let mounted = $state(false);
  let root: HTMLDivElement | undefined = $state();
  let canvas: HTMLCanvasElement | undefined = $state();
  let presetId = $state(TOPO_PRESETS[0].id);
  let volume = $state(40);
  let running = $state(false);
  let status = $state('');
  let customLoad = $state<{ ix: number; iy: number } | null>(null);

  const preset = $derived(TOPO_PRESETS.find((p) => p.id === presetId) ?? TOPO_PRESETS[0]);

  let worker: Worker | null = null;
  let density = new Float64Array(NELX * NELY);
  let ctx: CanvasRenderingContext2D | null = null;
  let cssWidth = 600;
  let cssHeight = 200;
  let dpr = 1;
  let colors: ThemeColors | null = null;

  function setup(autorun = running) {
    if (!worker) return;
    // Plain values only: Svelte state proxies can't be structured-cloned into a worker.
    const load = customLoad ? { ix: customLoad.ix, iy: customLoad.iy } : undefined;
    const message: SetupMessage = { type: 'setup', presetId, nelx: NELX, nely: NELY, volfrac: volume / 100, load };
    worker.postMessage(message);
    running = false;
    if (autorun) run();
  }

  function run() {
    worker?.postMessage({ type: 'run' });
    running = true;
  }

  function pause() {
    worker?.postMessage({ type: 'pause' });
    running = false;
  }

  function choosePreset(id: string) {
    presetId = id;
    customLoad = null;
    setup(!prefersReducedMotion());
  }

  function draw() {
    if (!ctx || !colors) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, cssWidth, cssHeight);
    const pad = 14;
    const cell = Math.min((cssWidth - 2 * pad) / NELX, (cssHeight - 2 * pad) / NELY);
    const ox = (cssWidth - cell * NELX) / 2;
    const oy = (cssHeight - cell * NELY) / 2;
    const [br, bg, bb] = rgb(colors.bg);
    const [tr, tg, tb] = rgb(colors.text);
    for (let ex = 0; ex < NELX; ex++) {
      for (let ey = 0; ey < NELY; ey++) {
        const v = density[ex * NELY + ey];
        if (v < 0.02) continue;
        ctx.fillStyle = `rgb(${br + (tr - br) * v}, ${bg + (tg - bg) * v}, ${bb + (tb - bb) * v})`;
        ctx.fillRect(ox + ex * cell, oy + ey * cell, cell + 0.5, cell + 0.5);
      }
    }
    ctx.strokeStyle = withAlpha(colors.muted, 0.6);
    ctx.lineWidth = 1;
    ctx.strokeRect(ox, oy, cell * NELX, cell * NELY);

    // Supports: hatch marks along fixed edges / pins at fixed corners.
    ctx.fillStyle = colors.muted;
    const nodeXY = (ix: number, iy: number) => [ox + ix * cell, oy + iy * cell];
    const pins: Array<[number, number]> =
      presetId === 'cantilever'
        ? Array.from({ length: NELY + 1 }, (_, iy) => [0, iy])
        : presetId === 'bridge'
          ? [
              [0, NELY],
              [NELX, NELY],
            ]
          : [
              ...Array.from({ length: NELY + 1 }, (_, iy) => [0, iy] as [number, number]),
              [NELX, NELY],
            ];
    for (const [ix, iy] of pins) {
      const [x, y] = nodeXY(ix, iy);
      ctx.beginPath();
      if (presetId === 'cantilever' || (presetId === 'mbb' && ix === 0)) ctx.rect(x - 5, y - 1, 4, 2);
      else {
        ctx.moveTo(x, y);
        ctx.lineTo(x - 6, y + 9);
        ctx.lineTo(x + 6, y + 9);
        ctx.closePath();
      }
      ctx.fill();
    }

    // Loads: downward arrows.
    ctx.strokeStyle = colors.accent;
    ctx.fillStyle = colors.accent;
    ctx.lineWidth = 2;
    const loads: Array<[number, number]> = customLoad
      ? [[customLoad.ix, customLoad.iy]]
      : presetId === 'cantilever'
        ? [[NELX, Math.floor(NELY / 2)]]
        : presetId === 'bridge'
          ? Array.from({ length: 7 }, (_, i) => [Math.round((i * NELX) / 6), 0] as [number, number])
          : [[0, 0]];
    for (const [ix, iy] of loads) {
      const [x, y] = nodeXY(ix, iy);
      const len = presetId === 'bridge' && !customLoad ? 12 : 22;
      ctx.beginPath();
      ctx.moveTo(x, y - len);
      ctx.lineTo(x, y - 3);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - 4, y - 7);
      ctx.lineTo(x + 4, y - 7);
      ctx.closePath();
      ctx.fill();
    }
  }

  function onClick(event: MouseEvent) {
    const rect = canvas!.getBoundingClientRect();
    const pad = 14;
    const cell = Math.min((rect.width - 2 * pad) / NELX, (rect.height - 2 * pad) / NELY);
    const ox = (rect.width - cell * NELX) / 2;
    const oy = (rect.height - cell * NELY) / 2;
    const ix = Math.round((event.clientX - rect.left - ox) / cell);
    const iy = Math.round((event.clientY - rect.top - oy) / cell);
    if (ix < 0 || ix > NELX || iy < 0 || iy > NELY) return;
    // Loading a fully fixed edge would do nothing.
    if ((presetId === 'cantilever' || presetId === 'mbb') && ix === 0) return;
    customLoad = { ix, iy };
    setup(true);
  }

  onMount(() => {
    mounted = true;
    const cleanups: Array<() => void> = [];
    tick().then(() => {
      if (!canvas || !root) return;
      ctx = canvas.getContext('2d');
      worker = new Worker(new URL('./topopt.worker.ts', import.meta.url), { type: 'module' });
      worker.onmessage = (event: MessageEvent<StateMessage>) => {
        const m = event.data;
        density = m.x;
        if (m.done) running = false;
        status =
          m.iteration === 0
            ? `Uniform grey block, ${volume}% material. Press Grow to optimise.`
            : `Iteration ${m.iteration} · compliance ${m.compliance.toFixed(1)} · largest change ${m.change.toFixed(3)}${m.done ? ' · converged' : ''}`;
        draw();
      };
      cleanups.push(() => worker?.terminate());
      cleanups.push(watchTheme(root, (c) => ((colors = c), draw())));
      cleanups.push(fitCanvas(canvas, (w, h, ratio) => ((cssWidth = w), (cssHeight = h), (dpr = ratio), draw())));
      setup(false);
      if (!prefersReducedMotion()) run();
      // Don't burn CPU while scrolled away; resume on return only if we paused it ourselves
      // (a pause the visitor pressed stays paused).
      let autoPaused = false;
      const visibility = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting) {
          if (running) {
            pause();
            autoPaused = true;
          }
        } else if (autoPaused) {
          autoPaused = false;
          run();
        }
      });
      visibility.observe(root);
      cleanups.push(() => visibility.disconnect());
    });
    return () => cleanups.forEach((fn) => fn());
  });
</script>

<div class="piece-body" bind:this={root}>
  {#if !mounted}
    {@render children?.()}
  {:else}
    <canvas
      bind:this={canvas}
      class="piece-canvas topo__canvas"
      role="img"
      aria-label="A block of material being optimised into a bone-like truss for the load shown. Click to move the load."
      onclick={onClick}
    ></canvas>
    <p class="piece-status" aria-live="polite">{status}</p>
    <p class="piece-status">{customLoad ? 'Custom point load. Pick a preset to reset.' : preset.note} Click inside the block to move the load.</p>
    <div class="controls">
      <div class="controls__group" role="group" aria-label="Load case">
        {#each TOPO_PRESETS as p (p.id)}
          <button type="button" class="chip" aria-pressed={presetId === p.id && !customLoad} onclick={() => choosePreset(p.id)}>{p.label}</button>
        {/each}
      </div>
      <label class="range">
        <span class="label">Material</span>
        <input type="range" min="20" max="60" step="5" bind:value={volume} onchange={() => setup(true)} />
        <output>{volume}%</output>
      </label>
      <div class="controls__group" role="group" aria-label="Optimiser">
        <button type="button" class="button button--primary topo__play" onclick={() => (running ? pause() : run())}>{running ? 'Pause' : 'Grow'}</button>
        <button type="button" class="button button--secondary" onclick={() => (pause(), worker?.postMessage({ type: 'step' }))}>Step</button>
        <button type="button" class="button button--secondary" onclick={() => setup(false)}>Reset</button>
      </div>
    </div>
  {/if}
</div>

<style>
  .topo__canvas {
    aspect-ratio: 3 / 1.15;
    cursor: crosshair;
  }

  .topo__play {
    min-width: 6.5em;
  }
</style>
