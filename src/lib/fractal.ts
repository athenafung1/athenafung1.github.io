// Escape-time fractals (Mandelbrot and Julia sets) with smooth colouring, plus view maths.

export type View = { cx: number; cy: number; span: number };

export const MANDELBROT_HOME: View = { cx: -0.6, cy: 0, span: 3.4 };
export const JULIA_HOME: View = { cx: 0, cy: 0, span: 3.2 };
/** Below this span, float64 rounding makes pixels blocky. */
export const MIN_SPAN = 1e-12;

/**
 * Iterate z ← z² + c from z0 and return a smooth (fractional) escape count, or `maxIter` if the
 * orbit stays bounded. Bailout radius 256 keeps the smooth estimate accurate.
 */
export function escapeTime(zx: number, zy: number, cx: number, cy: number, maxIter: number): number {
  let x = zx;
  let y = zy;
  for (let n = 0; n < maxIter; n++) {
    const x2 = x * x;
    const y2 = y * y;
    if (x2 + y2 > 65536) {
      // n + 1 − log₂(log|z|): continuous across the band boundaries.
      return n + 1 - Math.log2(Math.log(Math.sqrt(x2 + y2)));
    }
    y = 2 * x * y + cy;
    x = x2 - y2 + cx;
  }
  return maxIter;
}

export const mandelbrot = (x: number, y: number, maxIter: number) => escapeTime(0, 0, x, y, maxIter);

export const julia = (x: number, y: number, c: { x: number; y: number }, maxIter: number) =>
  escapeTime(x, y, c.x, c.y, maxIter);

/** Complex-plane point under pixel (px, py) for a width×height canvas showing `view`. */
export function pixelToComplex(px: number, py: number, width: number, height: number, view: View) {
  const unit = view.span / width;
  return { x: view.cx + (px - width / 2) * unit, y: view.cy + (py - height / 2) * unit };
}

/** Centre on (x, y) and divide the span by `factor` (> 1 zooms in), clamped to float precision. */
export function zoomAt(view: View, x: number, y: number, factor: number, home: View = MANDELBROT_HOME): View {
  const span = Math.min(home.span, Math.max(MIN_SPAN, view.span / factor));
  return { cx: x, cy: y, span };
}

/** More iterations as the view deepens, so detail keeps resolving. */
export function iterationsFor(span: number): number {
  return Math.round(Math.min(4000, 120 + 60 * Math.max(0, Math.log2(3.4 / span))));
}
