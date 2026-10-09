import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { STEPS, cosineAlphaBars, gaussians, linearAlphaBars, noisy, snr } from '../../src/lib/diffusion.ts';
import { attend, softmax } from '../../src/lib/attention.ts';
import { LANDSCAPES, initState, optimizerStep, type OptimizerId, type P } from '../../src/lib/optimizers.ts';
import { accuracy, createNet, dataset, forward, lossAndGrads, predict, trainStep } from '../../src/lib/mlp.ts';
import { damage, ncaStep, seedState, type NcaWeights } from '../../src/lib/nca.ts';
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

describe('attention', () => {
  it('softmax sums to 1 and is stable for large scores', () => {
    const w = softmax([1000, 1001, 999]);
    expect(w.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 12);
    expect(w.every(Number.isFinite)).toBe(true);
  });

  it('attends uniformly with a zero query', () => {
    const { weights } = attend([0, 0], [[1, 0], [0, 1], [-1, 0]], [[1], [2], [3]]);
    for (const w of weights) expect(w).toBeCloseTo(1 / 3, 12);
  });

  it('concentrates on the aligned key as the query grows, and returns its value', () => {
    const keys = [[1, 0], [0, 1], [-1, 0]];
    const values = [[10, 0], [0, 10], [-10, 0]];
    const { weights, output } = attend([50, 0], keys, values);
    expect(weights[0]).toBeGreaterThan(0.999);
    expect(output[0]).toBeCloseTo(10, 2);
  });
});

describe('optimisers', () => {
  const numericGrad = (f: (p: P) => number, p: P): P => {
    const h = 1e-6;
    return [(f([p[0] + h, p[1]]) - f([p[0] - h, p[1]])) / (2 * h), (f([p[0], p[1] + h]) - f([p[0], p[1] - h])) / (2 * h)];
  };

  it('have analytic gradients that match finite differences', () => {
    for (const l of LANDSCAPES) {
      for (const p of [l.start, [0.3, -0.7] as P, [1.2, 0.4] as P]) {
        const [a, b] = l.grad(p);
        const [na, nb] = numericGrad(l.f, p);
        expect(a).toBeCloseTo(na, 3);
        expect(b).toBeCloseTo(nb, 3);
      }
    }
  });

  it('place every landscape’s minima at zero loss', () => {
    for (const l of LANDSCAPES) for (const m of l.minima) expect(l.f(m)).toBeCloseTo(0, 4);
  });

  it('take a first Adam step of about lr per coordinate (bias correction)', () => {
    const s = optimizerStep('adam', initState([0, 0]), [5, -0.01], 0.1);
    expect(s.p[0]).toBeCloseTo(-0.1, 6);
    expect(s.p[1]).toBeCloseTo(0.1, 4);
  });

  it('all reach the bowl minimum with their default rates, and momentum beats plain descent', () => {
    const bowl = LANDSCAPES.find((l) => l.id === 'bowl')!;
    const run = (id: OptimizerId, steps: number) => {
      let s = initState(bowl.start);
      for (let i = 0; i < steps; i++) s = optimizerStep(id, s, bowl.grad(s.p), bowl.lr[id]);
      return bowl.f(s.p);
    };
    for (const id of ['sgd', 'momentum', 'adam'] as const) expect(run(id, 600)).toBeLessThan(1e-3);
    // Momentum oscillates early but converges far faster: ~300× lower loss than descent by step 200.
    expect(run('momentum', 200)).toBeLessThan(run('sgd', 200) / 10);
  });

  it('follow the Rosenbrock valley, momentum and Adam far faster than plain descent', () => {
    const r = LANDSCAPES.find((l) => l.id === 'rosenbrock')!;
    const run = (id: OptimizerId) => {
      let s = initState(r.start);
      for (let i = 0; i < 1500; i++) s = optimizerStep(id, s, r.grad(s.p), r.lr[id]);
      return r.f(s.p);
    };
    const [sgd, momentum, adam] = [run('sgd'), run('momentum'), run('adam')];
    expect(sgd).toBeLessThan(r.f(r.start));
    expect(momentum).toBeLessThan(r.f(r.start) / 1000);
    expect(adam).toBeLessThan(r.f(r.start) / 1000);
    expect(sgd).toBeGreaterThan(momentum * 100);
  });
});

describe('mlp', () => {
  it('predict matches the full forward pass, including layers wider than its scratch buffer', () => {
    for (const net of [createNet([2, 5, 3, 1], 'tanh', 2), createNet([2, 24, 20, 1], 'relu', 3)]) {
      for (const [x, y] of [[0, 0], [0.3, -0.7], [-0.9, 0.95]]) {
        const full = forward(net, [x, y]).ys[net.layers.length][0];
        expect(predict(net, x, y)).toBeCloseTo(full, 12);
      }
    }
  });

  it('has backprop gradients that match finite differences', () => {
    const net = createNet([2, 4, 3, 1], 'tanh', 5);
    const batch = dataset('moons', 12, 2);
    const { grads } = lossAndGrads(net, batch);
    const params = net.layers.flatMap((l) => [l.w, l.b]);
    params.forEach((p, k) => {
      for (const i of [0, Math.floor(p.length / 2), p.length - 1]) {
        const orig = p[i];
        p[i] = orig + 1e-6;
        const up = lossAndGrads(net, batch).loss;
        p[i] = orig - 1e-6;
        const down = lossAndGrads(net, batch).loss;
        p[i] = orig;
        expect(grads[k][i]).toBeCloseTo((up - down) / 2e-6, 5);
      }
    });
  });

  it('learns XOR (which a single neuron cannot)', () => {
    const data = dataset('xor', 200, 4);
    const net = createNet([2, 8, 1], 'tanh', 2);
    for (let i = 0; i < 400; i++) trainStep(net, data, 0.05);
    expect(accuracy(net, data)).toBeGreaterThan(0.95);
  });

  it('reduces the loss on the spiral with a deeper ReLU net', () => {
    const data = dataset('spiral', 200, 1);
    const net = createNet([2, 16, 16, 1], 'relu', 3);
    const first = trainStep(net, data, 0.02);
    let last = first;
    for (let i = 0; i < 600; i++) last = trainStep(net, data, 0.02);
    expect(last).toBeLessThan(first / 3);
  });

  it('outputs probabilities', () => {
    const net = createNet([2, 4, 1], 'relu', 1);
    const p = forward(net, [0.2, -0.4]).ys[2][0];
    expect(p).toBeGreaterThan(0);
    expect(p).toBeLessThan(1);
  });
});

describe('neural cellular automaton', () => {
  const weightsPath = 'src/data/nca-weights.json';
  const fixturePath = 'tests/fixtures/nca-step.json';

  it('seeds one live cell in the centre and damages a disc', () => {
    const s = seedState(8, 3);
    expect(s.reduce((a, b) => a + b, 0)).toBe(3);
    damage(s, 8, 3, 4, 4, 1.5);
    expect(s.reduce((a, b) => a + b, 0)).toBe(0);
  });

  it.skipIf(!existsSync(fixturePath) || !existsSync(weightsPath))('matches the NumPy training step exactly (all cells firing)', () => {
    const weights = JSON.parse(readFileSync(weightsPath, 'utf8')) as NcaWeights;
    const fixture = JSON.parse(readFileSync(fixturePath, 'utf8')) as { size: number; state: number[]; expected: number[] };
    const out = ncaStep(Float32Array.from(fixture.state), { ...weights, size: fixture.size }, () => 0);
    fixture.expected.forEach((v, i) => expect(out[i]).toBeCloseTo(v, 3));
  });
});
