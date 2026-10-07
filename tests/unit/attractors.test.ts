import { describe, expect, it } from 'vitest';
import { centre, lorenz, project, rossler, trajectory, upright } from '../../src/lib/attractors.ts';
import { rk4 } from '../../src/lib/ode.ts';

describe('rk4', () => {
  it('solves y′ = −y to high accuracy', () => {
    let y = [1];
    for (let i = 0; i < 100; i++) y = rk4(([v]) => [-v], y, 0.01);
    expect(y[0]).toBeCloseTo(Math.exp(-1), 9);
  });

  it('keeps a harmonic oscillator on its circle', () => {
    let s = [1, 0];
    for (let i = 0; i < 628; i++) s = rk4(([x, v]) => [v, -x], s, 0.01);
    expect(Math.hypot(s[0], s[1])).toBeCloseTo(1, 6);
  });
});

describe('lorenz', () => {
  it('has fixed points at (±√(β(ρ−1)), ±√(β(ρ−1)), ρ−1)', () => {
    const beta = 8 / 3;
    const c = Math.sqrt(beta * 27);
    for (const s of [1, -1]) {
      const d = lorenz()([s * c, s * c, 27]);
      for (const v of d) expect(Math.abs(v)).toBeLessThan(1e-9);
    }
  });

  it('stays on the bounded butterfly after the transient', () => {
    for (const [x, y, z] of trajectory(lorenz(), [1, 1, 1], 0.005, 4000, 1000)) {
      expect(Math.abs(x)).toBeLessThan(25);
      expect(Math.abs(y)).toBeLessThan(30);
      expect(z).toBeGreaterThan(0);
      expect(z).toBeLessThan(55);
    }
  });
});

describe('rossler', () => {
  it('stays bounded', () => {
    for (const p of trajectory(rossler(), [1, 1, 0], 0.02, 4000, 500)) for (const v of p) expect(Math.abs(v)).toBeLessThan(40);
  });
});

describe('projection helpers', () => {
  it('projects unchanged with zero rotation', () => {
    expect(project([[1, 2, 3]], 0, 0)[0]).toEqual({ x: 1, y: 2, depth: 3 });
  });

  it('preserves distances from the origin under rotation', () => {
    const [p] = project([[1, 2, 3]], 0.7, -0.4);
    expect(Math.hypot(p.x, p.y, p.depth)).toBeCloseTo(Math.hypot(1, 2, 3), 12);
  });

  it('centres a point cloud on its bounding box', () => {
    const c = centre([
      [0, 0, 0],
      [2, 4, 6],
    ]);
    expect(c).toEqual([
      [-1, -2, -3],
      [1, 2, 3],
    ]);
  });

  it('puts the chosen axis vertical', () => {
    expect(upright([[1, 2, 3]], 2)[0]).toEqual([1, -3, 2]);
    expect(upright([[1, 2, 3]], 1)[0]).toEqual([1, 2, 3]);
  });
});
