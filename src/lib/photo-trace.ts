// The maths behind the Fun page's drawn photos (src/components/photos/plate-drawing.ts): a photo's
// line drawing, as served by src/pages/photos/[id].json.ts, turned into a chain of spinning circles
// that draws it. Pure, framework-free, erasable TypeScript.
import type { Point } from './curves.ts';
import { dft, type Coefficient } from './fourier.ts';

/**
 * A photo's line drawing (written by scripts/prepare-photos.mjs): one closed path of evenly spaced
 * samples as x, y pairs in thousandths of the frame, and the runs of samples [first, last] where the
 * pen is lifted between strokes (the step arriving at each of those samples is not drawn).
 */
export type Trace = { points: number[]; lifts: [number, number][] };

/**
 * The trace as points in units of the photo's height (x scaled by the aspect ratio, width over
 * height, so circles stay round on screen) and, for each sample, whether the step into it is lifted.
 */
export function decodeTrace(trace: Trace, aspect: number): { path: Point[]; lifted: boolean[] } {
  const n = Math.floor(trace.points.length / 2);
  const path = Array.from({ length: n }, (_, k) => ({ x: (trace.points[2 * k] / 1000) * aspect, y: trace.points[2 * k + 1] / 1000 }));
  const lifted = new Array<boolean>(n).fill(false);
  for (const [first, last] of trace.lifts) for (let k = Math.max(0, first); k <= Math.min(n - 1, last); k++) lifted[k] = true;
  return { path, lifted };
}

/** The circles that draw `path`: the centre (frequency 0) first, then the `terms − 1` largest. */
export function traceCircles(path: Point[], terms: number): Coefficient[] {
  const all = dft(path);
  const centre = all.find((c) => c.frequency === 0)!;
  const rest = all.filter((c) => c.frequency !== 0).sort((a, b) => b.amplitude - a.amplitude);
  return [centre, ...rest.slice(0, Math.max(0, terms - 1))];
}

/** The pen's position at time t ∈ [0, 1), and the joints of the chain of circles that put it there. */
export function chainAt(circles: Coefficient[], t: number): Point[] {
  const joints: Point[] = [];
  let x = 0;
  let y = 0;
  for (const c of circles) {
    const angle = 2 * Math.PI * c.frequency * t + c.phase;
    x += c.amplitude * Math.cos(angle);
    y += c.amplitude * Math.sin(angle);
    joints.push({ x, y });
  }
  return joints;
}

/** Where the circles put the pen at each of `n` evenly spaced times: the drawing as it will appear. */
export function penPath(circles: Coefficient[], n: number): Point[] {
  return Array.from({ length: n }, (_, k) => {
    const joints = chainAt(circles, k / n);
    return joints[joints.length - 1] ?? { x: 0, y: 0 };
  });
}
