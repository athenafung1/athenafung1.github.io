<script lang="ts">
  // N-body gravity: a few masses orbiting each other. Click/tap to add a mass in orbit; drag to
  // throw one. Physics (leapfrog, softened gravity) lives in src/lib/nbody.ts.
  import { onMount, tick, type Snippet } from 'svelte';
  import { NBODY_PRESETS, centerOfMass, energy, orbitalVelocityAround, step, type Body } from '../lib/nbody.ts';
  import { createLoop, fitCanvas, prefersReducedMotion, watchTheme, withAlpha, type Loop, type ThemeColors } from './canvas-kit.ts';

  let { children }: { children?: Snippet } = $props();

  const VIEW_WIDTH = 4.8; // world units across the canvas
  const DT = 1 / 500;
  const SIM_SPEED = 0.9; // world time per real second
  const SOFTENING = 0.04;
  const MAX_BODIES = 16;
  const TRAIL = 320;
  const ESCAPE_RADIUS = 14;

  let mounted = $state(false);
  let root: HTMLDivElement | undefined = $state();
  let canvas: HTMLCanvasElement | undefined = $state();
  let playing = $state(false);
  let presetId = $state(NBODY_PRESETS[0].id);
  let stats = $state('');
  let announcement = $state('');

  type Tracked = Body & { added: boolean; trail: Array<{ x: number; y: number }> };
  let bodies: Tracked[] = [];
  let baseline = 0;
  let ctx: CanvasRenderingContext2D | null = null;
  let cssWidth = 640;
  let cssHeight = 400;
  let dpr = 1;
  let colors: ThemeColors | null = null;
  let loop: Loop | null = null;
  let accumulator = 0;
  let drag: { start: { x: number; y: number }; now: { x: number; y: number } } | null = null;
  let lastStats = 0;

  const scale = () => cssWidth / VIEW_WIDTH;

  function load(id: string) {
    const preset = NBODY_PRESETS.find((p) => p.id === id) ?? NBODY_PRESETS[0];
    presetId = preset.id;
    bodies = preset.bodies.map((b) => ({ ...b, added: false, trail: [] }));
    rebaseline();
    announcement = `${preset.label}: ${bodies.length} bodies.`;
    draw();
  }

  function rebaseline() {
    baseline = energy(bodies, { softening: SOFTENING });
    updateStats(true);
  }

  function updateStats(force = false) {
    const now = performance.now();
    if (!force && now - lastStats < 400) return;
    lastStats = now;
    const drift = baseline === 0 ? 0 : Math.abs((energy(bodies, { softening: SOFTENING }) - baseline) / baseline) * 100;
    stats = `${bodies.length} ${bodies.length === 1 ? 'body' : 'bodies'} · energy drift ${drift < 0.001 ? '<0.001' : drift.toFixed(3)}%`;
  }

  function toWorld(event: PointerEvent) {
    const rect = canvas!.getBoundingClientRect();
    const c = centerOfMass(bodies);
    return { x: c.x + (event.clientX - rect.left - rect.width / 2) / scale(), y: c.y + (event.clientY - rect.top - rect.height / 2) / scale() };
  }

  function addBody(x: number, y: number, velocity?: { vx: number; vy: number }) {
    const v = velocity ?? orbitalVelocityAround(bodies, x, y);
    bodies.push({ x, y, ...v, mass: 0.25, added: true, trail: [] });
    if (bodies.length > MAX_BODIES) {
      // Drop the oldest added mass (or the oldest body if none were added).
      const oldest = bodies.findIndex((b) => b.added);
      bodies.splice(oldest === -1 ? 0 : oldest, 1);
    }
    rebaseline();
    announcement = `Added a mass. ${bodies.length} bodies.`;
    draw();
  }

  function addRandom() {
    const c = centerOfMass(bodies);
    const angle = Math.random() * Math.PI * 2;
    const r = 1.3 + Math.random() * 0.7;
    addBody(c.x + r * Math.cos(angle), c.y + r * Math.sin(angle));
  }

  function advance(seconds: number) {
    accumulator += seconds * SIM_SPEED;
    while (accumulator >= DT) {
      const next = step(bodies, DT, { softening: SOFTENING });
      bodies = bodies.map((b, i) => ({ ...b, ...next[i] }));
      accumulator -= DT;
    }
    const c = centerOfMass(bodies);
    const before = bodies.length;
    bodies = bodies.filter((b) => Math.hypot(b.x - c.x, b.y - c.y) < ESCAPE_RADIUS);
    if (bodies.length < before) {
      rebaseline();
      announcement = `A mass escaped. ${bodies.length} bodies.`;
    }
    for (const b of bodies) {
      b.trail.push({ x: b.x, y: b.y });
      if (b.trail.length > TRAIL) b.trail.shift();
    }
    updateStats();
  }

  function setPlaying(next: boolean) {
    playing = next;
    loop?.setPlaying(next);
  }

  function draw() {
    if (!ctx || !colors) return;
    const s = scale();
    const c = centerOfMass(bodies);
    const toScreen = (p: { x: number; y: number }) => ({ x: (p.x - c.x) * s + cssWidth / 2, y: (p.y - c.y) * s + cssHeight / 2 });
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, cssWidth, cssHeight);
    ctx.lineWidth = 1.6;
    ctx.lineJoin = 'round';
    for (const b of bodies) {
      if (b.trail.length < 2) continue;
      ctx.strokeStyle = withAlpha(b.added ? colors.muted : colors.accent, 0.55);
      ctx.beginPath();
      b.trail.forEach((p, i) => {
        const q = toScreen(p);
        if (i === 0) ctx!.moveTo(q.x, q.y);
        else ctx!.lineTo(q.x, q.y);
      });
      ctx.stroke();
    }
    for (const b of bodies) {
      const q = toScreen(b);
      ctx.fillStyle = b.added ? colors.text : colors.accent;
      ctx.beginPath();
      ctx.arc(q.x, q.y, 3 + 6 * Math.cbrt(b.mass), 0, Math.PI * 2);
      ctx.fill();
    }
    if (drag) {
      const a = toScreen(drag.start);
      const b = toScreen(drag.now);
      ctx.strokeStyle = colors.text;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  function onPointerDown(event: PointerEvent) {
    if (event.button !== 0) return;
    event.preventDefault();
    canvas!.setPointerCapture(event.pointerId);
    const p = toWorld(event);
    drag = { start: p, now: p };
  }

  function onPointerMove(event: PointerEvent) {
    if (!drag) return;
    drag.now = toWorld(event);
    if (!playing) draw();
  }

  function onPointerUp() {
    if (!drag) return;
    const { start, now } = drag;
    drag = null;
    const dx = now.x - start.x;
    const dy = now.y - start.y;
    // A tap places a mass in orbit; a drag throws it in the drag direction.
    if (Math.hypot(dx, dy) * scale() < 6) addBody(start.x, start.y);
    else addBody(start.x, start.y, { vx: dx * 1.5, vy: dy * 1.5 });
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
      load(NBODY_PRESETS[0].id);
      // Show some history even when starting paused (reduced motion).
      for (let i = 0; i < 90; i++) advance(1 / 60);
      draw();
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
      class="piece-canvas nbody__canvas"
      role="img"
      aria-label="Masses orbiting under gravity. Click or tap to add a mass in orbit, or drag to throw one."
      onpointerdown={onPointerDown}
      onpointermove={onPointerMove}
      onpointerup={onPointerUp}
      onpointercancel={() => (drag = null)}
    ></canvas>
    <p class="piece-status">{stats} · tap to add a mass, drag to throw one</p>
    <div class="controls">
      <div class="controls__group" role="group" aria-label="Starting setup">
        {#each NBODY_PRESETS as preset (preset.id)}
          <button type="button" class="chip" aria-pressed={presetId === preset.id} onclick={() => load(preset.id)}>{preset.label}</button>
        {/each}
      </div>
      <div class="controls__group" role="group" aria-label="Playback">
        <button type="button" class="button button--primary nbody__play" onclick={() => setPlaying(!playing)}>{playing ? 'Pause' : 'Play'}</button>
        <button type="button" class="button button--secondary" onclick={addRandom}>Add a mass</button>
        <button type="button" class="button button--secondary" onclick={() => load(presetId)}>Reset</button>
      </div>
    </div>
    <p class="visually-hidden" aria-live="polite">{announcement}</p>
  {/if}
</div>

<style>
  .nbody__canvas {
    aspect-ratio: 8 / 5;
    cursor: crosshair;
    touch-action: none;
  }

  .nbody__play {
    min-width: 6.5em;
  }
</style>
