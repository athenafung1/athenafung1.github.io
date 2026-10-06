import { describe, expect, it } from 'vitest';
import { harmonograph, normalizeToViewBox, rose, toSvgPath, type Point } from '../../src/lib/curves.ts';

const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

describe('rose', () => {
  it('returns the requested number of points', () => {
    expect(rose(3, 120)).toHaveLength(120);
    expect(rose(2, 50)).toHaveLength(50);
  });

  it('is a closed curve for odd and even k', () => {
    for (const k of [3, 4, 5]) {
      const points = rose(k, 200);
      expect(distance(points[0], points[points.length - 1])).toBeLessThan(1e-6);
    }
  });

  it('stays within the unit circle and starts at r = 1 on the x axis', () => {
    const points = rose(3, 300);
    expect(points[0].x).toBeCloseTo(1, 9);
    expect(points[0].y).toBeCloseTo(0, 9);
    for (const p of points) expect(Math.hypot(p.x, p.y)).toBeLessThanOrEqual(1 + 1e-9);
  });
});

describe('harmonograph', () => {
  const params = {
    x: [
      { amplitude: 1, frequency: 2, phase: Math.PI / 2 },
      { amplitude: 0.7, frequency: 5.006, phase: 0 },
    ],
    y: [
      { amplitude: 1, frequency: 2, phase: 0 },
      { amplitude: 0.7, frequency: 5.006, phase: Math.PI / 2 },
    ],
    damping: 0.03,
    duration: 70,
  };

  it('returns the requested number of points', () => {
    expect(harmonograph(params, 400)).toHaveLength(400);
  });

  it('starts at the undamped sum and decays toward the origin', () => {
    const points = harmonograph(params, 400);
    expect(points[0].x).toBeCloseTo(1, 9); // sin(π/2) + 0.7·sin(0)
    expect(points[0].y).toBeCloseTo(0.7, 9); // sin(0) + 0.7·sin(π/2)
    const last = points[points.length - 1];
    expect(Math.hypot(last.x, last.y)).toBeLessThan(Math.exp(-0.03 * 70) * 1.7 + 1e-9);
  });

  it('closes when undamped and run for a common period', () => {
    const closed = harmonograph(
      { x: [{ amplitude: 1, frequency: 1, phase: 0 }], y: [{ amplitude: 1, frequency: 2, phase: 0 }], damping: 0, duration: 2 * Math.PI },
      100,
    );
    expect(distance(closed[0], closed[closed.length - 1])).toBeLessThan(1e-6);
  });
});

describe('normalizeToViewBox', () => {
  it('fits every point inside the padded box, preserving aspect ratio', () => {
    const points = rose(5, 400).map((p) => ({ x: p.x * 3 + 10, y: p.y - 4 }));
    const fitted = normalizeToViewBox(points, 200, 100, 10);
    for (const p of fitted) {
      expect(p.x).toBeGreaterThanOrEqual(10 - 1e-9);
      expect(p.x).toBeLessThanOrEqual(190 + 1e-9);
      expect(p.y).toBeGreaterThanOrEqual(10 - 1e-9);
      expect(p.y).toBeLessThanOrEqual(90 + 1e-9);
    }
  });

  it('centres the curve in the box', () => {
    const fitted = normalizeToViewBox([{ x: -1, y: -1 }, { x: 1, y: 1 }], 100, 100, 0);
    expect(fitted[0]).toEqual({ x: 0, y: 0 });
    expect(fitted[1]).toEqual({ x: 100, y: 100 });
  });

  it('handles a degenerate (single-point) input without dividing by zero', () => {
    const fitted = normalizeToViewBox([{ x: 5, y: 5 }], 100, 50, 0);
    expect(fitted[0]).toEqual({ x: 50, y: 25 });
  });
});

describe('toSvgPath', () => {
  const points: Point[] = [
    { x: 0, y: 0 },
    { x: 1.23456, y: 2.5 },
    { x: 3, y: 4.005 },
  ];

  it('starts with M and rounds coordinates to 2 decimals', () => {
    const d = toSvgPath(points);
    expect(d.startsWith('M0 0')).toBe(true);
    expect(d).toContain('L1.23 2.5');
    expect(d).not.toContain('1.2345');
  });

  it('ends with Z only for closed curves', () => {
    expect(toSvgPath(points, { closed: true }).endsWith('Z')).toBe(true);
    expect(toSvgPath(points).endsWith('Z')).toBe(false);
  });

  it('returns an empty string for no points', () => {
    expect(toSvgPath([])).toBe('');
  });
});
