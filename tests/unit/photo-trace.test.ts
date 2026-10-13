import { describe, expect, it } from 'vitest';
import { chainAt, decodeTrace, penPath, traceCircles, type Trace } from '../../src/lib/photo-trace.ts';

// A small square, drawn as two strokes: the top and right edges, then (pen up) the bottom and left.
const square: Trace = {
  points: [100, 100, 500, 100, 900, 100, 900, 500, 900, 900, 500, 900, 100, 900, 100, 500],
  lifts: [[5, 6]],
};

describe('decodeTrace', () => {
  it('reads thousandths of the frame into units of the photo’s height', () => {
    const { path } = decodeTrace(square, 1.5);
    expect(path).toHaveLength(8);
    expect(path[0].x).toBeCloseTo(0.15, 9);
    expect(path[0].y).toBeCloseTo(0.1, 9);
    expect(path[3].x).toBeCloseTo(1.35, 9);
  });

  it('marks the lifted steps, and only those', () => {
    const { lifted } = decodeTrace(square, 1);
    expect(lifted).toEqual([false, false, false, false, false, true, true, false]);
  });

  it('ignores lift runs that reach past the path', () => {
    const { lifted } = decodeTrace({ points: [0, 0, 1, 1, 2, 2], lifts: [[2, 9]] }, 1);
    expect(lifted).toEqual([false, false, true]);
  });
});

describe('traceCircles', () => {
  const { path } = decodeTrace(square, 1);

  it('starts with the centre of the drawing, then the largest circles', () => {
    const circles = traceCircles(path, 5);
    expect(circles).toHaveLength(5);
    expect(circles[0].frequency).toBe(0);
    expect(circles[0].amplitude).toBeCloseTo(Math.hypot(0.5, 0.5), 9);
    for (let i = 2; i < circles.length; i++) expect(circles[i].amplitude).toBeLessThanOrEqual(circles[i - 1].amplitude);
  });

  it('never asks for more circles than the path has samples', () => {
    expect(traceCircles(path, 50)).toHaveLength(8);
  });
});

describe('chainAt and penPath', () => {
  const { path } = decodeTrace(square, 1);

  it('redraws the path exactly when every circle is used', () => {
    const drawn = penPath(traceCircles(path, path.length), path.length);
    drawn.forEach((p, k) => {
      expect(p.x).toBeCloseTo(path[k].x, 9);
      expect(p.y).toBeCloseTo(path[k].y, 9);
    });
  });

  it('puts the end of the chain where the pen is', () => {
    const circles = traceCircles(path, 4);
    const joints = chainAt(circles, 3 / 8);
    expect(joints).toHaveLength(4);
    expect(joints[joints.length - 1]).toEqual(penPath(circles, 8)[3]);
  });
});
