import { describe, expect, it } from 'vitest';
import { MANDELBROT_HOME, MIN_SPAN, iterationsFor, julia, mandelbrot, pixelToComplex, zoomAt } from '../../src/lib/fractal.ts';

describe('mandelbrot', () => {
  it('keeps points of the set bounded (returns maxIter)', () => {
    for (const [x, y] of [[0, 0], [-1, 0], [-0.1, 0.1], [0.25, 0]]) expect(mandelbrot(x, y, 200)).toBe(200);
  });

  it('escapes quickly far outside the set', () => {
    expect(mandelbrot(2, 2, 200)).toBeLessThan(5);
    expect(mandelbrot(-2.5, 0, 200)).toBeLessThan(5);
  });

  it('gives a smooth, monotone escape estimate along a ray leaving the set', () => {
    const a = mandelbrot(0.3, 0, 500);
    const b = mandelbrot(0.35, 0, 500);
    const c = mandelbrot(0.5, 0, 500);
    expect(a).toBeGreaterThan(b);
    expect(b).toBeGreaterThan(c);
    expect(Number.isInteger(b)).toBe(false);
  });
});

describe('julia', () => {
  it('with c = 0 is the unit disc', () => {
    expect(julia(0.5, 0.5, { x: 0, y: 0 }, 100)).toBe(100);
    expect(julia(1.2, 0, { x: 0, y: 0 }, 100)).toBeLessThan(100);
  });
});

describe('view maths', () => {
  it('maps the canvas centre to the view centre and edges to ±span/2', () => {
    const v = { cx: -0.5, cy: 0.25, span: 3 };
    expect(pixelToComplex(200, 100, 400, 200, v)).toEqual({ x: -0.5, y: 0.25 });
    expect(pixelToComplex(0, 100, 400, 200, v).x).toBeCloseTo(-2, 12);
    expect(pixelToComplex(400, 100, 400, 200, v).x).toBeCloseTo(1, 12);
  });

  it('zoomAt recentres and divides the span, clamped at both ends', () => {
    expect(zoomAt(MANDELBROT_HOME, 0.3, 0.1, 3)).toEqual({ cx: 0.3, cy: 0.1, span: MANDELBROT_HOME.span / 3 });
    expect(zoomAt({ cx: 0, cy: 0, span: 2e-12 }, 0, 0, 10).span).toBe(MIN_SPAN);
    expect(zoomAt(MANDELBROT_HOME, 0, 0, 0.1).span).toBe(MANDELBROT_HOME.span);
  });

  it('uses more iterations for deeper views', () => {
    expect(iterationsFor(0.001)).toBeGreaterThan(iterationsFor(3.4));
    expect(iterationsFor(1e-15)).toBeLessThanOrEqual(4000);
  });
});
