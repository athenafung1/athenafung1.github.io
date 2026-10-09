import { describe, expect, it } from 'vitest';
import {
  TOPO_PRESETS,
  dofCount,
  elementDofs,
  elementStiffness,
  filterWeights,
  halfBandwidth,
  initialState,
  iterate,
  solveBanded,
  type Problem,
} from '../../src/lib/topopt.ts';

describe('elementStiffness', () => {
  const ke = elementStiffness();

  it('is symmetric', () => {
    for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) expect(ke[i * 8 + j]).toBeCloseTo(ke[j * 8 + i], 12);
  });

  it('stores no energy under rigid translation', () => {
    for (const shift of [
      [1, 0, 1, 0, 1, 0, 1, 0],
      [0, 1, 0, 1, 0, 1, 0, 1],
    ]) {
      for (let i = 0; i < 8; i++) {
        let row = 0;
        for (let j = 0; j < 8; j++) row += ke[i * 8 + j] * shift[j];
        expect(row).toBeCloseTo(0, 12);
      }
    }
  });
});

describe('mesh helpers', () => {
  it('keeps every element within the stated half-bandwidth', () => {
    const nelx = 7;
    const nely = 4;
    for (let x = 0; x < nelx; x++) {
      for (let y = 0; y < nely; y++) {
        const d = elementDofs(nely, x, y);
        expect(Math.max(...d) - Math.min(...d)).toBeLessThanOrEqual(halfBandwidth(nely));
        expect(Math.max(...d)).toBeLessThan(dofCount(nelx, nely));
      }
    }
  });
});

describe('solveBanded', () => {
  it('matches a direct solve of a small SPD band system', () => {
    // Tridiagonal [4 1; 1 4 1; 1 4 1; 1 4], b = 1, lower band stored as [diag, sub].
    const n = 4;
    const band = new Float64Array([4, 0, 4, 1, 4, 1, 4, 1]);
    const u = solveBanded(band, n, 1, new Float64Array([1, 2, 3, 4]));
    const A = [
      [4, 1, 0, 0],
      [1, 4, 1, 0],
      [0, 1, 4, 1],
      [0, 0, 1, 4],
    ];
    A.forEach((row, i) => expect(row.reduce((s, v, j) => s + v * u[j], 0)).toBeCloseTo([1, 2, 3, 4][i], 12));
  });
});

const problem = (id: string, nelx = 30, nely = 10, volfrac = 0.5): Problem => {
  const { force, fixed } = TOPO_PRESETS.find((p) => p.id === id)!.build(nelx, nely);
  return { nelx, nely, volfrac, penal: 3, rmin: 1.5, force, fixed };
};

describe('iterate', () => {
  it('lowers compliance while holding the volume fraction', () => {
    const p = problem('mbb');
    const neighbours = filterWeights(p.nelx, p.nely, p.rmin);
    let s = iterate(p, initialState(p), neighbours);
    const first = s.compliance;
    for (let i = 0; i < 30; i++) s = iterate(p, s, neighbours);
    expect(s.compliance).toBeLessThan(first * 0.7);
    const mean = s.x.reduce((a, b) => a + b, 0) / s.x.length;
    expect(Math.abs(mean - p.volfrac)).toBeLessThan(2e-3);
  });

  it('produces a design symmetric about the load line for a centred cantilever load', () => {
    const p = problem('cantilever', 24, 12);
    const neighbours = filterWeights(p.nelx, p.nely, p.rmin);
    let s = initialState(p);
    for (let i = 0; i < 20; i++) s = iterate(p, s, neighbours);
    for (let x = 0; x < p.nelx; x++) {
      for (let y = 0; y < p.nely / 2; y++) {
        expect(s.x[x * p.nely + y]).toBeCloseTo(s.x[x * p.nely + (p.nely - 1 - y)], 3);
      }
    }
  });

  it('builds every preset without singular stiffness', () => {
    for (const preset of TOPO_PRESETS) {
      const p = problem(preset.id, 20, 8);
      const s = iterate(p, initialState(p));
      expect(Number.isFinite(s.compliance)).toBe(true);
      expect(s.compliance).toBeGreaterThan(0);
    }
  });
});
