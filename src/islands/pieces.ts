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
    id: 'hopfield',
    name: 'Hopfield memory',
    idea: 'Neurons that fire together wire together. Store pictures as energy valleys, scramble one, and watch the network roll back down to it.',
  },
  {
    id: 'cochlea',
    name: 'The ear’s Fourier analyser',
    idea: 'Your cochlea splits sound by frequency before your brain hears it: every pitch makes the membrane peak at its own place.',
  },
  {
    id: 'bone',
    name: 'Grow a bone',
    idea: 'Give a block of material a load and a budget. Finite elements and a density update carve out struts much like the ones inside your bones.',
  },
  {
    id: 'nca',
    name: 'A logo that heals',
    idea: 'A neural cellular automaton: every pixel runs the same tiny network on its neighbours. Together they grow a three-petal rose from one cell, and regrow it when cut.',
  },
  {
    id: 'diffusion',
    name: 'Diffusion, forwards',
    idea: 'Image generators learn to undo noise. Here is the half that needs no learning: data dissolving step by step into Gaussian noise.',
  },
  {
    id: 'attention',
    name: 'Attention, by hand',
    idea: 'The core of a transformer in two dimensions: compare a query with every key, softmax the scores, and blend the values.',
  },
  {
    id: 'optimisers',
    name: 'Optimiser race',
    idea: 'Gradient descent, momentum and Adam roll down the same loss surface from the same start. Pick the start; watch them disagree.',
  },
  {
    id: 'neural-net',
    name: 'Train a neural net',
    idea: 'A tiny network learns to separate two classes of points, live. Add points, change the architecture, and watch the boundary bend.',
  },
  {
    id: 'automata',
    name: 'Cellular automata',
    idea: 'Each cell looks at itself and its two neighbours. Eight-entry rules give chaos, fractals, traffic, and universal computation.',
  },
];
