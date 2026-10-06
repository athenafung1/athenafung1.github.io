// Parametric curves for the landing-hero signature (HeroCurve.astro) and build-time fallback art.
// Pure, framework-free, erasable TypeScript.

export type Point = { x: number; y: number };

/** Rose curve r = cos(kθ) for integer k; closed over π (odd k) or 2π (even k). */
export function rose(k: number, samples: number): Point[] {
  const period = k % 2 === 0 ? 2 * Math.PI : Math.PI;
  return Array.from({ length: samples }, (_, i) => {
    const theta = (period * i) / (samples - 1);
    const r = Math.cos(k * theta);
    return { x: r * Math.cos(theta), y: r * Math.sin(theta) };
  });
}

export type Pendulum = { amplitude: number; frequency: number; phase: number };

export type HarmonographParams = {
  x: Pendulum[];
  y: Pendulum[];
  /** Exponential decay rate per unit of t. */
  damping: number;
  /** Total simulated time; t runs from 0 to duration inclusive. */
  duration: number;
};

const swing = (pendulums: Pendulum[], t: number) =>
  pendulums.reduce((sum, p) => sum + p.amplitude * Math.sin(p.frequency * t + p.phase), 0);

/** A damped harmonograph: each axis is a sum of decaying sinusoids. */
export function harmonograph(params: HarmonographParams, samples: number): Point[] {
  return Array.from({ length: samples }, (_, i) => {
    const t = (params.duration * i) / (samples - 1);
    const decay = Math.exp(-params.damping * t);
    return { x: decay * swing(params.x, t), y: decay * swing(params.y, t) };
  });
}

/** Uniformly scale and centre points into [pad, width - pad] × [pad, height - pad]. */
export function normalizeToViewBox(points: Point[], width: number, height: number, pad: number): Point[] {
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const [minX, maxX, minY, maxY] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const spanX = maxX - minX;
  const spanY = maxY - minY;
  const innerW = width - 2 * pad;
  const innerH = height - 2 * pad;
  const scale = Math.min(spanX > 0 ? innerW / spanX : Infinity, spanY > 0 ? innerH / spanY : Infinity);
  const s = Number.isFinite(scale) ? scale : 1;
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  return points.map((p) => ({ x: width / 2 + (p.x - cx) * s, y: height / 2 + (p.y - cy) * s }));
}

const fmt = (n: number) => String(Math.round(n * 100) / 100);

/** "M x y L x y …" with 2-decimal coordinates; " Z" appended for closed curves. */
export function toSvgPath(points: Point[], options: { closed?: boolean } = {}): string {
  if (points.length === 0) return '';
  const body = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${fmt(p.x)} ${fmt(p.y)}`).join(' ');
  return options.closed ? `${body} Z` : body;
}
