<script lang="ts">
  // Hopfield associative memory (maths and concept in src/lib/hopfield.ts): 144 neurons, one per
  // cell of a 12×12 grid, with Hebbian weights storing four glyphs. Corrupt a memory or draw one,
  // then watch recall update one neuron at a time, downhill in energy, until it settles on what it
  // remembers (or on a spurious blend).
  //
  // How it works: the grid is SVG, so the server render doubles as the no-JS fallback. Recall runs
  // the same asynchronous update as recall() in the library, but a few neurons per animation frame,
  // highlighting the last flip and adding the energy to a sparkline that can only go down. "Store"
  // adds the current drawing as a memory by retraining the weights; storing several shows how
  // memories interfere. Under reduced motion, recall runs to completion at once.
  import { onMount } from 'svelte';
  import { GRID, HOPFIELD_MEMORIES, corrupt, energy, overlap, train, updateNeuron, type State } from '../lib/hopfield.ts';
  import { prefersReducedMotion } from './canvas-kit.ts';

  const N = GRID * GRID;
  const CELL = 20;
  const MAX_MEMORIES = 8;
  const UPDATES_PER_FRAME = 4;

  type Memory = { id: string; label: string; state: State };

  let mounted = $state(false);
  let memories = $state.raw<Memory[]>(HOPFIELD_MEMORIES.map((m) => ({ ...m })));
  let cells = $state.raw<State>(Int8Array.from(HOPFIELD_MEMORIES[0].state));
  let lastFlip = $state(-1);
  let recalling = $state(false);
  let noise = $state(25);
  let message = $state('Memory “A” loaded. Add noise, then let the network recall it.');
  let energyTrace = $state.raw<number[]>([]);

  let weights = train(memories.map((m) => m.state), N);
  let raf = 0;
  let painting: 1 | -1 | null = null;

  const currentEnergy = $derived(energy(weights, cells));
  const closest = $derived.by(() => {
    let best = { label: '', m: 0, inverse: false };
    for (const mem of memories) {
      const m = overlap(cells, mem.state);
      if (Math.abs(m) > Math.abs(best.m)) best = { label: mem.label, m, inverse: m < 0 };
    }
    return best;
  });
  const sparkline = $derived.by(() => {
    if (energyTrace.length < 2) return '';
    const min = Math.min(...energyTrace);
    const max = Math.max(...energyTrace);
    const span = max - min || 1;
    // Lower energy plots lower, so the line visibly runs downhill.
    return energyTrace.map((e, i) => `${((i / (energyTrace.length - 1)) * 200).toFixed(1)},${(4 + ((max - e) / span) * 32).toFixed(1)}`).join(' ');
  });

  function show(state: State, text: string) {
    stop();
    cells = Int8Array.from(state);
    lastFlip = -1;
    energyTrace = [energy(weights, cells)];
    message = text;
  }

  function stop() {
    cancelAnimationFrame(raf);
    recalling = false;
  }

  function addNoise() {
    show(corrupt(cells, noise / 100, Math.random), `Flipped ${noise}% of the neurons. Now press Recall.`);
  }

  function describeResult(sweeps: number) {
    const match = memories.find((m) => Math.abs(overlap(cells, m.state)) === 1);
    if (match) {
      const inverse = overlap(cells, match.state) < 0;
      message = inverse
        ? `Settled on the inverse of “${match.label}”: Hebbian memories are stored together with their negatives.`
        : `Recalled “${match.label}” exactly after ${sweeps} sweep${sweeps === 1 ? '' : 's'} through the neurons.`;
    } else {
      message = `Settled into a spurious state, a blend of memories (closest: “${closest.label}”, overlap ${closest.m.toFixed(2)}). Real Hopfield networks do this too.`;
    }
  }

  /** Asynchronous recall, animated: random-order sweeps until one sweep changes nothing. */
  function recall() {
    stop();
    recalling = true;
    energyTrace = [energy(weights, cells)];
    const state = Int8Array.from(cells);
    let order: number[] = [];
    let position = 0;
    let changedThisSweep = false;
    let sweeps = 0;
    const nextSweep = () => {
      order = Array.from({ length: N }, (_, i) => i);
      for (let i = N - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [order[i], order[j]] = [order[j], order[i]];
      }
      position = 0;
      changedThisSweep = false;
      sweeps++;
    };
    nextSweep();
    const finish = () => {
      cells = state;
      recalling = false;
      lastFlip = -1;
      describeResult(sweeps);
    };
    if (prefersReducedMotion()) {
      while (sweeps <= 20) {
        for (const i of order) if (updateNeuron(weights, state, i)) changedThisSweep = true;
        if (!changedThisSweep) break;
        nextSweep();
      }
      return finish();
    }
    const frame = () => {
      let flipped = -1;
      for (let k = 0; k < UPDATES_PER_FRAME && position < N; k++, position++) {
        if (updateNeuron(weights, state, order[position])) {
          changedThisSweep = true;
          flipped = order[position];
        }
      }
      if (flipped >= 0) {
        cells = Int8Array.from(state);
        lastFlip = flipped;
        energyTrace = [...energyTrace, energy(weights, state)];
      }
      if (position >= N) {
        if (!changedThisSweep || sweeps >= 20) return finish();
        nextSweep();
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
  }

  function storeDrawing() {
    if (memories.length >= MAX_MEMORIES) {
      message = `This network holds at most ${MAX_MEMORIES} memories here (theory: about 0.14 × ${N} ≈ 20 random ones).`;
      return;
    }
    const label = `#${memories.length + 1}`;
    memories = [...memories, { id: `custom-${Date.now()}`, label, state: Int8Array.from(cells) }];
    weights = train(memories.map((m) => m.state), N);
    message = `Stored your drawing as memory ${label}. More memories mean more interference.`;
    energyTrace = [energy(weights, cells)];
  }

  function resetMemories() {
    memories = HOPFIELD_MEMORIES.map((m) => ({ ...m }));
    weights = train(memories.map((m) => m.state), N);
    show(memories[0].state, 'Back to the four original memories.');
  }

  function cellFromEvent(event: PointerEvent): number {
    const svg = event.currentTarget as SVGSVGElement;
    const rect = svg.getBoundingClientRect();
    const col = Math.floor(((event.clientX - rect.left) / rect.width) * GRID);
    const row = Math.floor(((event.clientY - rect.top) / rect.height) * GRID);
    return col < 0 || row < 0 || col >= GRID || row >= GRID ? -1 : row * GRID + col;
  }

  function paint(i: number) {
    if (i < 0 || painting === null || cells[i] === painting) return;
    const next = Int8Array.from(cells);
    next[i] = painting;
    cells = next;
  }

  function onPointerDown(event: PointerEvent) {
    if (event.button !== 0) return;
    stop();
    (event.currentTarget as Element).setPointerCapture(event.pointerId);
    const i = cellFromEvent(event);
    if (i < 0) return;
    painting = cells[i] === 1 ? -1 : 1;
    paint(i);
    message = 'Drawing. Press Recall to see which memory it resembles, or store it as a new memory.';
  }

  onMount(() => {
    mounted = true;
    energyTrace = [energy(weights, cells)];
    return stop;
  });
</script>

<div class="hopfield">
  <div class="hopfield__grid-wrap">
    <svg
      class="hopfield__grid"
      viewBox="0 0 {GRID * CELL} {GRID * CELL}"
      role="img"
      aria-label="A 12 by 12 grid of neurons; filled squares are firing. Closest memory: {closest.label}."
      onpointerdown={mounted ? onPointerDown : undefined}
      onpointermove={mounted ? (e) => painting !== null && paint(cellFromEvent(e)) : undefined}
      onpointerup={() => (painting = null)}
      onpointercancel={() => (painting = null)}
    >
      {#each cells as v, i (i)}
        <rect
          x={(i % GRID) * CELL + 1}
          y={Math.floor(i / GRID) * CELL + 1}
          width={CELL - 2}
          height={CELL - 2}
          rx="3"
          class:on={v === 1}
          class:flip={i === lastFlip}
        ></rect>
      {/each}
    </svg>
  </div>

  <div class="hopfield__side">
    {#if mounted}
      <div class="hopfield__memories" role="group" aria-label="Stored memories">
        {#each memories as mem (mem.id)}
          <button type="button" class="hopfield__memory" onclick={() => show(mem.state, `Memory “${mem.label}” loaded.`)} aria-label="Load memory {mem.label}">
            <svg viewBox="0 0 {GRID} {GRID}" aria-hidden="true">
              {#each mem.state as v, i (i)}
                {#if v === 1}<rect x={i % GRID} y={Math.floor(i / GRID)} width="1" height="1"></rect>{/if}
              {/each}
            </svg>
          </button>
        {/each}
      </div>

      <label class="range">
        <span class="label">Noise</span>
        <input type="range" min="5" max="50" step="5" bind:value={noise} />
        <output>{noise}%</output>
      </label>

      <div class="controls__group" role="group" aria-label="Network">
        <button type="button" class="button button--secondary" onclick={addNoise} disabled={recalling}>Add noise</button>
        <button type="button" class="button button--primary" onclick={recall} disabled={recalling}>{recalling ? 'Recalling…' : 'Recall'}</button>
        <button type="button" class="button button--secondary" onclick={storeDrawing} disabled={recalling}>Store drawing</button>
        <button type="button" class="button button--secondary" onclick={resetMemories} disabled={recalling}>Reset</button>
      </div>

      <figure class="hopfield__energy">
        <svg viewBox="0 0 200 40" preserveAspectRatio="none" aria-hidden="true">
          {#if sparkline}<polyline points={sparkline}></polyline>{/if}
        </svg>
        <figcaption class="piece-status">Energy E = −½ Σ w<sub>ij</sub> s<sub>i</sub> s<sub>j</sub>: {currentEnergy.toFixed(1)} (only ever goes down)</figcaption>
      </figure>
      <p class="piece-status" aria-live="polite">{message}</p>
    {:else}
      <p class="piece-status">
        A Hopfield network stores pictures as energy minima. Corrupt one and it falls back to the memory, one neuron at a time.
      </p>
    {/if}
  </div>
</div>

<style>
  .hopfield {
    display: grid;
    gap: var(--space-l);
    align-items: start;
  }

  .hopfield__grid {
    display: block;
    width: 100%;
    max-width: 22rem;
    border-radius: var(--radius-m);
    background: var(--color-bg);
    touch-action: none;
    cursor: crosshair;
  }

  rect {
    fill: var(--color-rule);
    transition: fill var(--dur-fast) var(--ease);
  }

  rect.on {
    fill: var(--color-text);
  }

  rect.flip {
    fill: var(--color-accent);
  }

  .hopfield__side {
    display: grid;
    gap: var(--space-s);
    min-width: 0;
  }

  .hopfield__memories {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2xs);
  }

  .hopfield__memory {
    width: var(--tap);
    height: var(--tap);
    padding: 5px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-m);
    background: var(--color-bg);
    cursor: pointer;
  }

  .hopfield__memory svg {
    display: block;
    width: 100%;
    height: 100%;
  }

  .hopfield__memory rect {
    fill: var(--color-text);
    transition: none;
  }

  .hopfield__energy {
    margin: 0;
  }

  .hopfield__energy svg {
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

  @media (min-width: 44rem) {
    .hopfield {
      grid-template-columns: minmax(0, 22rem) minmax(0, 1fr);
    }
  }
</style>
