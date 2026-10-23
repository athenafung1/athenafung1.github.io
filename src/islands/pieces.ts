// Registry of interactive pieces on /fun/. Each entry's Svelte component and build-time
// fallback are paired in src/pages/fun.astro (data-model.md: Interactive piece).
export type Piece = { id: string; name: string; idea: string };

export const PIECES: Piece[] = [
  {
    id: 'fourier-sketch',
    name: 'Fourier Sketch',
    idea: 'Any closed drawing is a sum of spinning circles. Add more circles and the sketch sharpens.',
  },
];
