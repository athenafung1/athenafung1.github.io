<script lang="ts">
  // The About timeline's harmonograph (maths in src/lib/timeline-flower.ts): a circle per entry,
  // chained from the first entry's at the centre out to the current role's, which holds the pen. A
  // circle is present from its entry's start, so the figure has one circle at the bottom of the list
  // and the whole flower at the top. The faint outline is the finished flower; the lit entry's circle
  // and arm are drawn in the accent and the other circles fade back.
  import { onMount } from 'svelte';
  import { FLOWER_DAMPING, FLOWER_SPAN, armAngle, flowerReach, flowerTerms, penOffset, presence } from '../../lib/timeline-flower.ts';
  import { createLoop, prefersReducedMotion } from '../canvas-kit.ts';
  import type { TimelineState } from './timeline.svelte.ts';

  let { timeline }: { timeline: TimelineState } = $props();

  const W = 400;
  const H = 410;
  const C = { x: 200, y: 205 };
  const SAMPLES = 3000;
  const PEN_SPEED = (2 * Math.PI) / 24000; // one winding every 24 s

  // svelte-ignore state_referenced_locally
  const terms = flowerTerms(timeline.listed);
  const all = terms.map(() => 1);
  // Fixed scale: the finished flower just fills the frame, so the figure visibly grows into it.
  const SCALE = 178 / flowerReach(terms, SAMPLES);
  // The chain is drawn from the oldest circle out; the pen lands in the same place either way.
  const drawOrder = terms.map((_, i) => terms.length - 1 - i);

  const pen = (weights: number[], s: number) => {
    const o = penOffset(terms, weights, s);
    return { x: C.x + o.x * SCALE, y: C.y + o.y * SCALE };
  };

  const curvePath = (weights: number[], from: number, to: number, samples: number) => {
    let d = '';
    for (let k = 0; k < samples; k++) {
      const p = pen(weights, from + ((to - from) * k) / (samples - 1));
      d += `${k ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
    }
    return d;
  };

  const weights = $derived(terms.map((term) => presence(timeline.time, term.start)));
  const curve = $derived(weights.some(Boolean) ? curvePath(weights, 0, FLOWER_SPAN, SAMPLES) : '');
  const ghost = curvePath(all, 0, FLOWER_SPAN, SAMPLES);
  // The faint outline only shows what's still to come, so a finished flower (the top of the list, and
  // the page as first served) skips it rather than drawing the same path twice.
  const complete = $derived(weights.every((w) => w === 1));

  // The live pen: where it is along the figure, and the chain of circles that puts it there.
  let s = $state(FLOWER_SPAN * 0.04);
  const chain = $derived.by(() => {
    const decay = Math.exp(-FLOWER_DAMPING * s);
    let x = C.x;
    let y = C.y;
    return drawOrder.map((i) => {
      const term = terms[i];
      const r = term.amp * weights[i] * decay * SCALE;
      const angle = armAngle(term, s);
      const from = { x, y };
      x += r * Math.cos(angle);
      y += r * Math.sin(angle);
      return { term, r, from, to: { x, y } };
    });
  });
  const tip = $derived(chain.length ? chain[chain.length - 1].to : null);
  const trail = $derived(weights.some(Boolean) ? curvePath(weights, Math.max(0, s - Math.PI), s, 120) : '');

  let svg: SVGSVGElement;
  onMount(() => {
    if (prefersReducedMotion()) return;
    const loop = createLoop(svg, (dt) => {
      s += dt * PEN_SPEED;
      if (s > FLOWER_SPAN) s = 0;
    });
    loop.setPlaying(true);
    return loop.destroy;
  });
</script>

<svg class="flower" viewBox="0 0 {W} {H}" aria-hidden="true" preserveAspectRatio="xMidYMid meet" bind:this={svg}>
  {#if !complete}<path class="flower__ghost" d={ghost} />{/if}
  {#if curve}<path class="flower__curve" d={curve} />{/if}
  {#if trail}<path class="flower__trail" d={trail} />{/if}

  {#each chain as link (link.term.id)}
    {#if link.r > 0.3}
      <g data-entry={link.term.id} class="flower__link" class:lit={timeline.isLit(link.term.id)}>
        <circle class="flower__hit" cx={link.from.x} cy={link.from.y} r={link.r} />
        <circle class="flower__circle" cx={link.from.x} cy={link.from.y} r={link.r} />
        <line class="flower__arm" x1={link.from.x} y1={link.from.y} x2={link.to.x} y2={link.to.y} />
      </g>
    {/if}
  {/each}
  {#if tip}<circle class="flower__pen" cx={tip.x} cy={tip.y} r="3" />{/if}
</svg>

<style>
  .flower {
    display: block;
    width: 100%;
    height: 100%;
    overflow: visible;
    -webkit-user-select: none;
    user-select: none;
  }

  .flower__ghost {
    fill: none;
    stroke: var(--color-rule);
    stroke-width: 0.5;
  }

  .flower__curve {
    fill: none;
    stroke: var(--color-curve);
    stroke-width: 0.6;
    opacity: 0.75;
  }

  .flower__trail {
    fill: none;
    stroke: var(--color-text);
    stroke-width: 1;
    stroke-linecap: round;
    opacity: 0.6;
  }

  .flower__link {
    cursor: pointer;
  }

  /* A wide invisible ring around each circle, so it's easy to point at. */
  .flower__hit {
    fill: none;
    stroke: transparent;
    stroke-width: 14;
    pointer-events: stroke;
  }

  .flower__circle {
    fill: none;
    stroke: var(--color-border);
    stroke-width: 0.8;
    opacity: 0.35;
  }

  .flower__arm {
    stroke: var(--color-muted);
    stroke-width: 1;
  }

  .flower__link.lit .flower__circle {
    stroke: var(--color-accent);
    stroke-width: 2.2;
    opacity: 1;
  }

  .flower__link.lit .flower__arm {
    stroke: var(--color-accent);
    stroke-width: 2;
  }

  .flower__pen {
    fill: var(--color-text);
  }
</style>
