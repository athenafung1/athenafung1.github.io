import { describe, expect, it } from 'vitest';
import { GRID, HOPFIELD_MEMORIES, corrupt, energy, fromRows, overlap, recall, train, updateNeuron } from '../../src/lib/hopfield.ts';
import { mulberry32 } from '../../src/lib/random.ts';

const N = GRID * GRID;
const memories = HOPFIELD_MEMORIES.map((m) => m.state);
const w = train(memories, N);

describe('memories', () => {
  it('are all 12 × 12 and ±1', () => {
    for (const m of memories) {
      expect(m.length).toBe(N);
      expect([...m].every((v) => v === 1 || v === -1)).toBe(true);
    }
  });

  it('are distinct enough to store together (pairwise overlap below 0.6)', () => {
    for (let i = 0; i < memories.length; i++) {
      for (let j = i + 1; j < memories.length; j++) expect(Math.abs(overlap(memories[i], memories[j]))).toBeLessThan(0.6);
    }
  });
});

describe('train', () => {
  it('builds symmetric weights with a zero diagonal', () => {
    for (let i = 0; i < N; i++) {
      expect(w[i * N + i]).toBe(0);
      for (let j = 0; j < i; j++) expect(w[i * N + j]).toBe(w[j * N + i]);
    }
  });
});

describe('dynamics', () => {
  it('keeps every stored memory as a fixed point', () => {
    for (const m of memories) {
      const s = Int8Array.from(m);
      for (let i = 0; i < N; i++) expect(updateNeuron(w, s, i)).toBe(false);
    }
  });

  it('never increases the energy under asynchronous updates', () => {
    const rand = mulberry32(3);
    const s = corrupt(memories[0], 0.4, rand);
    let e = energy(w, s);
    for (let k = 0; k < 2000; k++) {
      updateNeuron(w, s, Math.floor(rand() * N));
      const next = energy(w, s);
      expect(next).toBeLessThanOrEqual(e + 1e-12);
      e = next;
    }
  });

  // Hebbian recall is reliable but not perfect: correlated memories create spurious blends,
  // which the demo explains rather than hides.
  it('usually recalls each memory exactly from 10% and 20% noise', () => {
    const rand = mulberry32(11);
    for (const [noise, minRate] of [
      [0.1, 0.95],
      [0.2, 0.8],
    ]) {
      for (const m of memories) {
        let exact = 0;
        for (let t = 0; t < 50; t++) if (overlap(recall(w, corrupt(m, noise, rand), rand).state, m) === 1) exact++;
        expect(exact / 50).toBeGreaterThanOrEqual(minRate);
      }
    }
  });

  it('degrades as more random memories are crammed in (capacity ≈ 0.14 N)', () => {
    const rand = mulberry32(2);
    const random = (k: number) => Array.from({ length: k }, () => Int8Array.from({ length: N }, () => (rand() < 0.5 ? 1 : -1)));
    const stableFraction = (k: number) => {
      const pats = random(k);
      const wk = train(pats, N);
      return pats.filter((p) => overlap(recall(wk, p, rand).state, p) > 0.95).length / k;
    };
    expect(stableFraction(5)).toBe(1);
    expect(stableFraction(60)).toBeLessThan(0.5);
  });

  it('also stores the inverse of each memory (spin-flip symmetry)', () => {
    const inverse = Int8Array.from(memories[1], (v) => -v);
    expect(energy(w, inverse)).toBeCloseTo(energy(w, memories[1]), 9);
  });
});

describe('helpers', () => {
  it('corrupt flips exactly the requested number of neurons', () => {
    const noisy = corrupt(memories[2], 0.25, mulberry32(5));
    expect(overlap(noisy, memories[2])).toBeCloseTo(1 - 2 * (Math.round(0.25 * N) / N), 12);
  });

  it('fromRows parses # as on and . as off', () => {
    expect([...fromRows(['#.', '.#'])]).toEqual([1, -1, -1, 1]);
  });
});
