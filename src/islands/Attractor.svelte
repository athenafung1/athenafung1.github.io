<script lang="ts">
  // Strange attractors in 3-D, slowly rotating. Drag to turn them. Maths in src/lib/attractors.ts.
  import { onMount, tick, type Snippet } from 'svelte';
  import { ATTRACTORS, centre, project, trajectory, upright, type Vec3 } from '../lib/attractors.ts';
  import { createLoop, fitCanvas, prefersReducedMotion, watchTheme, withAlpha, type Loop, type ThemeColors } from './canvas-kit.ts';

  let { children }: { children?: Snippet } = $props();

  const POINTS = 9000;
  const SPIN = 0.18; // radians per second
  const REVEAL_SECONDS = 2.5;

  let mounted = $state(false);
  let root: HTMLDivElement | undefined = $state();
  let canvas: HTMLCanvasElement | undefined = $state();
  let attractorId = $state(ATTRACTORS[0].id);
  let playing = $state(false);

  const current = $derived(ATTRACTORS.find((a) => a.id === attractorId) ?? ATTRACTORS[0]);

  let points: Vec3[] = [];
  let radius = 1;
  let yaw = 0.6;
  let pitch = 0.32;
  let revealed = 0;
  let ctx: CanvasRenderingContext2D | null = null;
  let cssWidth = 640;
  let cssHeight = 400;
  let dpr = 1;
  let colors: ThemeColors | null = null;
  let loop: Loop | null = null;
  let drag: { x: number; y: number } | null = null;

  function load(id: string) {
    attractorId = id;
    const a = ATTRACTORS.find((x) => x.id === id) ?? ATTRACTORS[0];
    points = centre(upright(trajectory(a.f, a.start, a.dt, POINTS, 600), a.up));
    radius = Math.max(...points.map((p) => Math.hypot(p[0], p[1], p[2])));
    revealed = prefersReducedMotion() ? POINTS : 0;
    draw();
  }

  function draw() {
    if (!ctx || !colors || points.length === 0) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, cssWidth, cssHeight);
    const s = (Math.min(cssWidth, cssHeight) * 0.46) / radius;
    const projected = project(points.slice(0, Math.max(2, Math.floor(revealed))), yaw, pitch);
    // Draw in chunks so colour can shift from muted (oldest) to accent (newest).
    const chunks = 12;
    const size = Math.ceil(projected.length / chunks);
    ctx.lineWidth = 0.9;
    ctx.lineJoin = 'round';
    for (let c = 0; c < chunks; c++) {
      const part = projected.slice(c * size, (c + 1) * size + 1);
      if (part.length < 2) continue;
      ctx.strokeStyle = withAlpha(c < chunks / 2 ? colors.muted : colors.accent, 0.35 + (0.5 * c) / chunks);
      ctx.beginPath();
      part.forEach((p, i) => {
        const x = cssWidth / 2 + p.x * s;
        const y = cssHeight / 2 + p.y * s;
        if (i === 0) ctx!.moveTo(x, y);
        else ctx!.lineTo(x, y);
      });
      ctx.stroke();
    }
  }

  function setPlaying(next: boolean) {
    playing = next;
    loop?.setPlaying(next);
  }

  function onPointerDown(event: PointerEvent) {
    if (event.button !== 0) return;
    canvas!.setPointerCapture(event.pointerId);
    drag = { x: event.clientX, y: event.clientY };
  }

  function onPointerMove(event: PointerEvent) {
    if (!drag) return;
    yaw += (event.clientX - drag.x) * 0.01;
    pitch = Math.max(-1.4, Math.min(1.4, pitch + (event.clientY - drag.y) * 0.01));
    drag = { x: event.clientX, y: event.clientY };
    revealed = POINTS;
    draw();
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
        if (revealed < POINTS) revealed = Math.min(POINTS, revealed + (POINTS * ms) / (REVEAL_SECONDS * 1000));
        if (!drag) yaw += (SPIN * ms) / 1000;
        draw();
      });
      cleanups.push(() => loop?.destroy());
      load(ATTRACTORS[0].id);
      setPlaying(!prefersReducedMotion());
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
      class="piece-canvas attractor__canvas"
      role="img"
      aria-label={`The ${current.label} attractor, rotating in 3-D. Drag to turn it.`}
      onpointerdown={onPointerDown}
      onpointermove={onPointerMove}
      onpointerup={() => (drag = null)}
      onpointercancel={() => (drag = null)}
    ></canvas>
    <p class="piece-status">{current.label}: {current.equation} · drag to rotate</p>
    <div class="controls">
      <div class="controls__group" role="group" aria-label="Attractor">
        {#each ATTRACTORS as a (a.id)}
          <button type="button" class="chip" aria-pressed={attractorId === a.id} onclick={() => load(a.id)}>{a.label}</button>
        {/each}
      </div>
      <button type="button" class="button button--primary attractor__play" onclick={() => setPlaying(!playing)}>
        {playing ? 'Pause' : 'Rotate'}
      </button>
    </div>
  {/if}
</div>

<style>
  .attractor__canvas {
    aspect-ratio: 8 / 5;
    cursor: grab;
    touch-action: none;
  }

  .attractor__play {
    min-width: 6.5em;
  }
</style>
