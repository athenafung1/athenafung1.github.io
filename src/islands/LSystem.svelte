<script lang="ts">
  // Koch snowflake and Sierpinski triangle grown from L-system rewriting rules. SVG, so the
  // server-rendered markup is also the no-JS fallback; controls appear once hydrated.
  import { onMount } from 'svelte';
  import { normalizeToViewBox, toSvgPath } from '../lib/curves.ts';
  import { KOCH_SNOWFLAKE, SIERPINSKI_ARROWHEAD, arrowheadStartAngle, expand, turtle, type LSystem } from '../lib/lsystem.ts';
  import { prefersReducedMotion } from './canvas-kit.ts';

  const SYSTEMS: Record<string, { label: string; system: LSystem; rule: string; closed: boolean }> = {
    koch: { label: 'Koch snowflake', system: KOCH_SNOWFLAKE, rule: 'F → F+F−−F+F', closed: true },
    sierpinski: { label: 'Sierpinski triangle', system: SIERPINSKI_ARROWHEAD, rule: 'A → B−A−B, B → A+B+A', closed: false },
  };
  const W = 600;
  const H = 540;

  let mounted = $state(false);
  let id = $state<'koch' | 'sierpinski'>('koch');
  let depth = $state(4);
  let generation = $state(0); // bumps to replay the draw animation
  let building = $state(false);
  let timer = 0;

  const current = $derived(SYSTEMS[id]);
  const commands = $derived(expand(current.system.axiom, current.system.rules, depth));
  const segments = $derived([...commands].filter((c) => current.system.draw.includes(c)).length);
  const d = $derived.by(() => {
    const start = id === 'sierpinski' ? arrowheadStartAngle(depth) : current.system.startAngle ?? 0;
    const points = turtle(commands, current.system.angle, current.system.draw, start);
    return toSvgPath(normalizeToViewBox(points, W, H, 24), { closed: current.closed });
  });

  function choose(next: 'koch' | 'sierpinski') {
    stopBuild();
    id = next;
    depth = Math.min(depth, SYSTEMS[next].system.maxDepth);
    generation++;
  }

  function stopBuild() {
    window.clearTimeout(timer);
    building = false;
  }

  /** Grow from depth 0 up to the chosen depth, one rewriting step at a time. */
  function build() {
    stopBuild();
    const target = depth;
    if (prefersReducedMotion()) return;
    building = true;
    depth = 0;
    generation++;
    const next = () => {
      if (depth >= target) return stopBuild();
      depth++;
      generation++;
      timer = window.setTimeout(next, 1100);
    };
    timer = window.setTimeout(next, 1100);
  }

  onMount(() => {
    mounted = true;
    return stopBuild;
  });
</script>

<div class="piece-body">
  <svg class="lsys" viewBox="0 0 {W} {H}" role="img" aria-label="{current.label} at depth {depth}, {segments} line segments">
    {#key generation}
      <path {d} pathLength="1" class:lsys__draw={mounted}></path>
    {/key}
  </svg>
  <p class="piece-status">
    {current.label} · depth {depth} · {segments.toLocaleString()} segments · rule {current.rule}
  </p>
  {#if mounted}
    <div class="controls">
      <div class="controls__group" role="group" aria-label="Shape">
        <button type="button" class="chip" aria-pressed={id === 'koch'} onclick={() => choose('koch')}>Koch</button>
        <button type="button" class="chip" aria-pressed={id === 'sierpinski'} onclick={() => choose('sierpinski')}>Sierpinski</button>
      </div>
      <label class="range">
        <span class="label">Depth</span>
        <input
          type="range"
          min="0"
          max={current.system.maxDepth}
          bind:value={depth}
          oninput={() => (stopBuild(), generation++)}
        />
        <output>{depth}</output>
      </label>
      <button type="button" class="button button--primary" onclick={build} disabled={building}>
        {building ? 'Building…' : 'Build it up'}
      </button>
    </div>
  {/if}
</div>

<style>
  .lsys {
    display: block;
    width: 100%;
    max-height: 26rem;
    border-radius: var(--radius-m);
    background: var(--color-bg);
  }

  path {
    fill: none;
    stroke: var(--color-accent);
    stroke-width: 1.4;
    stroke-linejoin: round;
    vector-effect: non-scaling-stroke;
  }

  .lsys__draw {
    stroke-dasharray: 1;
    stroke-dashoffset: 1;
    animation: lsys-draw 1s ease-in-out forwards;
  }

  @keyframes lsys-draw {
    to {
      stroke-dashoffset: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .lsys__draw {
      animation: none;
      stroke-dashoffset: 0;
    }
  }
</style>
