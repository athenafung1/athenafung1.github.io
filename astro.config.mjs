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
    // One family for headings and text (--font-display is an alias in src/styles/tokens.css).
    // Static weights: regular text, medium labels and nav, semibold headings, bold for the site
    // mark. Italics are declared too; a browser downloads one only when a page uses it.
    {
      provider: fontProviders.fontsource(),
      name: 'IBM Plex Sans Condensed',
      cssVariable: '--font-text',
      weights: [400, 500, 600, 700],
      styles: ['normal', 'italic'],
      subsets: ['latin'],
      fallbacks: ['Arial Narrow', 'system-ui', 'sans-serif'],
    },
  ],
});
