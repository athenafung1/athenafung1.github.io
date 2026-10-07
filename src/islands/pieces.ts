// Registry of interactive pieces on /fun/. Each entry's Svelte component and build-time
// fallback are paired in src/pages/fun.astro (data-model.md: Interactive piece).
export type Piece = { id: string; name: string; idea: string };

export const PIECES: Piece[] = [
  {
    id: 'fourier-sketch',
    name: 'Fourier Sketch',
    idea: 'Any closed drawing is a sum of spinning circles. Add more circles and the sketch sharpens.',
  },
  {
    id: 'n-body',
    name: 'N-body gravity',
    idea: 'Masses pulling on each other by Newton’s inverse-square law. Tap to add a mass in orbit, or drag to throw one.',
  },
  {
    id: 'fractal',
    name: 'Mandelbrot & Julia',
    idea: 'Iterate z ↦ z² + c and ask whether it escapes. Tap anywhere to zoom in; the edge never runs out of detail.',
  },
  {
    id: 'attractor',
    name: 'Strange attractors',
    idea: 'Three simple equations, fully deterministic, that never repeat: chaos you can rotate.',
  },
  {
    id: 'l-system',
    name: 'L-system fractals',
    idea: 'Start with one symbol, rewrite it by a rule, repeat. Two lines of grammar grow a snowflake or a Sierpinski triangle.',
  },
  {
    id: 'flow-field',
    name: 'Noise flow field',
    idea: 'Particles follow arrows set by smooth Perlin noise, tracing rivers through a random but coherent field.',
  },
  {
    id: 'pendulum',
    name: 'The butterfly effect',
    idea: 'Two double pendulums released a hair’s breadth apart. Watch how long they agree.',
  },
  {
    id: 'monte-carlo',
    name: 'Darts for π',
    idea: 'Throw random darts at a square. The fraction inside the quarter circle closes in on π/4.',
  },
  {
    id: 'automata',
    name: 'Cellular automata',
    idea: 'Each cell looks at itself and its two neighbours. Eight-entry rules give chaos, fractals, traffic, and universal computation.',
  },
];
