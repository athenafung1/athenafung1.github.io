<script lang="ts">
  // Fourier Sketch (research R12): any closed drawing is a sum of spinning circles.
  // Contract: specs/001-portfolio-site/contracts/components.md. Math lives in src/lib/fourier.ts.
  import { onMount, tick as nextTick, type Snippet } from 'svelte';
  import { normalizeToViewBox, type Point } from '../lib/curves.ts';
  import { dft, epicycleChain, resample, sortByAmplitude, type Coefficient } from '../lib/fourier.ts';
  import { PRESETS } from '../lib/presets.ts';

  let { children }: { children?: Snippet } = $props();

  const WIDTH = 640; // logical drawing space, same 8:5 aspect as the static fallback
  const HEIGHT = 400;
  const SAMPLES = 256;
  const CYCLE_MS = 9000;

  let mounted = $state(false);
  let canvas: HTMLCanvasElement | undefined = $state();
  let root: HTMLDivElement | undefined = $state();
  let accentProbe: HTMLSpanElement | undefined = $state();
  let mutedProbe: HTMLSpanElement | undefined = $state();
  let ruleProbe: HTMLSpanElement | undefined = $state();

  let playing = $state(false);
  let terms = $state(48);
  let shape = $state({ id: PRESETS[0].id, label: PRESETS[0].label });
  let coefficients: Coefficient[] = $state.raw([]);

  const status = $derived(
    `${playing ? 'Drawing' : 'Paused:'} ${shape.id === 'custom' ? 'your shape' : shape.label} with ${terms} of ${coefficients.length} circles.`,
  );

  let target: Point[] = [];
  let trace: Point[] = [];
  let stroke: Point[] = [];
  let drawing = false;
  let t = 0;
  let last = 0;
  let raf = 0;
  let onScreen = true;
  let ctx: CanvasRenderingContext2D | null = null;
  let colors = { accent: '#b3401d', muted: '#5a554c', rule: '#ddd6ca' };

  function loadShape(points: Point[], id: string, label: string, autoplay: boolean) {
    const fitted = normalizeToViewBox(points, WIDTH, HEIGHT, 56).map((p) => ({ x: p.x - WIDTH / 2, y: p.y - HEIGHT / 2 }));
    target = resample(fitted, SAMPLES);
    coefficients = sortByAmplitude(dft(target));
    shape = { id, label };
    terms = Math.min(terms, coefficients.length);
    restart();
    setPlaying(autoplay);
  }

  function restart() {
    t = 0;
    trace = [];
    draw();
  }

  function setPlaying(next: boolean) {
    playing = next;
    cancelAnimationFrame(raf);
    if (playing && onScreen && !document.hidden) {
      last = performance.now();
      raf = requestAnimationFrame(tick);
    }
  }

  function advance(dt: number) {
    t += dt;
    if (t >= 1) {
      t -= 1;
      trace = [];
    }
    const chain = epicycleChain(coefficients, terms, t);
    if (chain.length) trace.push(chain[chain.length - 1].tip);
  }

  function tick(now: number) {
    advance(Math.min(now - last, 64) / CYCLE_MS);
    last = now;
    draw();
    raf = requestAnimationFrame(tick);
  }

  function step() {
    setPlaying(false);
    advance(1 / SAMPLES);
    draw();
  }

  function onTermsInput() {
    trace = [];
    draw();
  }

  function draw() {
    if (!ctx || !canvas) return;
    const scale = canvas.width / WIDTH;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(scale, 0, 0, scale, (WIDTH / 2) * scale, (HEIGHT / 2) * scale);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    if (drawing) {
      polyline(stroke, colors.accent, 2.4, false);
      return;
    }

    polyline(target, colors.rule, 1.5, true);

    const chain = epicycleChain(coefficients, terms, t);
    ctx.lineWidth = 0.9;
    ctx.strokeStyle = colors.muted;
    ctx.globalAlpha = 0.45;
    for (const circle of chain) {
      if (circle.radius < 0.6) continue;
      ctx.beginPath();
      ctx.arc(circle.center.x, circle.center.y, circle.radius, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 0.85;
    ctx.beginPath();
    chain.forEach((circle, i) => {
      if (i === 0) ctx!.moveTo(circle.center.x, circle.center.y);
      ctx!.lineTo(circle.tip.x, circle.tip.y);
    });
    ctx.stroke();
    ctx.globalAlpha = 1;

    polyline(trace, colors.accent, 2.4, false);
    const tip = chain.at(-1)?.tip;
    if (tip) {
      ctx.fillStyle = colors.accent;
      ctx.beginPath();
      ctx.arc(tip.x, tip.y, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function polyline(points: Point[], color: string, width: number, closed: boolean) {
    if (!ctx || points.length < 2) return;
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (const p of points.slice(1)) ctx.lineTo(p.x, p.y);
    if (closed) ctx.closePath();
    ctx.stroke();
  }

  function toLogical(event: PointerEvent): Point {
    const rect = canvas!.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * WIDTH - WIDTH / 2,
      y: ((event.clientY - rect.top) / rect.height) * HEIGHT - HEIGHT / 2,
    };
  }

  function onPointerDown(event: PointerEvent) {
    if (event.button !== 0) return;
    event.preventDefault();
    canvas!.setPointerCapture(event.pointerId);
    setPlaying(false);
    drawing = true;
    stroke = [toLogical(event)];
    draw();
  }

  function onPointerMove(event: PointerEvent) {
    if (!drawing) return;
    const point = toLogical(event);
    const previous = stroke[stroke.length - 1];
    if (Math.hypot(point.x - previous.x, point.y - previous.y) > 2) {
      stroke.push(point);
      draw();
    }
  }

  function onPointerUp() {
    if (!drawing) return;
    drawing = false;
    const length = stroke.slice(1).reduce((sum, p, i) => sum + Math.hypot(p.x - stroke[i].x, p.y - stroke[i].y), 0);
    if (stroke.length >= 8 && length > 60) loadShape(stroke, 'custom', 'Your drawing', true);
    else draw();
  }

  function readColors() {
    const color = (el?: HTMLElement) => (el ? getComputedStyle(el).color : '');
    colors = {
      accent: color(accentProbe) || colors.accent,
      muted: color(mutedProbe) || colors.muted,
      rule: color(ruleProbe) || colors.rule,
    };
    draw();
  }

  onMount(() => {
    mounted = true;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const scheme = window.matchMedia('(prefers-color-scheme: dark)');
    const cleanups: Array<() => void> = [];

    // Wait for Svelte to swap the fallback for the canvas before wiring it up.
    nextTick().then(() => {
      if (!canvas || !root) return;
      ctx = canvas.getContext('2d');

      const resize = new ResizeObserver(() => {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const rect = canvas!.getBoundingClientRect();
        canvas!.width = Math.max(1, Math.round(rect.width * dpr));
        canvas!.height = Math.max(1, Math.round(rect.height * dpr));
        draw();
      });
      resize.observe(canvas);
      cleanups.push(() => resize.disconnect());

      const visibility = new IntersectionObserver(([entry]) => {
        onScreen = entry.isIntersecting;
        setPlaying(playing);
      });
      visibility.observe(root);
      cleanups.push(() => visibility.disconnect());

      const onVisibilityChange = () => setPlaying(playing);
      document.addEventListener('visibilitychange', onVisibilityChange);
      cleanups.push(() => document.removeEventListener('visibilitychange', onVisibilityChange));

      const themeObserver = new MutationObserver(readColors);
      themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
      scheme.addEventListener('change', readColors);
      cleanups.push(() => {
        themeObserver.disconnect();
        scheme.removeEventListener('change', readColors);
      });

      readColors();
      loadShape(PRESETS[0].points, PRESETS[0].id, PRESETS[0].label, !reduceMotion.matches);
    });

    return () => {
      cancelAnimationFrame(raf);
      for (const cleanup of cleanups) cleanup();
    };
  });
</script>

<div class="sketch" bind:this={root}>
  {#if !mounted}
    {@render children?.()}
  {:else}
    <canvas
      bind:this={canvas}
      class="sketch__canvas"
      role="img"
      aria-label="Fourier epicycles redrawing the selected shape. Draw on it with a mouse or finger to try your own."
      onpointerdown={onPointerDown}
      onpointermove={onPointerMove}
      onpointerup={onPointerUp}
      onpointercancel={onPointerUp}
    ></canvas>
    <p class="sketch__hint">Draw a closed shape on the canvas, or pick a preset.</p>

    <div class="sketch__controls">
      <div class="sketch__group" role="group" aria-label="Shape">
        {#each PRESETS as preset (preset.id)}
          <button
            type="button"
            class="sketch__chip"
            aria-pressed={shape.id === preset.id}
            onclick={() => loadShape(preset.points, preset.id, preset.label, playing || shape.id === 'custom')}
          >
            {preset.label}
          </button>
        {/each}
      </div>

      <label class="sketch__terms">
        <span class="label">Circles</span>
        <input type="range" min="1" max={coefficients.length || SAMPLES} step="1" bind:value={terms} oninput={onTermsInput} />
        <output class="sketch__count">{terms}</output>
      </label>

      <div class="sketch__group" role="group" aria-label="Playback">
        <button type="button" class="button button--primary sketch__play" onclick={() => setPlaying(!playing)}>
          {playing ? 'Pause' : 'Play'}
        </button>
        <button type="button" class="button button--secondary" onclick={step}>Step</button>
        <button type="button" class="button button--secondary" onclick={restart}>Reset</button>
      </div>
    </div>

    <p class="visually-hidden" aria-live="polite">{status}</p>
    <span class="sketch__probe sketch__probe--accent" bind:this={accentProbe} aria-hidden="true"></span>
    <span class="sketch__probe sketch__probe--muted" bind:this={mutedProbe} aria-hidden="true"></span>
    <span class="sketch__probe sketch__probe--rule" bind:this={ruleProbe} aria-hidden="true"></span>
  {/if}
</div>

<style>
  .sketch {
    display: grid;
    gap: var(--space-s);
  }

  .sketch__canvas {
    display: block;
    width: 100%;
    aspect-ratio: 8 / 5;
    border-radius: var(--radius-m);
    background: var(--color-bg);
    cursor: crosshair;
    touch-action: none; /* only the drawing surface; the page still scrolls around it */
  }

  .sketch__hint {
    margin: 0;
    font-size: var(--step--1);
    color: var(--color-muted);
  }

  .sketch__controls {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-s) var(--space-l);
  }

  .sketch__group {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2xs);
  }

  .sketch__chip {
    min-width: var(--tap);
    min-height: var(--tap);
    padding: 0 1em;
    border: 1px solid var(--color-border);
    border-radius: 999px;
    background: transparent;
    color: var(--color-text);
    font-weight: 600;
    cursor: pointer;
  }

  .sketch__chip[aria-pressed='true'] {
    background: var(--color-text);
    border-color: var(--color-text);
    color: var(--color-bg);
  }

  .sketch__terms {
    display: flex;
    align-items: center;
    gap: var(--space-2xs);
    flex: 1 1 14rem;
    min-height: var(--tap);
  }

  .sketch__terms input {
    flex: 1;
    min-width: 6rem;
    height: var(--tap); /* 44px hit area; the native track stays centred */
    margin: 0;
    accent-color: var(--color-accent);
  }

  .sketch__count {
    min-width: 3ch;
    font-variant-numeric: tabular-nums;
    text-align: end;
  }

  .sketch__play {
    min-width: 6.5em;
  }

  .sketch__probe {
    display: none;
  }

  .sketch__probe--accent {
    color: var(--color-accent);
  }

  .sketch__probe--muted {
    color: var(--color-muted);
  }

  .sketch__probe--rule {
    color: var(--color-rule);
  }
</style>
