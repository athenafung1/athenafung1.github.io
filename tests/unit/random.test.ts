import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../../src/lib/random.ts';

describe('mulberry32', () => {
  it('is deterministic per seed and in [0, 1)', () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    const c = mulberry32(43);
    const sa = Array.from({ length: 1000 }, a);
    expect(sa).toEqual(Array.from({ length: 1000 }, b));
    expect(sa).not.toEqual(Array.from({ length: 1000 }, c));
    for (const v of sa) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});
