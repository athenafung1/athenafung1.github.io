// Strange attractors (Lorenz 1963, Rössler 1976) integrated with RK4, plus 3-D → 2-D projection.
import { rk4, type Derivative } from './ode.ts';

export type Vec3 = [number, number, number];

export const lorenz =
  (sigma = 10, rho = 28, beta = 8 / 3): Derivative =>
  ([x, y, z]) => [sigma * (y - x), x * (rho - z) - y, x * y - beta * z];

export const rossler =
  (a = 0.2, b = 0.2, c = 5.7): Derivative =>
  ([x, y, z]) => [-y - z, x + a * y, b + z * (x - c)];

/** Integrate `steps` RK4 steps from `start`, discarding the first `skip` (transient) points. */
export function trajectory(f: Derivative, start: Vec3, dt: number, steps: number, skip = 0): Vec3[] {
  const points: Vec3[] = [];
  let state: number[] = [...start];
  for (let i = 0; i < steps + skip; i++) {
    state = rk4(f, state, dt);
    if (i >= skip) points.push([state[0], state[1], state[2]]);
  }
  return points;
}

/** Rotate by yaw (about y) then pitch (about x) and drop z: orthographic projection. */
export function project(points: Vec3[], yaw: number, pitch: number): Array<{ x: number; y: number; depth: number }> {
  const cy = Math.cos(yaw);
  const sy = Math.sin(yaw);
  const cp = Math.cos(pitch);
  const sp = Math.sin(pitch);
  return points.map(([x, y, z]) => {
    const x1 = x * cy + z * sy;
    const z1 = -x * sy + z * cy;
    const y2 = y * cp - z1 * sp;
    const z2 = y * sp + z1 * cp;
    return { x: x1, y: y2, depth: z2 };
  });
}

/** Translate points so their bounding-box centre is the origin (attractors aren't centred). */
export function centre(points: Vec3[]): Vec3[] {
  const mins = [0, 1, 2].map((i) => Math.min(...points.map((p) => p[i])));
  const maxs = [0, 1, 2].map((i) => Math.max(...points.map((p) => p[i])));
  const mid = mins.map((m, i) => (m + maxs[i]) / 2);
  return points.map((p) => [p[0] - mid[0], p[1] - mid[1], p[2] - mid[2]]);
}

export type AttractorPreset = {
  id: string;
  label: string;
  f: Derivative;
  start: Vec3;
  dt: number;
  /** Axis to treat as "up" on screen: index into the state vector. */
  up: 0 | 1 | 2;
  equation: string;
};

export const ATTRACTORS: AttractorPreset[] = [
  { id: 'lorenz', label: 'Lorenz', f: lorenz(), start: [1, 1, 1], dt: 0.006, up: 2, equation: 'ẋ = σ(y − x), ẏ = x(ρ − z) − y, ż = xy − βz' },
  { id: 'rossler', label: 'Rössler', f: rossler(), start: [1, 1, 0], dt: 0.02, up: 2, equation: 'ẋ = −y − z, ẏ = x + ay, ż = b + z(x − c)' },
];

/** Reorder so the chosen axis is the projection's vertical (y) axis. */
export function upright(points: Vec3[], up: 0 | 1 | 2): Vec3[] {
  if (up === 1) return points;
  return points.map(([x, y, z]) => (up === 2 ? [x, -z, y] : [y, -x, z]));
}
