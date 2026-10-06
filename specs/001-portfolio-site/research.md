# Research: Personal Portfolio Site

**Feature**: [spec.md](./spec.md) · **Plan**: [plan.md](./plan.md) · **Date**: 2026-10-05

Versions were checked against the npm registry on 2026-10-05: `astro` 7.3.5, `svelte` 5.57.1,
`@astrojs/svelte` 9.0.1 (peer: `astro ^7`, `svelte ^5.43`), `vitest` 5.0.3 and `sharp` 0.35.5.
Astro 7 requires Node ≥ 22.12.0.

No `NEEDS CLARIFICATION` items remained in Technical Context. Each section below records a
decision, why it was made, and what else was considered.

---

## R1. Stack: Astro + Svelte islands, and whether something else would be more interesting

**Decision**: Astro 7 with Svelte 5 confined to interactive islands, as the author requested.
Within that stack, adopt two techniques that make the site stand out without adding dependencies:

1. **Native cross-document view transitions** (CSS only, R17) for editorial page-to-page motion.
2. **Math computed at build time**: the landing-hero curve and every interactive piece's static
   fallback are generated in Astro frontmatter from the same `src/lib/` functions the islands use
   at runtime (R11, R12). The math is the visual identity, and it costs zero client JavaScript on
   content pages.

**More interesting options, offered as additions rather than replacements**:

- **Raw WebGL2 fragment shaders for a future piece** (for example a Mandelbrot/Julia explorer or
  a domain-coloring plot of complex functions). A shader is a few KB of text, runs on the GPU,
  and is about as "engineer, not Wix" as a portfolio gets. Wrap it in a Svelte island like any
  other piece; no three.js or other library is needed. Deferred to after launch because it needs
  a WebGL-unavailable fallback and more device testing.
- **Typeset equations as build-time MathML** for easter eggs or interest write-ups that show
  formulas. MathML Core renders natively in all target browsers, so there's no KaTeX CSS or font
  payload. Add only when a page actually needs an equation.

**Alternatives considered**:

- *SvelteKit (static adapter)*: hydrates every page and ships its router by default. Turning that
  off per page works against the framework. Rejected.
- *Eleventy + vanilla JS*: the simplest fit for Principle V and the earlier recommendation, but it
  has no first-class island story for Svelte. Rejected in favor of the author's choice and
  recorded in plan Complexity Tracking.
- *Next.js/React SPA*: content depends on JavaScript (FR-027) and the framework spends the budget.
  Rejected.
- *Hugo*: excellent and dependency-free, but no Svelte integration. Rejected for this author's
  stated preference.

## R2. Astro configuration for GitHub Pages

**Decision**:
- `output: 'static'`, `site: 'https://athenafung1.github.io'`, no `base` (user site at root).
- `outDir` stays at Astro's default `./dist`, which is already in `.gitignore`. The hand-written
  `site/` is left intact as a frozen, unpublished record (constitution v1.3.0), because the
  author requires that no existing file be deleted.
- `build.format: 'directory'` with `trailingSlash: 'always'`, so pages are `/about/`,
  `/projects/` and `/fun/` (FR-004). GitHub Pages serves `about/index.html` for `/about/`, and the
  canonical URL in OG tags always carries the trailing slash.
- `compressHTML` keeps the Astro 7 default (`'jsx'`). **Risk**: JSX whitespace rules remove
  whitespace between adjacent inline elements, so components must use explicit `{' '}` or CSS gap
  where words sit in separate inline elements. This is called out in contracts/components.md.
- The Astro 7 Rust compiler rejects unclosed non-void elements, so templates must be valid HTML.
  This is caught at build time.

**Alternatives considered**: `outDir: './site'` (keeps the published directory name, but the
build would overwrite or require deleting the existing hand-written files, which the author
ruled out); moving `site/` into `archive/` (also changes existing files). Rejected.

## R3. Dependencies (Principle V: each justified individually)

| Package | Kind | Justification |
|---|---|---|
| `astro` | build | Static generation, layouts, content collections with schema validation, `astro:assets`, Fonts API. Replaces hundreds of lines of custom tooling. |
| `@astrojs/svelte` | build | Official integration that compiles `.svelte` islands and handles `client:*` loading. |
| `svelte` | runtime (islands only) | Reactive UI for the interactive pieces and easter eggs. Shipped only where an island is used. |
| `sharp` | build | Astro's default image service: AVIF/WebP conversion and resizing (Principle IV). |
| `vitest` | dev | Unit tests (constitution requirement) using Astro's Vite config through `getViteConfig`. |
| `@astrojs/check` + `typescript` | dev | Type-checks `.astro`/`.svelte`/`.ts` in CI. |

**Not added**: Tailwind or Sass (R8), icon fonts (inline SVG instead), analytics, KaTeX,
three.js, Playwright (R13), `@lhci/cli` (the CI action is used instead, R14), and
`@fontsource-*` packages (the Fonts API fetches fonts at build time, R9).

## R4. Content modeling

**Decision**: Astro content collections defined in `src/content.config.ts`:
- `projects`: `glob()` over `src/content/projects/*.md`. Frontmatter holds the card fields. The
  Markdown body is the optional detail page, rendered only when `detail: true`.
- `interests`: `glob()` over `src/content/interests/*.md`. Frontmatter holds the metadata and the
  body is the write-up. This mirrors projects, so adding an interest works "the same way as
  project entries" (FR-020).
- `profile`: `file()` over `src/data/profile.yaml` (a single entry, `author`).
- `nav`: `file()` over `src/data/nav.yaml`, the single shared navigation list (FR-030).

**Rationale**: Markdown files with frontmatter are directly editable (Principle V, FR-032).
Glob collections support the `image()` schema helper, so images referenced in frontmatter go
through `astro:assets` automatically. Zod schemas make missing or invalid fields a build error
rather than a broken page.

**Alternatives considered**: one big `projects.yaml` (harder to give each project a body for its
detail page; `image()` support in `file()` collections is less certain); a `src/data/*.ts` object
(not "plain content" for a non-developer edit); MDX (not needed until a detail page needs
embedded components; can be added later without changing frontmatter).

## R5. Routes and legacy addresses

**Decision**: Previously published addresses (found in git history before `3042f79`) are
`/index.html`, `/about/about_index.html` and `/projects/projects_index.html`. `/index.html` keeps
working because the build emits it. The other two get hand-written stub pages in `public/` that
use `<meta http-equiv="refresh" content="0; url=/about/">`, `<link rel="canonical">`,
`<meta name="robots" content="noindex">` and a visible fallback link. The full list is in
contracts/routes.md.

**Rationale**: GitHub Pages has no server-side redirects. Stubs in `public/` are copied verbatim
into the output, so the path is exactly what's published, with no ambiguity about how a `.html`
source key interacts with `build.format: 'directory'`.

**Alternatives considered**: Astro's `redirects` config (generates the same meta-refresh pages,
but it's unclear how `.html` source keys map under directory format; worth trying, with stubs as
fallback); a JS redirect (fails without JavaScript).

## R6. Light/dark theme with remembered toggle (FR-034)

**Decision**:
- Colors are defined once with CSS `light-dark()` in `tokens.css`. `:root` declares
  `color-scheme: light dark` (follows the device), and `:root[data-theme="light"|"dark"]`
  overrides `color-scheme`.
- A short `is:inline` script directly after `<meta charset>` in `<head>` reads `localStorage['theme']` (in try/catch)
  and sets `data-theme` before first paint, so the wrong theme never flashes.
- `ThemeToggle` is a native `<button aria-pressed>` rendered with the `hidden` attribute. The
  bundled `src/scripts/theme.ts` removes `hidden`, flips the theme on click, writes storage in
  try/catch, and follows `matchMedia('(prefers-color-scheme: dark)')` changes while no choice is
  stored. Without JavaScript the toggle never appears (spec edge case).
- `resolveTheme(stored, systemPrefersDark)` in `src/lib/theme.ts` is the unit-tested decision
  logic.
- With a native cross-document view transition, the stored theme must apply before the snapshot.
  The inline head script runs early enough for this.

**Alternatives considered**: duplicated token blocks under `@media (prefers-color-scheme)` and
`[data-theme]` (more CSS to keep in sync; unnecessary given `light-dark()` support in all target
browsers); a Svelte toggle island (would hydrate Svelte on every page for one button; rejected by
budget).

## R7. Islands and easter eggs

**Decision**:
- **Interactive pieces**: each is a Svelte component in `src/islands/`, placed inside
  `PieceFrame.astro` with `client:visible`. The page passes the build-time static fallback
  (SVG or image plus caption) to the island as children. The island renders those children until
  it has mounted and then swaps in its live canvas. The fallback is therefore in the static HTML:
  it shows before the island loads and permanently when JavaScript is off. A `<noscript>` note
  explains what the piece does.
- **Runtime behavior**: pieces pause with `IntersectionObserver` when off screen and on
  `visibilitychange` when the tab is hidden. They cap canvas resolution at
  `devicePixelRatio ≤ 2`. Under `prefers-reduced-motion: reduce` they start paused and step on
  demand instead of animating.
- **Easter eggs**: `src/scripts/eggs.ts` is a tiny vanilla listener module loaded on every page
  (target ≤ 1.5 KB gzipped). On a trigger it calls `import()` on the matching egg component and
  mounts it with Svelte's `mount()` into a fixed, pointer-transparent overlay layer. Svelte's
  runtime therefore never loads on a page unless an egg is triggered or the page has a piece.
  Eggs self-end (≤ 6 s) or close with `Esc` or a tap, and under reduced motion they show a static
  card instead of animating (FR-019).
- **Triggers**: each egg has a keyboard trigger and a touch trigger (for example tapping the
  site mark 5 times), per the touch-only edge case.

**Alternatives considered**: `client:load` for pieces (wastes bandwidth above the fold); one
Svelte island wrapping the whole Fun page (hydrates static content needlessly); a vanilla-only
egg system (fine for one egg, but loses the shared component model the author chose).

## R8. Responsive, mobile-first layout

**Decision**:
- Styles are written mobile first at 320px, with layout upgrades at `48rem` (768px) and `80rem`
  (1280px) via media queries for page-level grid. Component-level changes, such as project cards
  going from stacked to side-by-side, use **container queries**, so components adapt to their
  slot rather than to the viewport.
- **Fluid type and space**: `clamp()` scales from 320px to 1280px. The editorial display size can
  be very large on desktop without overflowing on phones. Long words use
  `overflow-wrap: anywhere` and `hyphens: auto` (long-content edge case).
- **Navigation without a hamburger**: the header is the site mark on row 1 and four short nav
  links plus the theme toggle on row 2 at narrow widths, merging into a single row from 768px.
  This needs no JavaScript and no disclosure state (FR-002, FR-027). Links have ≥ 44×44 px hit
  areas through padding.
- **Touch**: hover effects sit behind `@media (hover: hover)`, and everything a hover reveals is
  also reachable by focus or tap. Canvas islands set `touch-action: none` on the drawing surface
  only, so the page still scrolls around it. Respect `env(safe-area-inset-*)` for notched phones.
- **Viewport sizing**: avoid `100vh` traps on mobile browsers; use `svh`/`dvh` units where a
  section must fill the screen.
- **No CSS framework**: hand-written CSS with cascade layers (`@layer reset, tokens, base,
  layout, components, utilities`). An editorial look depends on bespoke typography and spacing,
  where utility frameworks add weight and fight the design.

**Fallbacks for browsers in the support range that lack a feature**: view transitions (no
animation, normal navigation), `hyphens: auto` (plain wrapping). `light-dark()`, container
queries, `:has()`, `clamp()` and cascade layers are supported in the current and prior majors of
all four target browsers.

## R9. Typography (two families, self-hosted)

**Decision**: use Astro's stable Fonts API with the Fontsource provider. It downloads font files
at build time, self-hosts them under `dist/`, emits `<link rel="preload">` for the primary face,
and generates metric-matched fallback `@font-face` rules to avoid layout shift.
- **Display**: *Fraunces* (variable serif with optical size and "softness" axes). It gives the
  editorial, expressive headline voice.
- **Text and UI**: *Inter* (variable sans with tabular figures). Engineering-flavored labels such
  as dates, tech tags and "§" section markers use Inter with `font-variant-numeric:
  tabular-nums` and small caps, rather than a third, monospace family (Principle IV allows at most
  two).
- Latin subset only. Load only the weight ranges actually used.

**Alternatives considered**: Google Fonts CDN (third-party request; constitution prefers fewer
third-party dependencies); system font stack only (fast, but generic, against "stands out"); a
monospace display face (strong "engineer" signal but poor for long-form reading; can be swapped
later via the two `--font-*` variables). Final pairing is a design-time choice; the constraint is
two families and the R10 font budget.

## R10. Performance budget allocation (per page, transferred, compressed)

| Resource | Landing | About | Projects | Detail | Fun |
|---|---|---|---|---|---|
| HTML (incl. inline SVG hero) | ≤ 40 KB | ≤ 30 KB | ≤ 40 KB | ≤ 30 KB | ≤ 40 KB |
| CSS (one shared file) | ≤ 25 KB | ≤ 25 KB | ≤ 25 KB | ≤ 25 KB | ≤ 25 KB |
| Fonts (2 families, latin) | ≤ 150 KB | ≤ 150 KB | ≤ 150 KB | ≤ 150 KB | ≤ 150 KB |
| JS (theme + eggs listener) | ≤ 3 KB | ≤ 3 KB | ≤ 3 KB | ≤ 3 KB | ≤ 3 KB |
| JS (Svelte runtime + pieces) | 0 | 0 | 0 | 0 | ≤ 60 KB |
| Images, first view | ≤ 150 KB | ≤ 150 KB | ≤ 300 KB | ≤ 300 KB | ≤ 250 KB |
| **Total at first load** | **≤ 370 KB** | **≤ 360 KB** | **≤ 520 KB** | **≤ 510 KB** | **≤ 530 KB** |

Below-the-fold images use `loading="lazy"` and don't count toward first-load totals. The total
transferred after a full scroll must still stay under 1 MB. Lighthouse CI asserts
`resource-summary` totals and LCP per URL (`lighthouserc.json`). The LCP element on every page is
text (name or page title), never an image.

## R11. Landing hero signature motion

**Decision**: `HeroCurve.astro` computes a parametric curve at build time with `src/lib/curves.ts`
(for example a rose curve r = cos(kθ) or a harmonograph-style sum of damped sinusoids, parameters
chosen during design). It emits a single inline SVG `<path>` and animates `stroke-dashoffset`
with CSS so the curve draws itself once. Under reduced motion the finished curve is shown
statically. No JavaScript is used, and the SVG is `aria-hidden` with no layout dependency, so it
never delays LCP (FR-022 limits prominent motion to this hero, the pieces, easter eggs, page transitions,
and hover/focus).

**Alternatives considered**: a canvas or Svelte hero (JS on the most important page, LCP risk);
Lottie or video (heavy, third-party runtime, against FR-022's no-autoplay-video rule).

## R12. First interactive piece

**Decision**: **Fourier Sketch**. The visitor draws a closed shape (pointer or touch) or picks a
preset (keyboard and screen-reader accessible buttons). A discrete Fourier transform turns the
path into rotating circles (epicycles) that redraw the shape. A slider controls how many terms
are used, so the visitor sees the approximation sharpen. Play/pause and reset are buttons.
- Math (`dft`, sorting by amplitude, resampling a freehand path to N evenly spaced points) lives
  in `src/lib/fourier.ts` and is unit-tested against known transforms (a pure circle has one
  non-zero coefficient; reconstruction error drops as terms increase).
- The static fallback is generated at build time from the same module as an SVG of the epicycle
  trace of a preset shape (for example the author's initials), with a caption explaining the idea.

**Rationale**: it is visually striking, unmistakably mathematical, interactive in a way that
rewards play, works on touch, and its core logic is pure and testable.

**Alternatives considered**: Game of Life (familiar, less personal); Mandelbrot via WebGL
(spectacular, but needs a WebGL fallback path; proposed as the second piece, R1); Lissajous
harmonograph (better as the CSS-only hero, R11).

## R13. Testing strategy

**Decision**:
- **Unit (Vitest)**: everything in `src/lib/`: `fourier.ts`, `curves.ts`, `theme.ts` and
  `content-rules.ts` (sentence counter for the 1–3 sentence summary, detail-page heading check,
  phone/street-address detectors). Run with `npm test`.
- **Build-time validation**: Zod schemas in `content.config.ts` plus checks in `getStaticPaths`
  (`detail: true` without the required headings fails the build). See data-model.md.
- **Type checks**: `astro check`.
- **Post-build checks**: `scripts/check-content.mjs` (placeholders, phone and address patterns in
  `dist/**/*.html`), lychee link check, Lighthouse CI.
- **Manual**: no-JS, three viewports, both themes, keyboard-only, touch device, and the
  add-a-page drill, as scripted in quickstart.md.

**Alternatives considered**: Playwright end-to-end tests (would automate the no-JS and theme
checks, but adds a large dev dependency and browser downloads for a single-author static site;
revisit if regressions appear); component tests for Svelte (logic is in `src/lib/`, so the
components are thin).

## R14. CI and deploy

**Decision**:
- `pages.yml` (deploy, on push to `master`): checkout → `actions/setup-node` (version from
  `.nvmrc`, npm cache) → `npm ci` → `npm test` → `npm run build` → `upload-pages-artifact` with
  `path: ./dist` → `deploy-pages`. It is still the only deploy path.
- `checks.yml` (on pull request): `npm ci` → `npx astro check` → `npm test` → `npm run build` →
  `node scripts/check-content.mjs` → `lycheeverse/lychee-action` over `dist/` (offline mode for
  internal links, with external links checked but non-blocking) →
  `treosh/lighthouse-ci-action` with `staticDistDir: ./dist`, `lighthouserc.json` budgets, and a
  temporary public report link to paste into the PR (constitution Development Workflow).

**Alternatives considered**: `withastro/action` (convenient, but hides the build steps the
constitution wants explicit); running Lighthouse only after deploy (too late to block a merge).

## R15. Privacy and content safety (FR-029, FR-036)

**Decision**: `scripts/check-content.mjs` fails the build in CI if any built HTML page contains
placeholder markers (`lorem ipsum`, `TODO`, `TBD`, `placeholder`), phone-number patterns, or
street-address patterns (number + street suffix). The resume PDF is checked manually in the
pre-deploy checklist (quickstart §6), because extracting PDF text in CI would add a dependency.
The profile schema has no phone or street fields at all, so it can't be populated by mistake.

## R16. Social sharing previews (FR-028)

**Decision**: static 1200×630 PNG (or JPEG) images in `public/og/`: `default.png` plus optional
per-page overrides passed as a `BaseLayout` prop. Project detail pages default to their card image
if one exists. All OG URLs are absolute, built from `Astro.site`.

**Alternatives considered**: generating OG images at build time with Satori and resvg (attractive
and on-brand, but two more dependencies to save a few manually exported images; revisit if detail
pages multiply).

## R17. Page transitions

**Decision**: native cross-document view transitions via CSS
`@view-transition { navigation: auto; }`, with named transitions on the site mark and page title
for an editorial "morph" between pages. They are disabled under `prefers-reduced-motion`. No
JavaScript is needed, and browsers without support simply navigate normally.

**Alternatives considered**: Astro's `<ClientRouter />` (ships a client-side router on every
page and changes navigation semantics, which works against zero-JS content pages). Rejected.
