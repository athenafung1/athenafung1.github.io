// Generated project emblems: one small harmonograph per project, from the same family as the hero
// curve (two circular swings turning in opposite directions), with every parameter drawn from a hash of
// the project's slug. Each project gets its own mark, and the same slug always gets the same one.
//
// Concept: z(t) = e^(−dt) · (e^(i·f₁t) + b·e^(i(π − f₂t))), two arrows spinning opposite ways. The
// curve reaches out when they line up and returns to the hub when they oppose; opposite turns at f₁ and
// f₂ line up f₁ + f₂ times a lap, so f₁ + f₂ = petals (with gcd(f₁, f₂) = 1 so no petal repeats). The
// inner swing b sets the petal shape (low: a spiky star; 1: rose petals through the hub), a small
// detune makes each lap land slightly turned so the petals fan out, and damping spirals it inward.
//
// How this code works: hash() turns the slug into a seed for mulberry32; emblemParams() draws the
// parameters (never five petals, which belong to the site mark); emblemPoints() samples the curve,
// starting and ending at the hub so every petal is closed, rotated so the first petal points up, and
// scaled into the unit circle.
import type { Point } from './curves.ts';
import { mulberry32 } from './random.ts';

export type EmblemParams = {
  petals: number;
  f1: number;
  f2: number;
  /** Inner swing relative to the outer one. */
  ratio: number;
  /** Extra frequency on the second swing; makes the petals fan out. */
  detune: number;
  /** Hub-to-hub passes in total (laps × petals). */
  lobes: number;
};

/** FNV-1a: a fast, well-spread 32-bit hash of a string. */
export function hash(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
const PETALS = [3, 4, 6, 7, 8, 9]; // 5 is the site mark's

export function emblemParams(seed: string): EmblemParams {
  const rand = mulberry32(hash(seed));
  const pick = <T>(items: T[]) => items[Math.floor(rand() * items.length)];
  const petals = pick(PETALS);
  const f1 = pick(Array.from({ length: petals - 1 }, (_, i) => i + 1).filter((f) => gcd(f, petals) === 1));
  return {
    petals,
    f1,
    f2: petals - f1,
    ratio: 0.6 + 0.4 * rand(),
    detune: 0.004 + 0.012 * rand(),
    // Three or four laps: enough to fan, few enough to stay legible at card size.
    lobes: petals * (3 + Math.floor(rand() * 2)),
  };
}

/** The emblem as points in the unit circle (screen coordinates: y grows downward). */
export function emblemPoints(p: EmblemParams, samples: number): Point[] {
  const F = p.f1 + p.f2 + p.detune;
  // Hubs (swings opposed) fall every 2π/F; ending after a whole number of them closes the last petal.
  const T = (p.lobes * 2 * Math.PI) / F;
  // The last petal is drawn at a quarter of the first one's size.
  const damping = Math.log(4) / T;
  // The first tip (swings aligned) comes at t = π/F, pointing at f₁·π/F; turn that to straight up.
  const turn = -Math.PI / 2 - (p.f1 * Math.PI) / F;
  const scale = 1 / (1 + p.ratio);
  return Array.from({ length: samples }, (_, i) => {
    const t = (T * i) / (samples - 1);
    const e = Math.exp(-damping * t) * scale;
    const a = p.f1 * t + turn;
    const b = Math.PI - (p.f2 + p.detune) * t + turn;
    return { x: e * (Math.cos(a) + p.ratio * Math.cos(b)), y: e * (Math.sin(a) + p.ratio * Math.sin(b)) };
  });
}
