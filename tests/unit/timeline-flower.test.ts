import { describe, expect, it } from 'vitest';
import { STEP_YEARS, flowerAmp, flowerFreq, flowerReach, flowerTerms, penOffset, presence } from '../../src/lib/timeline-flower.ts';

describe('flowerFreq', () => {
  it('runs 2, −3, 7, −8, 12, −13, all ≡ 2 mod 5 for five-fold symmetry', () => {
    const freqs = Array.from({ length: 8 }, (_, i) => flowerFreq(i));
    expect(freqs).toEqual([2, -3, 7, -8, 12, -13, 17, -18]);
    for (const f of freqs) expect(((f % 5) + 5) % 5).toBe(2);
  });
});

describe('flowerAmp', () => {
  it('gives the current role the largest circle and never grows going back', () => {
    const amps = Array.from({ length: 10 }, (_, i) => flowerAmp(i));
    expect(amps.slice(0, 6)).toEqual([1, 0.85, 0.3, 0.25, 0.2, 0.15]);
    for (let i = 1; i < amps.length; i++) expect(amps[i]).toBeLessThanOrEqual(amps[i - 1]);
    expect(Math.min(...amps)).toBeCloseTo(0.1, 9);
  });
});

describe('flowerTerms', () => {
  it('numbers circles newest first and keeps their entries', () => {
    const terms = flowerTerms([
      { id: 'now', start: 2025 },
      { id: 'intern', start: 2024.4 },
      { id: 'first', start: 2020.6 },
    ]);
    expect(terms.map((t) => t.id)).toEqual(['now', 'intern', 'first']);
    expect(terms[0]).toMatchObject({ freq: 2, amp: 1, phase: 0 });
    expect(terms[1].freq).toBeCloseTo(-2.985, 9);
    expect(terms[2].amp).toBe(0.3);
  });
});

describe('presence', () => {
  it('is 0 before the fade, 1 from the entry’s start, and halfway in between', () => {
    expect(presence(2024 - STEP_YEARS - 0.01, 2024)).toBe(0);
    expect(presence(2024, 2024)).toBe(1);
    expect(presence(2030, 2024)).toBe(1);
    expect(presence(2024 - STEP_YEARS / 2, 2024)).toBeCloseTo(0.5, 9);
  });
});

describe('penOffset', () => {
  const terms = flowerTerms([
    { id: 'a', start: 2025 },
    { id: 'b', start: 2024 },
  ]);

  it('adds the arms end to end at pen-time 0', () => {
    const o = penOffset(terms, [1, 1], 0);
    expect(o.x).toBeCloseTo(1 + 0.85 * Math.cos(0.7), 9);
    expect(o.y).toBeCloseTo(0.85 * Math.sin(0.7), 9);
  });

  it('leaves out absent circles', () => {
    expect(penOffset(terms, [1, 0], 0)).toEqual({ x: 1, y: 0 });
    expect(penOffset(terms, [0, 0], 1)).toEqual({ x: 0, y: 0 });
  });
});

describe('flowerReach', () => {
  it('is no more than the sum of the circles and no less than the largest', () => {
    const terms = flowerTerms(Array.from({ length: 6 }, (_, i) => ({ id: String(i), start: 2025 - i })));
    const reach = flowerReach(terms, 1500);
    expect(reach).toBeLessThanOrEqual(terms.reduce((sum, t) => sum + t.amp, 0));
    expect(reach).toBeGreaterThan(1);
  });
});
