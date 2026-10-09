import { describe, expect, it } from 'vitest';
import { TONE_PRESETS, envelope, frequencyAt, phaseAt, placeOf, response } from '../../src/lib/cochlea.ts';

describe('Greenwood place–frequency map', () => {
  it('spans the human hearing range, about 20 Hz at the apex to 20.7 kHz at the base', () => {
    expect(frequencyAt(0)).toBeCloseTo(19.85, 1);
    expect(frequencyAt(1)).toBeGreaterThan(20600);
    expect(frequencyAt(1)).toBeLessThan(20700);
  });

  it('is monotonic and inverted by placeOf', () => {
    let previous = 0;
    for (let x = 0; x <= 1; x += 0.05) {
      const f = frequencyAt(x);
      expect(f).toBeGreaterThan(previous);
      expect(placeOf(f)).toBeCloseTo(x, 10);
      previous = f;
    }
  });

  it('is roughly logarithmic above ~500 Hz: each octave spans a similar length', () => {
    const steps = [500, 1000, 2000, 4000, 8000].map(placeOf);
    const gaps = steps.slice(1).map((x, i) => x - steps[i]);
    for (const g of gaps) expect(g).toBeCloseTo(gaps[0], 1);
  });
});

describe('travelling-wave response', () => {
  it('peaks at the tone’s characteristic place', () => {
    const tone = { frequency: 1000, amplitude: 1 };
    const peak = placeOf(1000);
    expect(envelope(peak, tone)).toBeCloseTo(1, 12);
    expect(envelope(peak + 0.05, tone)).toBeLessThan(1);
    expect(envelope(peak - 0.05, tone)).toBeLessThan(1);
  });

  it('falls off more sharply on the apical side than the basal side', () => {
    const tone = { frequency: 1000, amplitude: 1 };
    const peak = placeOf(1000);
    expect(envelope(peak - 0.04, tone)).toBeLessThan(envelope(peak + 0.04, tone));
  });

  it('separates the notes of a chord into distinct peaks', () => {
    const chord = TONE_PRESETS.find((p) => p.id === 'octaves')!.tones;
    for (const t of chord) {
      const x = placeOf(t.frequency);
      expect(response(x, chord)).toBeGreaterThan(response(x + 0.03, chord));
      expect(response(x, chord)).toBeGreaterThan(response(x - 0.03, chord));
    }
  });

  it('accumulates phase from the base toward the peak', () => {
    const tone = { frequency: 1000, amplitude: 1 };
    expect(phaseAt(1, tone)).toBe(0);
    expect(phaseAt(placeOf(1000), tone)).toBeGreaterThan(phaseAt(0.9, tone));
  });
});
