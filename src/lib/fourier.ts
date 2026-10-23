// Discrete Fourier transform of a closed 2-D path, treated as complex samples z = x + iy.
// Used at build time (FourierFallback.astro) and at runtime (FourierSketch.svelte).
import type { Point } from './curves.ts';

export type Coefficient = {
  /** Signed frequency: whole turns per cycle (negative = clockwise). */
  frequency: number;
  re: number;
  im: number;
  amplitude: number;
  phase: number;
};

export type Epicycle = { center: Point; radius: number; tip: Point };

/** `n` points evenly spaced along the arc length of the closed polygon, starting at points[0]. */
export function resample(points: Point[], n: number): Point[] {
  const path = points.filter((p, i) => i === 0 || p.x !== points[i - 1].x || p.y !== points[i - 1].y);
  if (path.length < 2) return Array.from({ length: n }, () => ({ ...(path[0] ?? { x: 0, y: 0 }) }));
  const closed = [...path, path[0]];
  const cumulative = [0];
  for (let i = 1; i < closed.length; i++) {
    cumulative.push(cumulative[i - 1] + Math.hypot(closed[i].x - closed[i - 1].x, closed[i].y - closed[i - 1].y));
  }
  const total = cumulative[cumulative.length - 1];
  const result: Point[] = [];
  let segment = 1;
  for (let k = 0; k < n; k++) {
    const target = (total * k) / n;
    while (segment < closed.length - 1 && cumulative[segment] < target) segment++;
    const start = closed[segment - 1];
    const end = closed[segment];
    const length = cumulative[segment] - cumulative[segment - 1];
    const f = length === 0 ? 0 : (target - cumulative[segment - 1]) / length;
    result.push({ x: start.x + (end.x - start.x) * f, y: start.y + (end.y - start.y) * f });
  }
  return result;
}

/** X_k = (1/N) Σ z_n e^(−2πikn/N), reported with signed frequencies in (−N/2, N/2]. */
export function dft(points: Point[]): Coefficient[] {
  const n = points.length;
  const coefficients: Coefficient[] = [];
  for (let k = 0; k < n; k++) {
    let re = 0;
    let im = 0;
    for (let j = 0; j < n; j++) {
      const angle = (-2 * Math.PI * k * j) / n;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      re += points[j].x * cos - points[j].y * sin;
      im += points[j].x * sin + points[j].y * cos;
    }
    re /= n;
    im /= n;
    coefficients.push({
      frequency: k <= n / 2 ? k : k - n,
      re,
      im,
      amplitude: Math.hypot(re, im),
      phase: Math.atan2(im, re),
    });
  }
  return coefficients;
}

export function sortByAmplitude(coefficients: Coefficient[]): Coefficient[] {
  return [...coefficients].sort((a, b) => b.amplitude - a.amplitude);
}

/** Circles for the first `terms` coefficients at time t ∈ [0, 1), chained tip to centre. */
export function epicycleChain(coefficients: Coefficient[], terms: number, t: number): Epicycle[] {
  const chain: Epicycle[] = [];
  let x = 0;
  let y = 0;
  for (const c of coefficients.slice(0, terms)) {
    const angle = 2 * Math.PI * c.frequency * t + c.phase;
    const center = { x, y };
    x += c.amplitude * Math.cos(angle);
    y += c.amplitude * Math.sin(angle);
    chain.push({ center, radius: c.amplitude, tip: { x, y } });
  }
  return chain;
}

/** The point drawn by the first `terms` coefficients at time t ∈ [0, 1). */
export function reconstruct(coefficients: Coefficient[], terms: number, t: number): Point {
  const chain = epicycleChain(coefficients, terms, t);
  return chain.length ? chain[chain.length - 1].tip : { x: 0, y: 0 };
}
