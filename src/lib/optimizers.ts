// Gradient-based optimisers on 2-D test functions: plain gradient descent, heavy-ball momentum and
// Adam (Kingma & Ba, 2014).
//
// Concept: training a model means adjusting its parameters to reduce a loss. The gradient g points
// uphill, so every optimiser steps against it; they differ in how they size the step.
//   - Gradient descent: p ← p − lr·g. One learning rate has to suit every direction, so in a narrow
//     valley it zig-zags across the steep walls while creeping along the shallow floor.
//   - Momentum: keep a velocity v ← β·v + g and step p ← p − lr·v. Steady directions build up speed
//     (up to 1/(1 − β) = 10× here) and back-and-forth components cancel, like a ball rolling
//     downhill. Like a ball, it can overshoot and swing back.
//   - Adam: keep running averages of the gradient (m) and of its square (s) and step by m/√s, so each
//     parameter gets its own step size and steep and shallow directions move at similar speeds. Both
//     averages start at 0, so early values are divided by (1 − βᵗ) to undo that bias.
// The landscapes are classic test functions: Rosenbrock (a long curved valley), Himmelblau (four
// equally good minima) and a stretched bowl (50× steeper across than along).
//
// How this code works: each landscape bundles its function, analytic gradient, view window, start
// point and a default learning rate per optimiser. optimizerStep() is pure: it takes a state and
// returns the next one.

export type P = [number, number];

export type Landscape = {
  id: string;
  label: string;
  f: (p: P) => number;
  grad: (p: P) => P;
  /** View window [xmin, xmax, ymin, ymax]. */
  bounds: [number, number, number, number];
  start: P;
  minima: P[];
  /** Default learning rates per optimiser (one shared rate would be unfair to plain GD). */
  lr: Record<OptimizerId, number>;
  note: string;
};

export const LANDSCAPES: Landscape[] = [
  {
    id: 'rosenbrock',
    label: 'Rosenbrock valley',
    f: ([x, y]) => (1 - x) ** 2 + 100 * (y - x * x) ** 2,
    grad: ([x, y]) => [-2 * (1 - x) - 400 * x * (y - x * x), 200 * (y - x * x)],
    bounds: [-2, 2, -1, 3],
    start: [-1.5, 2.5],
    minima: [[1, 1]],
    // Each rate is about the largest that stays stable from the default start.
    lr: { sgd: 0.001, momentum: 0.0004, adam: 0.05 },
    note: 'A long curved valley: easy to fall into, slow to follow. Plain descent crawls along the floor; momentum and Adam build speed. The minimum is at (1, 1).',
  },
  {
    id: 'himmelblau',
    label: 'Himmelblau',
    f: ([x, y]) => (x * x + y - 11) ** 2 + (x + y * y - 7) ** 2,
    grad: ([x, y]) => [4 * x * (x * x + y - 11) + 2 * (x + y * y - 7), 2 * (x * x + y - 11) + 4 * y * (x + y * y - 7)],
    bounds: [-5, 5, -5, 5],
    start: [-0.3, -0.9],
    minima: [
      [3, 2],
      [-2.805118, 3.131312],
      [-3.77931, -3.283186],
      [3.584428, -1.848126],
    ],
    lr: { sgd: 0.01, momentum: 0.004, adam: 0.08 },
    note: 'Four equally good minima: where you start decides where you end up.',
  },
  {
    id: 'bowl',
    label: 'Narrow bowl',
    f: ([x, y]) => 0.5 * (x * x + 50 * y * y),
    grad: ([x, y]) => [x, 50 * y],
    bounds: [-4, 4, -2.5, 2.5],
    start: [-3.6, 1.2],
    minima: [[0, 0]],
    lr: { sgd: 0.035, momentum: 0.01, adam: 0.1 },
    note: 'Steep across, shallow along: plain descent zig-zags and then creeps; momentum overshoots and swings back but arrives sooner; Adam rescales each direction.',
  },
];

export type OptimizerId = 'sgd' | 'momentum' | 'adam';

export type OptState = { p: P; v: P; m: P; s: P; t: number };

export const initState = (p: P): OptState => ({ p: [...p] as P, v: [0, 0], m: [0, 0], s: [0, 0], t: 0 });

/** One update. Returns a new state; the input is not modified. */
export function optimizerStep(id: OptimizerId, state: OptState, g: P, lr: number): OptState {
  const t = state.t + 1;
  // Gradient descent: straight downhill.
  if (id === 'sgd') return { ...state, t, p: [state.p[0] - lr * g[0], state.p[1] - lr * g[1]] };
  // Heavy-ball momentum: the velocity is a decaying sum of past gradients.
  if (id === 'momentum') {
    const beta = 0.9;
    const v: P = [beta * state.v[0] + g[0], beta * state.v[1] + g[1]];
    return { ...state, t, v, p: [state.p[0] - lr * v[0], state.p[1] - lr * v[1]] };
  }
  // Adam: m and s are moving averages of g and g². Dividing m by √s gives each coordinate its own
  // step size; the (1 − βᵗ) factors undo the averages' initial bias toward 0.
  const b1 = 0.9;
  const b2 = 0.999;
  const eps = 1e-8;
  const m: P = [b1 * state.m[0] + (1 - b1) * g[0], b1 * state.m[1] + (1 - b1) * g[1]];
  const s: P = [b2 * state.s[0] + (1 - b2) * g[0] ** 2, b2 * state.s[1] + (1 - b2) * g[1] ** 2];
  const mh = m.map((v) => v / (1 - b1 ** t));
  const sh = s.map((v) => v / (1 - b2 ** t));
  return { ...state, t, m, s, p: [state.p[0] - (lr * mh[0]) / (Math.sqrt(sh[0]) + eps), state.p[1] - (lr * mh[1]) / (Math.sqrt(sh[1]) + eps)] };
}

export const OPTIMIZERS: Array<{ id: OptimizerId; label: string }> = [
  { id: 'sgd', label: 'Gradient descent' },
  { id: 'momentum', label: 'Momentum' },
  { id: 'adam', label: 'Adam' },
];
