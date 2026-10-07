<script lang="ts">
  // Perlin-noise flow field: particles drift along angle = noise(x, y) and leave fading trails.
  // Click or tap for a new field.
  import { onMount, tick, type Snippet } from 'svelte';
  import { createNoise } from '../lib/noise.ts';
  import { createLoop, fitCanvas, prefersReducedMotion, watchTheme, withAlpha, type Loop, type ThemeColors } from './canvas-kit.ts';

  let { children }: { children?: Snippet } = $props();

  const NOISE_SCALE = 0.0045; // noise units per CSS pixel
  const SPEED = 60; // CSS px per second
  const DRIFT = 0.05; // how fast the field itself evolves (noise units per second)

  let mounted = $state(false);
  let root: HTMLDivElement | undefined = $state();
  let canvas: HTMLCanvasElement | undefined = $state();
  let playing = $state(false);
  let seed = $state(1);

  let noise = createNoise(1);
  let particles: Array<{ x: number; y: number; life: number }> = [];
  let ctx: CanvasRenderingContext2D | null = null;
  let cssWidth = 640;
  let cssHeight = 320;
  let dpr = 1;
  let colors: ThemeColors | null = null;
  let loop: Loop | null = null;
  let time = 0;

  const spawn = () => ({ x: Math.random() * cssWidth, y: Math.random() * cssHeight, life: 2 + Math.random() * 6 });

  function reset(newSeed = seed) {
    seed = newSeed;
    noise = createNoise(newSeed);
    const count = Math.min(1400, Math.round((cssWidth * cssHeight) / 650));
    particles = Array.from({ length: count }, spawn);
    time = 0;
    ctx?.clearRect(0, 0, canvas?.width ?? 0, canvas?.height ?? 0);
    // Warm up so the field is visible immediately (and when starting paused).
    for (let i = 0; i < 90; i++) advance(1 / 60);
  }

  function advance(seconds: number) {
    if (!ctx || !colors) return;
    time += seconds;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // Fade old strokes toward transparent (the canvas background shows through). Painting the
    // page colour at low alpha instead leaves a grey residue from 8-bit rounding.
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.07)';
    ctx.fillRect(0, 0, cssWidth, cssHeight);
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = withAlpha(colors.accent, 0.5);
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (const p of particles) {
      const angle = noise(p.x * NOISE_SCALE + time * DRIFT, p.y * NOISE_SCALE) * Math.PI * 2;
      const nx = p.x + Math.cos(angle) * SPEED * seconds;
      const ny = p.y + Math.sin(angle) * SPEED * seconds;
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(nx, ny);
      p.x = nx;
      p.y = ny;
      p.life -= seconds;
      if (p.life <= 0 || nx < 0 || ny < 0 || nx > cssWidth || ny > cssHeight) Object.assign(p, spawn());
    }
    ctx.stroke();
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
      cleanups.push(fitCanvas(canvas, (w, h, ratio) => ((cssWidth = w), (cssHeight = h), (dpr = ratio), reset())));
      loop = createLoop(root, (ms) => advance(ms / 1000));
      cleanups.push(() => loop?.destroy());
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
      class="piece-canvas flow__canvas"
      role="img"
      aria-label="Particles drifting along a Perlin-noise flow field. Click or tap for a new field."
      onclick={() => reset(seed + 1)}
    ></canvas>
    <p class="piece-status">Field #{seed} · angle = 2π · noise(x, y) · click for a new field</p>
    <div class="controls">
      <div class="controls__group" role="group" aria-label="Playback">
        <button type="button" class="button button--primary flow__play" onclick={() => setPlaying(!playing)}>{playing ? 'Pause' : 'Play'}</button>
        <button type="button" class="button button--secondary" onclick={() => reset(seed + 1)}>New field</button>
      </div>
    </div>
  {/if}
</div>

<style>
  .flow__canvas {
    aspect-ratio: 2 / 1;
    cursor: pointer;
  }

  .flow__play {
    min-width: 6.5em;
  }
</style>
