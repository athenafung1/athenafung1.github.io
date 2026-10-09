<script lang="ts">
  // Train a tiny neural network live (maths and concept in src/lib/mlp.ts): 2 inputs (x, y) → one
  // or two hidden layers → probability of class ▲.
  //
  // How it works: each animation frame runs up to 3 full-batch training steps (fewer if they take
  // more than 8 ms, so slow devices train more slowly rather than stutter). Every few frames it
  // redraws the decision field: the network's prediction at each point of a 44×44 grid, tinted
  // toward ▲'s colour where p > 0.5 and the other class's where p < 0.5, fading to paper where it
  // is unsure (p ≈ 0.5), so the boundary shows as the pale band. The sparkline is the loss.
  // Changing the dataset, width, depth or activation starts a fresh network from new random
  // weights.
  import { onMount, tick, type Snippet } from 'svelte';
  import { accuracy, createNet, dataset, predict, trainStep, type Activation, type DatasetId, type Net, type Point } from '../lib/mlp.ts';
  import { createLoop, fitCanvas, prefersReducedMotion, rgb, watchTheme, type Loop, type ThemeColors } from './canvas-kit.ts';

  let { children }: { children?: Snippet } = $props();

  const DATASETS: Array<{ id: DatasetId; label: string }> = [
    { id: 'spiral', label: 'Spiral' },
    { id: 'circles', label: 'Circles' },
    { id: 'xor', label: 'XOR' },
    { id: 'moons', label: 'Moons' },
  ];
  const GRID = 44;
  const STEPS_PER_FRAME = 3;
  const FRAME_BUDGET_MS = 8; // slower devices take fewer steps per frame rather than dropping frames
  const MAX_EPOCHS = 3000;

  let mounted = $state(false);
  let root: HTMLDivElement | undefined = $state();
  let canvas: HTMLCanvasElement | undefined = $state();
  let datasetId = $state<DatasetId>('spiral');
  let hidden = $state(12);
  let depth = $state<1 | 2>(2);
  let activation = $state<Activation>('tanh');
  let addClass = $state<0 | 1>(1);
  let playing = $state(false);
  let stats = $state('');
  let lossTrace = $state.raw<number[]>([]);

  let data: Point[] = dataset('spiral', 200);
  let net: Net = createNet([2, 12, 12, 1], 'tanh', 1);
  let epoch = 0;
  let frames = 0;
  let seed = 1;
  let ctx: CanvasRenderingContext2D | null = null;
  let cssSize = 360;
  let dpr = 1;
  let colors: ThemeColors | null = null;
  let loop: Loop | null = null;
  let field: HTMLCanvasElement | null = null;

  const sparkline = $derived.by(() => {
    if (lossTrace.length < 2) return '';
    const max = Math.max(...lossTrace);
    // High loss at the top, so a falling loss runs downhill.
    return lossTrace.map((l, i) => `${((i / (lossTrace.length - 1)) * 200).toFixed(1)},${(4 + (1 - l / max) * 32).toFixed(1)}`).join(' ');
  });

  function rebuild() {
    seed++;
    net = createNet([2, ...Array(depth).fill(hidden), 1], activation, seed);
    epoch = 0;
    lossTrace = [];
    updateStats(Number.NaN);
    renderField();
    draw();
  }

  function loadData(id: DatasetId) {
    datasetId = id;
    data = dataset(id, 200, 3);
    rebuild();
    setPlaying(!prefersReducedMotion());
  }

  function updateStats(loss: number) {
    const acc = accuracy(net, data);
    stats = `Epoch ${epoch} · loss ${Number.isFinite(loss) ? loss.toFixed(3) : '—'} · accuracy ${(acc * 100).toFixed(0)}% · ${data.length} points`;
  }

  /** Probability field p(▲ | x, y) on a coarse grid, blended between the two class tints. */
  function renderField() {
    if (!colors) return;
    field ??= document.createElement('canvas');
    field.width = GRID;
    field.height = GRID;
    const f = field.getContext('2d')!;
    const img = f.createImageData(GRID, GRID);
    const a = rgb(colors.rule);
    const b = rgb(colors.accent);
    const bg = rgb(colors.bg);
    for (let j = 0; j < GRID; j++) {
      for (let i = 0; i < GRID; i++) {
        const p = predict(net, (i / (GRID - 1)) * 2 - 1, 1 - (j / (GRID - 1)) * 2);
        const k = (j * GRID + i) * 4;
        // Strong tint where the net is confident, paper where it is unsure (p ≈ 0.5).
        const conf = Math.abs(p - 0.5) * 2;
        const target = p > 0.5 ? b : a;
        const mix = 0.15 + 0.45 * conf;
        for (let c = 0; c < 3; c++) img.data[k + c] = bg[c] + (target[c] - bg[c]) * mix;
        img.data[k + 3] = 255;
      }
    }
    f.putImageData(img, 0, 0);
  }

  function draw() {
    if (!ctx || !colors) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = true;
    if (field) ctx.drawImage(field, 0, 0, cssSize, cssSize);
    const toScreen = (x: number, y: number) => [((x + 1) / 2) * cssSize, ((1 - y) / 2) * cssSize];
    for (const pt of data) {
      const [x, y] = toScreen(pt.x, pt.y);
      ctx.beginPath();
      if (pt.label === 1) {
        ctx.moveTo(x, y - 5);
        ctx.lineTo(x + 4.5, y + 3.5);
        ctx.lineTo(x - 4.5, y + 3.5);
        ctx.closePath();
        ctx.fillStyle = colors.accent;
      } else {
        ctx.arc(x, y, 3.6, 0, Math.PI * 2);
        ctx.fillStyle = colors.text;
      }
      ctx.fill();
      ctx.strokeStyle = colors.bg;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  function train() {
    let loss = Number.NaN;
    const t0 = performance.now();
    for (let k = 0; k < STEPS_PER_FRAME && epoch < MAX_EPOCHS; k++) {
      loss = trainStep(net, data, 0.03);
      epoch++;
      if (performance.now() - t0 > FRAME_BUDGET_MS) break;
    }
    // Steps per frame vary, so sample on a frame counter rather than on exact epochs.
    frames++;
    if (frames % 2 === 0) lossTrace = [...lossTrace, loss].slice(-200);
    if (frames % 4 === 0) {
      updateStats(loss);
      renderField();
    }
    draw();
    if (epoch >= MAX_EPOCHS) setPlaying(false);
  }

  function setPlaying(next: boolean) {
    playing = next;
    loop?.setPlaying(next);
  }

  function onClick(event: MouseEvent) {
    const rect = canvas!.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = 1 - ((event.clientY - rect.top) / rect.height) * 2;
    data = [...data, { x, y, label: addClass }];
    updateStats(Number.NaN);
    draw();
    if (!playing && !prefersReducedMotion()) setPlaying(true);
  }

  onMount(() => {
    mounted = true;
    const cleanups: Array<() => void> = [];
    tick().then(() => {
      if (!canvas || !root) return;
      ctx = canvas.getContext('2d');
      cleanups.push(watchTheme(root, (c) => ((colors = c), renderField(), draw())));
      cleanups.push(fitCanvas(canvas, (w, _h, ratio) => ((cssSize = w), (dpr = ratio), draw())));
      loop = createLoop(root, train);
      cleanups.push(() => loop?.destroy());
      rebuild();
      setPlaying(!prefersReducedMotion());
    });
    return () => cleanups.forEach((fn) => fn());
  });
</script>

<div class="nn" bind:this={root}>
  <div class="piece-body nn__stage">
    {#if !mounted}
      {@render children?.()}
    {:else}
      <canvas bind:this={canvas} class="piece-canvas nn__canvas" role="img" aria-label="Two classes of points (circles and triangles) and the network's learned decision regions. Click to add a point."></canvas>
    {/if}
  </div>

  <div class="nn__side">
    {#if mounted}
      <figure class="nn__loss">
        <svg viewBox="0 0 200 40" preserveAspectRatio="none" aria-hidden="true">
          {#if sparkline}<polyline points={sparkline}></polyline>{/if}
        </svg>
        <figcaption class="piece-status" aria-live="off">{stats}</figcaption>
      </figure>
      <div class="controls__group" role="group" aria-label="Dataset">
        {#each DATASETS as d (d.id)}
          <button type="button" class="chip" aria-pressed={datasetId === d.id} onclick={() => loadData(d.id)}>{d.label}</button>
        {/each}
      </div>
      <label class="range">
        <span class="label">Neurons</span>
        <input type="range" min="2" max="16" step="1" bind:value={hidden} onchange={() => (rebuild(), setPlaying(!prefersReducedMotion()))} />
        <output>{hidden}</output>
      </label>
      <div class="controls__group" role="group" aria-label="Architecture">
        <button type="button" class="chip" aria-pressed={depth === 1} onclick={() => ((depth = 1), rebuild(), setPlaying(!prefersReducedMotion()))}>1 layer</button>
        <button type="button" class="chip" aria-pressed={depth === 2} onclick={() => ((depth = 2), rebuild(), setPlaying(!prefersReducedMotion()))}>2 layers</button>
        <button type="button" class="chip" aria-pressed={activation === 'tanh'} onclick={() => ((activation = 'tanh'), rebuild(), setPlaying(!prefersReducedMotion()))}>tanh</button>
        <button type="button" class="chip" aria-pressed={activation === 'relu'} onclick={() => ((activation = 'relu'), rebuild(), setPlaying(!prefersReducedMotion()))}>ReLU</button>
      </div>
      <div class="controls__group" role="group" aria-label="Click adds">
        <button type="button" class="chip" aria-pressed={addClass === 0} onclick={() => (addClass = 0)}>Add ●</button>
        <button type="button" class="chip" aria-pressed={addClass === 1} onclick={() => (addClass = 1)}>Add ▲</button>
      </div>
      <div class="controls__group" role="group" aria-label="Training">
        <button type="button" class="button button--primary nn__play" onclick={() => setPlaying(!playing)}>{playing ? 'Pause' : 'Train'}</button>
        <button type="button" class="button button--secondary" onclick={() => (rebuild(), setPlaying(!prefersReducedMotion()))}>New weights</button>
      </div>
    {:else}
      <p class="piece-status">A small neural network learns to separate two classes of points, redrawing its decision boundary as it trains.</p>
    {/if}
  </div>
</div>

<style>
  .nn {
    display: grid;
    gap: var(--space-l);
    align-items: start;
  }

  .nn__canvas {
    aspect-ratio: 1;
    max-width: 26rem;
    cursor: crosshair;
  }

  .nn__side {
    display: grid;
    gap: var(--space-s);
    min-width: 0;
  }

  .nn__loss {
    margin: 0;
  }

  .nn__loss svg {
    display: block;
    width: 100%;
    height: 2.5rem;
    border-bottom: 1px solid var(--color-rule);
  }

  polyline {
    fill: none;
    stroke: var(--color-accent);
    stroke-width: 1.5;
    vector-effect: non-scaling-stroke;
  }

  .nn__play {
    min-width: 6.5em;
  }

  @media (min-width: 52rem) {
    .nn {
      grid-template-columns: minmax(0, 26rem) minmax(0, 1fr);
    }
  }
</style>
