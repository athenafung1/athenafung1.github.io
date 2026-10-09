// The cochlea as a frequency analyser.
//
// Concept: the cochlea is a fluid-filled tube coiled 2¾ turns and divided along its length by the
// basilar membrane. The membrane is narrow and stiff at the base (where sound enters) and wide and
// floppy at the apex, so each point resonates best at one "characteristic frequency" (CF): high at
// the base, low at the apex. Sound enters at the base as a travelling wave that grows as it moves
// toward its characteristic place, peaks there, then dies away abruptly. A chord therefore excites
// several separate places at once: the ear does a rough Fourier analysis mechanically, and the hair
// cells at each place report how much of that frequency is present. Greenwood (1990) fitted the human
// place–frequency map as f = A(10^(a·x) − k), x = fraction of the length from the apex.
//
// How this code works: frequencyAt() and placeOf() are Greenwood's map and its inverse. envelope() is
// a lopsided Gaussian centred on a tone's place (wide on the base side the wave arrives from, narrow
// beyond it); response() adds tones together; phaseAt() makes the crests bunch up near the peak,
// where the wave slows. The travelling-wave shape is a simplified illustration, not a physiological
// model.

export const GREENWOOD = { A: 165.4, a: 2.1, k: 0.88 } as const;

/** Characteristic frequency (Hz) at position x ∈ [0, 1] measured from the apex. */
export function frequencyAt(x: number): number {
  const { A, a, k } = GREENWOOD;
  return A * (10 ** (a * x) - k);
}

/** Position from the apex (0–1) whose characteristic frequency is f: Greenwood's map solved for x. */
export function placeOf(f: number): number {
  const { A, a, k } = GREENWOOD;
  return Math.log10(f / A + k) / a;
}

/** Human cochlear duct length (mm), for labelling positions. */
export const COCHLEA_LENGTH_MM = 35;

export type Tone = { frequency: number; amplitude: number };

/**
 * Envelope of the travelling wave at position x for one tone: it grows gently as the wave travels
 * from the base toward its characteristic place, peaks there, then dies away sharply on the apical
 * side, the classic asymmetric shape.
 */
export function envelope(x: number, tone: Tone): number {
  const peak = placeOf(tone.frequency);
  const d = x - peak; // > 0: basal of the peak (the side the wave arrives from)
  const width = d > 0 ? 0.09 : 0.025;
  return tone.amplitude * Math.exp(-((d / width) ** 2));
}

/** Total envelope from several tones (linear superposition). */
export function response(x: number, tones: Tone[]): number {
  return tones.reduce((sum, t) => sum + envelope(x, t), 0);
}

/**
 * Phase lag (radians) of the travelling wave at x. Phase accumulates as the wave moves from the
 * base toward the peak and slows down there, so crests bunch up near the characteristic place.
 */
export function phaseAt(x: number, tone: Tone): number {
  const peak = placeOf(tone.frequency);
  const travelled = Math.max(0, 1 - x) / Math.max(1e-6, 1 - peak);
  return 3 * Math.PI * Math.min(travelled, 1.4) ** 2;
}

export const TONE_PRESETS: Array<{ id: string; label: string; tones: Tone[]; note: string }> = [
  { id: 'a4', label: 'A4 · 440 Hz', tones: [{ frequency: 440, amplitude: 1 }], note: 'A single pure tone excites one place.' },
  {
    id: 'chord',
    label: 'A major chord',
    tones: [
      { frequency: 440, amplitude: 0.8 },
      { frequency: 554.37, amplitude: 0.8 },
      { frequency: 659.25, amplitude: 0.8 },
    ],
    note: 'Three notes, three nearby peaks: the ear separates the frequencies before the brain hears a chord.',
  },
  {
    id: 'vowel',
    label: 'Vowel “ah”',
    tones: [
      { frequency: 730, amplitude: 1 },
      { frequency: 1090, amplitude: 0.6 },
      { frequency: 2440, amplitude: 0.35 },
    ],
    note: 'The first three formants of “ah” (typical adult male values, Peterson & Barney 1952) excite three regions.',
  },
  {
    id: 'octaves',
    label: 'Octaves',
    tones: [110, 220, 440, 880, 1760, 3520].map((frequency) => ({ frequency, amplitude: 0.7 })),
    note: 'Each doubling of frequency moves the peak a similar distance: the map is roughly logarithmic.',
  },
];
