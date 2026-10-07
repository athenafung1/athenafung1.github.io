import { describe, expect, it } from 'vitest';
import { DEFAULT_PENDULUM, bobs, doublePendulum, pendulumEnergy } from '../../src/lib/pendulum.ts';
import { rk4 } from '../../src/lib/ode.ts';
import { estimatePi, sample, standardError } from '../../src/lib/montecarlo.ts';
import { mulberry32 } from '../../src/lib/random.ts';

const simulate = (state: number[], dt: number, steps: number) => {
  const f = doublePendulum();
  let s = state;
  for (let i = 0; i < steps; i++) s = rk4(f, s, dt);
  return s;
};

describe('double pendulum', () => {
  it('stays at rest when hanging straight down', () => {
    expect(simulate([0, 0, 0, 0], 0.001, 1000).every((v) => Math.abs(v) < 1e-12)).toBe(true);
  });

  it('conserves energy in a chaotic swing', () => {
    const start = [2.0, 0, 2.5, 0];
    const e0 = pendulumEnergy(start);
    const end = simulate(start, 0.0005, 20000); // 10 s
    expect(Math.abs((pendulumEnergy(end) - e0) / e0)).toBeLessThan(1e-4);
  });

  it('shows sensitive dependence: a 0.001 rad difference grows by orders of magnitude', () => {
    const a = simulate([2.0, 0, 2.5, 0], 0.001, 15000);
    const b = simulate([2.001, 0, 2.5, 0], 0.001, 15000);
    const pa = bobs(a);
    const pb = bobs(b);
    expect(Math.hypot(pa.x2 - pb.x2, pa.y2 - pb.y2)).toBeGreaterThan(0.1);
  });

  it('places bobs at rod lengths from the pivot', () => {
    const { x1, y1, x2, y2 } = bobs([0.4, 0, -0.9, 0]);
    expect(Math.hypot(x1, y1)).toBeCloseTo(DEFAULT_PENDULUM.l1, 12);
    expect(Math.hypot(x2 - x1, y2 - y1)).toBeCloseTo(DEFAULT_PENDULUM.l2, 12);
  });
});

describe('Monte Carlo π', () => {
  it('converges to π within a few standard errors', () => {
    const rand = mulberry32(2024);
    let inside = 0;
    const n = 200000;
    for (let i = 0; i < n; i++) if (sample(rand).inside) inside++;
    expect(Math.abs(estimatePi(inside, n) - Math.PI)).toBeLessThan(4 * standardError(n));
  });

  it('handles zero samples', () => {
    expect(estimatePi(0, 0)).toBe(0);
    expect(standardError(0)).toBe(Number.POSITIVE_INFINITY);
  });
});
