<script lang="ts">
  // Elementary cellular automata, scrolling upward one generation at a time. `decorative` renders
  // the quiet Rule 30 background band (no controls, hidden from assistive tech); otherwise a
  // panel with rule and seed controls.
  import { onMount, tick } from 'svelte';
  import { RULES, nextRow, randomRow, singleCell, type Row } from '../lib/automata.ts';
  import { createLoop, fitCanvas, prefersReducedMotion, watchTheme, type Loop, type ThemeColors } from './canvas-kit.ts';

  let { decorative = false, cell = decorative ? 5 : 4, rate = decorative ? 8 : 18 }: { decorative?: boolean; cell?: number; rate?: number } =
    $props();

  let root: HTMLDivElement | undefined = $state();
  let canvas: HTMLCanvasElement | undefined = $state();
  let mounted = $state(false);
  let rule = $state<number>(30);
  let seedMode = $state<'single' | 'random'>(decorative ? 'random' : 'single');
  let playing = $state(false);

  const note = $derived(RULES.find((r) => r.rule === rule)?.note ?? '');

  let rows: Row[] = [];
  let cols = 0;
  let visibleRows = 0;
  let ctx: CanvasRenderingContext2D | null = null;
  let cssWidth = 0;
  let cssHeight = 0;
  let dpr = 1;
  let colors: ThemeColors | null = null;
  let loop: Loop | null = null;
  let pending = 0;

  function restart() {
    if (cssWidth === 0) return;
    cols = Math.max(8, Math.floor(cssWidth / cell));
    visibleRows = Math.max(4, Math.ceil(cssHeight / cell));
    rows = [seedMode === 'single' ? singleCell(cols) : randomRow(cols, Math.random, 0.5)];
    // Fill the panel so it never starts empty.
    while (rows.length < visibleRows) rows.push(nextRow(rows[rows.length - 1], rule));
    draw();
  }

  function advance(seconds: number) {
    pending += seconds * rate;
    let changed = false;
    while (pending >= 1) {
      rows.push(nextRow(rows[rows.length - 1], rule));
      if (rows.length > visibleRows) rows.shift();
      pending -= 1;
      changed = true;
    }
    if (changed) draw();
  }

  function draw() {
    if (!ctx || !colors) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, cssWidth, cssHeight);
    ctx.fillStyle = decorative ? colors.text : colors.accent;
    const offsetX = (cssWidth - cols * cell) / 2;
    rows.forEach((row, y) => {
      for (let x = 0; x < cols; x++) if (row[x]) ctx!.fillRect(offsetX + x * cell, y * cell, cell - 0.5, cell - 0.5);
    });
  }

  function setPlaying(next: boolean) {
    playing = next;
    loop?.setPlaying(next);
  }

  function chooseRule(next: number) {
    rule = next;
    restart();
  }

  function chooseSeed(next: 'single' | 'random') {
    seedMode = next;
    restart();
  }

  onMount(() => {
    mounted = true;
    const cleanups: Array<() => void> = [];
    tick().then(() => {
      if (!canvas || !root) return;
      ctx = canvas.getContext('2d');
      cleanups.push(watchTheme(root, (c) => ((colors = c), draw())));
      cleanups.push(fitCanvas(canvas, (w, h, ratio) => ((cssWidth = w), (cssHeight = h), (dpr = ratio), restart())));
      loop = createLoop(root, (ms) => advance(ms / 1000));
      cleanups.push(() => loop?.destroy());
      setPlaying(!prefersReducedMotion());
    });
    return () => cleanups.forEach((fn) => fn());
  });
</script>

{#if decorative}
  <div class="ca ca--band" bind:this={root} aria-hidden="true">
    <canvas bind:this={canvas} class="ca__canvas"></canvas>
  </div>
{:else}
  <div class="piece-body" bind:this={root}>
    {#if mounted}
      <canvas bind:this={canvas} class="piece-canvas ca__canvas ca__canvas--panel" role="img" aria-label={`Rule ${rule} cellular automaton, newest generation at the bottom.`}></canvas>
      <p class="piece-status">Rule {rule}: {note}</p>
      <div class="controls">
        <div class="controls__group" role="group" aria-label="Rule">
          {#each RULES as r (r.rule)}
            <button type="button" class="chip" aria-pressed={rule === r.rule} onclick={() => chooseRule(r.rule)}>{r.rule}</button>
          {/each}
        </div>
        <div class="controls__group" role="group" aria-label="Starting row">
          <button type="button" class="chip" aria-pressed={seedMode === 'single'} onclick={() => chooseSeed('single')}>One cell</button>
          <button type="button" class="chip" aria-pressed={seedMode === 'random'} onclick={() => chooseSeed('random')}>Random</button>
        </div>
        <button type="button" class="button button--primary ca__play" onclick={() => setPlaying(!playing)}>{playing ? 'Pause' : 'Play'}</button>
      </div>
    {:else}
      <p class="piece-status">
        A one-dimensional row of cells; each new row follows from the three cells above it. Rule 30 looks random, Rule 90 draws
        Sierpinski's triangle, Rule 110 can compute anything.
      </p>
    {/if}
  </div>
{/if}

<style>
  .ca__canvas {
    display: block;
    width: 100%;
    height: 100%;
  }

  .ca__canvas--panel {
    aspect-ratio: 2 / 1;
    height: auto;
  }

  .ca--band {
    position: absolute;
    inset: 0;
    opacity: 0.09;
    pointer-events: none;
    -webkit-mask-image: linear-gradient(to right, transparent, black 35%, black 70%, transparent);
    mask-image: linear-gradient(to right, transparent, black 35%, black 70%, transparent);
  }

  .ca__play {
    min-width: 6.5em;
  }
</style>
