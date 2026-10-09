// A tiny multi-layer perceptron for 2-D binary classification, with hand-written backpropagation
// and Adam. Small enough to train live in the browser at 60 fps.
//
// Concept: each layer computes z = W·x + b and passes it through a nonlinearity (tanh or ReLU).
// Stacking layers lets the network bend a straight dividing line into almost any shape. The last
// layer has one output, squashed by a sigmoid into p = P(class 1). Training minimises binary
// cross-entropy, −[y·log p + (1 − y)·log(1 − p)], which punishes confident mistakes hardest.
// Backpropagation finds every weight's gradient in one backward pass using the chain rule: start from
// the output error (for sigmoid with cross-entropy it is simply p − y), then repeatedly pass it back
// through a layer's weights and multiply by that layer's activation slope. Adam (see
// src/lib/optimizers.ts) then updates every weight.
//
// How this code works: each layer's weights are one flat Float64Array (output o, input i at
// o·inSize + i). forward() keeps every layer's z and activation for backprop; predict() is an
// allocation-free forward pass used to shade the decision field; lossAndGrads() averages gradients
// over the whole dataset (full-batch training).
import { mulberry32 } from './random.ts';

export type Activation = 'tanh' | 'relu';
export type Layer = { w: Float64Array; b: Float64Array; inSize: number; outSize: number };
export type Net = { layers: Layer[]; activation: Activation; adam: { m: Float64Array[]; v: Float64Array[]; t: number } };
export type Point = { x: number; y: number; label: 0 | 1 };

/**
 * Layers sized `sizes` (e.g. [2, 8, 8, 1]); Xavier/He-style init from a seeded generator. Random
 * weights make neurons start out different; scaling them by fan-in keeps each layer's output on
 * about the same scale as its input, so signals neither fade out nor blow up. Biases start at 0.
 */
export function createNet(sizes: number[], activation: Activation, seed = 1): Net {
  const rand = mulberry32(seed);
  const normal = () => Math.sqrt(-2 * Math.log(Math.max(rand(), 1e-12))) * Math.cos(2 * Math.PI * rand());
  const layers: Layer[] = [];
  for (let i = 0; i + 1 < sizes.length; i++) {
    const inSize = sizes[i];
    const outSize = sizes[i + 1];
    const scale = activation === 'relu' && i + 2 < sizes.length ? Math.sqrt(2 / inSize) : Math.sqrt(1 / inSize);
    layers.push({ w: Float64Array.from({ length: inSize * outSize }, () => normal() * scale), b: new Float64Array(outSize), inSize, outSize });
  }
  const zeros = () => layers.flatMap((l) => [new Float64Array(l.w.length), new Float64Array(l.b.length)]);
  return { layers, activation, adam: { m: zeros(), v: zeros(), t: 0 } };
}

const act = (a: Activation, z: number) => (a === 'tanh' ? Math.tanh(z) : Math.max(0, z));
const actGrad = (a: Activation, z: number, y: number) => (a === 'tanh' ? 1 - y * y : z > 0 ? 1 : 0);
const sigmoid = (z: number) => 1 / (1 + Math.exp(-z));

/** Forward pass keeping pre-activations (zs) and activations (ys) for backprop. */
export function forward(net: Net, input: number[]) {
  const ys: number[][] = [input];
  const zs: number[][] = [];
  net.layers.forEach((layer, li) => {
    const prev = ys[ys.length - 1];
    const z = new Array<number>(layer.outSize);
    for (let o = 0; o < layer.outSize; o++) {
      let sum = layer.b[o];
      for (let i = 0; i < layer.inSize; i++) sum += layer.w[o * layer.inSize + i] * prev[i];
      z[o] = sum;
    }
    zs.push(z);
    const last = li === net.layers.length - 1;
    ys.push(z.map((v) => (last ? sigmoid(v) : act(net.activation, v))));
  });
  return { zs, ys };
}

// Scratch buffers for predict(), which runs thousands of times per frame to shade the decision field.
let bufIn = new Float64Array(16);
let bufOut = new Float64Array(16);

/** Probability of class 1 at (x, y): forward() without keeping intermediates or allocating. */
export function predict(net: Net, x: number, y: number): number {
  let prev = bufIn;
  let next = bufOut;
  prev[0] = x;
  prev[1] = y;
  const last = net.layers.length - 1;
  for (let li = 0; li <= last; li++) {
    const { w, b, inSize, outSize } = net.layers[li];
    if (next.length < outSize) next = new Float64Array(outSize);
    for (let o = 0; o < outSize; o++) {
      let sum = b[o];
      for (let i = 0; i < inSize; i++) sum += w[o * inSize + i] * prev[i];
      next[o] = li === last ? sigmoid(sum) : act(net.activation, sum);
    }
    [prev, next] = [next, prev];
  }
  [bufIn, bufOut] = [prev, next];
  return prev[0];
}

/** Mean binary cross-entropy and its gradients over a batch. */
export function lossAndGrads(net: Net, batch: Point[]) {
  const grads = net.layers.flatMap((l) => [new Float64Array(l.w.length), new Float64Array(l.b.length)]);
  let loss = 0;
  for (const pt of batch) {
    const { zs, ys } = forward(net, [pt.x, pt.y]);
    const p = Math.min(1 - 1e-12, Math.max(1e-12, ys[ys.length - 1][0]));
    loss += -(pt.label * Math.log(p) + (1 - pt.label) * Math.log(1 - p));
    // Sigmoid + cross-entropy: dL/dz = p − y at the output.
    let delta = [ys[ys.length - 1][0] - pt.label];
    for (let li = net.layers.length - 1; li >= 0; li--) {
      const layer = net.layers[li];
      const prev = ys[li];
      const gw = grads[2 * li];
      const gb = grads[2 * li + 1];
      // This layer's gradients: ∂L/∂b = delta and ∂L/∂W = delta · inputᵀ (each weight's gradient is
      // its output's error times the input it multiplied).
      for (let o = 0; o < layer.outSize; o++) {
        gb[o] += delta[o];
        for (let i = 0; i < layer.inSize; i++) gw[o * layer.inSize + i] += delta[o] * prev[i];
      }
      // Error for the layer below: Wᵀ · delta, times the slope of that layer's activation.
      if (li > 0) {
        const next = new Array<number>(layer.inSize).fill(0);
        for (let i = 0; i < layer.inSize; i++) {
          let sum = 0;
          for (let o = 0; o < layer.outSize; o++) sum += layer.w[o * layer.inSize + i] * delta[o];
          next[i] = sum * actGrad(net.activation, zs[li - 1][i], ys[li][i]);
        }
        delta = next;
      }
    }
  }
  const n = batch.length;
  for (const g of grads) for (let i = 0; i < g.length; i++) g[i] /= n;
  return { loss: loss / n, grads };
}

/** One Adam step on the batch (as in src/lib/optimizers.ts); returns the loss before the update. */
export function trainStep(net: Net, batch: Point[], lr: number): number {
  const { loss, grads } = lossAndGrads(net, batch);
  const { adam } = net;
  adam.t++;
  const params = net.layers.flatMap((l) => [l.w, l.b]);
  params.forEach((p, k) => {
    const m = adam.m[k];
    const v = adam.v[k];
    const g = grads[k];
    for (let i = 0; i < p.length; i++) {
      m[i] = 0.9 * m[i] + 0.1 * g[i];
      v[i] = 0.999 * v[i] + 0.001 * g[i] * g[i];
      p[i] -= (lr * (m[i] / (1 - 0.9 ** adam.t))) / (Math.sqrt(v[i] / (1 - 0.999 ** adam.t)) + 1e-8);
    }
  });
  return loss;
}

export const accuracy = (net: Net, data: Point[]) => data.filter((p) => (predict(net, p.x, p.y) > 0.5 ? 1 : 0) === p.label).length / data.length;

// --- Toy datasets on [−1, 1]², labels alternating 0/1. None can be split by a straight line, so each
// needs a hidden layer; the spiral needs the most bending. ---
export type DatasetId = 'spiral' | 'circles' | 'xor' | 'moons';

export function dataset(id: DatasetId, n: number, seed = 3): Point[] {
  const rand = mulberry32(seed);
  const jitter = (s: number) => (rand() - 0.5) * s;
  const pts: Point[] = [];
  for (let i = 0; i < n; i++) {
    const label = (i % 2) as 0 | 1;
    if (id === 'spiral') {
      const r = (i / n) * 0.9 + 0.05;
      const t = 1.75 * r * 2 * Math.PI + label * Math.PI;
      pts.push({ x: r * Math.cos(t) + jitter(0.06), y: r * Math.sin(t) + jitter(0.06), label });
    } else if (id === 'circles') {
      const r = label ? 0.35 + jitter(0.12) : 0.8 + jitter(0.12);
      const t = rand() * 2 * Math.PI;
      pts.push({ x: r * Math.cos(t), y: r * Math.sin(t), label });
    } else if (id === 'xor') {
      const x = rand() * 1.8 - 0.9;
      const y = rand() * 1.8 - 0.9;
      pts.push({ x, y, label: (x > 0) !== (y > 0) ? 1 : 0 });
    } else {
      const t = rand() * Math.PI;
      pts.push(
        label
          ? { x: 0.55 * (1 - Math.cos(t)) - 0.3 + jitter(0.1), y: -0.55 * Math.sin(t) + 0.25 + jitter(0.1), label }
          : { x: 0.55 * Math.cos(t) - 0.25 + jitter(0.1), y: 0.55 * Math.sin(t) - 0.2 + jitter(0.1), label },
      );
    }
  }
  return pts;
}
