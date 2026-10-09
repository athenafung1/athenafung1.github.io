<script lang="ts">
  // A neural cellular automaton (Mordvintsev et al., 2020) that grows a three-petal rose from one
  // cell and regrows it when damaged (concept and step in src/lib/nca.ts; weights trained offline
  // by scripts/nca/train.py). Every cell runs the same tiny neural network on what it sees of its
  // neighbours.
  //
  // How it works: the 32×32 grid of 12-channel cells lives in one Float32Array. The animation loop
  // advances about 30 steps per second (at most 2 per frame, so slow devices fall behind rather
  // than stall) and paints each cell's ink channel as an accent-coloured square whose opacity is
  // the ink value. Dragging empties small discs of cells along the pointer's path; "Damage it" cuts
  // one larger disc, sized so it heals cleanly in simulation. Under reduced motion, steps run
  // off-screen in small batches and only the result is drawn.
  import { onMount, tick, type Snippet } from 'svelte';
  import weightsJson from '../data/nca-weights.json';
  import { damage, ncaStep, seedState, type NcaWeights } from '../lib/nca.ts';
  import { createLoop, fitCanvas, prefersReducedMotion, rgb, watchTheme, type Loop, type ThemeColors } from './canvas-kit.ts';

  let { children }: { children?: Snippet } = $props();

  const weights = weightsJson as NcaWeights;
  const SIZE = weights.size;
  const C = weights.channels;
  const STEPS_PER_SECOND = 30;

  let mounted = $state(false);
  let root: HTMLDivElement | undefined = $state();
  let canvas: HTMLCanvasElement | undefined = $state();
  let playing = $state(false);
  let status = $state('');
  let announcement = $state('');

  let grid = seedState(SIZE, C);
  let steps = 0;
  let pending = 0;
  let erasing = false;
  let ctx: CanvasRenderingContext2D | null = null;
  let cssSize = 320;
  let dpr = 1;
  let colors: ThemeColors | null = null;
  let loop: Loop | null = null;
  let fastForward = 0;

  function advance(n: number) {
    for (let i = 0; i < n; i++) grid = ncaStep(grid, weights, Math.random);
    steps += n;
  }

  function updateStatus() {
    let alive = 0;
    for (let i = 0; i < SIZE * SIZE; i++) if (grid[i * C] > 0.1) alive++;
    status = `Step ${steps} · ${alive} living cells · ${SIZE}×${SIZE} grid, ${C} channels per cell`;
  }

  function draw() {
    if (!ctx || !colors) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, cssSize, cssSize);
    const cell = cssSize / SIZE;
    const [r, g, b] = rgb(colors.accent);
    for (let y = 0; y < SIZE; y++) {
      for (let x = 0; x < SIZE; x++) {
        const ink = Math.max(0, Math.min(1, grid[(y * SIZE + x) * C]));
        if (ink < 0.02) continue;
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${ink})`;
        ctx.fillRect(x * cell + 0.5, y * cell + 0.5, cell - 1, cell - 1);
      }
    }
  }

  /** Under reduced motion, run steps off-screen in small batches and draw only the result. */
  function runQuietly(n: number) {
    fastForward = n;
    const batch = () => {
      const k = Math.min(4, fastForward);
      advance(k);
      fastForward -= k;
      if (fastForward > 0) requestAnimationFrame(batch);
      else {
        updateStatus();
        draw();
      }
    };
    requestAnimationFrame(batch);
  }

  function regrow() {
    grid = seedState(SIZE, C);
    steps = 0;
    announcement = 'Restarted from a single cell.';
    if (prefersReducedMotion()) runQuietly(120);
    else setPlaying(true);
    draw();
  }

  function damageRandom() {
    const cx = SIZE / 2 + (Math.random() - 0.5) * SIZE * 0.4;
    const cy = SIZE / 2 + (Math.random() - 0.5) * SIZE * 0.4;
    // Radius 4 cells heals cleanly in simulation (40/40 trials); much larger holes can leave a scar.
    damage(grid, SIZE, C, cx, cy, SIZE / 8);
    announcement = 'Cut a hole in the mark. Watch it heal.';
    if (prefersReducedMotion()) runQuietly(90);
    else setPlaying(true);
    draw();
  }

  function eraseAt(event: PointerEvent) {
    const rect = canvas!.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * SIZE;
    const y = ((event.clientY - rect.top) / rect.height) * SIZE;
    damage(grid, SIZE, C, x, y, 2.6);
    draw();
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
      cleanups.push(watchTheme(root, (c) => ((colors = c), draw())));
      cleanups.push(fitCanvas(canvas, (w, _h, ratio) => ((cssSize = w), (dpr = ratio), draw())));
      loop = createLoop(root, (ms) => {
        pending += (ms / 1000) * STEPS_PER_SECOND;
        const n = Math.floor(pending);
        if (n > 0) {
          advance(Math.min(n, 2));
          pending -= n;
          if (steps % 5 === 0) updateStatus();
          draw();
        }
      });
      cleanups.push(() => loop?.destroy());
      updateStatus();
      if (prefersReducedMotion()) runQuietly(120);
      else setPlaying(true);
    });
    return () => cleanups.forEach((fn) => fn());
  });
</script>

<div class="nca" bind:this={root}>
  <div class="piece-body nca__stage">
    {#if !mounted}
      {@render children?.()}
    {:else}
      <canvas
        bind:this={canvas}
        class="piece-canvas nca__canvas"
        role="img"
        aria-label="A three-petal rose grown cell by cell by a neural cellular automaton. Drag across it to cut it; it grows back."
        onpointerdown={(e) => ((erasing = true), canvas!.setPointerCapture(e.pointerId), eraseAt(e), setPlaying(!prefersReducedMotion()))}
        onpointermove={(e) => erasing && eraseAt(e)}
        onpointerup={() => ((erasing = false), prefersReducedMotion() && runQuietly(90))}
        onpointercancel={() => (erasing = false)}
      ></canvas>
    {/if}
  </div>
  <div class="nca__side">
    <p class="piece-status">{status}</p>
    <p class="piece-status">
      Every pixel is a cell running the same {weights.hidden}-neuron network on what it can see of its neighbours. Nobody draws the
      shape; it emerges, and because training included random damage, it heals.
    </p>
    {#if mounted}
      <div class="controls__group" role="group" aria-label="Automaton">
        <button type="button" class="button button--primary nca__play" onclick={() => setPlaying(!playing)}>{playing ? 'Pause' : 'Play'}</button>
        <button type="button" class="button button--secondary" onclick={damageRandom}>Damage it</button>
        <button type="button" class="button button--secondary" onclick={regrow}>Regrow from one cell</button>
      </div>
      <p class="piece-status">Drag across the mark to cut it. Very large cuts can leave a scar; “Regrow” starts over.</p>
    {/if}
    <p class="visually-hidden" aria-live="polite">{announcement}</p>
  </div>
</div>

<style>
  .nca {
    display: grid;
    gap: var(--space-l);
    align-items: center;
  }

  .nca__canvas {
    aspect-ratio: 1;
    max-width: 20rem;
    cursor: crosshair;
    touch-action: none;
  }

  .nca__side {
    display: grid;
    gap: var(--space-s);
    min-width: 0;
  }

  .nca__play {
    min-width: 6.5em;
  }

  @media (min-width: 48rem) {
    .nca {
      grid-template-columns: minmax(0, 20rem) minmax(0, 1fr);
    }
  }
</style>
