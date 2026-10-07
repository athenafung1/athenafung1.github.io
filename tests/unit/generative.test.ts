import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../../src/lib/random.ts';
import { pointInPolygon, polygonArea, randomSites, voronoiCells } from '../../src/lib/voronoi.ts';
import { createNoise } from '../../src/lib/noise.ts';
import { generate, nextRow, singleCell } from '../../src/lib/automata.ts';

const bits = (row: Uint8Array) => [...row].join('');

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

describe('voronoiCells', () => {
  const sites = randomSites(40, 1200, 140, mulberry32(7));
  const cells = voronoiCells(sites, 1200, 140);

  it('partitions the box: cell areas sum to its area', () => {
    const total = cells.reduce((sum, cell) => sum + Math.abs(polygonArea(cell)), 0);
    expect(total).toBeCloseTo(1200 * 140, 4);
  });

  it('contains each site in its own cell', () => {
    sites.forEach((site, i) => expect(pointInPolygon(site, cells[i])).toBe(true));
  });

  it('puts every cell vertex at least as close to its site as to any other', () => {
    cells.forEach((cell, i) => {
      for (const v of cell) {
        const own = Math.hypot(v.x - sites[i].x, v.y - sites[i].y);
        for (const other of sites) expect(own).toBeLessThanOrEqual(Math.hypot(v.x - other.x, v.y - other.y) + 1e-6);
      }
    });
  });
});

describe('createNoise', () => {
  const noise = createNoise(1);

  it('is deterministic and seed-dependent', () => {
    expect(createNoise(1)(3.3, 4.7)).toBe(noise(3.3, 4.7));
    expect(createNoise(2)(3.3, 4.7)).not.toBe(noise(3.3, 4.7));
  });

  it('is zero on integer lattice points and within [−1, 1]', () => {
    expect(noise(5, 9)).toBeCloseTo(0, 12);
    for (let i = 0; i < 2000; i++) {
      const v = noise(i * 0.137, i * 0.071);
      expect(v).toBeGreaterThanOrEqual(-1);
      expect(v).toBeLessThanOrEqual(1);
    }
  });

  it('is continuous', () => {
    for (let i = 0; i < 200; i++) {
      const x = i * 0.31;
      expect(Math.abs(noise(x, 1.7) - noise(x + 1e-4, 1.7))).toBeLessThan(1e-3);
    }
  });
});

describe('elementary cellular automata', () => {
  it('produces Rule 30’s known first rows from one cell', () => {
    const rows = generate(30, singleCell(11), 4).map(bits);
    expect(rows).toEqual(['00000100000', '00001110000', '00011001000', '00110111100']);
  });

  it('Rule 90 from one cell is Pascal’s triangle mod 2 (Sierpinski)', () => {
    const rows = generate(90, singleCell(17), 8);
    for (let n = 0; n < 8; n++) {
      for (let k = 0; k <= n; k++) {
        let binom = 1;
        for (let j = 0; j < k; j++) binom = (binom * (n - j)) / (j + 1);
        expect(rows[n][8 - n + 2 * k]).toBe(binom % 2);
      }
    }
  });

  it('handles the trivial rules and wraps at the edges', () => {
    expect(bits(nextRow(Uint8Array.from([1, 0, 1, 1]), 0))).toBe('0000');
    expect(bits(nextRow(Uint8Array.from([1, 0, 1, 1]), 255))).toBe('1111');
    // Rule 184 (traffic): a lone car at the right edge moves to the left edge.
    expect(bits(nextRow(Uint8Array.from([0, 0, 0, 1]), 184))).toBe('1000');
  });
});
