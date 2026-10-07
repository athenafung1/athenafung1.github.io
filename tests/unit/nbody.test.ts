import { describe, expect, it } from 'vitest';
import {
  FIGURE_EIGHT,
  FIGURE_EIGHT_PERIOD,
  NBODY_PRESETS,
  accelerations,
  centerOfMass,
  energy,
  momentum,
  orbitalVelocityAround,
  step,
  type Body,
} from '../../src/lib/nbody.ts';

const run = (bodies: Body[], dt: number, steps: number, softening = 0) => {
  let state = bodies;
  for (let i = 0; i < steps; i++) state = step(state, dt, { softening });
  return state;
};

describe('two-body circular orbit', () => {
  // Equal masses m = 1 at separation d = 1 orbit their centre with v = sqrt(G m / (2 d)).
  const v = Math.sqrt(0.5);
  const pair: Body[] = [
    { x: -0.5, y: 0, vx: 0, vy: -v, mass: 1 },
    { x: 0.5, y: 0, vx: 0, vy: v, mass: 1 },
  ];

  it('keeps the separation constant over several orbits', () => {
    let state = pair;
    for (let i = 0; i < 20000; i++) {
      state = step(state, 0.001, { softening: 0 });
      const d = Math.hypot(state[1].x - state[0].x, state[1].y - state[0].y);
      expect(Math.abs(d - 1)).toBeLessThan(0.01);
    }
  });
});

describe('conservation (leapfrog)', () => {
  it('conserves total energy over a figure-eight period', () => {
    const e0 = energy(FIGURE_EIGHT, { softening: 0 });
    const end = run(FIGURE_EIGHT, 0.001, Math.round(FIGURE_EIGHT_PERIOD / 0.001));
    expect(Math.abs((energy(end, { softening: 0 }) - e0) / e0)).toBeLessThan(1e-4);
  });

  it('conserves linear momentum', () => {
    const bodies: Body[] = [
      { x: 0, y: 0, vx: 0.3, vy: 0, mass: 2 },
      { x: 1, y: 0.2, vx: -0.1, vy: 0.4, mass: 0.5 },
      { x: -0.7, y: 0.9, vx: 0, vy: -0.2, mass: 1 },
    ];
    const p0 = momentum(bodies);
    const p1 = momentum(run(bodies, 0.002, 2000, 0.05));
    expect(p1.px).toBeCloseTo(p0.px, 10);
    expect(p1.py).toBeCloseTo(p0.py, 10);
  });
});

describe('figure-eight choreography (Chenciner–Montgomery)', () => {
  it('returns to its starting positions after one period', () => {
    const end = run(FIGURE_EIGHT, 0.0005, Math.round(FIGURE_EIGHT_PERIOD / 0.0005));
    end.forEach((body, i) => {
      expect(Math.hypot(body.x - FIGURE_EIGHT[i].x, body.y - FIGURE_EIGHT[i].y)).toBeLessThan(0.01);
    });
  });

  it('has zero total momentum and its centre of mass at the origin', () => {
    const p = momentum(FIGURE_EIGHT);
    const c = centerOfMass(FIGURE_EIGHT);
    expect(Math.hypot(p.px, p.py)).toBeLessThan(1e-7);
    expect(Math.hypot(c.x, c.y)).toBeLessThan(1e-9);
  });
});

describe('step', () => {
  it('does not mutate its input', () => {
    const before = structuredClone(FIGURE_EIGHT);
    step(FIGURE_EIGHT, 0.01, { softening: 0 });
    expect(FIGURE_EIGHT).toEqual(before);
  });
});

describe('accelerations', () => {
  it('stays finite for coincident bodies thanks to softening', () => {
    const acc = accelerations(
      [
        { x: 0, y: 0, vx: 0, vy: 0, mass: 1 },
        { x: 0, y: 0, vx: 0, vy: 0, mass: 1 },
      ],
      { softening: 0.05 },
    );
    for (const a of acc) {
      expect(Number.isFinite(a.ax)).toBe(true);
      expect(Number.isFinite(a.ay)).toBe(true);
    }
  });

  it('points each body toward the other', () => {
    const [a, b] = accelerations(
      [
        { x: -1, y: 0, vx: 0, vy: 0, mass: 1 },
        { x: 1, y: 0, vx: 0, vy: 0, mass: 3 },
      ],
      { softening: 0 },
    );
    expect(a.ax).toBeCloseTo(3 / 4, 10); // G m_b / d² toward +x
    expect(b.ax).toBeCloseTo(-1 / 4, 10);
  });
});

describe('centerOfMass', () => {
  it('is mass-weighted', () => {
    const c = centerOfMass([
      { x: 0, y: 0, vx: 0, vy: 0, mass: 3 },
      { x: 4, y: 0, vx: 0, vy: 0, mass: 1 },
    ]);
    expect(c.x).toBeCloseTo(1, 12);
    expect(c.y).toBeCloseTo(0, 12);
  });
});

describe('orbitalVelocityAround', () => {
  it('gives a circular-orbit speed perpendicular to the radius', () => {
    const sun: Body[] = [{ x: 0, y: 0, vx: 0, vy: 0, mass: 4 }];
    const v = orbitalVelocityAround(sun, 2, 0);
    expect(Math.hypot(v.vx, v.vy)).toBeCloseTo(Math.sqrt(4 / 2), 10);
    expect(v.vx * 2 + v.vy * 0).toBeCloseTo(0, 10);
  });

  it('returns zero velocity with nothing to orbit', () => {
    expect(orbitalVelocityAround([], 1, 1)).toEqual({ vx: 0, vy: 0 });
  });
});

describe('NBODY_PRESETS', () => {
  it('each has bodies with positive mass and a label', () => {
    expect(NBODY_PRESETS.length).toBeGreaterThanOrEqual(3);
    for (const preset of NBODY_PRESETS) {
      expect(preset.label.length).toBeGreaterThan(0);
      expect(preset.bodies.length).toBeGreaterThanOrEqual(2);
      for (const body of preset.bodies) expect(body.mass).toBeGreaterThan(0);
    }
  });
});
