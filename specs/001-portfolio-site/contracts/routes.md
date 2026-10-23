# Contract: Public Routes

The set of URLs the site promises to serve at `https://athenafung1.github.io`. Changing or
removing a URL here breaks links to it. Redirects are not required (FR-005 was removed), so weigh
that before renaming a page.

Rules for every route:
- Directory-style with a trailing slash, served from `<path>/index.html` (FR-004).
- Works with JavaScript disabled (FR-027).
- Carries the `BaseLayout` metadata: unique `<title>`, meta description, `og:title`,
  `og:description`, `og:image`, `og:url`, and canonical (FR-028). The redirect stubs and 404 are
  the only exceptions.
- Returns HTTP 200 from GitHub Pages.

## Top-level pages (in navigation)

| Path | Source | Nav label | Purpose | Spec |
|---|---|---|---|---|
| `/` | `src/pages/index.astro` | Home | Landing: name and role; optional strengths, featured projects and primary action | US1, FR-006–008 |
| `/about/` | `src/pages/about.astro` | About | Experience; optional bio, education, skills, resume and contact call | US3, FR-013–015 |
| `/projects/` | `src/pages/projects/index.astro` | Projects | All project cards, featured first | US2, FR-009–012 |
| `/musings/` | `src/pages/musings/index.astro` | Musings | All musings (write-ups): dated ones newest first, then undated | FR-037 |
| `/fun/` | `src/pages/fun.astro` | Fun | Photography film strip (creative work and the interactive piece); optional interest entries | US4, FR-016–020 |

`/index.html` also resolves to the landing page, since GitHub Pages serves the file directly.
This preserves the old homepage address.

## Generated pages (not in navigation)

| Path | Source | Generated when | Spec |
|---|---|---|---|
| `/projects/<slug>/` | `src/pages/projects/[slug].astro` | One per project with `detail: true`; `<slug>` is the Markdown file name | FR-033 |
| `/musings/<slug>/` | `src/pages/musings/[slug].astro` | One per Markdown file directly in `src/content/musings/` (subfolders such as `test/` are not published); `<slug>` is the file name | FR-038 |

## Static files

| Path | Source | Notes |
|---|---|---|
| `/resume.pdf` | `public/resume.pdf` | Optional public resume, linked from About only when `resume` is set in `src/data/profile.yaml`; no phone, no street address (FR-014, FR-036) |
| `/musings/<slug>/*` | `public/musings/<slug>/` | Images used by a musing, served next to its page |
| `/og/*.png` | `public/og/` | Sharing images, 1200×630 |
| `/favicon.svg` | `public/favicon.svg` | |
| `/_astro/*` | build output | Hashed CSS, JS and images. Not a stable contract, so never link to these |

## Legacy addresses (no longer required)

FR-005 and SC-010 were removed on 2026-10-22: the old site is left untouched and only the new
build is published, so old addresses are not redirected. Two stubs from the first version remain
in `public/`, copied verbatim to `dist/`. They are harmless and may be deleted:

| Old path (published before 2026-09) | Redirects to |
|---|---|
| `/about/about_index.html` | `/about/` |
| `/projects/projects_index.html` | `/projects/` |

While they remain, each stub must:
1. contain `<meta http-equiv="refresh" content="0; url=<target>">`
2. contain `<link rel="canonical" href="https://athenafung1.github.io<target>">`
3. contain `<meta name="robots" content="noindex">`
4. contain a visible link to `<target>` for clients that ignore meta refresh
5. not load any CSS, JS or font
6. contain `<title>Redirecting…</title>` (valid HTML; stubs are exempt from the site-wide title
   uniqueness and description-length checks in `scripts/check-content.mjs`)

## Not found

| Path | Source | Behavior |
|---|---|---|
| any unknown path | `src/pages/404.astro` → `dist/404.html` | Served by GitHub Pages with HTTP 404. Shows the shared header and navigation, so the visitor can reach Home in one step (spec edge case). `noindex`. Optional under constitution v1.2.0 but kept. |

## Adding a route

A new top-level page means adding `src/pages/<name>.astro` (using `BaseLayout`) **and** one entry
in `src/data/nav.yaml`. Nothing else changes (FR-030). The steps are documented in the README
(FR-031), and the new row is added to the table above in the same pull request.
