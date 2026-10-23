// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import svelte from '@astrojs/svelte';
import { satteri } from '@astrojs/markdown-satteri';
import katex from 'katex';

// $…$ and $$…$$ in Markdown become native MathML at build time, so no KaTeX script, stylesheet or
// font reaches the page. Display equations get a wrapper that can scroll sideways on narrow screens.
/** @param {string} tex @param {boolean} displayMode */
function toMathML(tex, displayMode) {
  return (
    katex
      .renderToString(tex, { output: 'mathml', displayMode })
      // Browsers set a function name tight against what follows ("cosθ"); TeX puts a thin space
      // after it, and before it when it follows a letter or number ("r cos θ"), but not before a
      // bracket.
      .replace(/<mo>⁡<\/mo>(?!<mo[^>]*>[([{|])/g, '<mo rspace="0.1667em">⁡</mo>')
      .replace(/(<\/(?:mi|mn|msub|msup|msubsup)>)(<mi[^>]*>[^<]{2,}<\/mi><mo[^>]*>⁡)/g, '$1<mspace width="0.1667em"></mspace>$2')
  );
}

const mathml = {
  name: 'mathml',
  /** @param {{ value: string }} node @param {any} ctx */
  math(node, ctx) {
    ctx.replaceNode(node, { type: 'html', value: `<div class="math-display">${toMathML(node.value, true)}</div>` });
  },
  /** @param {{ value: string }} node @param {any} ctx */
  inlineMath(node, ctx) {
    ctx.replaceNode(node, { type: 'html', value: toMathML(node.value, false) });
  },
};

// HTML comments in Markdown (a commented-out figure, a note to self) are dropped at build time, so
// they stay in the source but never reach the published page.
const stripComments = {
  name: 'strip-comments',
  /** @param {{ value: string }} node @param {any} ctx */
  html(node, ctx) {
    if (/^\s*<!--[\s\S]*-->\s*$/.test(node.value)) ctx.removeNode(node);
  },
};

// Static build for GitHub Pages (user site, served from the domain root).
// Output goes to Astro's default `dist/`, which pages.yml uploads. The previous site, in `site/`, is
// a frozen, unpublished record (constitution) and is not touched.
export default defineConfig({
  site: 'https://athenafung1.github.io',
  output: 'static',
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
  integrations: [svelte()],
  markdown: {
    processor: satteri({ features: { math: true }, mdastPlugins: [mathml, stripComments] }),
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
