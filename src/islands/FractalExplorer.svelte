<script lang="ts">
  // Mandelbrot / Julia explorer. Click or tap to zoom in 3× at that point. Renders progressively
  // (coarse pass, then full resolution in ≤ 10 ms slices) so the page never blocks.
  import { onMount, tick, type Snippet } from 'svelte';
  import { JULIA_HOME, MANDELBROT_HOME, iterationsFor, julia, mandelbrot, pixelToComplex, zoomAt, type View } from '../lib/fractal.ts';
  import { fitCanvas, rgb, watchTheme, type ThemeColors } from './canvas-kit.ts';

  let { children }: { children?: Snippet } = $props();

  let mounted = $state(false);
  let root: HTMLDivElement | undefined = $state();
  let canvas: HTMLCanvasElement | undefined = $state();
  let mode = $state<'mandelbrot' | 'julia'>('mandelbrot');
  let view = $state<View>({ ...MANDELBROT_HOME });
  let juliaC = $state({ x: -0.8, y: 0.156 });
  let rendering = $state(false);

  const zoom = $derived(Math.round((mode === 'mandelbrot' ? MANDELBROT_HOME.span : JULIA_HOME.span) / view.span));
  const fmt = (n: number, digits = 4) => (n < 0 ? '−' : '') + Math.abs(n).toFixed(digits);
  const label = $derived(
    mode === 'mandelbrot'
      ? `Centre ${fmt(view.cx)} ${view.cy < 0 ? '−' : '+'} ${Math.abs(view.cy).toFixed(4)}i · zoom ${zoom.toLocaleString()}×`
      : `Julia set for c = ${fmt(juliaC.x, 3)} ${juliaC.y < 0 ? '−' : '+'} ${Math.abs(juliaC.y).toFixed(3)}i · zoom ${zoom.toLocaleString()}×`,
  );

  let ctx: CanvasRenderingContext2D | null = null;
  let width = 0;
  let height = 0;
  let palette: Uint8ClampedArray = new Uint8ClampedArray(0);
  let inside: [number, number, number] = [0, 0, 0];
  let job = 0;

  function buildPalette(c: ThemeColors) {
    const stops = [c.bg, c.rule, c.accent, c.text].map(rgb);
    const size = 1024;
    palette = new Uint8ClampedArray(size * 3);
    for (let i = 0; i < size; i++) {
      const t = (i / (size - 1)) * (stops.length - 1);
      const k = Math.min(stops.length - 2, Math.floor(t));
      const f = t - k;
      for (let ch = 0; ch < 3; ch++) palette[i * 3 + ch] = stops[k][ch] + (stops[k + 1][ch] - stops[k][ch]) * f;
    }
    // Fill the set with whichever theme colour is darker: ink on paper in light mode, and a set
    // outlined only by its glowing boundary in dark mode.
    const lum = ([r, g, b]: [number, number, number]) => 0.2126 * r + 0.7152 * g + 0.0722 * b;
    inside = [rgb(c.text), rgb(c.bg)].sort((x, y) => lum(x) - lum(y))[0];
  }

  let logScale = false;

  function colorAt(n: number, maxIter: number, out: Uint8ClampedArray, offset: number) {
    if (n >= maxIter) {
      out[offset] = inside[0];
      out[offset + 1] = inside[1];
      out[offset + 2] = inside[2];
    } else {
      // Julia exteriors escape in very few iterations, so a log scale keeps them visible.
      const t = logScale ? Math.log1p(Math.max(0, n)) / Math.log1p(maxIter) : Math.sqrt(Math.max(0, n) / maxIter);
      const i = Math.min(1023, Math.floor(t * 1023)) * 3;
      out[offset] = palette[i];
      out[offset + 1] = palette[i + 1];
      out[offset + 2] = palette[i + 2];
    }
    out[offset + 3] = 255;
  }

  function render() {
    if (!ctx || width === 0 || palette.length === 0) return;
    const id = ++job;
    const v = { ...view };
    const isJulia = mode === 'julia';
    logScale = isJulia;
    const c = { ...juliaC };
    const maxIter = iterationsFor(v.span);
    const image = ctx.createImageData(width, height);
    const data = image.data;
    const value = (px: number, py: number) => {
      const z = pixelToComplex(px, py, width, height, v);
      return isJulia ? julia(z.x, z.y, c, maxIter) : mandelbrot(z.x, z.y, maxIter);
    };

    // Coarse pass: one sample per 6×6 block, painted as a block.
    const B = 6;
    for (let by = 0; by < height; by += B) {
      for (let bx = 0; bx < width; bx += B) {
        const n = value(bx + B / 2, by + B / 2);
        for (let y = by; y < Math.min(by + B, height); y++) {
          for (let x = bx; x < Math.min(bx + B, width); x++) colorAt(n, maxIter, data, (y * width + x) * 4);
        }
      }
    }
    ctx.putImageData(image, 0, 0);

    // Fine pass in time slices.
    rendering = true;
    let row = 0;
    const slice = () => {
      if (id !== job) return;
      const until = performance.now() + 10;
      while (row < height && performance.now() < until) {
        for (let x = 0; x < width; x++) colorAt(value(x, row), maxIter, data, (row * width + x) * 4);
        row++;
      }
      ctx!.putImageData(image, 0, 0);
      if (row < height) requestAnimationFrame(slice);
      else rendering = false;
    };
    requestAnimationFrame(slice);
  }

  function zoomBy(factor: number, x = view.cx, y = view.cy) {
    view = zoomAt(view, x, y, factor, mode === 'mandelbrot' ? MANDELBROT_HOME : JULIA_HOME);
    render();
  }

  function setMode(next: 'mandelbrot' | 'julia') {
    if (next === mode) return;
    // From the unzoomed view, use a classic dendrite; otherwise the point you zoomed into.
    const atHome = view.cx === MANDELBROT_HOME.cx && view.cy === MANDELBROT_HOME.cy && view.span === MANDELBROT_HOME.span;
    if (next === 'julia') juliaC = atHome ? { x: -0.8, y: 0.156 } : { x: view.cx, y: view.cy };
    mode = next;
    view = { ...(next === 'mandelbrot' ? MANDELBROT_HOME : JULIA_HOME) };
    render();
  }

  function reset() {
    view = { ...(mode === 'mandelbrot' ? MANDELBROT_HOME : JULIA_HOME) };
    render();
  }

  function onClick(event: MouseEvent) {
    const rect = canvas!.getBoundingClientRect();
    const px = ((event.clientX - rect.left) / rect.width) * width;
    const py = ((event.clientY - rect.top) / rect.height) * height;
    const z = pixelToComplex(px, py, width, height, view);
    zoomBy(3, z.x, z.y);
  }

  onMount(() => {
    mounted = true;
    const cleanups: Array<() => void> = [];
    tick().then(() => {
      if (!canvas || !root) return;
      ctx = canvas.getContext('2d');
      cleanups.push(
        watchTheme(root, (c) => {
          buildPalette(c);
          render();
        }),
      );
      // Cap at 1.5× DPR: fractal cost grows with pixel count.
      cleanups.push(
        fitCanvas(
          canvas,
          () => {
            width = canvas!.width;
            height = canvas!.height;
            render();
          },
          1.5,
        ),
      );
    });
    return () => {
      job++;
      cleanups.forEach((fn) => fn());
    };
  });
</script>

<div class="piece-body" bind:this={root}>
  {#if !mounted}
    {@render children?.()}
  {:else}
    <canvas
      bind:this={canvas}
      class="piece-canvas fractal__canvas"
      role="img"
      aria-label={`${mode === 'mandelbrot' ? 'Mandelbrot set' : 'Julia set'}. Click or tap to zoom in.`}
      onclick={onClick}
    ></canvas>
    <p class="piece-status" aria-live="polite">{label}{rendering ? ' · rendering…' : ''}</p>
    <div class="controls">
      <div class="controls__group" role="group" aria-label="Fractal">
        <button type="button" class="chip" aria-pressed={mode === 'mandelbrot'} onclick={() => setMode('mandelbrot')}>Mandelbrot</button>
        <button type="button" class="chip" aria-pressed={mode === 'julia'} onclick={() => setMode('julia')}>Julia from centre</button>
      </div>
      <div class="controls__group" role="group" aria-label="Zoom">
        <button type="button" class="button button--secondary" onclick={() => zoomBy(3)}>Zoom in</button>
        <button type="button" class="button button--secondary" onclick={() => zoomBy(1 / 3)}>Zoom out</button>
        <button type="button" class="button button--secondary" onclick={reset}>Reset</button>
      </div>
    </div>
  {/if}
</div>

<style>
  .fractal__canvas {
    aspect-ratio: 8 / 5;
    cursor: zoom-in;
  }
</style>
