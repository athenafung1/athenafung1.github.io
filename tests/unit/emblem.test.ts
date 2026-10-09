import { describe, expect, it } from 'vitest';
import { emblemParams, emblemPoints, hash } from '../../src/lib/emblem.ts';

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

describe('project emblems', () => {
  it('hashes deterministically, and different slugs differently', () => {
    expect(hash('smart-legos')).toBe(hash('smart-legos'));
    expect(hash('smart-legos')).not.toBe(hash('caster-ddi'));
  });

  it('gives each slug the same parameters every time, never the site mark’s five petals', () => {
    for (const slug of ['smart-legos', 'caster-ddi', 'scheduling-optimizer', 'a', 'another-project']) {
      const p = emblemParams(slug);
      expect(emblemParams(slug)).toEqual(p);
      expect(p.petals).not.toBe(5);
      expect(p.f1 + p.f2).toBe(p.petals);
      expect(gcd(p.f1, p.f2)).toBe(1);
      expect(p.lobes % p.petals).toBe(0);
    }
  });

  it('gives the current projects visibly different emblems', () => {
    const params = ['smart-legos', 'caster-ddi', 'scheduling-optimizer'].map((slug) => emblemParams(slug));
    const signatures = new Set(params.map((p) => `${p.petals}/${p.f1}/${p.ratio.toFixed(2)}`));
    expect(signatures.size).toBe(3);
  });

  it('starts and ends at the hub, points its first petal up, and stays inside the unit circle', () => {
    for (const slug of ['smart-legos', 'caster-ddi', 'scheduling-optimizer']) {
      const p = emblemParams(slug);
      const points = emblemPoints(p, 2000);
      const r = (q: { x: number; y: number }) => Math.hypot(q.x, q.y);
      const hub = (1 - p.ratio) / (1 + p.ratio);
      expect(r(points[0])).toBeCloseTo(hub, 9);
      expect(r(points[points.length - 1])).toBeCloseTo(hub / 4, 9);
      for (const q of points) expect(r(q)).toBeLessThanOrEqual(1 + 1e-12);
      const firstLap = points.slice(0, Math.ceil(2000 / (p.lobes)));
      const tip = firstLap.reduce((best, q) => (r(q) > r(best) ? q : best));
      expect(Math.atan2(tip.y, tip.x)).toBeCloseTo(-Math.PI / 2, 1);
    }
  });
});
