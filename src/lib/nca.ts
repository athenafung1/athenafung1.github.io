// Browser inference for the neural cellular automaton (NCA) trained by scripts/nca/train.py.
//
// Concept: a cellular automaton is a grid where every cell updates by the same local rule, looking
// only at itself and its 8 neighbours. In a neural CA the rule is a small neural network found by
// gradient descent instead of written by hand (Mordvintsev et al., "Growing Neural Cellular
// Automata", Distill 2020). Each cell holds C numbers: channel 0 is the visible ink, and the rest are
// hidden signals the cells use to coordinate, a bit like chemical gradients in a growing embryo.
// Training found a rule that grows the target shape from a single cell, holds it steady, and regrows
// it after damage. No cell knows the overall shape; it emerges from local interactions.
//
// One step, for every cell:
//   1. Perceive: its own state plus the Sobel x/y gradient of every channel (how each signal changes
//      across the neighbourhood): 3C numbers.
//   2. Compute: a two-layer network (3C → hidden ReLU → C) proposes a change to the state.
//   3. Fire at random: each cell applies its update with probability fireRate, like cells with no
//      shared clock, so the rule cannot rely on everyone updating in lockstep.
//   4. Live or die: a cell is alive if any cell in its 3×3 neighbourhood has ink above a threshold.
//      Cells not alive both before and after the step are emptied, so growth only spreads outward
//      from living tissue.
//
// This must match the Python step exactly; tests/unit/ml.test.ts checks one step against a fixture
// that the trainer writes.

export type NcaWeights = {
  size: number;
  channels: number;
  hidden: number;
  fireRate: number;
  aliveThreshold: number;
  W1: number[]; // (3C × hidden), row-major
  b1: number[];
  W2: number[]; // (hidden × C), row-major
};

const SOBEL_X = [-1, 0, 1, -2, 0, 2, -1, 0, 1].map((v) => v / 8);
const SOBEL_Y = [-1, -2, -1, 0, 0, 0, 1, 2, 1].map((v) => v / 8);

/** The starting state: one live cell in the middle, every channel 1 (the "seed"). */
export function seedState(size: number, channels: number): Float32Array {
  const s = new Float32Array(size * size * channels);
  const c = (Math.floor(size / 2) * size + Math.floor(size / 2)) * channels;
  s.fill(1, c, c + channels);
  return s;
}

/** Alive = the largest ink value in the cell's 3×3 neighbourhood exceeds the threshold. */
function aliveMask(state: Float32Array, size: number, channels: number, threshold: number): Uint8Array {
  const out = new Uint8Array(size * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let max = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const yy = y + dy;
          const xx = x + dx;
          if (yy < 0 || xx < 0 || yy >= size || xx >= size) continue;
          max = Math.max(max, state[(yy * size + xx) * channels]);
        }
      }
      out[y * size + x] = max > threshold ? 1 : 0;
    }
  }
  return out;
}

/** One automaton step. `rand` decides which cells fire (a cell fires when rand() < fireRate). */
export function ncaStep(state: Float32Array, w: NcaWeights, rand: () => number): Float32Array {
  const { size, channels: C, hidden: H } = w;
  const pre = aliveMask(state, size, C, w.aliveThreshold);
  const next = Float32Array.from(state);
  const perception = new Float32Array(3 * C);
  const hidden = new Float32Array(H);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      // 3. Random firing (checked first, since a cell that does not fire computes nothing).
      if (!(rand() < w.fireRate)) continue;
      // A cell that was not alive before the step is zeroed below whatever it computes; skip it.
      if (!pre[y * size + x]) continue;
      const cell = (y * size + x) * C;
      // 1. Perceive: for each channel, the cell's value and its Sobel x/y gradients (zero outside the
      // grid), in the trainer's order [state, ∂x, ∂y].
      for (let c = 0; c < C; c++) {
        let gx = 0;
        let gy = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const yy = y + dy;
            const xx = x + dx;
            if (yy < 0 || xx < 0 || yy >= size || xx >= size) continue;
            const v = state[(yy * size + xx) * C + c];
            const k = (dy + 1) * 3 + (dx + 1);
            gx += SOBEL_X[k] * v;
            gy += SOBEL_Y[k] * v;
          }
        }
        perception[c] = state[cell + c];
        perception[C + c] = gx;
        perception[2 * C + c] = gy;
      }
      // 2. Hidden layer, ReLU(perception · W1 + b1), then an output layer with no bias or activation
      // whose result is added to this cell's state.
      for (let h = 0; h < H; h++) {
        let sum = w.b1[h];
        for (let i = 0; i < 3 * C; i++) sum += perception[i] * w.W1[i * H + h];
        hidden[h] = sum > 0 ? sum : 0;
      }
      for (let c = 0; c < C; c++) {
        let sum = 0;
        for (let h = 0; h < H; h++) sum += hidden[h] * w.W2[h * C + c];
        next[cell + c] += sum;
      }
    }
  }
  // 4. Keep only cells alive both before and after the update; empty the rest.
  const post = aliveMask(next, size, C, w.aliveThreshold);
  for (let i = 0; i < size * size; i++) if (!(pre[i] && post[i])) next.fill(0, i * C, i * C + C);
  return next;
}

/** Zero every channel inside a circle (grid units). */
export function damage(state: Float32Array, size: number, channels: number, cx: number, cy: number, r: number) {
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if ((x - cx) ** 2 + (y - cy) ** 2 < r * r) state.fill(0, (y * size + x) * channels, (y * size + x + 1) * channels);
    }
  }
}
