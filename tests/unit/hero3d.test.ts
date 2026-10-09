import { describe, expect, it } from 'vitest';
import { project, type Vec3 } from '../../src/lib/attractors.ts';
import { HERO_HARMONOGRAPH, harmonograph } from '../../src/lib/curves.ts';
import { HERO_TWIST, heroPoints, lengthFractions, radius, resample, rollAbout } from '../../src/lib/hero3d.ts';

describe('hero curve in 3-D', () => {
  const points = heroPoints(1800);

  it('is exactly the flat curve when seen face-on', () => {
    const flat = harmonograph(HERO_HARMONOGRAPH, 1800);
    project(points, 0, 0).forEach((p, i) => {
      expect(p.x).toBeCloseTo(flat[i].x, 12);
      expect(p.y).toBeCloseTo(flat[i].y, 12);
    });
  });

  it('twists each petal: depth at most TWIST·r, raised on the clockwise side of the top petal', () => {
    const outer = radius(points) * 0.5;
    for (const [x, y, z] of points) {
      const r = Math.hypot(x, y);
      expect(Math.abs(z)).toBeLessThanOrEqual(HERO_TWIST * r + 1e-12);
      if (r < outer) continue;
      const fromUp = Math.atan2(y, x) + Math.PI / 2; // angle from the top petal's centreline
      // Screen y grows downward, so a positive angle from the centreline is the clockwise side.
      if (fromUp > 0.02 && fromUp < 0.3) expect(z).toBeGreaterThan(0);
      if (fromUp < -0.02 && fromUp > -0.3) expect(z).toBeLessThan(0);
    }
  });

  it('spins like a pinwheel: each point turns by the angle about the hub, depth unchanged', () => {
    const spun = rollAbout(points, 0.7);
    spun.forEach(([x, y, z], i) => {
      const [x0, y0, z0] = points[i];
      expect(z).toBe(z0);
      expect(Math.hypot(x, y)).toBeCloseTo(Math.hypot(x0, y0), 12);
      if (Math.hypot(x0, y0) > 1e-6) {
        const turned = Math.atan2(y, x) - Math.atan2(y0, x0);
        expect(Math.cos(turned)).toBeCloseTo(Math.cos(0.7), 9);
        expect(Math.sin(turned)).toBeCloseTo(Math.sin(0.7), 9);
      }
    });
    rollAbout(spun, -0.7).forEach((p, i) => p.forEach((v, k) => expect(v).toBeCloseTo(points[i][k], 12)));
  });

  it('fits inside radius() at every angle it can turn to', () => {
    const r = radius(points);
    for (const [yaw, pitch] of [[0, 0], [0.45, 0.3], [1.57, 0], [2.4, -1.2], [4, 1.4]]) {
      for (const p of project(points, yaw, pitch)) expect(Math.hypot(p.x, p.y)).toBeLessThanOrEqual(r + 1e-9);
    }
  });
});

describe('resampling by arc length', () => {
  it('turns an unevenly sampled line into evenly spaced points', () => {
    const line: Vec3[] = [0, 0.1, 0.15, 0.6, 0.65, 1].map((x) => [x * 10, 0, 0]);
    const { points, at } = resample(line, lengthFractions(line), 11);
    points.forEach((p, i) => expect(p[0]).toBeCloseTo(i, 9));
    expect(at[0]).toBe(0);
    expect(at[10]).toBe(1);
  });

  it('measures length fractions from 0 to 1, never decreasing', () => {
    const at = lengthFractions(heroPoints(600));
    expect(at[0]).toBe(0);
    expect(at[at.length - 1]).toBeCloseTo(1, 12);
    for (let i = 1; i < at.length; i++) expect(at[i]).toBeGreaterThanOrEqual(at[i - 1]);
  });
});
