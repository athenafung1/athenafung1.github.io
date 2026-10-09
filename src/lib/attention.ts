// Scaled dot-product attention (Vaswani et al., 2017), the core operation of transformers.
//
// Concept: every token in a sequence carries three learned vectors: a query ("what am I looking
// for?"), a key ("what do I offer?") and a value ("what do I pass on?"). To update one token, compare
// its query with every token's key by dot product (large when they point the same way), turn those
// scores into weights that sum to 1 with softmax, and output the weighted average of the values:
//   weights = softmax(q · kᵢ / √d),   output = Σ weightsᵢ · vᵢ
// Dividing by √d (d = vector length) stops scores growing with dimension, which would make softmax
// almost one-hot and stall learning. A transformer runs many of these "heads" in parallel, for every
// token at once, in every layer.
//
// How this code works: plain arrays, one query at a time. `scale` is a parameter so the demo can
// sharpen or soften the softmax, acting as a temperature.

export type Vec = number[];

export const dot = (a: Vec, b: Vec) => a.reduce((s, v, i) => s + v * b[i], 0);

/**
 * Softmax: exponentiate and normalise, so scores become positive weights summing to 1, with the
 * largest score dominating. Subtracting the max first cancels out in the ratio but keeps exp() from
 * overflowing.
 */
export function softmax(xs: number[]): number[] {
  const max = Math.max(...xs);
  const exps = xs.map((x) => Math.exp(x - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((e) => e / sum);
}

/**
 * Attention for one query: scores (scaled dot products with each key), weights (their softmax) and
 * output (the weighted average of the values). `scale` defaults to 1/√d.
 */
export function attend(query: Vec, keys: Vec[], values: Vec[], scale = 1 / Math.sqrt(query.length)) {
  const scores = keys.map((k) => dot(query, k) * scale);
  const weights = softmax(scores);
  const output = values[0].map((_, j) => weights.reduce((s, w, i) => s + w * values[i][j], 0));
  return { scores, weights, output };
}
