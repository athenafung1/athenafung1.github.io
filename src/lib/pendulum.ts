// Double pendulum (point masses on rigid massless rods), state [θ1, ω1, θ2, ω2], angles from
// straight down. Chaotic: nearby starts diverge exponentially, the classic "butterfly effect" demo.
import type { Derivative } from './ode.ts';

export type PendulumParams = { m1: number; m2: number; l1: number; l2: number; g: number };

export const DEFAULT_PENDULUM: PendulumParams = { m1: 1, m2: 1, l1: 1, l2: 1, g: 9.81 };

export function doublePendulum(p: PendulumParams = DEFAULT_PENDULUM): Derivative {
  const { m1, m2, l1, l2, g } = p;
  return ([t1, w1, t2, w2]) => {
    const d = t1 - t2;
    const den = 2 * m1 + m2 - m2 * Math.cos(2 * d);
    const a1 =
      (-g * (2 * m1 + m2) * Math.sin(t1) -
        m2 * g * Math.sin(t1 - 2 * t2) -
        2 * Math.sin(d) * m2 * (w2 * w2 * l2 + w1 * w1 * l1 * Math.cos(d))) /
      (l1 * den);
    const a2 =
      (2 * Math.sin(d) * (w1 * w1 * l1 * (m1 + m2) + g * (m1 + m2) * Math.cos(t1) + w2 * w2 * l2 * m2 * Math.cos(d))) /
      (l2 * den);
    return [w1, a1, w2, a2];
  };
}

/** Total mechanical energy (zero potential at the pivot). */
export function pendulumEnergy([t1, w1, t2, w2]: number[], p: PendulumParams = DEFAULT_PENDULUM): number {
  const { m1, m2, l1, l2, g } = p;
  const kinetic =
    0.5 * m1 * (l1 * w1) ** 2 + 0.5 * m2 * ((l1 * w1) ** 2 + (l2 * w2) ** 2 + 2 * l1 * l2 * w1 * w2 * Math.cos(t1 - t2));
  const potential = -(m1 + m2) * g * l1 * Math.cos(t1) - m2 * g * l2 * Math.cos(t2);
  return kinetic + potential;
}

/** Cartesian positions of both bobs (y down), pivot at the origin. */
export function bobs([t1, , t2]: number[], p: PendulumParams = DEFAULT_PENDULUM) {
  const x1 = p.l1 * Math.sin(t1);
  const y1 = p.l1 * Math.cos(t1);
  return { x1, y1, x2: x1 + p.l2 * Math.sin(t2), y2: y1 + p.l2 * Math.cos(t2) };
}
