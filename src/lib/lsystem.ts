// Lindenmayer systems: string rewriting plus a turtle that turns the result into line segments.
import type { Point } from './curves.ts';

export type LSystem = {
  axiom: string;
  rules: Record<string, string>;
  /** Turn angle in degrees for + and −. */
  angle: number;
  /** Symbols that draw a line forward (others are ignored by the turtle). */
  draw: string;
  startAngle?: number;
  maxDepth: number;
};

export function expand(axiom: string, rules: Record<string, string>, iterations: number): string {
  let current = axiom;
  for (let i = 0; i < iterations; i++) {
    let next = '';
    for (const symbol of current) next += rules[symbol] ?? symbol;
    current = next;
  }
  return current;
}

/** Turtle graphics: draw symbols step forward 1 unit; + turns left, − turns right; [ ] push/pop. */
export function turtle(commands: string, angleDeg: number, draw: string, startAngleDeg = 0): Point[] {
  const turn = (angleDeg * Math.PI) / 180;
  let x = 0;
  let y = 0;
  let heading = (startAngleDeg * Math.PI) / 180;
  const points: Point[] = [{ x, y }];
  const stack: Array<{ x: number; y: number; heading: number }> = [];
  for (const c of commands) {
    if (draw.includes(c)) {
      x += Math.cos(heading);
      y += Math.sin(heading);
      points.push({ x, y });
    } else if (c === '+') heading -= turn;
    else if (c === '-') heading += turn;
    else if (c === '[') stack.push({ x, y, heading });
    else if (c === ']') {
      const s = stack.pop();
      if (s) ({ x, y, heading } = s);
      points.push({ x: Number.NaN, y: Number.NaN }, { x, y }); // NaN = pen up
    }
  }
  return points;
}

export const KOCH_SNOWFLAKE: LSystem = {
  axiom: 'F--F--F',
  rules: { F: 'F+F--F+F' },
  angle: 60,
  draw: 'F',
  maxDepth: 6,
};

/** Sierpinski arrowhead curve: one unbroken line that fills the Sierpinski triangle. */
export const SIERPINSKI_ARROWHEAD: LSystem = {
  axiom: 'A',
  rules: { A: 'B-A-B', B: 'A+B+A' },
  angle: 60,
  draw: 'AB',
  maxDepth: 8,
};

/** Arrowhead orientation flips with depth parity; start rotated so the triangle sits on its base. */
export function arrowheadStartAngle(depth: number): number {
  return depth % 2 === 0 ? 0 : -60;
}
