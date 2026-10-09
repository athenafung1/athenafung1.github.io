<script lang="ts">
  // The forward half of a diffusion model (maths and concept in src/lib/diffusion.ts): data
  // dissolves into Gaussian noise as t goes 0 → T, x_t = √ᾱ_t·x₀ + √(1−ᾱ_t)·ε. Shown as pixels (the
  // hero harmonograph) or as a 2-D point cloud (the five-petal mark), the kind of toy data
  // diffusion tutorials use.
  //
  // How it works: ε is drawn once from a fixed seed, so scrubbing t back and forth shows one
  // consistent sample, just as training produces any x_t straight from x₀ and one ε. Each redraw
  // only mixes the clean data with that noise, weighted √ᾱ_t and √(1−ᾱ_t). Pixel mode rasterises
  // the curve once into a 128×80 grey image with values in [−1, 1]; point mode moves 1,400 points
  // sampled along the mark, with rings at 1σ and 2σ of the standard normal they end up in. The side
  // plot shows both weights across the whole schedule, with the current step marked.
  import { onMount, tick, type Snippet } from 'svelte';
  import { HERO_HARMONOGRAPH, harmonograph, normalizeToViewBox, rose } from '../lib/curves.ts';
  import { STEPS, cosineAlphaBars, gaussians, linearAlphaBars, noisy, snr } from '../lib/diffusion.ts';
  import { mulberry32 } from '../lib/random.ts';
  import { createLoop, fitCanvas, prefersReducedMotion, rgb, watchTheme, withAlpha, type Loop, type ThemeColors } from './canvas-kit.ts';

  let { children }: { children?: Snippet } = $props();

  const SCHEDULES = { linear: linearAlphaBars(), cosine: cosineAlphaBars() };
  const N = 1400;
  const IMG_W = 128;
  const IMG_H = 80;

  // Clean data x₀ for pixel mode: the hero harmonograph.
  const curve = normalizeToViewBox(
    harmonograph(HERO_HARMONOGRAPH, N),
    2,
    2,
    0,
  ).map((p) => ({ x: (p.x - 1) * 1.7, y: (p.y - 1) * 1.7 }));
  // Clean data x₀ for point mode: the five-petal site mark's outline, petal up, spanning about ±1.8.
  const mark = rose(5, N).map((p) => ({ x: p.y * 1.8, y: -p.x * 1.8 }));
  const rand = mulberry32(42);
  const epsPoints = gaussians(2 * N, rand);
  const epsPixels = gaussians(IMG_W * IMG_H, rand);

  let mounted = $state(false);
  let root: HTMLDivElement | undefined = $state();
  let canvas: HTMLCanvasElement | undefined = $state();
  let t = $state(0);
  let schedule = $state<'linear' | 'cosine'>('cosine');
  let mode = $state<'points' | 'pixels'>('pixels');
  let playing = $state(false);

  const alphaBar = $derived(SCHEDULES[schedule][Math.round(t)]);
  const signal = $derived(Math.sqrt(alphaBar));
  const noise = $derived(Math.sqrt(1 - alphaBar));
  const plot = $derived.by(() => {
    const ab = SCHEDULES[schedule];
    const path = (fn: (a: number) => number) =>
      Array.from({ length: 101 }, (_, i) => {
        const step = Math.round((i / 100) * STEPS);
        return `${(i * 2).toFixed(1)},${(62 - fn(ab[step]) * 56).toFixed(1)}`;
      }).join(' ');
    return { signal: path((a) => Math.sqrt(a)), noise: path((a) => Math.sqrt(1 - a)) };
  });

  let ctx: CanvasRenderingContext2D | null = null;
  let cssWidth = 640;
  let cssHeight = 400;
  let dpr = 1;
  let colors: ThemeColors | null = null;
  let loop: Loop | null = null;
  let clean: Float32Array | null = null; // x₀ for pixel mode, in [−1, 1]
  let pixelCanvas: HTMLCanvasElement | null = null;
  let direction = 1;

  /** Rasterise the curve into a grayscale image (−1 = paper, +1 = ink) for pixel mode. */
  function rasterise() {
    const off = document.createElement('canvas');
    off.width = IMG_W;
    off.height = IMG_H;
    const o = off.getContext('2d')!;
    o.fillStyle = '#000';
    o.fillRect(0, 0, IMG_W, IMG_H);
    o.strokeStyle = '#fff';
    o.lineWidth = 1.1;
    o.beginPath();
    curve.forEach((p, i) => {
      const x = IMG_W / 2 + (p.x / 4.2) * IMG_H;
      const y = IMG_H / 2 + (p.y / 4.2) * IMG_H;
      if (i === 0) o.moveTo(x, y);
      else o.lineTo(x, y);
    });
    o.stroke();
    const data = o.getImageData(0, 0, IMG_W, IMG_H).data;
    clean = Float32Array.from({ length: IMG_W * IMG_H }, (_, i) => (data[i * 4] / 255) * 2 - 1);
  }

  function draw() {
    if (!ctx || !colors) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, cssWidth, cssHeight);
    const a = alphaBar;
    if (mode === 'points') {
      const s = Math.min(cssWidth, cssHeight) / 4.6;
      const cx = cssWidth / 2;
      const cy = cssHeight / 2;
      // Reference rings: 1σ and 2σ of the standard normal that x_T converges to.
      ctx.strokeStyle = colors.rule;
      ctx.lineWidth = 1;
      for (const r of [1, 2]) {
        ctx.beginPath();
        ctx.arc(cx, cy, r * s, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.fillStyle = withAlpha(colors.accent, 0.75);
      for (let i = 0; i < N; i++) {
        const x = noisy(mark[i].x, epsPoints[2 * i], a);
        const y = noisy(mark[i].y, epsPoints[2 * i + 1], a);
        ctx.fillRect(cx + x * s - 1.25, cy + y * s - 1.25, 2.5, 2.5);
      }
    } else if (clean) {
      const img = ctx.createImageData(IMG_W, IMG_H);
      const paper = rgb(colors.bg);
      const ink = rgb(colors.accent);
      for (let i = 0; i < clean.length; i++) {
        const v = noisy(clean[i], epsPixels[i], a);
        const u = Math.max(0, Math.min(1, (v + 1) / 2));
        for (let c = 0; c < 3; c++) img.data[i * 4 + c] = paper[c] + (ink[c] - paper[c]) * u;
        img.data[i * 4 + 3] = 255;
      }
      pixelCanvas ??= Object.assign(document.createElement('canvas'), { width: IMG_W, height: IMG_H });
      const off = pixelCanvas;
      off.getContext('2d')!.putImageData(img, 0, 0);
      ctx.imageSmoothingEnabled = false;
      const scale = Math.min(cssWidth / IMG_W, cssHeight / IMG_H);
      ctx.drawImage(off, (cssWidth - IMG_W * scale) / 2, (cssHeight - IMG_H * scale) / 2, IMG_W * scale, IMG_H * scale);
    }
  }

  function setPlaying(next: boolean) {
    playing = next;
    loop?.setPlaying(next);
  }

  $effect(() => {
    // Redraw whenever t, the schedule or the mode changes.
    void t;
    void schedule;
    void mode;
    draw();
  });

  onMount(() => {
    mounted = true;
    const cleanups: Array<() => void> = [];
    tick().then(() => {
      if (!canvas || !root) return;
      ctx = canvas.getContext('2d');
      rasterise();
      cleanups.push(watchTheme(root, (c) => ((colors = c), draw())));
      cleanups.push(fitCanvas(canvas, (w, h, ratio) => ((cssWidth = w), (cssHeight = h), (dpr = ratio), draw())));
      loop = createLoop(root, (ms) => {
        t = Math.max(0, Math.min(STEPS, t + direction * ms * 0.25));
        if (t >= STEPS || t <= 0) direction = -direction;
      });
      cleanups.push(() => loop?.destroy());
      setPlaying(!prefersReducedMotion());
    });
    return () => cleanups.forEach((fn) => fn());
  });
</script>

<div class="diffusion" bind:this={root}>
  <div class="piece-body">
    {#if !mounted}
      {@render children?.()}
    {:else}
      <canvas bind:this={canvas} class="piece-canvas diffusion__canvas" role="img" aria-label={`The site's ${mode === 'pixels' ? 'curve' : 'mark'} at noise step ${Math.round(t)} of ${STEPS}: ${Math.round(signal * 100)}% signal.`}></canvas>
    {/if}
  </div>

  <div class="diffusion__side">
    <figure class="diffusion__plot">
      <svg viewBox="0 0 200 66" preserveAspectRatio="none" aria-hidden="true">
        <polyline class="diffusion__signal" points={plot.signal}></polyline>
        <polyline class="diffusion__noise" points={plot.noise}></polyline>
        <line class="diffusion__now" x1={(t / STEPS) * 200} x2={(t / STEPS) * 200} y1="0" y2="66"></line>
      </svg>
      <figcaption class="piece-status">
        <span class="diffusion__key diffusion__key--signal"></span> √ᾱ<sub>t</sub> signal
        <span class="diffusion__key diffusion__key--noise"></span> √(1−ᾱ<sub>t</sub>) noise
      </figcaption>
    </figure>
    <p class="piece-status" aria-live="off">
      t = {Math.round(t)} / {STEPS} · signal {signal.toFixed(2)} · noise {noise.toFixed(2)} · SNR {alphaBar >= 1 ? '∞' : snr(alphaBar).toPrecision(2)}
    </p>
    <p class="piece-status">x<sub>t</sub> = √ᾱ<sub>t</sub>·x₀ + √(1−ᾱ<sub>t</sub>)·ε. Only this half is exact; generating means learning to undo it.</p>
    {#if mounted}
      <label class="range">
        <span class="label">Step t</span>
        <input type="range" min="0" max={STEPS} step="1" bind:value={t} oninput={() => setPlaying(false)} />
        <output>{Math.round(t)}</output>
      </label>
      <div class="controls">
        <div class="controls__group" role="group" aria-label="Noise schedule">
          <button type="button" class="chip" aria-pressed={schedule === 'linear'} onclick={() => (schedule = 'linear')}>Linear</button>
          <button type="button" class="chip" aria-pressed={schedule === 'cosine'} onclick={() => (schedule = 'cosine')}>Cosine</button>
        </div>
        <div class="controls__group" role="group" aria-label="Data">
          <button type="button" class="chip" aria-pressed={mode === 'points'} onclick={() => (mode = 'points')}>Points</button>
          <button type="button" class="chip" aria-pressed={mode === 'pixels'} onclick={() => (mode = 'pixels')}>Pixels</button>
        </div>
        <button type="button" class="button button--primary diffusion__play" onclick={() => setPlaying(!playing)}>{playing ? 'Pause' : 'Play'}</button>
      </div>
    {/if}
  </div>
</div>

<style>
  .diffusion {
    display: grid;
    gap: var(--space-l);
    align-items: start;
  }

  .diffusion__canvas {
    aspect-ratio: 8 / 5;
  }

  .diffusion__side {
    display: grid;
    gap: var(--space-s);
    min-width: 0;
  }

  .diffusion__plot {
    margin: 0;
  }

  .diffusion__plot svg {
    display: block;
    width: 100%;
    height: 4.5rem;
    border-bottom: 1px solid var(--color-rule);
  }

  polyline {
    fill: none;
    stroke-width: 2;
    vector-effect: non-scaling-stroke;
  }

  .diffusion__signal {
    stroke: var(--color-accent);
  }

  .diffusion__noise {
    stroke: var(--color-muted);
    stroke-dasharray: 5 4;
  }

  .diffusion__now {
    stroke: var(--color-text);
    stroke-width: 1;
    vector-effect: non-scaling-stroke;
  }

  .diffusion__key {
    display: inline-block;
    width: 1.4em;
    margin-inline-start: 0.6em;
    vertical-align: middle;
    border-top: 2px solid var(--color-accent);
  }

  .diffusion__key--noise {
    border-top: 2px dashed var(--color-muted);
  }

  .diffusion__play {
    min-width: 6.5em;
  }

  @media (min-width: 52rem) {
    .diffusion {
      grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
    }
  }
</style>
