// The forward (noising) process of diffusion models (Ho, Jain & Abbeel, 2020).
//
// Concept: image generators such as Stable Diffusion are built around a fixed recipe for destroying
// data. Over T steps a little Gaussian noise is mixed in at each step (step t adds variance β_t)
// until nothing of the original is left. A network is trained to predict the noise in any noised
// image, which lets it run the recipe backwards: start from pure noise and remove a little at a time
// until an image appears. The forward half needs no learning and has a closed form, so any step can
// be sampled straight from the clean data:
//   x_t = √ᾱ_t · x₀ + √(1 − ᾱ_t) · ε,   ε ~ N(0, I),   ᾱ_t = Π_{s ≤ t} (1 − β_s).
// ᾱ_t is the share of the original signal left at step t: 1 at the start, close to 0 at T. The two
// weights' squares add to 1, so data with unit variance keeps unit variance all the way. The
// schedule matters: the linear one reaches almost pure noise well before step T, wasting its last
// steps, while the cosine one falls more evenly.
//
// How this code works: each schedule returns ᾱ for every step as a lookup table; noisy() applies the
// formula to one coordinate; gaussians() draws ε. Running the process backwards needs a trained
// denoising network and is not implemented here.

export const STEPS = 1000;

/** ᾱ_0 … ᾱ_T for the linear β schedule (β from 1e-4 to 0.02, as in DDPM). Index 0 is the clean data. */
export function linearAlphaBars(T = STEPS, beta1 = 1e-4, betaT = 0.02): Float64Array {
  const out = new Float64Array(T + 1);
  out[0] = 1;
  for (let t = 1; t <= T; t++) {
    // β_t rises linearly; each step keeps a fraction (1 − β_t) of the signal variance left.
    const beta = beta1 + ((betaT - beta1) * (t - 1)) / (T - 1);
    out[t] = out[t - 1] * (1 - beta);
  }
  return out;
}

/**
 * ᾱ_t for the cosine schedule (Nichol & Dhariwal, 2021): defined directly as ᾱ_t ∝ f(t), a cos²
 * curve that falls slowly at both ends. β_t is recovered from consecutive values and clipped at 0.999
 * so the last steps stay finite; the small offset s keeps β from being vanishingly small near t = 0.
 */
export function cosineAlphaBars(T = STEPS, s = 0.008): Float64Array {
  const f = (t: number) => Math.cos(((t / T + s) / (1 + s)) * (Math.PI / 2)) ** 2;
  const out = new Float64Array(T + 1);
  out[0] = 1;
  for (let t = 1; t <= T; t++) {
    const beta = Math.min(0.999, 1 - f(t) / f(t - 1));
    out[t] = out[t - 1] * (1 - beta);
  }
  return out;
}

/** One coordinate of x_t given clean value x0, noise eps and ᾱ_t. */
export const noisy = (x0: number, eps: number, alphaBar: number) => Math.sqrt(alphaBar) * x0 + Math.sqrt(1 - alphaBar) * eps;

/** Signal-to-noise ratio ᾱ / (1 − ᾱ). */
export const snr = (alphaBar: number) => alphaBar / (1 - alphaBar);

/** Standard normal samples via Box–Muller: two uniform samples become two independent normals. */
export function gaussians(n: number, rand: () => number): Float64Array {
  const out = new Float64Array(n);
  for (let i = 0; i < n; i += 2) {
    const u = Math.max(rand(), 1e-12);
    const v = rand();
    const r = Math.sqrt(-2 * Math.log(u));
    out[i] = r * Math.cos(2 * Math.PI * v);
    if (i + 1 < n) out[i + 1] = r * Math.sin(2 * Math.PI * v);
  }
  return out;
}
