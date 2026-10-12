import { describe, expect, it } from 'vitest';
import { LOOKS, contrastRatio, isLookId, lookCss, looksCss, type Palette } from '../../src/lib/looks.ts';

describe('contrastRatio', () => {
  it('is 21 for black on white and 1 for a colour on itself', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5);
    expect(contrastRatio('#ffffff', '#000000')).toBeCloseTo(21, 5);
    expect(contrastRatio('#b3401d', '#b3401d')).toBe(1);
  });

  it('matches a known WCAG value', () => {
    // #767676 on white is the classic 4.54:1 grey.
    expect(contrastRatio('#767676', '#ffffff')).toBeCloseTo(4.54, 2);
  });
});

describe('LOOKS', () => {
  it('starts with the current look and has unique ids', () => {
    expect(LOOKS[0].id).toBe('current');
    expect(new Set(LOOKS.map((look) => look.id)).size).toBe(LOOKS.length);
  });

  it('accepts only known look ids', () => {
    expect(isLookId('plotter')).toBe(true);
    expect(isLookId('current')).toBe(true);
    expect(isLookId('Plotter')).toBe(false);
    expect(isLookId(null)).toBe(false);
  });

  // Text pairs need WCAG AA for body text (4.5:1, 7:1 for the main text colour); borders and focus
  // rings are non-text UI (3:1). The curves are decorative (aria-hidden) and only need to stand
  // clear of the paper (2.5:1), which leaves room for soft accents like Sage's #899A59.
  const pairs: Array<[keyof Palette, keyof Palette, number]> = [
    ['text', 'bg', 7],
    ['text', 'surface', 7],
    ['muted', 'bg', 4.5],
    ['muted', 'surface', 4.5],
    ['accent', 'bg', 4.5],
    ['accent', 'surface', 4.5],
    ['accentInk', 'accent', 4.5],
    ['border', 'bg', 3],
    ['focus', 'bg', 3],
    ['curve', 'bg', 2.5],
  ];
  for (const look of LOOKS) {
    for (const mode of ['light', 'dark'] as const) {
      it(`${look.id} (${mode}) meets the contrast minimums`, () => {
        const palette = look[mode];
        for (const [fg, bg, min] of pairs) {
          expect(contrastRatio(palette[fg], palette[bg]), `${fg} on ${bg}`).toBeGreaterThanOrEqual(min);
        }
      });
    }
  }
});

describe('lookCss', () => {
  it('scopes the current look to lab specimens only, never the whole page', () => {
    const css = lookCss(LOOKS[0]);
    expect(css).toContain("[data-look-scope='current']");
    expect(css).not.toContain(':root');
    expect(css).toContain('--font-display:var(--font-current-display)');
  });

  it('applies other looks to the page and to their specimen, with fonts on body', () => {
    const plotter = LOOKS.find((look) => look.id === 'plotter')!;
    const css = lookCss(plotter);
    expect(css).toContain(":root[data-look='plotter'],[data-look-scope='plotter']{--color-bg:light-dark(#eef0eb,#10294a);");
    expect(css).toContain(":root[data-look='plotter'] body,[data-look-scope='plotter']{--font-display:var(--font-stix);");
  });

  it('defines the current-font aliases once, ahead of every look', () => {
    const css = looksCss();
    expect(css.startsWith(':root{--font-current-display:var(--font-display);')).toBe(true);
    for (const look of LOOKS) expect(css).toContain(`[data-look-scope='${look.id}']`);
  });
});
