# Data Model: Personal Portfolio Site

**Feature**: [spec.md](./spec.md) · **Plan**: [plan.md](./plan.md) · **Date**: 2026-10-05

All data is plain files in the repository, validated at build time by Zod schemas in
`src/content.config.ts`. A validation failure is a **build error**, so invalid content cannot
reach `dist/`. Author-facing file formats with examples are in
[contracts/content.md](./contracts/content.md).

Notation: `?` means optional. `[]` is a list. Lengths are characters unless stated.

---

## Profile

The single author record. Source: `src/data/profile.yaml`, collection `profile`, one entry with
id `author`. Spec entity: **Profile**.

| Field | Type | Rules |
|---|---|---|
| `name` | string | Required, 1–80 |
| `role` | string | Required, one line ≤ 120; shown on Landing (FR-006) |
| `strengths` | string[] | Required, **2–4** items, each ≤ 60 (FR-006) |
| `bio` | string (plain text) | Required, 1–1200. Paragraphs separated by a blank line; rendered as `<p>` elements with no Markdown dependency (About, FR-013) |
| `location` | string? | City or region only (FR-036) |
| `seeking` | string? | What the author is looking for (User Story 3) |
| `education` | Education[] | Required, ≥ 1 |
| `experience` | Experience[] | Required, ≥ 1 (work or research) |
| `skills` | SkillGroup[] | Required, ≥ 1 group |
| `resume` | string | Required. Path under `public/`, must end in `.pdf` and the file must exist at build time (FR-014) |
| `contact.email` | email | Required (`z.email()`) |
| `contact.github` | URL | Required, host `github.com` |
| `contact.linkedin` | URL | Required, host `linkedin.com` or `www.linkedin.com` |

There is deliberately **no** phone or street-address field (FR-036). The schema is strict, so
unknown keys such as `phone` fail the build.

**Education**: `{ institution: string, credential: string, period: string, details?: string }`

**Experience**: `{ organization: string, title: string, period: string, summary: string ≤ 400,
highlights?: string[] (≤ 5) }`

**SkillGroup**: `{ group: string, items: string[] (≥ 1) }`

---

## Nav item

The one shared navigation list (FR-030). Source: `src/data/nav.yaml`, collection `nav`.
Spec entity: **Page** (navigation attributes).

| Field | Type | Rules |
|---|---|---|
| `id` | string | Required, unique, kebab-case |
| `label` | string | Required, ≤ 16 (must fit the 320px nav row, R8) |
| `href` | string | Required. Root-relative, starts and ends with `/` (FR-004), and must match a built page (the lychee link check enforces this) |
| `order` | integer | Required, unique. Defines navigation order |

The current page is the item whose `href` matches `Astro.url.pathname`, marked
`aria-current="page"` (FR-002). Project detail pages mark **Projects** as current.

---

## Page metadata

Not a collection: these are **required props** of `BaseLayout` on every page, so a page without
them does not type-check or build (FR-028). Spec entity: **Page** (document attributes).

| Prop | Type | Rules |
|---|---|---|
| `title` | string | Required, ≤ 60, unique per page. Output as `<title>` and `og:title` |
| `description` | string | Required, 50–160. Output as meta description and `og:description` |
| `ogImage` | string? | Path under `public/og/`, defaulting to `/og/default.png` |
| `noindex` | boolean? | Default `false`. Used only by the 404 page |

`og:url` and `<link rel="canonical">` are derived from `Astro.site` plus the path, always with a
trailing slash.

---

## Project

Source: `src/content/projects/<slug>.md`, collection `projects`. The file name is the slug and
the URL segment. Spec entities: **Project** and **Project detail page**.

| Field | Type | Rules |
|---|---|---|
| `title` | string | Required, 1–80 |
| `summary` | string | Required, **1–3 sentences** (counted by `content-rules.ts`), ≤ 400 (FR-009) |
| `tech` | string[] | Required, ≥ 1, each ≤ 30 (FR-009) |
| `links` | ProjectLink[] | Required, **≥ 1** (FR-009) |
| `image` | Image? | Optional (FR-010). If omitted the card renders a text-only layout with no empty frame |
| `period` | string? | Free text, e.g. "Spring 2026" or "2025–present" |
| `featured` | boolean | Default `false` (FR-011) |
| `order` | integer | Required. Sort key within its group (FR-011) |
| `detail` | boolean | Default `false`. When `true`, the Markdown body becomes `/projects/<slug>/` (FR-033) |
| `detailDescription` | string? | Required when `detail: true`. 50–160. The detail page's meta description |

**ProjectLink**: `{ type: 'repository' | 'demo' | 'writeup' | 'publication', url: URL, label?:
string }`. External URLs only. The detail page is linked from the card itself, not through
`links`.

**Image**: `{ src: image(), alt: string, decorative?: boolean }`. `alt` must be non-empty unless
`decorative: true`, in which case it renders `alt=""` (FR-025, Principle III). `src` is a path
relative to the Markdown file and is processed by `astro:assets`.

**Detail page body rules** (when `detail: true`, checked in `getStaticPaths`, build error on
failure):
- The body must contain level-2 headings **Problem**, **Approach** and **Outcome**, in that order
  (FR-033).
- The body must contain at least one image or one fenced code block (FR-033 "supporting visual or
  code excerpt").
- When `detail: false`, any body content is ignored and a build **warning** is printed, so
  forgotten drafts are noticed.

**Ordering** (FR-011): sort by `featured` descending, then `order` ascending. No other sorting,
filtering or grouping.

**Landing selection** (FR-007): featured projects in the same order, capped at 3. The build fails
if no project is featured, because the Landing page must surface at least one.

**Collection-level rules**: ≥ 1 project (constitution Principle II); `order` unique within each
`featured` group (build error on duplicate, to keep order deterministic).

**Lifecycle**: a project has no runtime state. Its only "states" are authoring flags:
`featured` (card on Landing and first on Projects) and `detail` (a detail page exists). Toggling
either takes effect on the next build.

---

## Interest entry

Source: `src/content/interests/<slug>.md`, collection `interests`. The body is the write-up.
Spec entity: **Interest entry**.

| Field | Type | Rules |
|---|---|---|
| `title` | string | Required, 1–80 |
| `category` | string? | Free text label, e.g. "Creative work" or "Outdoors" |
| `images` | Image[] | Optional, ≤ 6. Same `Image` rules as Project. Stored on the site only (FR-035) |
| `links` | MediaLink[] | Optional |
| `order` | integer | Required, unique |
| body | Markdown | Required, 1–150 words (counted by `content-rules.ts`) |

**MediaLink**: `{ type: 'video' | 'audio' | 'writing' | 'other', url: URL, label: string }`.
Rendered as a plain outbound link. Never embedded, never an `<iframe>`, `<video>` or `<audio>`
element (FR-035; `check-content.mjs` fails CI if such an element appears on `/fun/`).

---

## Interactive piece

Code, not content. Each piece is a Svelte component in `src/islands/` plus an entry in
`src/islands/pieces.ts`. Spec entity: **Interactive piece**. The behavioral contract is in
[contracts/components.md](./contracts/components.md).

| Field | Type | Rules |
|---|---|---|
| `id` | string | Required, unique, kebab-case. Used as the section anchor on `/fun/` |
| `name` | string | Required. Visible heading |
| `idea` | string | Required, one line ≤ 140. The math behind it, shown as the caption |

The registry (`src/islands/pieces.ts`) holds only `id`, `name` and `idea`. Each piece's Svelte
component and its build-time fallback (SVG or image, shown before mount and without JS, FR-017)
are paired in `src/pages/fun.astro`, and every registered piece MUST have both there (checked
during review).

Launch set: `fourier-sketch` (research R12).

**Runtime states** (inside the island, never persisted):

```text
fallback ──mount──▶ idle ──play──▶ playing ──pause──▶ paused
                     ▲               │  ▲              │
                     └────reset──────┘  └────play──────┘
playing ──offscreen / tab hidden──▶ suspended ──visible again──▶ playing
reduced motion: mount ──▶ paused (never auto-plays; "step" advances one frame)
```

---

## Easter egg

Code, not content. Each egg is registered in `src/scripts/eggs.ts` with a Svelte component in
`src/islands/eggs/`. Spec entity: **Easter egg**.

| Field | Type | Rules |
|---|---|---|
| `id` | string | Required, unique |
| `keyTrigger` | key sequence | Required (keyboard path) |
| `touchTrigger` | gesture descriptor | Required (touch path, e.g. 5 taps on the site mark within 2 s) |
| `pages` | string[] or `'*'` | Where the trigger listens |
| `maxDurationMs` | integer | Required, ≤ 6000. Self-ends after this |
| `load` | `() => import(...)` | Dynamic import of the component, fetched only on trigger |

**States**: `armed → triggered → playing → ended`, where `Esc` or a tap during `playing` goes
straight to `ended`, and reduced motion goes `triggered → static card → ended`. An egg never
re-triggers while `playing`.

---

## Theme preference

Browser-local, not repository data. Spec FR-034.

| Key | Location | Values | Rules |
|---|---|---|---|
| `theme` | `localStorage` | `"light"` \| `"dark"` \| absent | Absent means follow the device. Any other value is treated as absent. Every read and write is wrapped in try/catch, falling back to "absent" |

**Resolution** (`resolveTheme(stored, systemPrefersDark)`, unit-tested): `stored` if it is
`"light"` or `"dark"`, otherwise `systemPrefersDark ? "dark" : "light"`. The result is applied as
`<html data-theme>` only when `stored` is set. Otherwise `data-theme` is absent and CSS
`color-scheme: light dark` follows the device live.

---

## Relationships

```text
Profile (1) ──────────── appears on ──▶ every page (contact links), Landing, About
Nav item (n) ─────────── renders ─────▶ SiteNav on every page
Project (n) ──0..1──▶ Project detail page (/projects/<slug>/)
Project [featured] (1..3) ─▶ Landing
Interest entry (n) ──────▶ Fun
Interactive piece (≥1) ──▶ Fun
Easter egg (n) ──────────▶ any page listed in `pages`
```

## Requirement traceability

| Rule | Spec |
|---|---|
| Profile strengths 2–4, role line | FR-006 |
| No phone/street fields; strict schema | FR-036 |
| Resume path must exist | FR-014 |
| Nav single source, `aria-current` | FR-002, FR-030 |
| Required page metadata props | FR-028 |
| Project summary 1–3 sentences, tech, ≥ 1 link | FR-009 |
| Optional image, text-only layout | FR-010 |
| Featured then order, nothing else | FR-011 |
| ≥ 1 featured project | FR-007 |
| Detail-page headings and visual | FR-033 |
| Image alt rules | FR-025 |
| Interest media: images + links, no embeds | FR-035 |
| Interest editing mirrors projects | FR-020 |
| Piece fallback required | FR-017 |
| Egg self-ending, dismissible, touch trigger | FR-019 |
| Theme storage and resolution | FR-034 |
