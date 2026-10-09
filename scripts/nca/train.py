#!/usr/bin/env python3
"""Train a tiny Neural Cellular Automaton to grow, and regrow, a three-petal rose curve.

After Mordvintsev, Randazzo, Niklasson & Levin, "Growing Neural Cellular Automata" (Distill, 2020).
The update rule, step() below (mirrored in src/lib/nca.ts, which explains the concept): every cell
perceives itself and its neighbours (identity + Sobel x/y per channel), a small per-cell MLP
proposes an update, cells fire stochastically, and only cells near living cells survive.

How training works:
  - Loss: run the automaton for 48–80 steps from some starting state, then compare the ink channel
    with the target mark (mean squared error). Only the end result is scored; nothing says how to
    get there.
  - Gradients: backpropagation through time. A rollout is one long computation in which every step
    reuses the same weights. loss_and_grads() runs it forwards, keeping what each step needs, then
    walks the steps in reverse with step_backward(), carrying the gradient of the state backwards
    and adding up each step's contribution to the weight gradients. `--check` verifies it against
    finite differences.
  - Persistence: a pool of 256 states. Each batch is drawn from the pool and written back after its
    rollout, so later batches continue from earlier results and the rule is trained on states
    hundreds of steps old: it must hold the shape, not just pass through it. The worst sample in
    each batch is reset to the seed, so growing from scratch is never forgotten.
  - Regeneration: after the first 200 iterations, two samples per batch have a random disc zeroed
    before their rollout, so the rule also learns to repair.
  - Optimiser: Adam, with each weight array's gradient first scaled to unit length (as in the
    paper), which keeps gradients from very long rollouts from producing wild steps.

Offline tool: NumPy only, CPU, about 45 minutes for 3000 iterations. The site ships the resulting
weights (src/data/nca-weights.json) and runs the automaton in the browser.

  python3 scripts/nca/train.py --check            # finite-difference gradient check (fast)
  python3 scripts/nca/train.py --iters 3000       # train, writing weights every 100 iterations
"""
import argparse
import json
import math
import time
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[2]
SIZE = 32  # grid is SIZE × SIZE
PETALS = 3  # the target is the rose r = cos(PETALS·θ); odd k gives k petals
RADIUS = 13  # petal length in cells
C = 12  # channels per cell; channel 0 is the visible "ink" and decides who is alive
HID = 32  # hidden units in the per-cell update MLP
FIRE = 0.5  # probability a cell updates on a given step
ALIVE = 0.1  # a cell lives if any neighbour's ink exceeds this
SOBEL_X = np.array([[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]], np.float32) / 8
SOBEL_Y = SOBEL_X.T.copy()


def target_mark(size=SIZE):
    """Filled rose r ≤ cos k(φ − π/2), k = PETALS, one petal up, anti-aliased by 4× supersampling."""
    s = 4
    n = size * s
    yy, xx = np.mgrid[0:n, 0:n].astype(np.float32)
    c = (n - 1) / 2
    x = (xx - c) / (RADIUS * s)
    y = (c - yy) / (RADIUS * s)
    r = np.hypot(x, y)
    phi = np.arctan2(y, x)
    inside = (r <= np.maximum(0, np.cos(PETALS * (phi - np.pi / 2)))).astype(np.float32)
    return inside.reshape(size, s, size, s).mean(axis=(1, 3))


def correlate(x, k):
    """Depthwise 3×3 cross-correlation with zero padding. x: (B, H, W, C)."""
    B, H, W, _ = x.shape
    xp = np.pad(x, ((0, 0), (1, 1), (1, 1), (0, 0)))
    out = np.zeros_like(x)
    for di in (-1, 0, 1):
        for dj in (-1, 0, 1):
            w = k[di + 1, dj + 1]
            if w:
                out += w * xp[:, 1 + di : 1 + di + H, 1 + dj : 1 + dj + W]
    return out


def correlate_transpose(g, k):
    """Adjoint of `correlate` (its gradient with respect to the input): each output gradient is sent
    back, with the same kernel weight, to the input cell that contributed it."""
    B, H, W, C_ = g.shape
    gp = np.zeros((B, H + 2, W + 2, C_), g.dtype)
    for di in (-1, 0, 1):
        for dj in (-1, 0, 1):
            w = k[di + 1, dj + 1]
            if w:
                gp[:, 1 + di : 1 + di + H, 1 + dj : 1 + dj + W] += w * g
    return gp[:, 1:-1, 1:-1]


def alive_mask(x):
    """3×3 max-pool of the ink channel (zero padded) > ALIVE."""
    a = np.pad(x[..., 0], ((0, 0), (1, 1), (1, 1)))
    H, W = x.shape[1:3]
    m = np.zeros(x.shape[:3], np.float32)
    for di in range(3):
        for dj in range(3):
            m = np.maximum(m, a[:, di : di + H, dj : dj + W])
    return m > ALIVE


def perceive(x):
    """Each cell's view: its state plus Sobel x/y gradients of every channel, (B, H, W, 3C)."""
    return np.concatenate([x, correlate(x, SOBEL_X), correlate(x, SOBEL_Y)], axis=-1)


def step(x, params, fire_mask):
    """One automaton step for a batch of grids x (B, H, W, C). Returns the new state and the values
    step_backward() needs."""
    W1, b1, W2 = params
    pre = alive_mask(x)  # alive before the update
    p = perceive(x)
    # The per-cell MLP: matrix products over the last axis apply the same weights at every cell.
    hpre = p @ W1 + b1
    h = np.maximum(hpre, 0)
    dx = h @ W2
    x1 = x + dx * fire_mask  # only firing cells change
    a = (pre & alive_mask(x1)).astype(np.float32)[..., None]  # alive before and after, or emptied
    return x1 * a, (p, hpre, h, fire_mask, a)


def step_backward(g_out, cache, params, grads):
    """Chain rule through step(): given the loss gradient with respect to the step's output, add
    this step's weight gradients to `grads` and return the gradient with respect to its input. The
    alive and fire masks only switch values on or off, so they are treated as constants."""
    W1, _, W2 = params
    gW1, gb1, gW2 = grads
    p, hpre, h, m, a = cache
    g_x1 = g_out * a  # emptied cells pass no gradient back
    g_dx = g_x1 * m  # nor do cells that did not fire
    gW2 += h.reshape(-1, HID).T @ g_dx.reshape(-1, C)
    g_hpre = (g_dx @ W2.T) * (hpre > 0)  # through the ReLU
    gW1 += p.reshape(-1, 3 * C).T @ g_hpre.reshape(-1, HID)
    gb1 += g_hpre.sum(axis=(0, 1, 2))
    g_p = g_hpre @ W1.T
    # The input reached the output twice: directly (x1 = x + dx) and through perception. The
    # perception gradient splits into the identity part and the two Sobel parts, which go back
    # through the transposed correlation.
    return g_x1 + g_p[..., :C] + correlate_transpose(g_p[..., C : 2 * C], SOBEL_X) + correlate_transpose(g_p[..., 2 * C :], SOBEL_Y)


def rollout(x, params, steps, rng):
    caches = []
    for _ in range(steps):
        x, cache = step(x, params, (rng.random(x.shape[:3] + (1,)) < FIRE).astype(np.float32))
        caches.append(cache)
    return x, caches


def loss_and_grads(x0, params, target, steps, rng):
    """Backpropagation through time: run the rollout forwards, score the final ink against the
    target, then walk the steps in reverse, accumulating the shared weights' gradients."""
    x, caches = rollout(x0, params, steps, rng)
    diff = x[..., 0] - target
    per_sample = (diff**2).mean(axis=(1, 2))
    g = np.zeros_like(x)
    g[..., 0] = 2 * diff / diff.size  # gradient of the mean squared error; hidden channels are free
    grads = [np.zeros_like(p) for p in params]
    for cache in reversed(caches):
        g = step_backward(g, cache, params, grads)
    return per_sample, x, grads


def seed(n=1):
    """One live cell in the middle with every channel 1."""
    x = np.zeros((n, SIZE, SIZE, C), np.float32)
    x[:, SIZE // 2, SIZE // 2, :] = 1.0
    return x


def init_params(rng):
    """Random first layer; second layer all zero, so the untrained rule changes nothing and training
    starts from a stable "do nothing" automaton (as in the paper)."""
    W1 = (rng.standard_normal((3 * C, HID)) * math.sqrt(2 / (3 * C + HID))).astype(np.float32)
    return [W1, np.zeros(HID, np.float32), np.zeros((HID, C), np.float32)]


def gradient_check():
    """Compare hand-written BPTT gradients with central finite differences (float64)."""
    global SIZE
    SIZE = 8
    rng = np.random.default_rng(0)
    params = [p.astype(np.float64) for p in init_params(rng)]
    params[2] = rng.standard_normal(params[2].shape) * 0.1
    x0 = (rng.random((2, SIZE, SIZE, C)) * (rng.random((2, SIZE, SIZE, 1)) < 0.6)).astype(np.float64)
    target = rng.random((SIZE, SIZE))
    masks_rng_seed = 123

    def loss(ps):
        r = np.random.default_rng(masks_rng_seed)
        per_sample, _, _ = loss_and_grads(x0, ps, target, 4, r)
        return per_sample.mean()

    _, _, grads = loss_and_grads(x0, params, target, 4, np.random.default_rng(masks_rng_seed))
    worst = 0.0
    for pi, (p, g) in enumerate(zip(params, grads)):
        for idx in rng.choice(p.size, size=min(12, p.size), replace=False):
            orig = p.flat[idx]
            p.flat[idx] = orig + 1e-6
            up = loss(params)
            p.flat[idx] = orig - 1e-6
            down = loss(params)
            p.flat[idx] = orig
            numeric = (up - down) / 2e-6
            # loss_and_grads already differentiates the mean over the whole batch.
            analytic = g.flat[idx]
            rel = abs(numeric - analytic) / max(1e-9, abs(numeric) + abs(analytic))
            worst = max(worst, rel)
        print(f"param {pi}: checked")
    print(f"worst relative error: {worst:.2e}")
    return worst


def save(params, path, meta):
    W1, b1, W2 = params
    data = {
        "size": SIZE,
        "channels": C,
        "hidden": HID,
        "fireRate": FIRE,
        "aliveThreshold": ALIVE,
        **meta,
        "W1": [round(float(v), 5) for v in W1.ravel()],
        "b1": [round(float(v), 5) for v in b1.ravel()],
        "W2": [round(float(v), 5) for v in W2.ravel()],
    }
    path.write_text(json.dumps(data, separators=(",", ":")) + "\n")


def write_fixture(params, path):
    """One deterministic step (every cell fires) on a small random state, for the JS port's test."""
    rng = np.random.default_rng(7)
    global SIZE
    old = SIZE
    SIZE = 6
    x = (rng.random((1, 6, 6, C)) * (rng.random((1, 6, 6, 1)) < 0.7)).astype(np.float32)
    y, _ = step(x, params, np.ones((1, 6, 6, 1), np.float32))
    SIZE = old
    path.write_text(json.dumps({"size": 6, "state": [round(float(v), 6) for v in x.ravel()], "expected": [round(float(v), 6) for v in y.ravel()]}) + "\n")


def train(iters, out, batch=8, pool_size=256, lr=2e-3):
    rng = np.random.default_rng(2020)
    target = target_mark()
    params = init_params(rng)
    m = [np.zeros_like(p) for p in params]
    v = [np.zeros_like(p) for p in params]
    pool = np.repeat(seed(), pool_size, axis=0)
    start = time.time()
    for it in range(1, iters + 1):
        idx = rng.choice(pool_size, batch, replace=False)
        x0 = pool[idx]
        # Persistence: always restart the worst sample from the seed. Regeneration: damage two.
        losses0 = ((x0[..., 0] - target) ** 2).mean(axis=(1, 2))
        order = np.argsort(-losses0)
        x0 = x0[order]
        idx = idx[order]
        x0[0] = seed()[0]
        if it > 200:
            yy, xx = np.mgrid[0:SIZE, 0:SIZE]
            for k in (-1, -2):
                cy, cx = rng.uniform(6, SIZE - 6, 2)
                r = rng.uniform(3, 7)
                x0[k][(yy - cy) ** 2 + (xx - cx) ** 2 < r * r] = 0
        steps = int(rng.integers(48, 81))
        per_sample, x, grads = loss_and_grads(x0, params, target, steps, rng)
        pool[idx] = x  # write back: later batches continue from these states
        step_lr = lr if it < iters * 0.6 else lr * 0.1  # smaller steps to settle at the end
        t = it
        for i, g in enumerate(grads):
            g = g / (np.linalg.norm(g) + 1e-8)  # per-variable gradient normalisation (as in the paper)
            m[i] = 0.9 * m[i] + 0.1 * g
            v[i] = 0.999 * v[i] + 0.001 * g * g
            mh = m[i] / (1 - 0.9**t)
            vh = v[i] / (1 - 0.999**t)
            params[i] -= (step_lr * mh / (np.sqrt(vh) + 1e-8)).astype(np.float32)
        if it % 25 == 0 or it == 1:
            print(f"iter {it:5d}  loss {per_sample.mean():.5f}  log10 {math.log10(per_sample.mean() + 1e-12):6.2f}  {time.time() - start:7.1f}s", flush=True)
        if it % 100 == 0 or it == iters:
            save(params, out, {"iterations": it, "loss": round(float(per_sample.mean()), 6)})
    write_fixture(params, ROOT / "tests" / "fixtures" / "nca-step.json")
    return params


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true")
    ap.add_argument("--iters", type=int, default=3000)
    ap.add_argument("--out", type=Path, default=ROOT / "src" / "data" / "nca-weights.json")
    args = ap.parse_args()
    if args.check:
        raise SystemExit(0 if gradient_check() < 1e-4 else 1)
    (ROOT / "tests" / "fixtures").mkdir(parents=True, exist_ok=True)
    train(args.iters, args.out)
