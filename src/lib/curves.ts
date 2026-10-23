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

const F1 = 2;
const F2 = 3.025;
// Rotating the figure by ROT adds ROT to the first circular swing's phase and subtracts it from the
// second's (they turn in opposite directions). 13π/10 stands one petal straight up, like the mark.
const ROT = (13 * Math.PI) / 10;
// The curve passes through the hub when the two swings point in opposite directions. Their relative
// angle is (F1 + F2)·t − π/2, so t = 0 would fall a quarter of a lobe before the top petal's tip,
// leaving that first petal half drawn. Shifting time by START (adding fᵢ·START to each phase) begins
// the drawing at a hub instead; it moves only where the pen starts, not the petals.
const START = -Math.PI / (2 * (F1 + F2));
// Hubs come every 2π/(F1 + F2) of time; ending after exactly 56 of them closes the last loop too.
const LOBES = 56;
// Adding π to both x phases mirrors the figure left to right (sin(a + π) = −sin a). Mirrored, each
// petal's fan of loops turns clockwise as it shrinks, so the fans trail a clockwise spin (src/lib/hero3d.ts).
const MIRROR = Math.PI;

/**
 * The landing-page curve (drawn in 3-D by src/lib/hero3d.ts): two circular swings turning in opposite directions at frequencies 2 and
 * 3.025. Opposite-direction circles at f₁ and f₂ trace f₁ + f₂ lobes, so this is a five-petal
 * rosette matching the site mark; with equal swings it would be exactly the mark's rose r = cos 5θ,
 * and the inner swing of 0.95 leaves a small open hub instead of a knot at the centre. The extra
 * 0.025 lands each pass slightly rotated, so the petals fan out, and the damping spirals it inward.
 */
export const HERO_HARMONOGRAPH: HarmonographParams = {
  x: [
    { amplitude: 1, frequency: F1, phase: Math.PI / 2 + ROT + F1 * START + MIRROR },
    { amplitude: 0.95, frequency: F2, phase: -ROT + F2 * START + MIRROR },
  ],
  y: [
    { amplitude: 1, frequency: F1, phase: ROT + F1 * START },
    { amplitude: 0.95, frequency: F2, phase: Math.PI / 2 - ROT + F2 * START },
  ],
  damping: 0.03,
  duration: (LOBES * 2 * Math.PI) / (F1 + F2),
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
