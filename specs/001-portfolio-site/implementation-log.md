# Implementation Log: 001-portfolio-site

Technical record of what was done during `/speckit-implement`, in order. Task IDs refer to
[tasks.md](./tasks.md). Newest entries are at the bottom of each phase.

## Environment

- Date: 2026-10-05 / 2026-10-06
- Branch: `001-portfolio-site` (created by the author; spec + constitution v1.3.0 committed in
  `c5c8b7c`)
- Node: v24.21.0 via nvm (system Node is v14.17.0, too old for Astro 7). Non-interactive shells
  need `source ~/.nvm/nvm.sh && nvm use` before running npm.
- Existing files are never deleted, moved or edited except where a task requires an edit
  (author requirement; constitution v1.3.0). `site/` and `archive/` are untouched.

## Phase 1: Setup

- **T001** `.nvmrc` = `24`. nvm already had v24.21.0 installed (`lts/krypton`).
- **T002** Constitution v1.3.0 was already committed by the author in `c5c8b7c`, together with
  the spec documents rather than in a commit of its own. Accepted as done; no history rewrite.
- **T003** Appended to `.gitignore`: `.astro/`, `.lighthouseci/`, `*.log`, `.env*` (`dist/` and
  `node_modules/` were already listed). No file deleted or moved.
- **T004** `package.json` (private, ESM, `engines.node >=22.12.0`, scripts dev/build/preview/
  test/check). Installed: `astro@7.3.5`, `@astrojs/svelte@9.0.1`, `svelte@5.57.1`,
  `sharp@0.35.5`; dev: `vitest@5.0.3`, `@astrojs/check@0.9.10`, `typescript@6.0.3`.
  npm 11 reported that the install scripts of `esbuild` (postinstall) and `fsevents` are not
  in its `allowScripts` list, so they did not run. Verified both are unnecessary: esbuild
  transforms TS through its platform binary package, sharp loads libvips 8.18.7, and
  `astro --version` works. Left unapproved on purpose.
- **T005** `astro.config.mjs`: `site`, `output: 'static'`, default `outDir` (`dist/`),
  `trailingSlash: 'always'`, `build.format: 'directory'`, Svelte integration. Fonts API (stable
  since Astro 6) with `fontProviders.fontsource()`: Fraunces `300 900` → `--font-display`,
  Inter `400 700` → `--font-text`, latin, normal style only (no italics, to save bytes),
  explicit fallbacks.
- **T006** `tsconfig.json` extends `astro/tsconfigs/strict`, excludes `dist`, `site`,
  `archive`, `node_modules`; alias `~/*` → `src/*`.
- **T007** `vitest.config.ts` via `getViteConfig` (exported from `astro/config` in Astro 7).
- **T008** `svelte.config.js` with `vitePreprocess` re-exported by `@astrojs/svelte`.
- **T009** Created the `src/`, `public/og`, `scripts/`, `tests/unit` skeleton.
- **Checkpoint**: `npm run build` → 0 pages, output in `dist/`, Fonts API downloaded 2 font
  files. `git status` shows only `.gitignore` modified (by T003) and new files.

## Phase 2: Foundational

- **T010–T011** Tests first: `tests/unit/theme.test.ts` (8 cases) and
  `tests/unit/content-rules.test.ts` (20 cases). Both failed (modules missing) before T012–T013.
- **T012** `src/lib/theme.ts`: `THEME_STORAGE_KEY`, `isTheme`, `resolveTheme`.
- **T013** `src/lib/content-rules.ts` (erasable TS only):
  - `countSentences`: protects URLs and a case-sensitive abbreviation list (`e.g.`, `i.e.`,
    `etc.`, `No.` …) by swapping their periods for U+2024, then splits on `[.!?]` + optional
    closing quote/bracket followed by whitespace or end. Decimals and versions never split
    because their dots are followed by digits.
  - `countWords`: drops fenced code, Markdown images, link targets, HTML tags and syntax chars.
  - `hasDetailSections`: ordered, case-insensitive `## Problem/Approach/Outcome`, ignoring fences.
  - `findPhoneNumbers`: US `(\d{3}) \d{3}-\d{4}` family plus `+CC …` international; lookarounds
    `(?<!\d)(?<!\d\.)` / `(?!\d)(?!\.\d)` reject digit runs (years, `24.21.0`) but still allow a
    sentence-ending period. `findStreetAddresses`: number + up to 4 capitalised words/
    directionals + street suffix. `findPlaceholders`: `lorem ipsum`/`placeholder` case-insensitive,
    `TODO`/`TBD`/`DRAFT:` case-sensitive (so "Todo app" passes).
  - Result: 28/28 tests pass. Verified Node 24 imports the `.ts` file directly (type stripping).
- **T014** `src/content.config.ts`: `imageSchema(image)` helper (alt required unless
  `decorative`), strict `profile` collection (`file()` over a YAML map → entry `author`; Zod 4
  `z.email()`, `z.url()` + host refinement; no phone/address keys possible), `nav` collection
  (`file()` over a YAML list; `id` kebab-case, `label` ≤ 16, `href` `^/$|^/.+/$`). `z` imported
  from `astro/zod` (the `astro:content` re-export is deprecated in Astro 7).
- **T015** `src/data/nav.yaml`: Home only; each story adds its own entry.
- **T016** `src/data/profile.yaml`: name, GitHub, LinkedIn, email `athenafung1@gmail.com`
  (author, 2026-10-05), institution UIUC (from the old site). Everything else `DRAFT:`.
- **T017** `src/styles/tokens.css`: `@layer reset, tokens, base, layout, components, utilities`.
  Palette via `light-dark()`; contrast computed with the WCAG formula before use:

  | Pair | Light | Dark |
  |---|---|---|
  | text / bg | 15.59 | 15.62 |
  | muted / bg | 6.57 | 7.47 |
  | accent / bg | 5.09 | 8.30 |
  | accent-ink / accent | 5.73 | 8.26 |
  | border (UI) / bg | 3.15 | 3.98 |
  | focus / bg | 5.94 | 8.82 |

  Fluid type steps (`clamp`, linear 320→1280px; display 44px→104px), fluid space, `--tap: 2.75rem`,
  motion durations zeroed under `prefers-reduced-motion`.
- **T018** `src/styles/base.css`: reset, element defaults, focus ring, skip link, `.label`
  (small caps + tabular figures), global reduced-motion rule, `.tap-target`, `.visually-hidden`.
- **T019** `src/styles/layout.css`: page grid with `max(gutter, safe-area)` padding (16px at
  320px), header grid areas (mark / nav+toggle → one row at 48rem), `.prose`, `.section-head`,
  `.cq` container, `.stack`.
- **T020** `Picture.astro`: `astro:assets` `<Picture>` AVIF+WebP, widths clipped to the source
  width (Astro never upscales), lazy unless `eager`, throws on empty alt unless decorative.
- **T021** `ContactLinks.astro`: `variant: 'footer' | 'compact'`; inline SVG icons
  (`aria-hidden`), compact links get `aria-label` ("Email Athena Fung", …).
- **T022** `SiteNav.astro`: sorted by `order`; build error on duplicate `id`/`order`;
  `aria-current="page"` on exact match, or prefix match for sections (detail pages → Projects).
- **T023** `ThemeToggle.astro` (`hidden` until JS) + `src/scripts/theme.ts` (reveals, toggles
  `data-theme`, try/catch storage, follows `prefers-color-scheme` changes). Built output: the
  script is inlined as a 693-byte module.
- **T024** `SiteHeader.astro`: site mark = rose curve r = cos(3θ) computed in frontmatter
  (72 samples, petal up) + name; `data-site-mark` (easter-egg touch target later).
- **T025** `BaseLayout.astro`: `<meta charset>` first, then the inline theme bootstrap (~120
  bytes), viewport, title/description/canonical/robots, OG + Twitter tags (absolute URLs from
  `Astro.site`), favicon, `<Font>` for both families (text face preloaded), skip link, header,
  `<main id="main">`, footer with ContactLinks + ©.
- **T026** `src/assets/og/default.svg` + `scripts/render-og.mjs` (sharp, PNG palette,
  1200×630) → `public/og/default.png` (31.4 KB). Artwork: rotary harmonograph
  `x = e^{-0.03t}(sin(2t+π/2) + 0.7 sin(5.006t))`, `y = e^{-0.03t}(sin 2t + 0.7 sin(5.006t+π/2))`,
  chosen from 4 rendered candidates. Text uses system Georgia/Helvetica (librsvg), so CI never
  needs to render it. `public/favicon.svg`: rose curve with a dark-mode stroke.
- **T027** `scripts/check-content.mjs`: walks `dist/**/*.html`, strips script/style/tags,
  runs the content-rules finders on visible text and on `alt/title/content/aria-label`
  attributes, embedded-media check for `/fun/`, exactly-one-`<title>`, title uniqueness (stubs and
  404 exempt), description 50–160 (stubs exempt; stubs detected by `http-equiv="refresh"`).
- **T028** `pages.yml`: checkout → setup-node (`.nvmrc`, npm cache) → `npm ci` → `npm test` →
  `npm run build` → configure-pages → upload `./dist` → deploy. Action majors bumped to the
  current releases (checked with `git ls-remote --tags`): checkout v7, setup-node v7
  (`node24` runtime; inputs `node-version-file`/`cache` confirmed in its action.yml),
  configure-pages v6, upload-pages-artifact v5 (`path` input confirmed), deploy-pages v5.
- **T029** `lighthouserc.json`: `staticDistDir ./dist`, 3 runs, perf/a11y ≥ 0.9, LCP ≤ 2500,
  total bytes ≤ 1,000,000, CLS ≤ 0.1, temporary public storage.
- **T030** `checks.yml` (PRs): `astro check` → tests → build → check-content → lychee
  (blocking `--offline --root-dir $GITHUB_WORKSPACE/dist --index-files index.html`; external
  non-blocking) → `treosh/lighthouse-ci-action@v12`. lychee-action v2.9.0 pins lychee v0.24.2,
  whose README documents both `--root-dir` and `--index-files`.
- **Font budget fix**: the first build shipped Fraunces as a variable font (121 KB) + Inter
  variable (73 KB) = 194 KB, over research R10's 150 KB. Switched Fraunces to static weight 600
  (18 KB) → fonts total 91 KB. Removed the now-meaningless `opsz` variation setting.
- **Checkpoint** (temporary `src/pages/scratch.astro`, deleted afterwards): build OK,
  `astro check` 0 errors / 0 warnings. Visual + behaviour check with a throwaway Chrome
  DevTools-protocol script (session scratchpad, not in the repo) because headless Chrome's
  `--window-size` cannot go below ~500px:
  - 320 / 768 / 1280px: `scrollWidth === innerWidth` (no horizontal scroll), one `<h1>`.
  - JS disabled: toggle stays `hidden`.
  - Stored `light` + device dark → `data-theme="light"`, paper background, `aria-pressed=false`.
  - Click toggle → `data-theme="dark"`, `localStorage.theme = "dark"`, ink background.
  - No console errors or exceptions. First load 98.8 KB transferred.
  - Svelte's client runtime (24.6 KB) is emitted to `_astro/` but not requested by the page.

## Phase 3: User Story 1 — Landing page

- **T031** `tests/unit/curves.test.ts` (12 cases): rose closure for odd/even k, unit-circle bound,
  harmonograph start value and decay envelope, undamped closure, `normalizeToViewBox` padding/
  centring/degenerate input, `toSvgPath` rounding and `Z`. Failed first (module missing).
- **T032** `src/lib/curves.ts`: `rose`, `harmonograph` (sum of damped sinusoids per axis),
  `normalizeToViewBox` (uniform scale, centred; scale 1 when the span is 0), `toSvgPath`
  (2-decimal `M/L`, optional `Z`). 40/40 unit tests pass.
- **T033** `HeroCurve.astro`: harmonograph D from the OG image, 1800 samples (900 looked
  polygonal on the outer petals at 1280px), normalised into a 600×600 viewBox, one `<path
  pathLength="1">` drawn by animating `stroke-dashoffset` 1 → 0 over `--dur-draw` (2.4 s, 0.15 s
  delay). `prefers-reduced-motion: reduce` → no animation, offset 0. `aria-hidden`, no JS.
- **T034** `src/pages/index.astro`: eyebrow label, `<h1>` name at `--step-display`, role line
  (Fraunces, muted), numbered strengths (`01`, `02` labels in small caps), primary "Get in
  touch" button (`mailto:`) + `<ContactLinks variant="compact">` so email/GitHub/LinkedIn are above
  the fold (analysis fix I1). Desktop (≥ 56rem): two-column grid, curve on the right. Phones: the
  curve is an absolutely positioned watermark (opacity 0.2) behind the heading. Added shared
  `.button`, `.button--primary`, `.button--secondary` to `base.css` (`@layer components`).
  Landing HTML: 39.1 KB raw, 15.0 KB gzip.
- **T035** Built `dist/index.html`: one `<h1>`, `og:url` `https://athenafung1.github.io/`,
  absolute `og:image`, `<title>Athena Fung · Portfolio</title>`.
- **T036** Validation (Chrome DevTools-protocol script):
  - 1280×720 light + dark: bottoms of name 353, role 444, strengths 522, button 590, contact row
    590 px → all above the fold (FR-006, US1 Independent Test).
  - 320 / 768 / 1280: `scrollWidth === innerWidth`.
  - JS disabled at 320 (dark): 7 contact links present (hero button, 3 compact, 3 footer), toggle
    hidden.
  - Reduced motion: computed `stroke-dashoffset` = `0px` immediately.
  - Theme persistence: a "light" job unexpectedly rendered dark because the previous run had
    stored `theme=dark` in the reused Chrome profile, i.e. the stored choice survived a browser
    restart (SC-011). The harness now clears `localStorage` before each job unless told not to.
  - No console errors. First load 105.8 KB transferred (HTML, 1 CSS file, 2 fonts).
  - `check-content`: only the expected `DRAFT:` hits from `profile.yaml` (role, strengths).
  - **Bug fixed in `check-content.mjs`**: attribute/description regexes used `[^"']*`, so the
    apostrophe in "Athena Fung's portfolio" truncated the description to 11 chars. Now matches
    `"…"` and `'…'` separately.

## Phase 4: User Story 2 — Projects

- **T037** `tests/unit/projects.test.ts` (7 cases). Failed first (module missing).
- **T038** `src/lib/projects.ts`: `sortProjects` (featured desc, order asc, stable, non-mutating),
  `selectFeatured(list, 3)` (throws with a fix-it message when none is featured),
  `assertUniqueOrder` (per featured group; names both ids). 47/47 tests pass.
- **T039** `projects` collection: `glob('*.md')`; strict schema; `summary` refined with
  `countSentences` (1–3) and ≤ 400 chars; `tech` ≥ 1 (≤ 30 chars each); `links` ≥ 1 typed
  `repository|demo|writeup|publication`; `image: imageSchema(image).optional()`; `featured`/
  `detail` default false; object-level refine: `detailDescription` (50–160) required when
  `detail: true`.
- **T040** `ProjectCard.astro`: `<article>` with `container-type: inline-size`; inner grid goes
  image | text at `@container (min-width: 40rem)` (the query can't style the container itself, so
  the grid lives on an inner wrapper). `№ 01` + period label, dynamic `h2`/`h3`, tech list in
  small caps, links labelled by type with a visually-hidden " for <title>" suffix. Detail
  projects: stretched-link `::after` on the title; external links are `position: relative;
  z-index: 1` so they stay clickable; a mouse-only "Read the case study →" (`aria-hidden`,
  `tabindex=-1`) duplicates the title link.
- **T041** `src/pages/projects/index.astro`: throws when the collection is empty (analysis fix
  G1), `assertUniqueOrder` → `sortProjects`, count-aware intro, single-entry variant.
- **T042** `ProjectLayout.astro`: back links top and bottom, header (period, `<h1>`, tech, link
  buttons), Markdown body with editorial `h2` rules. `.case-study` uses
  `grid-template-columns: minmax(0, 1fr)`: without it the code block's `min-width: auto` widened
  the page to 653px at a 320px viewport (found by the DevTools-protocol check).
- **T043** `src/pages/projects/[slug].astro`: validates every `detail: true` body with
  `hasDetailSections` and `hasVisualOrCode` (build error naming the file), warns on bodies of
  non-detail projects, renders with `render(entry)`; per-project OG image if
  `public/og/projects/<id>.png` exists.
  Code blocks: Astro 7 still uses Shiki for Markdown; its default `github-dark` inline styles
  ignored the site theme. Set `markdown.shikiConfig.themes = { light: 'github-light', dark:
  'github-dark' }` with `defaultColor: false` and pick per token with
  `color: light-dark(var(--shiki-light), var(--shiki-dark))`, so code follows the toggle too.
- **T044** `nav.yaml` += Projects (order 3).
- **T045** Landing: primary action → "View projects", "Get in touch" secondary;
  "Selected work" section with up to 3 featured `ProjectCard`s (`h3` under the section `h2`) and
  "View all projects".
- **T046** `public/projects/projects_index.html`: meta refresh, canonical, `noindex`,
  `<title>Redirecting…</title>`, visible link; no CSS/JS/fonts. `site/projects/projects_index.html`
  (the old hand-written page) is untouched.
- **T047** Project content seeded from the author's public GitHub repositories (API +
  READMEs), not invented: `smart-legos.md` (featured, detail page; Problem/Approach written from
  the README, real `ssh-keygen` snippet from the README; personal role and Outcome left
  `DRAFT:`; two building street addresses from the README deliberately not reproduced),
  `caster-ddi.md` (featured; CS 598 DL for Healthcare, CASTER summary from the README + `DRAFT:`
  findings sentence), `scheduling-optimizer.md` (no README: `DRAFT:` summary and period;
  tech from GitHub's language stats). README-derived text is marked for author review in YAML
  comments.
- **T048** `lighthouserc.json` URLs += `/projects/`, `/projects/smart-legos/`.
- **T049** Validation:
  - Negative builds (each restored afterwards), all exit 1 with file + field:
    links removed → `links: Required`; 4-sentence summary → "summary must be 1 to 3 sentences";
    `## Outcome` renamed → FR-033 heading error naming `smart-legos.md`; `phone:` in profile →
    `Unrecognized key: "phone"`; no featured project → "No featured project: set `featured:
    true` …" (first attempt tripped the duplicate-order check instead, which is also correct;
    re-ran with distinct orders).
  - Upper bound: 19 temporary copies (22 projects, long titles) → 320 and 1280 px with no
    horizontal overflow, titles wrap; copies deleted.
  - `/projects/projects_index.html` → `location.pathname === '/projects/'`.
  - Detail page: `aria-current` on Projects; 320/768/1280 no overflow after the grid fix.
  - Screenshots reviewed in both themes. Fixed: arrows touching link text (Astro 7 JSX
    whitespace dropped the space inside `<span> ↗</span>`) → flex `gap`; tech-list separators
    moved after items so wrapped lines never start with "·".

## Phase 5: User Story 3 — About

- **T050** `src/pages/about.astro`: "Hello, I’m Athena." `<h1>`, plain-text bio split on blank lines
  (first paragraph as a Fraunces lede), optional `seeking` and `location`, "Download resume"
  (`download` attribute, size from `statSync`, e.g. "PDF · 1 KB"), numbered sections
  01 Experience / 02 Education (timeline: period column from 48rem) / 03 Skills (`<dl>` groups
  with pill items) / 04 Get in touch (email in prose + compact contact links, FR-015). Build
  error if `public/resume.pdf` is missing (FR-014).
- **Stand-in resume**: no real resume exists yet, and T050 must fail without one, so
  `public/resume.pdf` is a hand-assembled 713-byte, 1-page PDF (uncompressed text, valid
  xref; rendered with `sips` to confirm) that reads "DRAFT: replace public/resume.pdf …".
  `check-content.mjs` now also scans `dist/**/*.pdf` raw bytes for `DRAFT:`, so the stand-in
  can never deploy. Real (compressed) resumes don't match; their privacy check stays manual.
- **T051** `public/about/about_index.html` stub (same rules as T046). `site/about/` untouched.
- **T052** `nav.yaml` += About (order 2). Rendered order Home | About | Projects.
- **T053** NOT done: needs the author's real bio, experience, education, skills and resume
  (left unchecked in tasks.md).
- **T054** `lighthouserc.json` URLs += `/about/`.
- **T055** Validation: `aria-current` on About; 320/768/1280 no overflow (incl. JS disabled);
  `/about/about_index.html` → `/about/`; `/resume.pdf` served as `application/pdf`. Opening the
  PDF directly logs a 404 for `/favicon.ico` (browsers request it for non-HTML documents);
  harmless, not fixed. `check-content`: only `DRAFT:` hits + the stand-in PDF. quickstart §6
  resume checks are re-run in T080 once the real resume exists.

## Phase 6: User Story 4 — Fun

- **T056–T057** Tests first: `tests/unit/fourier.test.ts` (10 cases: arc-length resampling incl.
  corners and duplicate points, single-coefficient circle, signed frequency −1 for clockwise,
  non-mutating sort, error 4 → 16 → 64 terms strictly decreasing, exact reconstruction with all
  terms, chained epicycles, presets) and `tests/unit/eggs.test.ts` (10 cases). Failed first.
- **T058** `src/lib/fourier.ts`: `resample` (cumulative arc length over the closed polygon,
  dedupes consecutive points), `dft` (O(N²), N = 256, signed frequencies in (−N/2, N/2]),
  `sortByAmplitude`, `epicycleChain`, `reconstruct`. `src/lib/presets.ts`: "AF" as one
  continuous closed stroke (A legs → baseline → F stem and bars, retraced → back → A crossbar;
  the closing segment runs down A's left leg), a 5-point star, a trefoil from `rose(3)`.
- **T059** `src/lib/eggs.ts`: `KONAMI`, `createSequenceMatcher` (sliding buffer of the last
  N keys, so overlapping prefixes like Up-Up-Up-Down… still match; letters case-insensitive),
  `createTapCounter` (sliding time window), `shouldIgnoreEvent` (INPUT/TEXTAREA/SELECT/
  contenteditable). 67/67 tests pass.
- **T060** `interests` collection: strict schema, `images` ≤ 6 via `imageSchema`, typed links
  `video|audio|writing|other`, integer `order`.
- **T061** `InterestEntry.astro`: `headingLevel` prop (default 3, analysis fix A2), category
  label, rendered body, lazy `Picture` gallery (1/2/3 columns by container query), links shown as
  "Watch/Listen/Read/Visit · label ↗". No embeds.
- **T062** `PieceFrame.astro`: single default slot (analysis fix U1), `<h2>` name, idea caption,
  `<noscript>` note; stage capped at 52rem so canvas + controls fit one desktop screen.
- **T063** `FourierFallback.astro`: build-time SVG of the AF preset rebuilt from its 64 largest
  terms (400 samples) + the first 12 epicycles at t = 0, `role="img"` with `<title>`/`<desc>`.
- **T064** `src/islands/FourierSketch.svelte` (Svelte 5 runes): renders `children` (the fallback)
  until `onMount`, then (after `tick()`) a canvas in a 640×400 logical space; ResizeObserver
  sizes the backing store at `min(devicePixelRatio, 2)`; pointer drawing with
  `setPointerCapture`, `touch-action: none` on the canvas only; strokes ≥ 8 points and > 60
  units become "your shape" (resampled to 256, DFT, sorted); preset chips (`aria-pressed`),
  circles slider (1–256, `<output>`), Play/Pause, Step, Reset; `aria-live` status ("Drawing AF
  with 48 of 256 circles."); pauses via IntersectionObserver and `visibilitychange`; starts
  paused under reduced motion. Canvas colours come from hidden probe elements' computed
  `color` (CSS `light-dark()` values can't be passed to canvas directly) and refresh on
  `data-theme` mutations and `prefers-color-scheme` changes.
- **T065** `src/islands/pieces.ts` registry (id, name, idea).
- **T066** `src/pages/fun.astro`: intro, Fourier Sketch in `PieceFrame` with `client:visible`
  and the fallback as children, "Interests & endeavours" (`h2`) with entries (`h3`); build errors
  on duplicate interest `order` and on write-ups outside 1–150 words.
- **T067** `nav.yaml` += Fun (order 4).
- **T068** `src/islands/eggs/CurveBloom.svelte`: six rose curves (k = 2…7) scale and rotate out
  from the trigger point over 3.2 s with staggered delays, `vector-effect: non-scaling-stroke`,
  pointer-transparent; floating Close button. Reduced motion: a small static corner card
  ("r = cos(kθ)…") with a Close button. The card was first full-width and covered page text, so
  it was shrunk to a 21rem corner card with `pointer-events: none` except its button (verified
  with `elementFromPoint`: the page is hit underneath).
- **T069** `src/scripts/eggs.ts`: registry (`curve-bloom`, Konami, 5 taps within 2 s, `*`,
  6000 ms); `play()` dynamically imports `svelte` (`mount`/`unmount`) and the component, mounts
  into a fixed `pointer-events: none` host, ends on timeout, Esc or Close, never re-triggers while
  playing. **Deviation from tasks.md**: the touch target is the footer "© … Athena Fung" line
  (`data-egg-target`), not the site mark, because the site mark is a link and the first tap
  would navigate away. Data-model only gave the site mark as an example.
- **T070** BaseLayout imports `eggs.ts` next to `theme.ts`; footer note gets
  `data-egg-target`. The combined module is 4.2 KB raw / 2.1 KB gzip (≤ 3 KB budget). Note: the
  theme script is no longer inlined; both now ship as one external module.
  `astro check` then reported 2 errors (`node:fs` types in about.astro and [slug].astro):
  added dev dependency `@types/node@24` (types only, never shipped) → 0 errors.
- **T071** Three `DRAFT:` interest entries (author input needed for real content and photos).
- **T072** `lighthouserc.json` URLs += `/fun/`.
- **T073** Validation:
  - Fun page: 320/768/1280 no overflow; one `<h1>`; JS disabled shows the SVG fallback + noscript
    note; at 1280 the island mounts and plays; at 320 it only mounts after scrolling into view
    (`client:visible` working).
  - Real mouse drawing via `Input.dispatchMouseEvent` (heart shape) → "Drawing your shape with
    48 of 256 circles." Reduced motion → starts with "Play" and status "Paused: …"; Step works;
    slider to 5 → "Paused: AF with 5 of 256 circles."
  - Frame timing at 256 circles, 390px viewport, 4× CPU throttling: worst frame 17 ms, p95
    17 ms, no long tasks (≈ 60 fps; the harness's "51 fps" figure included an 800 ms idle delay).
    Off-screen: canvas pixels unchanged for 1.5 s (paused).
  - Egg: no Svelte/egg JS before a trigger (`performance.getEntriesByType('resource')`); Konami
    → 6 petals, overlay `pointer-events: none`, `scrollY`/`scrollWidth` unchanged; Esc removes it;
    5 clicks on the footer note → egg at the footer, gone again within 6.5 s; reduced motion →
    card, Close removes it; Konami typed into the range input is ignored.
  - Requests: `/` loads HTML + 1 CSS + 2 fonts + the 2.1 KB module; `/fun/` adds
    `FourierSketch` (7.6 KB), the Svelte renderer (0.9 KB) and runtime (43 KB raw).
  - Bug fixes during validation: native `<button class="button button--secondary">` showed the
    UA grey background (added `background: transparent` + `cursor: pointer` to `.button`);
    canvas was ~1160 px wide at 1280 (stage capped at 52rem).

## Phase 7: User Story 5 — Adding a page

- **T074** `README.md` rewritten (an edit required by the task, not a deletion): repository
  layout (`src/`, `public/`, `dist/` = the only published directory, `site/` = frozen previous
  site, `archive/`, tests, scripts, workflows, Spec Kit), local development (`nvm use`,
  `npm ci`, dev/test/check/build/preview, content gate), deployment (build + upload `dist/`; PR
  checks; Pages source + Enforce HTTPS), editing content (table + `DRAFT:` rule), adding a
  project / detail page / interest / page (two-edit recipe with code), pieces and eggs pointers.
  "There is no build step" removed.
- **T075** Add-a-page drill, done in the working tree (all work is still uncommitted, so a
  throwaway branch would not have isolated anything): followed the README to add
  `src/pages/talks.astro` + one `nav.yaml` line. Result: build OK (6 pages); files modified by the
  drill = exactly those two (`find -newer` against a pre-drill marker); "Talks" link present on
  all 6 pages; `aria-current` on Talks; theme toggle and footer contacts present; unique title,
  absolute `og:url`/`og:image`; `check-content` reported only the existing `DRAFT:` items;
  ~7 s of edits + build (target < 30 min). Reverted: deleted `talks.astro`, restored `nav.yaml`
  from a backup; `git status --porcelain` identical to the pre-drill snapshot.

## Phase 8: Polish

- **T076** `src/pages/404.astro` → `dist/404.html`: `noindex`, "Lost in the curve." `<h1>`, link home.
  (`site/404.html`, the old hand-written page, is untouched.)
- **T077** `base.css`: `@view-transition { navigation: auto; }` and a `::view-transition-group(*)`
  timing, both inside `@media (prefers-reduced-motion: no-preference)`. `view-transition-name`:
  `site-mark` (header) and `page-title` (each page's `<h1>`: landing name, About, Projects, case
  study, Fun, 404). Present in the built CSS; CSS only, no router.
- **T078** `src/assets/og/{about,projects,fun}.svg` (page title + name over the harmonograph) →
  `public/og/*.png` (30.6–32.1 KB) via `render-og.mjs`; passed as `ogImage` from about,
  projects/index and fun.
- **T079** Budget measurement (cache disabled, files each page actually requested, sized from
  `dist/` with gzip -9; fonts/PNG/PDF counted as-is):

  | Page | Total (gz) | HTML | CSS | JS | Fonts |
  |---|---|---|---|---|---|
  | `/` | 111.1 KB | 17.5 | 2.8 | 2.0 | 88.9 |
  | `/about/` | 98.3 KB | 4.6 | 2.8 | 2.0 | 88.9 |
  | `/projects/` | 98.5 KB | 4.9 | 2.8 | 2.0 | 88.9 |
  | `/projects/smart-legos/` | 98.6 KB | 5.0 | 2.8 | 2.0 | 88.9 |
  | `/fun/` | 123.9 KB | 10.0 | 2.8 | 22.2 | 88.9 |
  | `/404.html` | 97.2 KB | 3.6 | 2.8 | 2.0 | 88.9 |

  All far under research R10 (≤ 360–530 KB first load) and the 1 MB cap; no images are loaded
  yet (no content images exist). Throttled mobile (150 ms RTT, 1.6 Mbps, 4× CPU, 390 px):
  LCP 620 ms `/`, 580 ms `/fun/`, 644 ms detail page; the LCP element is always text.
  Lighthouse CI run locally (`@lhci/cli@0.15.1 collect` + `assert` with `lighthouserc.json`;
  upload skipped on purpose so no report is published) — 5 URLs × 3 runs, all assertions pass.
  Worst run per page:

  | Page | Perf | A11y | Best practices | SEO | LCP | Bytes | CLS | TBT |
  |---|---|---|---|---|---|---|---|---|
  | `/` | 97 | 100 | 100 | 100 | 1810 ms | 115 KB | 0 | 0 |
  | `/about/` | 100 | 100 | 100 | 100 | 1654 ms | 103 KB | 0 | 0 |
  | `/fun/` | 99 | 100 | 100 | 100 | 1805 ms | 132 KB | 0 | 60 ms |
  | `/projects/` | 100 | 100 | 100 | 100 | 1655 ms | 104 KB | 0 | 0 |
  | `/projects/smart-legos/` | 100 | 100 | 100 | 100 | 1655 ms | 104 KB | 0 | 0 |

- **T080** NOT complete (left unchecked). Everything that can run without the author's content
  was run:
  - 42-run sweep: 6 pages × 320/768/1280 × light/dark, plus each page at 320 px with JS off:
    zero horizontal overflow, exactly one `<h1>` each, zero console errors/exceptions.
  - Tap targets at 320/768 (excluding inline prose links, WCAG 2.5.8 exception): only the
    project title link (a stretched link whose real hit area is the whole card) and the circles
    slider (16 px tall) were small. Fixed the slider: `height: var(--tap)`.
  - Internal links: 66 checked across `dist/`, 0 broken (equivalent of the CI lychee step).
  - `npm test` 67/67, `astro check` 0 errors / 0 warnings, build 6 pages.
  - Blocking items: `check-content` still reports 31 `DRAFT:` items (profile role, strengths,
    bio, experience, education, skills; project summaries/period/case-study sections; three
    interests) and the stand-in `resume.pdf`; quickstart §6 (resume has no phone/address and
    matches About) needs the real resume. These are author inputs (T053).
- **T081** NOT done: opening the pull request requires pushing the branch, which wasn't
  requested. `checks.yml` will run on that PR.
- **T082** NOT done: post-deploy checks (live routes, sharing previews, Enforce HTTPS, live
  Lighthouse, 5-second test) happen after merge.

## Open items for the author

1. Replace every `DRAFT:` value: `src/data/profile.yaml`, `src/content/projects/*.md`
   (review the README-derived text too), `src/content/interests/*.md` (+ photos).
2. Replace `public/resume.pdf` with the public resume (no phone number, no street address).
3. Run `node scripts/check-content.mjs` until it prints "clean", then T080 → T081 (open PR) →
   merge → T082.
4. Repository settings: Pages source "GitHub Actions" and Enforce HTTPS (unchanged requirement).

## Files

- New: `.nvmrc`, `package.json`, `package-lock.json`, `astro.config.mjs`, `tsconfig.json`,
  `vitest.config.ts`, `svelte.config.js`, `lighthouserc.json`, `.github/workflows/checks.yml`,
  everything under `src/`, `public/`, `scripts/`, `tests/`, and this log.
- Edited (required by tasks): `.gitignore` (appended), `.github/workflows/pages.yml` (build +
  upload `dist/`), `README.md` (rewritten for the build), `specs/001-portfolio-site/tasks.md`
  (checkboxes).
- Deleted or moved: none. `site/` and `archive/` are byte-for-byte unchanged.
