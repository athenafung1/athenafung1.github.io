<script lang="ts">
  // The butterfly effect: two double pendulums released from angles that differ by a tiny Δθ.
  // They move together at first, then diverge completely. Maths in src/lib/pendulum.ts.
  import { onMount, tick, type Snippet } from 'svelte';
  import { rk4 } from '../lib/ode.ts';
  import { bobs, doublePendulum } from '../lib/pendulum.ts';
  import { createLoop, fitCanvas, prefersReducedMotion, watchTheme, withAlpha, type Loop, type ThemeColors } from './canvas-kit.ts';

  let { children }: { children?: Snippet } = $props();

  const DT = 1 / 600;
  const TRAIL = 260;
  const DELTAS = [
    { value: 1e-3, label: '0.001 rad' },
    { value: 1e-6, label: '0.000001 rad' },
  ];
  const f = doublePendulum();

  let mounted = $state(false);
  let root: HTMLDivElement | undefined = $state();
  let canvas: HTMLCanvasElement | undefined = $state();
  let playing = $state(false);
  let delta = $state(DELTAS[0].value);
  let readout = $state('');

  let start = [2.1, 0, 2.6, 0];
  let a: number[] = [];
  let b: number[] = [];
  let trails: Array<Array<{ x: number; y: number }>> = [[], []];
  let time = 0;
  let accumulator = 0;
  let ctx: CanvasRenderingContext2D | null = null;
  let cssWidth = 640;
  let cssHeight = 400;
  let dpr = 1;
  let colors: ThemeColors | null = null;
  let loop: Loop | null = null;
  let lastReadout = 0;

  function reset(newStart = start) {
    start = newStart;
    a = [...start];
    b = [start[0] + delta, start[1], start[2], start[3]];
    trails = [[], []];
    time = 0;
    accumulator = 0;
    updateReadout(true);
    draw();
  }

  function separation() {
    const pa = bobs(a);
    const pb = bobs(b);
    return Math.hypot(pa.x2 - pb.x2, pa.y2 - pb.y2);
  }

  function updateReadout(force = false) {
    const now = performance.now();
    if (!force && now - lastReadout < 250) return;
    lastReadout = now;
    readout = `t = ${time.toFixed(1)} s · lower bobs ${separation().toFixed(3)} m apart`;
  }

  function advance(seconds: number) {
    accumulator += seconds;
    while (accumulator >= DT) {
      a = rk4(f, a, DT);
      b = rk4(f, b, DT);
      accumulator -= DT;
      time += DT;
    }
    [a, b].forEach((state, i) => {
      const p = bobs(state);
      trails[i].push({ x: p.x2, y: p.y2 });
      if (trails[i].length > TRAIL) trails[i].shift();
    });
    updateReadout();
  }

  function draw() {
    if (!ctx || !colors) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, cssWidth, cssHeight);
    const s = Math.min(cssWidth, cssHeight) * 0.23;
    const ox = cssWidth / 2;
    const oy = cssHeight * 0.48;
    const palette = [colors.accent, colors.text];
    trails.forEach((trail, i) => {
      if (trail.length < 2) return;
      ctx!.strokeStyle = withAlpha(palette[i], 0.45);
      ctx!.lineWidth = 1.4;
      ctx!.beginPath();
      trail.forEach((p, j) => (j === 0 ? ctx!.moveTo(ox + p.x * s, oy + p.y * s) : ctx!.lineTo(ox + p.x * s, oy + p.y * s)));
      ctx!.stroke();
    });
    [a, b].forEach((state, i) => {
      const p = bobs(state);
      ctx!.strokeStyle = palette[i];
      ctx!.fillStyle = palette[i];
      ctx!.lineWidth = 2;
      ctx!.beginPath();
      ctx!.moveTo(ox, oy);
      ctx!.lineTo(ox + p.x1 * s, oy + p.y1 * s);
      ctx!.lineTo(ox + p.x2 * s, oy + p.y2 * s);
      ctx!.stroke();
      for (const [x, y] of [
        [p.x1, p.y1],
        [p.x2, p.y2],
      ]) {
        ctx!.beginPath();
        ctx!.arc(ox + x * s, oy + y * s, 6, 0, Math.PI * 2);
        ctx!.fill();
      }
    });
    ctx.fillStyle = colors.muted;
    ctx.beginPath();
    ctx.arc(ox, oy, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  function setPlaying(next: boolean) {
    playing = next;
    loop?.setPlaying(next);
  }

  function chooseDelta(value: number) {
    delta = value;
    reset();
  }

  onMount(() => {
    mounted = true;
    const cleanups: Array<() => void> = [];
    tick().then(() => {
      if (!canvas || !root) return;
      ctx = canvas.getContext('2d');
      cleanups.push(watchTheme(root, (c) => ((colors = c), draw())));
      cleanups.push(fitCanvas(canvas, (w, h, ratio) => ((cssWidth = w), (cssHeight = h), (dpr = ratio), draw())));
      loop = createLoop(root, (ms) => {
        advance(ms / 1000);
        draw();
      });
      cleanups.push(() => loop?.destroy());
      reset();
      setPlaying(!prefersReducedMotion());
    });
    return () => cleanups.forEach((fn) => fn());
  });
</script>

<div class="piece-body" bind:this={root}>
  {#if !mounted}
    {@render children?.()}
  {:else}
    <canvas bind:this={canvas} class="piece-canvas pendulum__canvas" role="img" aria-label="Two double pendulums released from almost the same angle, drifting apart."></canvas>
    <p class="piece-status">{readout}</p>
    <div class="controls">
      <div class="controls__group" role="group" aria-label="Starting difference">
        {#each DELTAS as d (d.value)}
          <button type="button" class="chip" aria-pressed={delta === d.value} onclick={() => chooseDelta(d.value)}>Δθ = {d.label}</button>
        {/each}
      </div>
      <div class="controls__group" role="group" aria-label="Playback">
        <button type="button" class="button button--primary pendulum__play" onclick={() => setPlaying(!playing)}>{playing ? 'Pause' : 'Play'}</button>
        <button type="button" class="button button--secondary" onclick={() => reset()}>Restart</button>
        <button
          type="button"
          class="button button--secondary"
          onclick={() => reset([1.6 + Math.random() * 1.4, 0, 1.6 + Math.random() * 1.4, 0])}>New start</button
        >
      </div>
    </div>
  {/if}
</div>

<style>
  .pendulum__canvas {
    aspect-ratio: 8 / 5;
  }

  .pendulum__play {
    min-width: 6.5em;
  }
</style>
