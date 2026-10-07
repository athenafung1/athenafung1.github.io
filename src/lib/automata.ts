// Elementary (1-D, two-state, radius-1) cellular automata in Wolfram's rule numbering.

export type Row = Uint8Array;

/** Next generation: cell = bit (left·4 + centre·2 + right) of `rule`. Edges wrap around. */
export function nextRow(row: Row, rule: number): Row {
  const n = row.length;
  const next = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    const pattern = (row[(i - 1 + n) % n] << 2) | (row[i] << 1) | row[(i + 1) % n];
    next[i] = (rule >> pattern) & 1;
  }
  return next;
}

export function singleCell(width: number): Row {
  const row = new Uint8Array(width);
  row[Math.floor(width / 2)] = 1;
  return row;
}

export function randomRow(width: number, rand: () => number, density = 0.5): Row {
  return Uint8Array.from({ length: width }, () => (rand() < density ? 1 : 0));
}

export function generate(rule: number, first: Row, rows: number): Row[] {
  const out = [first];
  for (let i = 1; i < rows; i++) out.push(nextRow(out[i - 1], rule));
  return out;
}

export const RULES = [
  { rule: 30, note: 'Chaotic: its centre column looks random.' },
  { rule: 90, note: 'Draws the Sierpinski triangle (Pascal’s triangle mod 2).' },
  { rule: 110, note: 'Turing-complete: it can simulate any computer.' },
  { rule: 184, note: 'A traffic model: cars move right when the cell ahead is free.' },
] as const;
