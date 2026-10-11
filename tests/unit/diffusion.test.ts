import { describe, expect, it } from 'vitest';
import { STEPS, cosineAlphaBars, gaussians, linearAlphaBars, noisy, snr } from '../../src/lib/diffusion.ts';
import { mulberry32 } from '../../src/lib/random.ts';

describe('diffusion forward process', () => {
  for (const [name, schedule] of [
    ['linear', linearAlphaBars()],
    ['cosine', cosineAlphaBars()],
  ] as const) {
    it(`${name}: ᾱ starts at 1, decreases monotonically, and ends near pure noise`, () => {
      expect(schedule[0]).toBe(1);
      for (let t = 1; t <= STEPS; t++) expect(schedule[t]).toBeLessThan(schedule[t - 1]);
      expect(schedule[STEPS]).toBeLessThan(1e-3);
    });
  }

  it('matches the DDPM linear schedule’s known endpoint (ᾱ_T ≈ 4.0e-5)', () => {
    expect(linearAlphaBars()[STEPS]).toBeGreaterThan(3e-5);
    expect(linearAlphaBars()[STEPS]).toBeLessThan(5e-5);
  });

  it('cosine keeps more signal than linear in the middle of the schedule', () => {
    expect(cosineAlphaBars()[500]).toBeGreaterThan(linearAlphaBars()[500]);
  });

  it('interpolates from data (ᾱ = 1) to noise (ᾱ = 0) and preserves unit variance', () => {
    expect(noisy(0.7, -1.2, 1)).toBeCloseTo(0.7, 12);
    expect(noisy(0.7, -1.2, 0)).toBeCloseTo(-1.2, 12);
    const rand = mulberry32(9);
    const x0 = gaussians(20000, rand);
    const eps = gaussians(20000, rand);
    const xt = x0.map((x, i) => noisy(x, eps[i], 0.3));
    const variance = xt.reduce((s, v) => s + v * v, 0) / xt.length;
    expect(variance).toBeCloseTo(1, 1);
    expect(snr(0.5)).toBeCloseTo(1, 12);
  });
});
