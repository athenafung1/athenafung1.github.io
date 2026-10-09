// Hopfield network (Hopfield, 1982): an associative memory, which recalls a whole stored pattern
// from a damaged or partial copy of it.
//
// Concept: N binary neurons (+1 on, −1 off), every pair joined by a symmetric weight. Learning is
// Hebbian ("neurons that fire together wire together"): for each stored pattern, the weight between
// two neurons rises if they agree and falls if they disagree. The weights define an energy for every
// possible state, and each stored pattern sits at the bottom of its own valley. Recall is rolling
// downhill: flip one neuron at a time to agree with the weighted vote of all the others. A flip can
// only lower the energy, so the state must settle, usually in the nearest valley (the memory),
// sometimes in a spurious valley that blends several memories. Capacity is about 0.14·N random
// patterns; beyond that the valleys merge and recall fails.
//
// How this code works: train() builds the N×N weight matrix from the patterns; updateNeuron() is one
// neuron's vote; recall() repeats votes in random order until a whole sweep changes nothing.

export type State = Int8Array; // each entry +1 (on) or −1 (off)

/**
 * Hebbian learning: W = (1/N) Σ p pᵀ with a zero diagonal. For each pattern, w_ij rises when
 * neurons i and j agree (both +1 or both −1) and falls when they disagree. No self-connections.
 */
export function train(patterns: State[], n: number): Float64Array {
  const w = new Float64Array(n * n);
  for (const p of patterns) {
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const v = (p[i] * p[j]) / n;
        w[i * n + j] += v;
        w[j * n + i] += v;
      }
    }
  }
  return w;
}

/**
 * E = −½ Σ_ij w_ij s_i s_j: low when neurons agree with the neurons they are positively wired to,
 * so stored patterns sit at minima. Never increases under asynchronous updates (see updateNeuron).
 */
export function energy(w: Float64Array, s: State): number {
  const n = s.length;
  let e = 0;
  for (let i = 0; i < n; i++) {
    let h = 0;
    for (let j = 0; j < n; j++) h += w[i * n + j] * s[j];
    e += s[i] * h;
  }
  return -0.5 * e;
}

/**
 * Update neuron i in place to sign(local field); returns true if it flipped. Ties keep the state.
 * The local field h = Σ_j w_ij s_j is the weighted vote of every other neuron. Giving s_i the same
 * sign as h is exactly the choice that lowers E, which is why recall always settles.
 */
export function updateNeuron(w: Float64Array, s: State, i: number): boolean {
  const n = s.length;
  let h = 0;
  for (let j = 0; j < n; j++) h += w[i * n + j] * s[j];
  const next = h > 0 ? 1 : h < 0 ? -1 : s[i];
  if (next === s[i]) return false;
  s[i] = next;
  return true;
}

/**
 * Asynchronous recall: random-order sweeps until a sweep changes nothing (or maxSweeps). Updating
 * one neuron at a time matters: updating all at once can flip between two states forever.
 */
export function recall(w: Float64Array, start: State, rand: () => number, maxSweeps = 20): { state: State; sweeps: number } {
  const s = Int8Array.from(start);
  const order = Array.from({ length: s.length }, (_, i) => i);
  for (let sweep = 1; sweep <= maxSweeps; sweep++) {
    // Fisher–Yates shuffle: a fresh random update order each sweep.
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    let changed = false;
    for (const i of order) if (updateNeuron(w, s, i)) changed = true;
    if (!changed) return { state: s, sweeps: sweep };
  }
  return { state: s, sweeps: maxSweeps };
}

/** Flip a `fraction` of the neurons, chosen at random without replacement. */
export function corrupt(p: State, fraction: number, rand: () => number): State {
  const s = Int8Array.from(p);
  const idx = Array.from({ length: s.length }, (_, i) => i);
  const flips = Math.round(fraction * s.length);
  for (let k = 0; k < flips; k++) {
    const j = k + Math.floor(rand() * (idx.length - k));
    [idx[k], idx[j]] = [idx[j], idx[k]];
    s[idx[k]] = -s[idx[k]] as 1 | -1;
  }
  return s;
}

/**
 * m = (1/N) Σ a_i b_i: 1 for identical patterns, −1 for exact opposites. Opposites matter because
 * E(s) = E(−s): every stored memory's inverse is an energy minimum too.
 */
export function overlap(a: State, b: State): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += a[i] * b[i];
  return sum / a.length;
}

/** Parse rows of '#' (on) and '.' (off) into a ±1 state. */
export function fromRows(rows: string[]): State {
  return Int8Array.from(rows.join('').split(''), (c) => (c === '#' ? 1 : -1));
}

const SIZE = 12;
export const GRID = SIZE;

// 12 × 12 glyphs. Kept visually distinct so the overlaps between memories stay low.
export const HOPFIELD_MEMORIES: Array<{ id: string; label: string; state: State }> = [
  {
    id: 'a',
    label: 'A',
    state: fromRows([
      '............',
      '.....##.....',
      '....####....',
      '...##..##...',
      '..##....##..',
      '..##....##..',
      '..########..',
      '..########..',
      '..##....##..',
      '..##....##..',
      '..##....##..',
      '............',
    ]),
  },
  {
    id: 'f',
    label: 'F',
    state: fromRows([
      '............',
      '.#########..',
      '.#########..',
      '.##.........',
      '.##.........',
      '.#######....',
      '.#######....',
      '.##.........',
      '.##.........',
      '.##.........',
      '.##.........',
      '............',
    ]),
  },
  {
    id: 'heart',
    label: 'Heart',
    state: fromRows([
      '............',
      '..###..###..',
      '.##########.',
      '############',
      '############',
      '.##########.',
      '..########..',
      '...######...',
      '....####....',
      '.....##.....',
      '............',
      '............',
    ]),
  },
  {
    id: 'x',
    label: 'Cross',
    state: fromRows([
      '##........##',
      '###......###',
      '.###....###.',
      '..###..###..',
      '...######...',
      '....####....',
      '....####....',
      '...######...',
      '..###..###..',
      '.###....###.',
      '###......###',
      '##........##',
    ]),
  },
];
