<script lang="ts">
  // Scaled dot-product attention by hand (maths and concept in src/lib/attention.ts): drag the
  // query and watch scores = q·k/√d, weights = softmax(scores) and output = Σ weight × value. Toy
  // 2-D vectors.
  //
  // How it works: five made-up tokens, each with a fixed 2-D key and value. The left panel draws
  // the keys and the query; each key's line and dot grow with its attention weight, so the keys the
  // query points toward light up. The right panel draws the values and the output (their weighted
  // average), with a line pulling from each value in proportion to its weight. The bars list the
  // weights. Everything derives from `query` and `sharpness` (a multiplier on 1/√d), so it updates
  // together. It is SVG, so the server render is the no-JS view; dragging and the keyboard-operable
  // slider only exist after hydration.
  import { onMount } from 'svelte';
  import { attend, type Vec } from '../lib/attention.ts';

  const TOKENS: Array<{ word: string; key: Vec; value: Vec }> = [
    { word: 'the', key: [0.9, -1.5], value: [-1.4, -1.2] },
    { word: 'cat', key: [1.7, 0.6], value: [1.5, 0.9] },
    { word: 'sat', key: [0.1, 1.8], value: [0.2, 1.6] },
    { word: 'on', key: [-1.4, 0.8], value: [-1.5, 0.6] },
    { word: 'mat', key: [-1.3, -1.2], value: [1.2, -1.4] },
  ];
  const R = 2.4; // half-width of each panel in vector units
  const S = 140; // panel size in SVG units
  const px = (v: number) => S / 2 + (v / R) * (S / 2);
  const py = (v: number) => S / 2 - (v / R) * (S / 2);

  let mounted = $state(false);
  let query = $state<Vec>([1.4, 0.9]);
  let sharpness = $state(1);
  let dragging = false;

  const result = $derived(attend(query, TOKENS.map((t) => t.key), TOKENS.map((t) => t.value), sharpness / Math.sqrt(2)));
  const top = $derived(TOKENS[result.weights.indexOf(Math.max(...result.weights))].word);

  function setFromPointer(event: PointerEvent) {
    const svg = (event.currentTarget as SVGElement).closest('svg')!;
    const rect = svg.getBoundingClientRect();
    const sx = ((event.clientX - rect.left) / rect.width) * S;
    const sy = ((event.clientY - rect.top) / rect.height) * S;
    const clamp = (v: number) => Math.max(-R, Math.min(R, v));
    query = [clamp(((sx - S / 2) / (S / 2)) * R), clamp((-(sy - S / 2) / (S / 2)) * R)];
  }

  function onKey(event: KeyboardEvent) {
    const step = event.shiftKey ? 0.5 : 0.1;
    const moves: Record<string, Vec> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] };
    const m = moves[event.key];
    if (!m) return;
    event.preventDefault();
    query = [Math.max(-R, Math.min(R, query[0] + m[0])), Math.max(-R, Math.min(R, query[1] + m[1]))];
  }

  onMount(() => (mounted = true));
</script>

<div class="attn">
  <div class="attn__panels">
    <figure class="attn__panel">
      <svg
        viewBox="0 0 {S} {S}"
        role="img"
        aria-label="Query vector at ({query[0].toFixed(1)}, {query[1].toFixed(1)}) among five key vectors. Most attention goes to “{top}”."
        onpointerdown={mounted ? (e) => ((dragging = true), (e.currentTarget as Element).setPointerCapture(e.pointerId), setFromPointer(e)) : undefined}
        onpointermove={mounted ? (e) => dragging && setFromPointer(e) : undefined}
        onpointerup={() => (dragging = false)}
        onpointercancel={() => (dragging = false)}
      >
        <line class="attn__axis" x1="0" y1={S / 2} x2={S} y2={S / 2}></line>
        <line class="attn__axis" x1={S / 2} y1="0" x2={S / 2} y2={S}></line>
        {#each TOKENS as t, i (t.word)}
          <line class="attn__key" x1={S / 2} y1={S / 2} x2={px(t.key[0])} y2={py(t.key[1])} style:opacity={0.25 + 0.75 * result.weights[i]}></line>
          <circle class="attn__keydot" cx={px(t.key[0])} cy={py(t.key[1])} r={2 + 5 * result.weights[i]}></circle>
          <text class="attn__label" x={px(t.key[0]) + (t.key[0] >= 0 ? 5 : -5)} y={py(t.key[1]) - 5} text-anchor={t.key[0] >= 0 ? 'start' : 'end'}>{t.word}</text>
        {/each}
        <line class="attn__query" x1={S / 2} y1={S / 2} x2={px(query[0])} y2={py(query[1])}></line>
        {#if mounted}
          <g
            class="attn__handle"
            role="slider"
            tabindex="0"
            aria-label="Query vector"
            aria-valuetext="x {query[0].toFixed(1)}, y {query[1].toFixed(1)}"
            aria-valuenow={query[0]}
            aria-valuemin={-R}
            aria-valuemax={R}
            onkeydown={onKey}
          >
            <circle cx={px(query[0])} cy={py(query[1])} r="7"></circle>
            <text x={px(query[0])} y={py(query[1]) - 10} text-anchor="middle" class="attn__qlabel">q</text>
          </g>
        {:else}
          <g class="attn__handle">
            <circle cx={px(query[0])} cy={py(query[1])} r="7"></circle>
            <text x={px(query[0])} y={py(query[1]) - 10} text-anchor="middle" class="attn__qlabel">q</text>
          </g>
        {/if}
      </svg>
      <figcaption class="label">Query &amp; keys (drag q)</figcaption>
    </figure>

    <figure class="attn__panel">
      <svg viewBox="0 0 {S} {S}" role="img" aria-label="Value vectors and the output, their attention-weighted average.">
        <line class="attn__axis" x1="0" y1={S / 2} x2={S} y2={S / 2}></line>
        <line class="attn__axis" x1={S / 2} y1="0" x2={S / 2} y2={S}></line>
        {#each TOKENS as t, i (t.word)}
          <line class="attn__pull" x1={px(t.value[0])} y1={py(t.value[1])} x2={px(result.output[0])} y2={py(result.output[1])} style:opacity={result.weights[i]}></line>
          <rect class="attn__value" x={px(t.value[0]) - 3} y={py(t.value[1]) - 3} width="6" height="6"></rect>
          <text class="attn__label" x={px(t.value[0])} y={py(t.value[1]) + 13} text-anchor="middle">{t.word}</text>
        {/each}
        <circle class="attn__output" cx={px(result.output[0])} cy={py(result.output[1])} r="6"></circle>
      </svg>
      <figcaption class="label">Values → output (●)</figcaption>
    </figure>
  </div>

  <div class="attn__side">
    <ol class="attn__bars" role="list" aria-label="Attention weights">
      {#each TOKENS as t, i (t.word)}
        <li>
          <span class="attn__word">{t.word}</span>
          <span class="attn__track"><span class="attn__fill" style:width="{(result.weights[i] * 100).toFixed(1)}%"></span></span>
          <span class="attn__num">{(result.weights[i] * 100).toFixed(0)}%</span>
        </li>
      {/each}
    </ol>
    <p class="piece-status">weights = softmax(q · k / √d) · output = Σ weight × value. Most attention: “{top}”.</p>
    {#if mounted}
      <label class="range">
        <span class="label">Sharpness</span>
        <input type="range" min="0.2" max="4" step="0.1" bind:value={sharpness} />
        <output>×{Number(sharpness).toFixed(1)}</output>
      </label>
      <p class="piece-status">Drag q, or focus it and use the arrow keys (Shift for bigger steps).</p>
    {/if}
  </div>
</div>

<style>
  .attn {
    display: grid;
    gap: var(--space-l);
    align-items: start;
  }

  .attn__panels {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-s);
  }

  .attn__panel {
    margin: 0;
    display: grid;
    gap: var(--space-3xs);
  }

  .attn__panel svg {
    display: block;
    width: 100%;
    border-radius: var(--radius-m);
    background: var(--color-bg);
    touch-action: none;
  }

  .attn__axis {
    stroke: var(--color-rule);
    stroke-width: 0.6;
  }

  .attn__key {
    stroke: var(--color-muted);
    stroke-width: 1.2;
  }

  .attn__keydot,
  .attn__value {
    fill: var(--color-muted);
  }

  .attn__label {
    font-size: 8px;
    fill: var(--color-text);
  }

  .attn__query {
    stroke: var(--color-accent);
    stroke-width: 2;
  }

  .attn__handle {
    cursor: grab;
  }

  .attn__handle circle {
    fill: var(--color-accent);
  }

  .attn__handle:focus-visible {
    outline: none;
  }

  .attn__handle:focus-visible circle {
    stroke: var(--color-focus);
    stroke-width: 2.5;
  }

  .attn__qlabel {
    font-size: 9px;
    font-weight: 700;
    fill: var(--color-accent);
  }

  .attn__pull {
    stroke: var(--color-accent);
    stroke-width: 1.4;
  }

  .attn__output {
    fill: var(--color-accent);
    stroke: var(--color-bg);
    stroke-width: 1.5;
  }

  .attn__side {
    display: grid;
    gap: var(--space-s);
    min-width: 0;
  }

  .attn__bars {
    display: grid;
    gap: var(--space-2xs);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .attn__bars li {
    display: grid;
    grid-template-columns: 3ch minmax(0, 1fr) 4ch;
    align-items: center;
    gap: var(--space-2xs);
    font-variant-numeric: tabular-nums;
  }

  .attn__track {
    height: 0.6rem;
    border-radius: 999px;
    background: var(--color-rule);
    overflow: hidden;
  }

  .attn__fill {
    display: block;
    height: 100%;
    background: var(--color-accent);
    transition: width var(--dur-fast) linear;
  }

  .attn__num {
    text-align: end;
    font-size: var(--step--1);
  }

  @media (min-width: 52rem) {
    .attn {
      grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
    }
  }
</style>
