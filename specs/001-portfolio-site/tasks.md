---

description: "Task list for the Personal Portfolio Site (Astro 7 + Svelte 5 islands)"
---

# Tasks: Personal Portfolio Site

**Input**: Design documents from `specs/001-portfolio-site/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md),
[data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: The spec does not request TDD. However, constitution v1.3.0 (Development Workflow)
**requires unit tests for non-trivial client-side logic**, so every module in `src/lib/` has a
Vitest test task, written first. Page-level behavior is validated through the quickstart
scenarios, not automated end-to-end tests (research R13).

**Organization**: tasks are grouped by user story so each story can be implemented, tested and
deployed on its own. Each story adds its own page and its own entry in `src/data/nav.yaml`,
which dogfoods the add-a-page flow (FR-030) and keeps every intermediate build free of dead
navigation links.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: can run in parallel (different files, no dependency on an incomplete task)
- **[Story]**: the user story this task belongs to (US1–US5)
- All paths are relative to the repository root

## Conventions for the implementer

- **Author input**: tasks marked **(author input)** need real facts only the author has. Create
  the files so they are schema-valid. Fill in what is known (name *Athena Fung*, GitHub
  `https://github.com/athenafung1`, LinkedIn `https://www.linkedin.com/in/athenafung1`), and write
  every unknown value as text beginning with `DRAFT:`. `scripts/check-content.mjs` fails CI on
  `DRAFT:`, so placeholder text cannot be deployed (FR-029). Then list the needed facts for the
  author.
- **Validation commands**: `npm test`, `npx astro check`, `npm run build`, `npm run preview`,
  `node scripts/check-content.mjs`.
- **Node**: Node 24 via `nvm use` (machine default is v14.17.0, which is too old for Astro 7).
- **Astro 7 pitfalls** (research R2): templates must be valid HTML (Rust compiler), and the
  default `compressHTML: 'jsx'` removes whitespace between adjacent inline elements, so use `{' '}`
  or CSS `gap`.
- **Pure logic in `src/lib/`** uses erasable TypeScript only (no `enum`, no `namespace`, no
  parameter properties), so `scripts/check-content.mjs` can import it directly with Node 24's
  native type stripping.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: add an Astro project whose build output is `dist/`, leaving every existing file (including the hand-written `site/`) intact.

- [X] T001 Create `.nvmrc` at the repository root containing `24`, run `nvm install && nvm use`, and confirm `node -v` reports ≥ v22.12.0
- [X] T002 Commit the constitution amendment to v1.3.0 (`.specify/memory/constitution.md`: `dist/` is the published build output from `src/` and `public/`; `site/` is kept as a frozen, unpublished record) on its own, with the message `docs: amend constitution to v1.3.0 (custom 404 optional; publish dist/, keep site/ frozen)`, before any other commit on the branch. If the merge date differs from 2026-10-05, set **Last Amended** to the merge date first (constitution Governance). It must merge with or before this feature (plan Constitution Check)
- [X] T003 Add `.astro/` and `.lighthouseci/` to `.gitignore` (`dist/` and `node_modules/` are already listed). **Do not delete, move or edit any existing file**: `site/`, `archive/` and everything else stay exactly as they are (author requirement; constitution v1.3.0)
- [X] T004 Create `package.json` (`"private": true`, `"type": "module"`, `"engines": { "node": ">=22.12.0" }`, scripts `dev: astro dev`, `build: astro build`, `preview: astro preview`, `test: vitest run`, `check: astro check`). Install `astro@^7`, `@astrojs/svelte@^9`, `svelte@^5` and `sharp`, plus dev dependencies `vitest@^5`, `@astrojs/check` and `typescript`. Commit `package-lock.json`
- [X] T005 Create `astro.config.mjs` per research R2 and R9: `site: 'https://athenafung1.github.io'`, `output: 'static'`, `outDir` left at the default `./dist`, `trailingSlash: 'always'`, `build: { format: 'directory' }`, `integrations: [svelte()]`, and a `fonts` array with Fraunces (`cssVariable: '--font-display'`) and Inter (`cssVariable: '--font-text'`) from `fontProviders.fontsource()`, latin subset, variable weight ranges only
- [X] T006 [P] Create `tsconfig.json` extending `astro/tsconfigs/strict`, with `include` covering `.astro/types.d.ts` and `**/*`, `exclude` covering `dist/`, `site/` and `archive/`, and a path alias `~/*` → `src/*`
- [X] T007 [P] Create `vitest.config.ts` using `getViteConfig` from `astro/config`, with `test.include: ['tests/unit/**/*.test.ts']`
- [X] T008 [P] Create `svelte.config.js` exporting `{ preprocess: vitePreprocess() }` imported from `@astrojs/svelte`
- [X] T009 Create the directory skeleton from plan.md (Project Structure): `src/{content/projects,content/interests,data,assets,layouts,components,islands/eggs,scripts,lib,pages/projects,styles}`, `public/og`, `scripts`, `tests/unit`. Add a `.gitkeep` only where a directory would otherwise be empty at commit time

**Checkpoint**: `npm run build` succeeds with an empty site, output lands in `dist/`, and `git status` shows no deleted or modified pre-existing files.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: the shared shell every page inherits (layout, navigation, contact links, theme,
styles, metadata), content-validation helpers, and the CI and deploy pipeline.

**⚠️ CRITICAL**: no user story work can begin until this phase is complete.

### Tests first (constitution: unit tests for non-trivial logic)

- [X] T010 [P] Write `tests/unit/theme.test.ts` for `resolveTheme(stored, systemPrefersDark)`: `'light'`/`'dark'` stored values win over the system; `null`, `undefined` and any other string fall back to the system preference. Also check the exported `THEME_STORAGE_KEY === 'theme'`
- [X] T011 [P] Write `tests/unit/content-rules.test.ts` covering:
  - `countSentences`: does not split on "e.g.", "i.e.", decimals such as "3.5", version numbers or URLs
  - `countWords`
  - `hasDetailSections(markdown)`: requires `## Problem`, `## Approach`, `## Outcome` in that order
  - `hasVisualOrCode(markdown)`: true for an image or a fenced code block
  - `findPhoneNumbers`: US and international formats; no false positive on years like "2022–2026" or on version strings
  - `findStreetAddresses`: number + street suffix such as St/Street/Ave/Road/Blvd/Dr/Ln
  - `findPlaceholders`: `lorem ipsum` and `placeholder` case-insensitively; `TODO`, `TBD` and `DRAFT:` case-sensitively (uppercase only). Must **not** flag ordinary text such as a project titled "Todo app"

### Implementation

- [X] T012 [P] Implement `src/lib/theme.ts` (`THEME_STORAGE_KEY`, `resolveTheme`) so T010 passes
- [X] T013 [P] Implement `src/lib/content-rules.ts` (all functions from T011, erasable TypeScript only) so T011 passes
- [X] T014 Create `src/content.config.ts` with:
  - a shared, exported `imageSchema(image)` helper: `{ src: image(), alt: z.string(), decorative: z.boolean().optional() }`, refined so `alt` is non-empty unless `decorative` is true
  - the `profile` collection: `file('src/data/profile.yaml')`, strict schema exactly per data-model.md Profile, including Education, Experience and SkillGroup, `z.email()`, a URL host check for GitHub and LinkedIn, `strengths` 2–4 items, and no phone or address keys
  - the `nav` collection: `file('src/data/nav.yaml')`; `label` ≤ 16; `href` matches `^/$|^/.+/$`; integer `order`
  - leave projects and interests to US2 and US4
- [X] T015 [P] Create `src/data/nav.yaml` containing only `- { id: home, label: Home, href: /, order: 1 }`
- [X] T016 [P] Create `src/data/profile.yaml` per contracts/content.md (author input). Fill name, GitHub and LinkedIn. Set `contact.email` to `athenafung1@gmail.com` (specified by the author on 2026-10-05). Every other unknown field gets a `DRAFT:` value, keeping types valid (lists with 2 strengths, ≥ 1 education, experience and skill group); `resume: /resume.pdf`
- [X] T017 [P] Create `src/styles/tokens.css`:
  - declare `@layer reset, tokens, base, layout, components, utilities;`
  - color tokens defined once with `light-dark()`; `:root { color-scheme: light dark }`, `:root[data-theme="light"] { color-scheme: light }`, `:root[data-theme="dark"] { color-scheme: dark }`
  - text, surface, accent and border tokens meeting WCAG AA in both schemes (4.5:1 body, 3:1 UI and large text)
  - a fluid type scale using `clamp()` from 320px to 1280px, with a display step large enough for an editorial hero
  - spacing and radius scales; motion duration tokens set to `0s` under `prefers-reduced-motion: reduce`
  - `--font-display` and `--font-text` fallbacks
- [X] T018 [P] Create `src/styles/base.css`:
  - a modern reset
  - element defaults (body uses `--font-text`, headings use `--font-display`)
  - a `:focus-visible` outline with ≥ 3:1 contrast in both themes
  - a `.skip-link` that is visually hidden until focused
  - `overflow-wrap: anywhere` and `hyphens: auto` on headings and long text
  - `[hidden] { display: none !important }`
  - a global reduced-motion rule
  - a `.tap-target` utility with a minimum 44×44 px hit area
- [X] T019 [P] Create `src/styles/layout.css`:
  - a mobile-first page container with a 16px side gutter at 320px
  - a header with the site mark on row 1 and nav plus theme toggle on row 2, merged into one row at `min-width: 48rem`
  - editorial content widths and a wider grid at `80rem`
  - `container-type: inline-size` on card and list wrappers
  - `env(safe-area-inset-*)` padding
  - no horizontal overflow at 320px
- [X] T020 [P] Create `src/components/Picture.astro` per contracts/components.md: wraps `astro:assets` `<Picture>` with `formats={['avif','webp']}`, a responsive `widths` set, explicit dimensions, `loading="lazy"` unless an `eager` prop is passed, required `alt`, and `decorative` → `alt=""`
- [X] T021 [P] Create `src/components/ContactLinks.astro`: reads the `profile` entry `author`; renders plain `mailto:`, GitHub and LinkedIn links with inline SVG icons (`aria-hidden="true"`) plus visible or visually hidden text names; each link uses `.tap-target`; no JavaScript (FR-003). Accepts a `variant: 'footer' | 'compact'` prop (default `'footer'`) so the same component also serves the landing hero (T034)
- [X] T022 [P] Create `src/components/SiteNav.astro`:
  - reads the `nav` collection and sorts by `order`
  - throws a build error naming the duplicate if two entries share an `id` or `order`
  - renders `<nav aria-label="Primary">` with `aria-current="page"` on the item whose `href` equals `Astro.url.pathname`, or for `/projects/` when the path starts with `/projects/`
  - labels and touch targets fit the 320px row (R8)
- [X] T023 [P] Create `src/components/ThemeToggle.astro` and `src/scripts/theme.ts` per contracts/components.md:
  - a `<button type="button" aria-pressed="false" hidden>` with an icon and accessible name
  - the script un-hides the button, reflects the current theme in `aria-pressed`, and toggles `document.documentElement.dataset.theme` on click
  - writes `localStorage[THEME_STORAGE_KEY]` inside try/catch
  - follows `matchMedia('(prefers-color-scheme: dark)')` changes while nothing is stored
  - uses `resolveTheme` from `src/lib/theme.ts`
- [X] T024 Create `src/components/SiteHeader.astro`: `<header>` with the site mark (the author's name or initials linking to `/`, `.tap-target`), `SiteNav` and `ThemeToggle` (depends on T022 and T023)
- [X] T025 Create `src/layouts/BaseLayout.astro` per contracts/components.md (depends on T017–T024):
  - Props `title`, `description`, `ogImage = '/og/default.png'`, `noindex = false`
  - `<html lang="en">`; `<head>` begins with `<meta charset="utf-8">`, immediately followed by an `is:inline` theme bootstrap of ≤ 400 bytes (the first script, before any stylesheet) that reads `localStorage.theme` inside try/catch and sets `data-theme` only for `'light'` or `'dark'`
  - viewport, `<title>`, meta description, `og:title`, `og:description`, `og:type`, `og:url`, and absolute `og:image` built from `Astro.site`; `<link rel="canonical">` with a trailing slash; robots `noindex` when set
  - Astro `<Font>` components for both families, with `preload` on the text face
  - imports for `tokens.css`, `base.css` and `layout.css`
  - a skip link to `#main`, then `SiteHeader`, `<main id="main">` around the default slot, and `<footer>` containing `ContactLinks`
  - `<script>` importing `src/scripts/theme.ts`
- [X] T026 [P] Create `src/assets/og/default.svg` (1200×630, name and role line, using the palette) and `scripts/render-og.mjs`, which uses the installed `sharp` to rasterize every `src/assets/og/*.svg` to `public/og/<name>.png`. Run it to produce `public/og/default.png`. Also create `public/favicon.svg` (the site mark) and link it from `BaseLayout`
- [X] T027 Create `scripts/check-content.mjs` (Node 24, no dependencies):
  - recursively read `dist/**/*.html`, strip tags, scripts and styles
  - run `findPlaceholders`, `findPhoneNumbers` and `findStreetAddresses`, imported from `../src/lib/content-rules.ts`
  - fail if `dist/fun/index.html` (when present) contains `<iframe`, `<video` or `<audio`
  - fail if a page does not have exactly one `<title>`, if two pages (other than `404.html` and the legacy redirect stubs) share a `<title>`, or if any page other than the legacy redirect stubs has a missing meta description or one outside 50–160 characters (FR-028). Identify a stub by its `<meta http-equiv="refresh">`
  - print `file: rule: excerpt` for each hit and exit 1 if there are any
  - document usage in a header comment
- [X] T028 Update `.github/workflows/pages.yml`:
  - after checkout, add `actions/setup-node@v4` with `node-version-file: .nvmrc` and `cache: npm`, then `npm ci`, `npm test`, `npm run build`
  - change `upload-pages-artifact` `path` from `./site` to `./dist`, keep the single-deploy-path comment, and note that `dist/` is build output while `site/` is a frozen, unpublished record
- [X] T029 [P] Create `lighthouserc.json`:
  - `ci.collect.staticDistDir: './dist'`, `url` initially `['http://localhost/']` (stories append their pages), `numberOfRuns: 3`
  - `ci.assert.assertions`: `categories:performance` ≥ 0.9, `categories:accessibility` ≥ 0.9, `largest-contentful-paint` ≤ 2500, `total-byte-weight` ≤ 1000000, `cumulative-layout-shift` ≤ 0.1
  - `ci.upload.target: 'temporary-public-storage'`
- [X] T030 Create `.github/workflows/checks.yml` on `pull_request`, running in order:
  1. checkout, then setup-node from `.nvmrc` with npm cache, then `npm ci`
  2. `npx astro check`, then `npm test`, then `npm run build`, then `node scripts/check-content.mjs`
  3. `lycheeverse/lychee-action@v2` with `args: --offline --no-progress --root-dir ${{ github.workspace }}/dist --index-files index.html dist/` (blocking), plus a second non-blocking run (`continue-on-error: true`) that checks external links
  4. `treosh/lighthouse-ci-action@v12` with `configPath: ./lighthouserc.json`, `temporaryPublicStorage: true` and `uploadArtifacts: true`

**Checkpoint**: `npm test` passes. A scratch page using `BaseLayout` builds, shows the header,
nav (Home), toggle and footer contacts, and switches theme without a flash. Delete the scratch
page afterwards.

---

## Phase 3: User Story 1 - First impression on the landing page (Priority: P1) 🎯 MVP

**Goal**: the site root names the author, states what they do and 2–4 strengths, offers a
primary action and contact links, and carries the signature hero curve.

**Independent Test**: load only `/` at 320, 768 and 1280px. At 1280px, the name, role line,
strengths and primary action are visible without scrolling. Email, GitHub and LinkedIn work with
JavaScript disabled, and the page never scrolls horizontally (spec US1).

### Tests for User Story 1

- [X] T031 [P] [US1] Write `tests/unit/curves.test.ts`:
  - `rose(k, samples)` and `harmonograph(params, samples)` return the requested number of points, and closed curves start and end within 1e-6
  - `normalizeToViewBox(points, w, h, pad)` keeps every point inside the padded box
  - `toSvgPath(points)` starts with `M`, rounds coordinates to 2 decimals, and ends with `Z` for closed curves

### Implementation for User Story 1

- [X] T032 [US1] Implement `src/lib/curves.ts` (`rose`, `harmonograph`, `normalizeToViewBox`, `toSvgPath`; pure, erasable TypeScript) so T031 passes
- [X] T033 [US1] Create `src/components/HeroCurve.astro`:
  - compute a curve at build time with `src/lib/curves.ts`, keeping parameters in component props with sensible defaults
  - emit inline `<svg aria-hidden="true" focusable="false">` with one `<path>` stroked in `currentColor` or an accent token
  - CSS draws it once by animating `stroke-dashoffset` from the path length (`pathLength="1"`) over ≤ 2.5 s
  - under `prefers-reduced-motion: reduce`, show the finished curve with no animation
  - absolutely positioned or in its own grid area, so it never shifts or delays the text (FR-022, research R11)
- [X] T034 [US1] Create `src/pages/index.astro` using `BaseLayout` (unique title, 50–160 character description):
  - the hero has one `<h1>` with `profile.name`, the `profile.role` line, a `<ul>` of `profile.strengths`, and a primary action link styled as a button (`.tap-target`), initially "Get in touch" → `mailto:` from the profile (US2 changes it)
  - a `<ContactLinks variant="compact" />` row inside the hero, so email, GitHub and LinkedIn are all visible without scrolling at 1280×720 (US1 Independent Test). The footer `ContactLinks` stays for every other page
  - include `HeroCurve`
  - scoped styles use `--font-display` at the largest fluid step, keep the hero within one 1280×720 viewport, and stack cleanly at 320px with no overflow
- [X] T035 [US1] Spot-check the built `dist/index.html`: exactly one `<h1>`, and absolute `og:image` and `og:url`. Title uniqueness and description length are enforced site-wide by `scripts/check-content.mjs` (T027). Fix `BaseLayout` or the page if anything fails
- [X] T036 [US1] Validate US1 using quickstart.md: §4 table rows for Landing in both themes; §5.1 (no JS), §5.2 (theme toggle) and §5.4 (reduced-motion hero) on `/`; run `node scripts/check-content.mjs` and expect only `DRAFT:` hits from profile content

**Checkpoint**: the landing page is a usable portfolio on its own. The MVP can deploy once
profile `DRAFT:` values are replaced.

---

## Phase 4: User Story 2 - Evaluating work on the Projects page (Priority: P1)

**Goal**: a Projects page of validated cards (featured first), optional project detail pages,
featured projects surfaced on Landing, and the old projects URL redirected.

**Independent Test**: open `/projects/` directly. Every card shows a title, a 1–3 sentence
summary, technologies and at least one working link. Featured cards come first. A `detail: true`
project opens its detail page with Problem, Approach and Outcome (spec US2).

### Tests for User Story 2

- [X] T037 [P] [US2] Write `tests/unit/projects.test.ts`:
  - `sortProjects`: featured first, then `order` ascending, with a stable result
  - `selectFeatured(list, 3)`: returns at most 3 in sorted order and throws when none is featured
  - `assertUniqueOrder(list)`: throws, naming both ids, when two entries share `order` within the same `featured` group

### Implementation for User Story 2

- [X] T038 [US2] Implement `src/lib/projects.ts` (generic over `{ id, data: { featured, order } }`) so T037 passes
- [X] T039 [US2] Add the `projects` collection to `src/content.config.ts`, with `glob({ pattern: '*.md', base: './src/content/projects' })` and the schema per data-model.md Project:
  - `summary` refined with `countSentences` to 1–3 and ≤ 400 characters
  - `tech` with ≥ 1 entry, each ≤ 30 characters
  - `links` with ≥ 1 entry; `type` is one of `repository`/`demo`/`writeup`/`publication`; `url` is a URL
  - `image: imageSchema(image).optional()`, `period` optional, `featured` defaulting to `false`, integer `order`, `detail` defaulting to `false`
  - `superRefine`: `detailDescription` (50–160 characters) is required when `detail` is true
- [X] T040 [P] [US2] Create `src/components/ProjectCard.astro`:
  - `<article>` with a heading (level passed by prop), period, summary, and tech as a list with small caps and tabular figures
  - links labelled by type ("Repository", "Live demo", "Writeup", "Publication") with accessible names that include the project title
  - optional `Picture`; without an image, a text-only layout with no empty frame (FR-010)
  - when `detail` is true, the title links to `/projects/<id>/` via a stretched-link pseudo-element, so there are no nested interactive elements and external links stay clickable above it
  - layout switches from stacked to side-by-side with a `@container` query
- [X] T041 [US2] Create `src/pages/projects/index.astro`: `BaseLayout` metadata; `getCollection('projects')` → `assertUniqueOrder` → `sortProjects`; one `<h1>`; cards in a list; a layout that still looks intentional with a single project (spec edge case "Few projects"); no filtering or grouping (FR-011). If `getCollection('projects')` is empty, throw `Error('At least one project is required (constitution Principle II): add a file to src/content/projects/')`
- [X] T042 [P] [US2] Create `src/layouts/ProjectLayout.astro`: wraps `BaseLayout` (passes `title` and `description` from `detailDescription`); page header with the `<h1>` title, period, tech list and external links; `<article>` around the body slot; a "Back to all projects" link to `/projects/` at the top and bottom
- [X] T043 [US2] Create `src/pages/projects/[slug].astro` (depends on T039, T042):
  - `getStaticPaths` returns only `detail: true` entries
  - for each, throw an `Error` naming `src/content/projects/<id>.md` unless `hasDetailSections(entry.body)` and `hasVisualOrCode(entry.body)` pass (FR-033)
  - `console.warn` for `detail: false` entries with a non-empty body
  - render with `render(entry)` inside `ProjectLayout`
  - use `ogImage` `/og/projects/<id>.png` when that file exists in `public/`, otherwise the default
- [X] T044 [US2] Add `- { id: projects, label: Projects, href: /projects/, order: 3 }` to `src/data/nav.yaml`
- [X] T045 [US2] Update `src/pages/index.astro` to add a "Selected work" section after the hero: `selectFeatured(sorted, 3)` rendered as `ProjectCard`s with heading level 3, plus a "View all projects" link. Change the primary action to "View projects" → `/projects/` and keep "Get in touch" as a secondary link (FR-007, FR-008)
- [X] T046 [P] [US2] Create `public/projects/projects_index.html` as the legacy redirect stub per contracts/routes.md: meta refresh to `/projects/`, canonical `https://athenafung1.github.io/projects/`, `robots noindex`, `<title>Redirecting…</title>`, a visible link, and no CSS, JS or fonts
- [X] T047 [US2] Create project content in `src/content/projects/` (author input): at least one project with `featured: true`; at least one with `detail: true` whose body has `## Problem`, `## Approach`, `## Outcome` and an image (in `src/content/projects/images/`) or a fenced code block. Use `DRAFT:` text for unknown facts and list the needed facts for the author
- [X] T048 [US2] Append `http://localhost/projects/` and one `http://localhost/projects/<detail-slug>/` to `lighthouserc.json` `ci.collect.url`
- [X] T049 [US2] Validate US2 using quickstart.md: §2 "Content validation" (each listed error fails the build with a file and field message), §5.8 for `/projects/projects_index.html`, §5.10 (detail page), and the §4 table for `/projects/` and the detail page in both themes. Upper-bound check (FR-012): copy one project file 19 times with distinct `order` values, run `npm run build && npm run preview`, repeat the §4 table for `/projects/` at 320px and 1280px, then delete the copies before committing

**Checkpoint**: US1 and US2 both work. The Projects page works if opened directly, and Landing
shows featured work.

---

## Phase 5: User Story 3 - Learning more on the About page (Priority: P2)

**Goal**: the About page has the bio, education, experience, skills, the resume download and a
closing contact call, and the old about URL redirects.

**Independent Test**: open `/about/` directly. It shows background, education, experience,
skills and a resume download, and the download and every contact link work (spec US3).

### Implementation for User Story 3

- [X] T050 [US3] Create `src/pages/about.astro` with `BaseLayout` metadata and:
  - one `<h1>`
  - `profile.bio`, split on blank lines into `<p>` elements (no Markdown dependency)
  - `profile.seeking` when present
  - education and experience as semantic lists, with highlights under experience
  - skills as grouped lists
  - a "Download resume (PDF)" link to `profile.resume` with the `download` attribute and the file size computed at build time
  - a closing "Get in touch" section with the contact links (FR-013–FR-015)
  - at build time, throw an `Error` if `public${profile.resume}` does not exist (FR-014)
- [X] T051 [P] [US3] Create `public/about/about_index.html` as the legacy redirect stub to `/about/`, same rules as T046
- [X] T052 [US3] Add `- { id: about, label: About, href: /about/, order: 2 }` to `src/data/nav.yaml`
- [ ] T053 [US3] (author input) Replace the `DRAFT:` values in `src/data/profile.yaml` (bio, education, experience, skills, seeking, location as city or region only) and add `public/resume.pdf`, the public version with **no phone number and no street address** (FR-036). List any facts still missing for the author
- [X] T054 [US3] Append `http://localhost/about/` to `lighthouserc.json` `ci.collect.url`
- [X] T055 [US3] Validate US3 using quickstart.md: §5.8 for `/about/about_index.html`, the §6 resume checks (no phone or address; agrees with the About page), and the §4 table for `/about/` in both themes

**Checkpoint**: US1–US3 work on their own and together.

---

## Phase 6: User Story 4 - Getting a sense of personality on the Fun page (Priority: P3)

**Goal**: the Fun page has interest and endeavour entries (images plus outbound links), the
Fourier Sketch interactive piece with a static fallback, and a site-wide easter egg that loads
Svelte only on trigger.

**Independent Test**: open `/fun/` directly. Interest entries show and the Fourier Sketch works
with mouse, touch and keyboard. With JavaScript disabled, entries are readable and the piece
shows its static fallback. Navigation and visual identity match the other pages (spec US4).

### Tests for User Story 4

- [X] T056 [P] [US4] Write `tests/unit/fourier.test.ts`:
  - `resample(path, n)` returns `n` points spaced evenly along arc length (within 1%) and treats the path as closed
  - `dft(points)` of a sampled unit circle has one coefficient with magnitude ≈ 1 at frequency 1, and the rest ≈ 0
  - `sortByAmplitude` orders coefficients by descending magnitude
  - `reconstruct(coeffs, terms, t)` error against a sampled square falls as `terms` rises (4 → 16 → 64)
  - `epicycleChain(coeffs, terms, t)` returns `terms` circles, each centered at the previous circle's tip
  - every preset in `src/lib/presets.ts` is closed and non-empty
- [X] T057 [P] [US4] Write `tests/unit/eggs.test.ts`:
  - `createSequenceMatcher(seq)` matches the exact key sequence and resets on a wrong key
  - `createTapCounter(taps, withinMs)` fires on the n-th tap inside the window and not outside it
  - `shouldIgnoreEvent(target)` is true for `input`, `textarea`, `select` and `[contenteditable]`

### Implementation for User Story 4

- [X] T058 [US4] Implement `src/lib/fourier.ts` (`resample`, `dft`, `sortByAmplitude`, `reconstruct`, `epicycleChain`) and `src/lib/presets.ts` (closed point lists for the author's initials "AF", a star and a trefoil) so T056 passes
- [X] T059 [P] [US4] Implement `src/lib/eggs.ts` (`createSequenceMatcher`, `createTapCounter`, `shouldIgnoreEvent`) so T057 passes
- [X] T060 [US4] Add the `interests` collection to `src/content.config.ts`, with `glob({ pattern: '*.md', base: './src/content/interests' })` and the schema per data-model.md Interest entry: `title`, optional `category`, `images: z.array(imageSchema(image)).max(6).optional()`, `links` of `{ type: 'video'|'audio'|'writing'|'other', url, label }` (optional), and integer `order`
- [X] T061 [P] [US4] Create `src/components/InterestEntry.astro`: an `<article>` with a heading whose level comes from a `headingLevel` prop (default 3, under the Fun page's "Interests" `<h2>`, keeping the hierarchy unskipped per Principle III), category label, rendered body, an image gallery of `Picture`s (lazy), and media links as plain `<a>` elements labelled by type (for example "Watch: …"). Never `iframe`, `video` or `audio` (FR-035)
- [X] T062 [P] [US4] Create `src/components/PieceFrame.astro` per contracts/components.md: a `<section id={id}>` with an `<h2>` name, a `<p>` caption for `idea`, a slot for the island, and `<noscript>` text explaining that the live version needs JavaScript and the image shows its result
- [X] T063 [P] [US4] Create `src/components/FourierFallback.astro`: at build time, take the "AF" preset, run `resample` → `dft` → `reconstruct` with 64 terms, and emit an inline SVG with the traced path and faint epicycle circles at `t = 0`, plus a `<title>` and `<desc>` for accessibility
- [X] T064 [US4] Create `src/islands/FourierSketch.svelte` (Svelte 5 runes) per contracts/components.md, using `src/lib/fourier.ts` and `src/lib/presets.ts`:
  - render `children` until mounted, then show a `<canvas>` with an accessible name, a backing resolution capped at `devicePixelRatio` 2, and a `ResizeObserver` redraw
  - pointer drawing via Pointer Events, with `touch-action: none` on the canvas only
  - preset buttons, a term-count `<input type="range">` (1 → N), and play/pause, reset and step buttons, all ≥ 44 px
  - an `aria-live="polite"` status ("Drawing with 24 of 128 terms")
  - pause on `IntersectionObserver` not-intersecting and on `document.hidden`
  - start paused under reduced motion
  - no network requests
- [X] T065 [US4] Create `src/islands/pieces.ts`, exporting the piece registry `[{ id: 'fourier-sketch', name: 'Fourier Sketch', idea: 'Any closed drawing is a sum of spinning circles.' }]` for `fun.astro` to iterate
- [X] T066 [US4] Create `src/pages/fun.astro`:
  - `BaseLayout` metadata, one `<h1>` and a short intro
  - `getCollection('interests')` sorted by `order`, with a build error on duplicate `order` and on any entry whose body `countWords` falls outside 1–150
  - `InterestEntry` list
  - for each registry piece, `PieceFrame` containing `<FourierSketch client:visible><FourierFallback /></FourierSketch>`
- [X] T067 [US4] Add `- { id: fun, label: Fun, href: /fun/, order: 4 }` to `src/data/nav.yaml`
- [X] T068 [US4] Create `src/islands/eggs/CurveBloom.svelte`:
  - receives `reducedMotion` and `onEnd` props
  - renders inside the overlay: a burst of rose curves blooming from the site mark's position, at most 4 s, `pointer-events: none` except a small dismiss button
  - under reduced motion, renders a static card showing the rose-curve equation for ≤ 6 s
  - calls `onEnd` when finished
- [X] T069 [US4] Create `src/scripts/eggs.ts` per contracts/components.md:
  - a registry with `curve-bloom`: `keyTrigger` = the Konami sequence, `touchTrigger` = 5 taps on the site mark within 2000 ms, `pages: '*'`, `maxDurationMs: 6000`, `load: () => import('../islands/eggs/CurveBloom.svelte')`
  - listeners use `src/lib/eggs.ts` and ignore events from form fields
  - on trigger, create a fixed overlay root and mount with Svelte's `mount`; unmount on end, timeout or `Esc`, then remove the root
  - never re-trigger while playing
  - no static Svelte import (verify the built chunk graph)
- [X] T070 [US4] Add `<script>` importing `src/scripts/eggs.ts` to `src/layouts/BaseLayout.astro`. After `npm run build`, confirm the per-page eggs and theme JS is ≤ 3 KB gzipped, and that no Svelte runtime chunk is requested on `/`, `/about/` or `/projects/` until an egg triggers (research R7, R10)
- [X] T071 [US4] Create interest content in `src/content/interests/` (author input): 3+ entries with images in `src/content/interests/images/` and outbound media links where relevant, with `DRAFT:` text for unknown facts. List the needed facts for the author
- [X] T072 [US4] Append `http://localhost/fun/` to `lighthouserc.json` `ci.collect.url`
- [X] T073 [US4] Validate US4 using quickstart.md: §4 phone check of Fourier Sketch scrolling and drawing; §5.1 (fallback with no JS); §5.4 (reduced motion: paused with Step, static egg card); §5.5 (keyboard); §5.6 (sketch); §5.7 (egg by keyboard and touch; egg chunk fetched only on trigger); §5.13 (Fourier Sketch frame rate on a phone); `node scripts/check-content.mjs` reports no embeds on `/fun/`

**Checkpoint**: all four top-level pages exist and work independently.

---

## Phase 7: User Story 5 - Adding a new page later (Priority: P3)

**Goal**: the add-a-page flow is documented and proven to need only two edits.

**Independent Test**: follow the documented steps to add a placeholder page on a throwaway
branch. It appears in navigation on every page, matches the styling, and only two files changed
(spec US5, SC-008).

### Implementation for User Story 5

- [X] T074 [US5] Rewrite `README.md` for the Astro build:
  - **Repository layout**: `src/` source, `public/` static files, `dist/` generated output that is git-ignored and never hand-edited, `site/` the previous hand-written site kept as a frozen, unpublished record, plus `archive/` and `.specify/`
  - **Local development**: `nvm use`, `npm ci`, `npm run dev`, `npm run build`, `npm run preview`, `npm test`
  - **Deployment**: `pages.yml` now runs tests and the build, then uploads `dist/`; remove "There is no build step." and the statements that `site/` is published
  - **Adding a page**: create `src/pages/<name>.astro` with `BaseLayout` (`title`, `description`, one `<h1>`) and add one line to `src/data/nav.yaml`
  - **Adding a project, a project detail page, or an interest**: point to `specs/001-portfolio-site/contracts/content.md`
  - **Interactive pieces and easter eggs**: point to `specs/001-portfolio-site/contracts/components.md`
- [X] T075 [US5] Run the quickstart.md §8 add-a-page drill on a throwaway branch (`src/pages/talks.astro` plus one `nav.yaml` line). Confirm with `git status` that exactly two files changed, the page has the shared header, nav, footer, theme and OG tags, and it took under 30 minutes. If a third edit was needed, fix the shared code so it isn't, then delete the throwaway branch

**Checkpoint**: all five user stories are complete.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: work that touches several stories, final budgets, and release checks.

- [X] T076 [P] Create `src/pages/404.astro` with `BaseLayout` (`noindex`), one `<h1>`, a short message and a link home. The build emits `dist/404.html` (spec edge case "Unknown address")
- [X] T077 [P] Add cross-document view transitions to `src/styles/base.css`: `@view-transition { navigation: auto; }` inside `@media (prefers-reduced-motion: no-preference)`, plus `view-transition-name` on the site mark and each page's `<h1>` (research R17)
- [X] T078 [P] Create per-page sharing images `src/assets/og/{about,projects,fun}.svg`, render them with `node scripts/render-og.mjs`, and pass `ogImage` from `about.astro`, `projects/index.astro` and `fun.astro` (FR-028)
- [X] T079 Measure every page against the research R10 budget table in `npm run preview` (DevTools Network, transfer sizes, cache disabled, mobile throttling). Fix anything over budget, for example by trimming font weight ranges or image `widths`
- [ ] T080 Run the full quickstart.md §2–§6 on `npm run preview` in both themes and fix every failure. Confirm `node scripts/check-content.mjs` reports **zero** hits, so no `DRAFT:` text remains (FR-029)
- [ ] T081 Open the pull request from the feature branch to `master`. Confirm `checks.yml` passes, and paste the Lighthouse temporary report links and the R10 measurements into the PR description (constitution Principle IV)
- [ ] T082 After merge and deploy, run quickstart.md §7 (live routes, legacy redirects, 404, sharing previews, live Lighthouse, "Enforce HTTPS" enabled) and §9 (5-second first-impression test with ≥ 3 people; SC-001, SC-002)

---

## Dependencies & Execution Order

### Phase dependencies

- **Setup (Phase 1)**: no dependencies.
- **Foundational (Phase 2)**: depends on Setup. **Blocks every user story.**
- **US1 (Phase 3)**: depends on Foundational only.
- **US2 (Phase 4)**: depends on Foundational. T045 edits `src/pages/index.astro` and therefore
  needs **US1**. Everything else in US2 works without US1.
- **US3 (Phase 5)**: depends on Foundational only.
- **US4 (Phase 6)**: depends on Foundational only. T070 edits `BaseLayout.astro` (a shared file),
  so don't run it at the same time as other `BaseLayout` edits.
- **US5 (Phase 7)**: best after US1–US4, so the README describes the finished structure. The
  drill (T075) needs only Foundational.
- **Polish (Phase 8)**: after the desired stories. T080–T082 come last, in order.

### Story completion graph

```text
Setup ─▶ Foundational ─┬─▶ US1 (P1, MVP) ──▶ US2.T045 (landing featured section)
                       ├─▶ US2 (P1) ────────┘
                       ├─▶ US3 (P2)
                       ├─▶ US4 (P3)
                       └─▶ US5 (P3, after US1–US4 for README accuracy)
                                     └────────▶ Polish (T076–T082)
```

### Within each story

- Unit tests (T010/T011, T031, T037, T056/T057) are written first and must fail before their
  `src/lib/` implementation.
- Order is `src/lib/` logic, then the collection schema, then components, then the page, then
  the nav entry, then content, then validation.
- Shared files edited by several stories, in order: `src/content.config.ts` (T014 → T039 →
  T060), `src/data/nav.yaml` (T015 → T044/T052/T067), `src/pages/index.astro` (T034 → T045),
  `src/layouts/BaseLayout.astro` (T025 → T070), `lighthouserc.json` (T029 → T048/T054/T072).

### Parallel opportunities

- Setup: T006, T007 and T008 together.
- Foundational: T010 and T011 together; then T012, T013, T015–T021, T023, T026 and T029
  together. T024 → T025 is sequential.
- After Foundational: US1, US2 (except T045), US3 and US4 can be built at the same time.
- Inside US2: T040, T042 and T046 together.
- Inside US4: T056 and T057 together, then T059, T061, T062 and T063 together.
- Polish: T076, T077 and T078 together.

---

## Parallel Example: User Story 4

```bash
# Tests first, together:
Task: "Write tests/unit/fourier.test.ts (resample, dft, reconstruct, epicycleChain, presets)"
Task: "Write tests/unit/eggs.test.ts (sequence matcher, tap counter, ignore form fields)"

# Then independent files, together:
Task: "Implement src/lib/eggs.ts"
Task: "Create src/components/InterestEntry.astro"
Task: "Create src/components/PieceFrame.astro"
Task: "Create src/components/FourierFallback.astro"   # after T058 (fourier.ts)
```

## Parallel Example: Foundational

```bash
Task: "Implement src/lib/theme.ts"
Task: "Implement src/lib/content-rules.ts"
Task: "Create src/styles/tokens.css"
Task: "Create src/styles/base.css"
Task: "Create src/styles/layout.css"
Task: "Create src/components/Picture.astro"
Task: "Create src/components/ContactLinks.astro"
Task: "Create src/components/SiteNav.astro"
Task: "Create src/components/ThemeToggle.astro + src/scripts/theme.ts"
```

---

## Implementation Strategy

### MVP first (User Story 1)

1. Phase 1 Setup, then Phase 2 Foundational.
2. Phase 3 (US1): the landing page with hero curve, theme toggle and contact links.
3. **Stop and validate** with quickstart §4, §5.1, §5.2 and §5.4 on `/`.
4. Replace the profile `DRAFT:` values that the landing page shows (role line, strengths). Once
   `check-content` is clean,
   this is deployable on its own.

### Incremental delivery

1. MVP (US1), then deploy.
2. US2 Projects: the most important evidence. Deploy.
3. US3 About and resume. Deploy.
4. US4 Fun page, Fourier Sketch and easter egg. Deploy.
5. US5 README and add-a-page drill, then Polish (404, view transitions, OG images, budgets).

Each step adds a page and its nav entry without changing the earlier pages, except US2's landing
section (T045).

### Content dependency

Real content (T016, T047, T053, T071) is the critical path to deploying, not code. Collect it
from the author early. `check-content.mjs` keeps any `DRAFT:` text from reaching production.

---

## Notes

- [P] tasks touch different files and have no dependency on an incomplete task.
- A [USn] label maps a task to spec user story n for traceability.
- Commit after each task or logical group, on the feature branch only (constitution), never on
  `master`.
- Never edit `dist/` by hand. It is regenerated by every build.
- Never delete, move or edit existing files, including the hand-written `site/` (author requirement).
- `archive/` is read-only and must not be imported or linked.
