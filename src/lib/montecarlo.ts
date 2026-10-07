// Monte Carlo estimate of π: the fraction of uniform points in the unit square that land inside
// the quarter circle x² + y² ≤ 1 tends to π/4.

export type Sample = { x: number; y: number; inside: boolean };

export function sample(rand: () => number): Sample {
  const x = rand();
  const y = rand();
  return { x, y, inside: x * x + y * y <= 1 };
}

export function estimatePi(inside: number, total: number): number {
  return total === 0 ? 0 : (4 * inside) / total;
}

/** One standard error of the estimate: 4·sqrt(p(1 − p)/n) with p = π/4. */
export function standardError(total: number): number {
  const p = Math.PI / 4;
  return total === 0 ? Number.POSITIVE_INFINITY : 4 * Math.sqrt((p * (1 - p)) / total);
}
