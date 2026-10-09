// The landing curve in 3-D: the five-petal harmonograph (HERO_HARMONOGRAPH in src/lib/curves.ts) with
// each petal twisted like a propeller blade.
//
// Concept: depth z = TWIST · r · sin 5(θ − θ_up), where r and θ are the flat curve's distance and angle
// from the hub. Petal centrelines sit at θ_up + 72°·k, where sin 5(…) = 0, so every petal's spine and
// the hub stay flat while one edge of each petal rises and the other sinks. Seen face-on it is exactly
// the flat curve (the mark); turned, it becomes a pinwheel. (Five petals cannot alternate up and down
// all the way round, since an odd count leaves two neighbours matching, so the twist is per petal.)
//
// Spin direction: each petal is a fan of loops that turns 3.6° clockwise per lap as it shrinks (the
// curve is mirrored for this; see HERO_HARMONOGRAPH), so read outward the fans curve anticlockwise,
// like a sprinkler's spray or a spiral galaxy's arms, which trail a clockwise spin. The twist is set to
// agree: each petal's raised edge is on its clockwise side, and a breeze from the viewer pushes a
// blade toward its raised edge.
//
// How this code works: heroPoints() adds the depth to the flat samples. The page spins them like a
// pinwheel with rollAbout() (about the axle: the axis through the hub, perpendicular to the flower),
// then tilts them to the resting view with project() from src/lib/attractors.ts (orthographic, yaw
// then pitch), and scales by radius(): rotation never moves a point farther from the hub, so that
// scale fits every angle. lengthFractions() and resample() place points evenly along the curve for
// the denoise dots and the tracing pen.
import type { Vec3 } from './attractors.ts';
import { HERO_HARMONOGRAPH, harmonograph, type HarmonographParams } from './curves.ts';

export const HERO_TWIST = 0.45;
/**
 * Resting view: turned and tilted enough to show the twist, close enough to face-on to read as the mark,
 * at an angle that keeps every petal open to the viewer (some angles turn two petals edge-on).
 */
export const REST_YAW = 0.45;
export const REST_PITCH = -0.3;
const UP = -Math.PI / 2; // the top petal's direction (screen y grows downward)

export function heroPoints(samples: number, params: HarmonographParams = HERO_HARMONOGRAPH): Vec3[] {
  return harmonograph(params, samples).map(({ x, y }) => [x, y, HERO_TWIST * Math.hypot(x, y) * Math.sin(5 * (Math.atan2(y, x) - UP))]);
}

/**
 * Spin the flower about its own axle, like a pinwheel: each point turns by `angle` around the hub in the
 * flower's plane, and its depth is unchanged. Positive angles turn clockwise on screen (y grows
 * downward), which is the way the hero spins (see "Spin direction" above).
 */
export function rollAbout(points: Vec3[], angle: number): Vec3[] {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return points.map(([x, y, z]) => [x * c - y * s, x * s + y * c, z]);
}

/** Largest distance from the hub. */
export function radius(points: Vec3[]): number {
  let max = 0;
  for (const [x, y, z] of points) max = Math.max(max, Math.hypot(x, y, z));
  return max;
}

/** Arc length from the start to each vertex, as a fraction of the total (0 … 1). */
export function lengthFractions(points: Vec3[]): Float64Array {
  const out = new Float64Array(points.length);
  for (let i = 1; i < points.length; i++) {
    const [ax, ay, az] = points[i - 1];
    const [bx, by, bz] = points[i];
    out[i] = out[i - 1] + Math.hypot(bx - ax, by - ay, bz - az);
  }
  const total = out[out.length - 1] || 1;
  for (let i = 0; i < out.length; i++) out[i] /= total;
  return out;
}

/** n points evenly spaced by arc length (first and last included), each with its length fraction. */
export function resample(points: Vec3[], at: Float64Array, n: number): { points: Vec3[]; at: Float64Array } {
  const out: Vec3[] = [];
  const fractions = new Float64Array(n);
  let j = 1;
  for (let i = 0; i < n; i++) {
    const f = n === 1 ? 0 : i / (n - 1);
    while (j < points.length - 1 && at[j] < f) j++;
    const span = at[j] - at[j - 1] || 1;
    const t = Math.min(1, Math.max(0, (f - at[j - 1]) / span));
    const a = points[j - 1];
    const b = points[j];
    out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]);
    fractions[i] = f;
  }
  return { points: out, at: fractions };
}
