// Newtonian N-body gravity in 2-D (G = 1), integrated with leapfrog (kick–drift–kick), which is
// symplectic: energy error stays bounded instead of drifting. Used by NBody.svelte at runtime and
// NBodyFallback.astro at build time. Pure and framework-free.

export type Body = { x: number; y: number; vx: number; vy: number; mass: number };
export type Acceleration = { ax: number; ay: number };
export type SimOptions = {
  /** Gravitational constant; 1 in simulation units. */
  G?: number;
  /** Plummer softening length ε: force ∝ r / (r² + ε²)^(3/2). Keeps close passes finite. */
  softening?: number;
};

const DEFAULT_SOFTENING = 0.05;

export function accelerations(bodies: Body[], options: SimOptions = {}): Acceleration[] {
  const G = options.G ?? 1;
  const eps2 = (options.softening ?? DEFAULT_SOFTENING) ** 2;
  const acc = bodies.map(() => ({ ax: 0, ay: 0 }));
  for (let i = 0; i < bodies.length; i++) {
    for (let j = i + 1; j < bodies.length; j++) {
      const dx = bodies[j].x - bodies[i].x;
      const dy = bodies[j].y - bodies[i].y;
      const r2 = dx * dx + dy * dy + eps2;
      if (r2 === 0) continue;
      const inv = G / (r2 * Math.sqrt(r2));
      acc[i].ax += bodies[j].mass * dx * inv;
      acc[i].ay += bodies[j].mass * dy * inv;
      acc[j].ax -= bodies[i].mass * dx * inv;
      acc[j].ay -= bodies[i].mass * dy * inv;
    }
  }
  return acc;
}

/** One leapfrog step. Returns new bodies; the input is not modified. */
export function step(bodies: Body[], dt: number, options: SimOptions = {}): Body[] {
  const a0 = accelerations(bodies, options);
  const drifted = bodies.map((b, i) => {
    const vx = b.vx + 0.5 * dt * a0[i].ax;
    const vy = b.vy + 0.5 * dt * a0[i].ay;
    return { ...b, x: b.x + dt * vx, y: b.y + dt * vy, vx, vy };
  });
  const a1 = accelerations(drifted, options);
  return drifted.map((b, i) => ({ ...b, vx: b.vx + 0.5 * dt * a1[i].ax, vy: b.vy + 0.5 * dt * a1[i].ay }));
}

/** Kinetic plus (softened) potential energy. */
export function energy(bodies: Body[], options: SimOptions = {}): number {
  const G = options.G ?? 1;
  const eps2 = (options.softening ?? DEFAULT_SOFTENING) ** 2;
  let kinetic = 0;
  let potential = 0;
  for (let i = 0; i < bodies.length; i++) {
    const b = bodies[i];
    kinetic += 0.5 * b.mass * (b.vx * b.vx + b.vy * b.vy);
    for (let j = i + 1; j < bodies.length; j++) {
      const r = Math.sqrt((bodies[j].x - b.x) ** 2 + (bodies[j].y - b.y) ** 2 + eps2);
      if (r > 0) potential -= (G * b.mass * bodies[j].mass) / r;
    }
  }
  return kinetic + potential;
}

export function momentum(bodies: Body[]): { px: number; py: number } {
  return bodies.reduce((p, b) => ({ px: p.px + b.mass * b.vx, py: p.py + b.mass * b.vy }), { px: 0, py: 0 });
}

export function centerOfMass(bodies: Body[]): { x: number; y: number } {
  const total = bodies.reduce((m, b) => m + b.mass, 0);
  if (total === 0) return { x: 0, y: 0 };
  return {
    x: bodies.reduce((s, b) => s + b.mass * b.x, 0) / total,
    y: bodies.reduce((s, b) => s + b.mass * b.y, 0) / total,
  };
}

/**
 * Velocity for a light body at (x, y) to circle the existing system's centre of mass
 * (counter-clockwise on screen, where y points down), treating the system as one point mass.
 */
export function orbitalVelocityAround(bodies: Body[], x: number, y: number, G = 1): { vx: number; vy: number } {
  const total = bodies.reduce((m, b) => m + b.mass, 0);
  const c = centerOfMass(bodies);
  const dx = x - c.x;
  const dy = y - c.y;
  const r = Math.hypot(dx, dy);
  if (total === 0 || r === 0) return { vx: 0, vy: 0 };
  const speed = Math.sqrt((G * total) / r);
  // Shift into the system's moving frame so the orbit is relative to the centre of mass.
  const p = momentum(bodies);
  return { vx: (dy / r) * speed + p.px / total, vy: (-dx / r) * speed + p.py / total };
}

// Chenciner & Montgomery (2000): three equal masses chasing each other along one figure-eight.
const V3 = { vx: -0.93240737, vy: -0.86473146 };
export const FIGURE_EIGHT: Body[] = [
  { x: 0.97000436, y: -0.24308753, vx: -V3.vx / 2, vy: -V3.vy / 2, mass: 1 },
  { x: -0.97000436, y: 0.24308753, vx: -V3.vx / 2, vy: -V3.vy / 2, mass: 1 },
  { x: 0, y: 0, vx: V3.vx, vy: V3.vy, mass: 1 },
];
export const FIGURE_EIGHT_PERIOD = 6.32591398;

function binaryWithPlanet(): Body[] {
  // Two stars (masses 1 and 0.6) on circular orbits about their barycentre, plus a distant planet
  // on a circumbinary orbit.
  const m1 = 1;
  const m2 = 0.6;
  const d = 0.8;
  const r1 = (d * m2) / (m1 + m2);
  const r2 = (d * m1) / (m1 + m2);
  const w = Math.sqrt((m1 + m2) / d ** 3);
  const stars: Body[] = [
    { x: -r1, y: 0, vx: 0, vy: r1 * w, mass: m1 },
    { x: r2, y: 0, vx: 0, vy: -r2 * w, mass: m2 },
  ];
  const planet = { x: 0, y: -1.9, mass: 0.02 };
  return [...stars, { ...planet, ...orbitalVelocityAround(stars, planet.x, planet.y) }];
}

function sunAndPlanets(): Body[] {
  const sun: Body[] = [{ x: 0, y: 0, vx: 0, vy: 0, mass: 3 }];
  const planets = [
    { r: 0.55, mass: 0.01, angle: 0.3 },
    { r: 0.95, mass: 0.03, angle: 2.4 },
    { r: 1.45, mass: 0.02, angle: 4.4 },
  ].map(({ r, mass, angle }) => {
    const x = r * Math.cos(angle);
    const y = r * Math.sin(angle);
    return { x, y, mass, ...orbitalVelocityAround(sun, x, y) };
  });
  return [...sun, ...planets];
}

export type NBodyPreset = { id: string; label: string; bodies: Body[] };

export const NBODY_PRESETS: NBodyPreset[] = [
  { id: 'figure-eight', label: 'Figure-eight', bodies: FIGURE_EIGHT },
  { id: 'binary', label: 'Binary star', bodies: binaryWithPlanet() },
  { id: 'system', label: 'Sun & planets', bodies: sunAndPlanets() },
];
