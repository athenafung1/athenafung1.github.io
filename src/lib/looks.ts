// Look lab (/look-lab/): alternative palettes and typefaces for the whole site, compared side by
// side. A look only overrides the colour and font tokens from src/styles/tokens.css (plus a few
// type details in src/styles/looks.css); layout and content stay the same, so the comparison is
// palette and type alone. "current" is what the site uses today.

export type Palette = {
  bg: string;
  surface: string;
  text: string;
  muted: string;
  accent: string;
  accentInk: string;
  border: string;
  rule: string;
  focus: string;
  curve: string;
};

export type LookId = 'current' | 'green-emerald' | 'green-forest' | 'green-sage' | 'plotter' | 'pad' | 'riso';

export type Look = {
  id: LookId;
  name: string;
  /** Where the look comes from, in a sentence or two. */
  idea: string;
  /** The typefaces, in plain words. */
  type: string;
  /** CSS variables (from the Fonts API in astro.config.mjs) for headings and text. */
  fonts: { display: string; text: string };
  light: Palette;
  dark: Palette;
};

// The three greens share everything but the green: IBM Plex Sans Condensed for headings and
// labels, B612 for text, on the same cool grey paper.
const GREEN_TYPE = 'IBM Plex Sans Condensed for headings and labels, B612 for text.';
const GREEN_FONTS = { display: '--font-plex-cond', text: '--font-b612' };

export const LOOKS: Look[] = [
  {
    id: 'current',
    name: 'Current',
    idea: 'What the site uses today: warm cream paper, a terracotta accent, Fraunces headings over Inter.',
    type: 'Fraunces for headings, Inter for text.',
    fonts: { display: '--font-current-display', text: '--font-current-text' },
    light: {
      bg: '#f5f1ea',
      surface: '#fffcf7',
      text: '#1b1915',
      muted: '#5a554c',
      accent: '#b3401d',
      accentInk: '#ffffff',
      border: '#8f877a',
      rule: '#ddd6ca',
      focus: '#1f4ed8',
      curve: '#b3401d',
    },
    dark: {
      bg: '#121110',
      surface: '#1c1a17',
      text: '#efe9df',
      muted: '#aaa296',
      accent: '#ff8d63',
      accentInk: '#1b0f0a',
      border: '#7a7268',
      rule: '#35312b',
      focus: '#8fb0ff',
      curve: '#ff8d63',
    },
  },
  {
    id: 'green-emerald',
    name: 'Emerald',
    idea: 'A bright, jewel-like green on cool grey paper by day; deep teal-green by night.',
    type: GREEN_TYPE,
    fonts: GREEN_FONTS,
    light: {
      bg: '#f0f2ee',
      surface: '#f9faf8',
      text: '#18201c',
      muted: '#4b5650',
      accent: '#08765a',
      accentInk: '#ffffff',
      border: '#7d8881',
      rule: '#d3d9d3',
      focus: '#1f4ed8',
      curve: '#0e9a6e',
    },
    dark: {
      bg: '#0f2620',
      surface: '#14302a',
      text: '#e6f2ec',
      muted: '#a3bdb2',
      accent: '#46d9a0',
      accentInk: '#062018',
      border: '#6f9285',
      rule: '#22443a',
      focus: '#8fb0ff',
      curve: '#46d9a0',
    },
  },
  {
    id: 'green-forest',
    name: 'Forest',
    idea: 'A deep, quiet green on cool grey paper by day; dark forest green by night.',
    type: GREEN_TYPE,
    fonts: GREEN_FONTS,
    light: {
      bg: '#f0f2ee',
      surface: '#f9faf8',
      text: '#18201c',
      muted: '#4b5650',
      accent: '#285c3c',
      accentInk: '#ffffff',
      border: '#7d8881',
      rule: '#d3d9d3',
      focus: '#1f4ed8',
      curve: '#2f6b46',
    },
    dark: {
      bg: '#172a1f',
      surface: '#1d3326',
      text: '#e8efe6',
      muted: '#aab9a8',
      accent: '#9bd3a4',
      accentInk: '#10241a',
      border: '#7a8f7b',
      rule: '#2b4433',
      focus: '#8fb0ff',
      curve: '#9bd3a4',
    },
  },
  {
    id: 'green-sage',
    name: 'Sage',
    idea: 'A soft olive sage, #899A59, on cool grey paper by day; green-grey charcoal by night. The calmest of the three.',
    type: GREEN_TYPE,
    fonts: GREEN_FONTS,
    light: {
      bg: '#f0f2ee',
      surface: '#f9faf8',
      text: '#18201c',
      muted: '#4b5650',
      accent: '#5f6b3e',
      accentInk: '#ffffff',
      border: '#7d8881',
      rule: '#d3d9d3',
      focus: '#1f4ed8',
      curve: '#899a59',
    },
    dark: {
      bg: '#1f2421',
      surface: '#272d29',
      text: '#ecefea',
      muted: '#b1bab1',
      accent: '#899a59',
      accentInk: '#1b221d',
      border: '#838c84',
      rule: '#39413b',
      focus: '#8fb0ff',
      curve: '#899a59',
    },
  },
  {
    id: 'plotter',
    name: 'Plotter',
    idea: 'A harmonograph is a pen drawing on paper. Blue-black ink and one blue pen on cool paper by day; a blueprint by night.',
    type: 'STIX Two Text for everything, the typeface journals use to set mathematics. Labels are italic, like variables.',
    fonts: { display: '--font-stix', text: '--font-stix' },
    light: {
      bg: '#eef0eb',
      surface: '#f8f9f6',
      text: '#172033',
      muted: '#4d5667',
      accent: '#2a40ae',
      accentInk: '#ffffff',
      border: '#7e8794',
      rule: '#cdd2ca',
      focus: '#b21f5b',
      curve: '#2a40ae',
    },
    dark: {
      bg: '#10294a',
      surface: '#15325a',
      text: '#eaf1f9',
      muted: '#a9bcd5',
      accent: '#ffd06b',
      accentInk: '#1a1404',
      border: '#7c95ba',
      rule: '#274770',
      focus: '#ff9ec4',
      curve: '#d4e4ff',
    },
  },
  {
    id: 'pad',
    name: 'Engineering pad',
    idea: 'The green gridded computation pad from engineering classes: pencil-grey curves and green-ink links by day; a slate chalkboard by night.',
    type: 'B612 for everything, designed with Airbus for cockpit screens to be read at a glance.',
    fonts: { display: '--font-b612', text: '--font-b612' },
    light: {
      bg: '#e6eedb',
      surface: '#f1f5ea',
      text: '#232823',
      muted: '#4f574e',
      accent: '#1c6641',
      accentInk: '#ffffff',
      border: '#748370',
      rule: '#bfd1ad',
      focus: '#1f4ed8',
      curve: '#343a35',
    },
    dark: {
      bg: '#1e2e27',
      surface: '#25372f',
      text: '#e7ece4',
      muted: '#a8b6ab',
      accent: '#f2d27c',
      accentInk: '#1e1a0c',
      border: '#7b8d81',
      rule: '#34493f',
      focus: '#9cc8ff',
      curve: '#e7ece4',
    },
  },
  {
    id: 'riso',
    name: 'Riso print',
    idea: 'A risograph prints one ink at a time. Blue text and fluorescent-pink curves, as playful as the toys on the Fun page; deep violet by night.',
    type: 'Archivo for everything, heavy and tight in headings like a printed zine.',
    fonts: { display: '--font-archivo', text: '--font-archivo' },
    light: {
      bg: '#f6f6f3',
      surface: '#ffffff',
      text: '#1e2a78',
      muted: '#4c5590',
      accent: '#c4166f',
      accentInk: '#ffffff',
      border: '#8088b5',
      rule: '#d6d8e6',
      focus: '#00777f',
      curve: '#ec2c93',
    },
    dark: {
      bg: '#221a3b',
      surface: '#2b2249',
      text: '#f3eeff',
      muted: '#bdb3da',
      accent: '#ff7bc8',
      accentInk: '#2a0a1c',
      border: '#8d80b6',
      rule: '#3a3060',
      focus: '#6fe0d5',
      curve: '#ff7bc8',
    },
  },
];

export const isLookId = (value: unknown): value is LookId => LOOKS.some((look) => look.id === value);

const TOKENS: Record<keyof Palette, string> = {
  bg: '--color-bg',
  surface: '--color-surface',
  text: '--color-text',
  muted: '--color-muted',
  accent: '--color-accent',
  accentInk: '--color-accent-ink',
  border: '--color-border',
  rule: '--color-rule',
  focus: '--color-focus',
  curve: '--color-curve',
};

/**
 * Token overrides for one look. They apply to the whole page (`:root[data-look=id]`, set by the
 * head script in BaseLayout) and to any `[data-look-scope=id]` element, which is how the lab page
 * shows each look beside the others. Fonts are set on body rather than :root so that :root keeps
 * the Fonts API's own --font-display/--font-text, which "current" reads back through aliases.
 */
export function lookCss(look: Look): string {
  const colors = (Object.keys(TOKENS) as Array<keyof Palette>)
    .map((key) => `${TOKENS[key]}:light-dark(${look.light[key]},${look.dark[key]});`)
    .join('');
  const fonts = `--font-display:var(${look.fonts.display});--font-text:var(${look.fonts.text});`;
  const scope = `[data-look-scope='${look.id}']`;
  if (look.id === 'current') return `${scope}{${colors}${fonts}}`;
  const root = `:root[data-look='${look.id}']`;
  return `${root},${scope}{${colors}}${root} body,${scope}{${fonts}}`;
}

/** Every look's overrides, plus the aliases that keep today's fonts reachable inside a scope. */
export const looksCss = () =>
  `:root{--font-current-display:var(--font-display);--font-current-text:var(--font-text);}${LOOKS.map(lookCss).join('')}`;

/** WCAG 2.1 contrast ratio between two #rrggbb colours. */
export function contrastRatio(a: string, b: string): number {
  const luminance = (hex: string) => {
    const [r, g, bl] = (hex.replace('#', '').match(/../g) ?? []).map((pair) => {
      const v = parseInt(pair, 16) / 255;
      return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}
