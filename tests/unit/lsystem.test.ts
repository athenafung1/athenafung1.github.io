import { describe, expect, it } from 'vitest';
import { KOCH_SNOWFLAKE, SIERPINSKI_ARROWHEAD, arrowheadStartAngle, expand, turtle } from '../../src/lib/lsystem.ts';

const count = (s: string, chars: string) => [...s].filter((c) => chars.includes(c)).length;

describe('expand', () => {
  it('applies every rule in parallel', () => {
    expect(expand('AB', { A: 'AB', B: 'A' }, 3)).toBe('ABAABABA');
    expect(expand('F', {}, 5)).toBe('F');
  });

  it('grows the Koch snowflake to 3·4ⁿ segments', () => {
    for (let n = 0; n <= 4; n++) expect(count(expand(KOCH_SNOWFLAKE.axiom, KOCH_SNOWFLAKE.rules, n), 'F')).toBe(3 * 4 ** n);
  });

  it('grows the Sierpinski arrowhead to 3ⁿ segments', () => {
    for (let n = 0; n <= 5; n++) {
      expect(count(expand(SIERPINSKI_ARROWHEAD.axiom, SIERPINSKI_ARROWHEAD.rules, n), 'AB')).toBe(3 ** n);
    }
  });
});

describe('turtle', () => {
  it('closes the Koch snowflake (ends where it started)', () => {
    const pts = turtle(expand(KOCH_SNOWFLAKE.axiom, KOCH_SNOWFLAKE.rules, 3), 60, 'F');
    const last = pts[pts.length - 1];
    expect(Math.hypot(last.x, last.y)).toBeLessThan(1e-9);
  });

  it('spans the base of a 2ⁿ-unit triangle for the arrowhead curve', () => {
    for (const n of [2, 3, 4]) {
      const pts = turtle(expand(SIERPINSKI_ARROWHEAD.axiom, SIERPINSKI_ARROWHEAD.rules, n), 60, 'AB', arrowheadStartAngle(n));
      const last = pts[pts.length - 1];
      expect(Math.hypot(last.x, last.y)).toBeCloseTo(2 ** n, 9);
    }
  });

  it('uses a NaN point as pen-up when a branch is popped', () => {
    const pts = turtle('F[+F]F', 90, 'F');
    expect(pts.some((p) => Number.isNaN(p.x))).toBe(true);
  });
});
