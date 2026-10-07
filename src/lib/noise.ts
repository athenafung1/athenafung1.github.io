// Seeded 2-D gradient (Perlin) noise. noise(x, y) is smooth, in [−1, 1], and 0 on integer points.
import { mulberry32 } from './random.ts';

const GRADIENTS = Array.from({ length: 16 }, (_, i) => {
  const a = (i / 16) * Math.PI * 2;
  return [Math.cos(a), Math.sin(a)] as const;
});

const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export function createNoise(seed: number): (x: number, y: number) => number {
  const rand = mulberry32(seed);
  const perm = Array.from({ length: 256 }, (_, i) => i);
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [perm[i], perm[j]] = [perm[j], perm[i]];
  }
  const p = [...perm, ...perm];
  const grad = (ix: number, iy: number, dx: number, dy: number) => {
    const [gx, gy] = GRADIENTS[p[p[ix & 255] + (iy & 255)] & 15];
    return gx * dx + gy * dy;
  };
  return (x, y) => {
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    const fx = x - ix;
    const fy = y - iy;
    const u = fade(fx);
    const v = fade(fy);
    const n = lerp(
      lerp(grad(ix, iy, fx, fy), grad(ix + 1, iy, fx - 1, fy), u),
      lerp(grad(ix, iy + 1, fx, fy - 1), grad(ix + 1, iy + 1, fx - 1, fy - 1), u),
      v,
    );
    // Unit gradients give |n| ≤ √2/2; scale to [−1, 1].
    return Math.max(-1, Math.min(1, n * Math.SQRT2));
  };
}
