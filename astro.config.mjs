// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import svelte from '@astrojs/svelte';

// Static build for GitHub Pages (user site, served from the domain root).
// Output goes to Astro's default `dist/`, which pages.yml uploads. The hand-written
// `site/` folder is a frozen, unpublished record (constitution v1.3.0) and is not touched.
export default defineConfig({
  site: 'https://athenafung1.github.io',
  output: 'static',
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
  integrations: [svelte()],
  markdown: {
    // Dual themes as CSS variables; ProjectLayout picks one with light-dark() so code blocks follow
    // the site theme (including the manual toggle).
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
      defaultColor: false,
    },
  },
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: 'Fraunces',
      cssVariable: '--font-display',
      weights: [600],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['Georgia', 'serif'],
    },
    {
      provider: fontProviders.fontsource(),
      name: 'Inter',
      cssVariable: '--font-text',
      weights: ['400 700'],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['system-ui', 'sans-serif'],
    },
    // Look lab (/look-lab/): candidate faces. They are declared on every page but never
    // preloaded, so a browser only downloads one when the active look uses it.
    {
      provider: fontProviders.fontsource(),
      name: 'STIX Two Text',
      cssVariable: '--font-stix',
      weights: ['400 700'],
      styles: ['normal', 'italic'],
      subsets: ['latin'],
      fallbacks: ['Times New Roman', 'serif'],
    },
    {
      provider: fontProviders.fontsource(),
      name: 'B612',
      cssVariable: '--font-b612',
      weights: [400, 700],
      styles: ['normal', 'italic'],
      subsets: ['latin'],
      fallbacks: ['system-ui', 'sans-serif'],
    },
    {
      provider: fontProviders.fontsource(),
      name: 'Archivo',
      cssVariable: '--font-archivo',
      weights: ['400 800'],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['system-ui', 'sans-serif'],
    },
  ],
});
