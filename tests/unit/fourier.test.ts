import { describe, expect, it } from 'vitest';
import { dft, epicycleChain, reconstruct, resample, sortByAmplitude } from '../../src/lib/fourier.ts';
import { PRESETS } from '../../src/lib/presets.ts';
import type { Point } from '../../src/lib/curves.ts';

const dist = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

const circle = (n: number): Point[] =>
  Array.from({ length: n }, (_, i) => ({ x: Math.cos((2 * Math.PI * i) / n), y: Math.sin((2 * Math.PI * i) / n) }));

const square: Point[] = [
  { x: -1, y: -1 },
  { x: 1, y: -1 },
  { x: 1, y: 1 },
  { x: -1, y: 1 },
];

describe('resample', () => {
  it('returns n points spaced evenly along the closed path', () => {
    const points = resample(square, 64);
    expect(points).toHaveLength(64);
    const step = 8 / 64; // perimeter of the 2×2 square / n
    for (let i = 0; i < points.length; i++) {
      const next = points[(i + 1) % points.length];
      // Points on the same edge are exactly `step` apart; across a corner the chord is shorter.
      expect(dist(points[i], next)).toBeLessThanOrEqual(step * 1.01);
      expect(dist(points[i], next)).toBeGreaterThan(step * 0.7);
    }
  });

  it('starts at the first input point', () => {
    expect(resample(square, 16)[0]).toEqual({ x: -1, y: -1 });
  });

  it('handles duplicate consecutive points', () => {
    const withDupes = [square[0], square[0], square[1], square[2], square[2], square[3]];
    expect(resample(withDupes, 32)).toHaveLength(32);
  });
});

describe('dft', () => {
  it('turns a sampled unit circle into a single coefficient at frequency 1', () => {
    const coefficients = dft(circle(64));
    expect(coefficients).toHaveLength(64);
    const significant = coefficients.filter((c) => c.amplitude > 1e-9);
    expect(significant).toHaveLength(1);
    expect(significant[0].frequency).toBe(1);
    expect(significant[0].amplitude).toBeCloseTo(1, 9);
  });

  it('uses signed frequencies (a clockwise circle is frequency -1)', () => {
    const clockwise = circle(32).map((p) => ({ x: p.x, y: -p.y }));
    const top = sortByAmplitude(dft(clockwise))[0];
    expect(top.frequency).toBe(-1);
  });
});

describe('sortByAmplitude', () => {
  it('orders by descending amplitude without mutating the input', () => {
    const coefficients = dft(resample(square, 32));
    const copy = coefficients.map((c) => ({ ...c }));
    const sorted = sortByAmplitude(coefficients);
    for (let i = 1; i < sorted.length; i++) expect(sorted[i - 1].amplitude).toBeGreaterThanOrEqual(sorted[i].amplitude);
    expect(coefficients).toEqual(copy);
  });
});

describe('reconstruct', () => {
  const samples = resample(square, 128);
  const coefficients = sortByAmplitude(dft(samples));
  const meanError = (terms: number) =>
    samples.reduce((sum, p, i) => sum + dist(p, reconstruct(coefficients, terms, i / samples.length)), 0) / samples.length;

  it('gets closer to the shape as terms increase', () => {
    const e4 = meanError(4);
    const e16 = meanError(16);
    const e64 = meanError(64);
    expect(e16).toBeLessThan(e4);
    expect(e64).toBeLessThan(e16);
  });

  it('is exact with every term', () => {
    expect(meanError(128)).toBeLessThan(1e-9);
  });
});

describe('epicycleChain', () => {
  it('returns one circle per term, each centred on the previous tip', () => {
    const coefficients = sortByAmplitude(dft(resample(square, 64)));
    const chain = epicycleChain(coefficients, 10, 0.3);
    expect(chain).toHaveLength(10);
    for (let i = 1; i < chain.length; i++) expect(dist(chain[i].center, chain[i - 1].tip)).toBeLessThan(1e-12);
    expect(dist(chain[chain.length - 1].tip, reconstruct(coefficients, 10, 0.3))).toBeLessThan(1e-12);
  });
});

describe('PRESETS', () => {
  it('are non-empty, named, and usable as closed paths', () => {
    expect(PRESETS.length).toBeGreaterThanOrEqual(3);
    for (const preset of PRESETS) {
      expect(preset.label.length).toBeGreaterThan(0);
      expect(preset.points.length).toBeGreaterThanOrEqual(3);
      expect(resample(preset.points, 64)).toHaveLength(64);
    }
  });
});
