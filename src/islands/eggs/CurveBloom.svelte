<script lang="ts">
  // Easter egg (FR-019): rose curves r = cos(kθ) bloom from the trigger point and fade away.
  // Mounted on demand by src/scripts/eggs.ts into a pointer-transparent overlay; ends on its own.
  import { normalizeToViewBox, rose, toSvgPath } from '../../lib/curves.ts';

  let {
    reducedMotion = false,
    origin = { x: 0, y: 0 },
    onEnd,
  }: { reducedMotion?: boolean; origin?: { x: number; y: number }; onEnd?: () => void } = $props();

  const petals = [2, 3, 4, 5, 6, 7].map((k, i) => ({
    k,
    d: toSvgPath(normalizeToViewBox(rose(k, 361), 200, 200, 4), { closed: true }),
    delay: i * 140,
    turn: i * 23,
  }));
  const still = petals[3];
</script>

{#if reducedMotion}
  <div class="egg-card" role="status">
    <svg viewBox="0 0 200 200" width="72" height="72" aria-hidden="true">
      <path d={still.d}></path>
    </svg>
    <div>
      <p class="egg-card__title">You found an easter egg.</p>
      <p class="egg-card__text">Rose curves: <i>r</i> = cos(<i>k</i>θ). Odd <i>k</i> gives <i>k</i> petals, even <i>k</i> gives 2<i>k</i>.</p>
    </div>
    <button type="button" class="egg-close" onclick={() => onEnd?.()}>Close</button>
  </div>
{:else}
  <div class="bloom" style:left="{origin.x}px" style:top="{origin.y}px" aria-hidden="true">
    {#each petals as petal (petal.k)}
      <svg class="petal" viewBox="0 0 200 200" style:--delay="{petal.delay}ms" style:--turn="{petal.turn}deg">
        <path d={petal.d}></path>
      </svg>
    {/each}
  </div>
  <p class="visually-hidden" role="status">Easter egg: rose curves bloom across the page.</p>
  <button type="button" class="egg-close egg-close--floating" onclick={() => onEnd?.()}>
    Close<span class="visually-hidden"> easter egg</span>
  </button>
{/if}

<style>
  .bloom {
    position: fixed;
    width: min(90vmin, 44rem);
    aspect-ratio: 1;
    translate: -50% -50%;
    pointer-events: none;
  }

  .petal {
    position: absolute;
    inset: 0;
    opacity: 0;
    animation: bloom 3.2s cubic-bezier(0.2, 0.7, 0.2, 1) var(--delay) both;
  }

  path {
    fill: none;
    stroke: var(--color-accent);
    stroke-width: 1.4;
    vector-effect: non-scaling-stroke;
  }

  @keyframes bloom {
    0% {
      transform: scale(0.05) rotate(var(--turn));
      opacity: 0;
    }
    20% {
      opacity: 0.95;
    }
    70% {
      opacity: 0.6;
    }
    100% {
      transform: scale(1) rotate(calc(var(--turn) + 72deg));
      opacity: 0;
    }
  }

  .egg-close {
    pointer-events: auto;
    min-height: 2.75rem;
    padding: 0 1.1em;
    border: 1px solid var(--color-border);
    border-radius: 999px;
    background: var(--color-surface);
    color: var(--color-text);
    font: inherit;
    font-weight: 600;
    cursor: pointer;
  }

  .egg-close--floating {
    position: fixed;
    inset-inline-end: max(1rem, env(safe-area-inset-right));
    inset-block-end: max(1rem, env(safe-area-inset-bottom));
  }

  /* A small corner card: only its Close button takes input, so nothing underneath is blocked. */
  .egg-card {
    pointer-events: none;
    position: fixed;
    inset-inline-end: max(1rem, env(safe-area-inset-right));
    inset-block-end: max(1rem, env(safe-area-inset-bottom));
    width: min(21rem, calc(100vw - 2rem));
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 0.75rem 1rem;
    align-items: center;
    padding: 1rem;
    border: 1px solid var(--color-border);
    border-radius: 1rem;
    background: var(--color-surface);
    color: var(--color-text);
    box-shadow: 0 0.5rem 2rem rgb(0 0 0 / 0.18);
  }

  .egg-card .egg-close {
    grid-column: 1 / -1;
    justify-self: end;
  }

  .egg-card__title {
    margin: 0;
    font-family: var(--font-display);
    font-weight: 600;
  }

  .egg-card__text {
    margin: 0.25rem 0 0;
    font-size: 0.9rem;
    color: var(--color-muted);
  }

  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }
</style>
