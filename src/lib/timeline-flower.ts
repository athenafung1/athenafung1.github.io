// The About timeline's harmonograph: one spinning circle per entry, added end to end like the
// Fourier sketch's chain, with a pen at the end tracing the figure. Pure, framework-free, erasable
// TypeScript; src/islands/about/TimelineFlower.svelte draws it.
//
// Circles are numbered newest first. The current role has the largest circle and the one before it
// the next largest, and together (frequencies 2 and −3) they draw the five petals of the site mark.
// Every older entry's circle is smaller than the one after it and keeps the five-fold symmetry
// (frequencies ≡ 2 mod 5), so each one adds texture rather than changing the outline. A circle is
// present from its entry's start date, so a newest-first list scrolled from the bottom up adds one
// circle per entry and finishes on the whole flower.
import { clamp } from './timeline.ts';

export type FlowerTerm = {
  id: string;
  /** Its entry's start, in decimal years. */
  start: number;
  /** Turns per winding of the figure; negative turns the other way. */
  freq: number;
  /** Radius, relative to the current role's circle. */
  amp: number;
  /** Starting angle, in radians. */
  phase: number;
};

/** How fast the figure shrinks toward its centre, per radian of pen time. */
export const FLOWER_DAMPING = 0.01;
/** Pen time for the whole figure: 22 windings. */
export const FLOWER_SPAN = 22 * 2 * Math.PI;
/** A circle fades in over this long, finishing at its entry's start. */
export const STEP_YEARS = 0.12;
/** Tiny offsets so the line never exactly retraces itself, which gives the petals their banding. */
const DETUNE = [0, 0.015, 0, 0, 0, 0.01];

/** Frequency of circle i (newest first): 2, −3, 7, −8, 12, −13, … */
export const flowerFreq = (i: number) => (i % 2 === 0 ? 2 + 5 * (i / 2) : -(3 + 5 * ((i - 1) / 2)));

/** Size of circle i (newest first): 1, 0.85, then 0.3 down by 0.05 a step to a floor of 0.1. */
export const flowerAmp = (i: number) => (i === 0 ? 1 : i === 1 ? 0.85 : Math.max(10, 30 - 5 * (i - 2)) / 100);

/** One circle per entry, `newestFirst` as the list shows them. */
export function flowerTerms(newestFirst: { id: string; start: number }[]): FlowerTerm[] {
  return newestFirst.map((entry, i) => ({
    id: entry.id,
    start: entry.start,
    freq: flowerFreq(i) + (DETUNE[i] ?? 0),
    amp: flowerAmp(i),
    phase: i * 0.7,
  }));
}

/** How present a circle is at time t: 0 until shortly before its entry starts, 1 from then on. */
export function presence(t: number, start: number): number {
  const x = clamp((t - start + STEP_YEARS) / STEP_YEARS);
  return x * x * (3 - 2 * x);
}

/** Angle of a circle's arm at pen-time s. */
export const armAngle = (term: FlowerTerm, s: number) => term.freq * s + term.phase;

/** The pen's offset from the centre at pen-time s, before scaling: every arm end to end, shrinking slowly. */
export function penOffset(terms: FlowerTerm[], weights: number[], s: number): { x: number; y: number } {
  const decay = Math.exp(-FLOWER_DAMPING * s);
  let x = 0;
  let y = 0;
  terms.forEach((term, i) => {
    if (!weights[i]) return;
    const angle = armAngle(term, s);
    x += term.amp * weights[i] * Math.cos(angle);
    y += term.amp * weights[i] * Math.sin(angle);
  });
  return { x: x * decay, y: y * decay };
}

/**
 * How far the finished flower (every circle present) reaches from its centre. The circles rarely line
 * up, so this is measured from the curve rather than taken as the sum of their sizes.
 */
export function flowerReach(terms: FlowerTerm[], samples = 3000): number {
  const all = terms.map(() => 1);
  let reach = 0;
  for (let k = 0; k < samples; k++) {
    const o = penOffset(terms, all, (FLOWER_SPAN * k) / (samples - 1));
    reach = Math.max(reach, Math.hypot(o.x, o.y));
  }
  return reach;
}
