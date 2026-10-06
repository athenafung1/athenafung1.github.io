# Quickstart: Run and Validate the Portfolio Site

**Feature**: [spec.md](./spec.md) · **Plan**: [plan.md](./plan.md)

This is a run-and-verify guide. Each section maps to success criteria (SC) and constitution
gates. Details live in [data-model.md](./data-model.md) and [contracts/](./contracts/).

## 1. Prerequisites

- **Node.js 24 LTS** (Astro 7 requires ≥ 22.12.0). This machine currently has Node v14.17.0 and
  nvm is installed, so:

  ```sh
  nvm install      # reads .nvmrc (24)
  nvm use
  node -v          # expect v24.x
  ```

- A Chromium-based browser for Lighthouse and DevTools device emulation.
- At least one real phone (iOS Safari or Android Chrome) for the touch checks in §4.

## 2. Install, develop, build

```sh
npm ci                 # install exact locked versions
npm run dev            # http://localhost:4321 with live reload
npm test               # Vitest unit tests (src/lib)
npx astro check        # type-check .astro / .svelte / .ts
npm run build          # writes static output to dist/
npm run preview        # serves dist/ over HTTP at http://localhost:4321
```

**Expected**: `npm run build` exits 0 and `dist/` contains `index.html`, `about/index.html`,
`projects/index.html`, `fun/index.html`, one `projects/<slug>/index.html` per `detail: true`
project, `404.html`, `resume.pdf`, and the two legacy stubs. Always validate against
`npm run preview`, never by opening files as `file://` (constitution pre-deploy check).

**Content validation**: introduce each of these errors in turn and confirm the build fails with a
message naming the file and field, then revert:
- remove `links` from a project
- give a project a 4-sentence `summary`
- set `detail: true` on a project whose body lacks `## Outcome`
- add `phone:` to `profile.yaml`
- set no project as `featured`

## 3. Automated checks (same as CI `checks.yml`)

```sh
npm run build
node scripts/check-content.mjs          # placeholders, phone/address patterns, no embeds on /fun/
lychee --offline --root-dir "$PWD/dist" --index-files index.html dist/   # internal links (SC-009); brew install lychee
npx @lhci/cli autorun                   # uses lighthouserc.json; or rely on the CI action
```

**Expected**: all pass. Lighthouse reports Performance ≥ 90, Accessibility ≥ 90, LCP < 2.5 s and
total transfer < 1 MB for every URL (SC-004, SC-005). Paste the report link into the PR
(constitution Principle IV).

## 4. Responsive and mobile (SC-006, SC-011)

On `npm run preview`, in DevTools device mode **and** on a real phone:

| Check | 320px | 768px | 1280px (×720 for Landing) |
|---|---|---|---|
| No horizontal scroll on any page (`document.documentElement.scrollWidth === innerWidth`) | ✓ | ✓ | ✓ |
| Header: site mark + all four nav links + theme toggle visible, no hamburger | ✓ | ✓ | ✓ |
| Landing: name, role line, 2–4 strengths, primary action and email/GitHub/LinkedIn links visible without scrolling | — | — | ✓ at 1280×720 (FR-006, US1) |
| Tap targets ≥ 44×44 px (nav, contact icons, piece controls) | ✓ | ✓ | — |
| Long project title and skill list wrap without overlap | ✓ | ✓ | ✓ |

Repeat the table in **both** light and dark appearances. On the phone, also confirm that the page
scrolls normally when a swipe starts on the Fourier Sketch frame outside its drawing surface, and
that drawing on the surface does not scroll the page.

## 5. Behavior scenarios

| # | Scenario | Steps | Expected | Spec |
|---|---|---|---|---|
| 5.1 | No JavaScript | DevTools → disable JavaScript, visit every page | All text, nav and contact links work. Theme toggle hidden. Page follows OS theme. Fun page shows each piece's static fallback and `<noscript>` note | SC-007, FR-027, FR-017 |
| 5.2 | Theme toggle | Set OS to dark → load `/` (dark, no flash) → click toggle (light) → visit `/about/` → restart browser → visit `/fun/` | Light persists across pages and restart. Clearing site data returns to OS setting | FR-034, SC-011 |
| 5.3 | Private window | Repeat 5.2 in a private window with storage blocked | Toggle works per page view, with no console errors | FR-034 edge case |
| 5.4 | Reduced motion | OS → reduce motion, reload `/` and `/fun/`, then navigate between pages | Hero curve static and complete. Piece starts paused with a Step control. No page transition animation. Easter egg shows a static card | FR-026, FR-019 |
| 5.5 | Keyboard only | Tab through every page | Skip link first. Visible focus on every control. Fourier Sketch fully usable (presets, slider, play/pause, reset) | FR-024, FR-017 |
| 5.6 | Fourier Sketch | Draw a shape on a phone, then change the term slider | Epicycles redraw the shape. More terms gives a visibly closer match and fewer terms a smoother, rougher outline. Scrolling it off screen pauses it (CPU drops in DevTools Performance) | US4, R12 |
| 5.7 | Easter egg | Trigger by keyboard sequence, then by touch trigger on a phone | Plays ≤ 6 s or closes with Esc or tap. Content never covered, shifted or blocked. Network panel shows the egg chunk fetched only on trigger | FR-019 |
| 5.8 | Legacy URLs | Visit `/about/about_index.html` and `/projects/projects_index.html` | Lands on `/about/` and `/projects/` | SC-010, FR-005 |
| 5.9 | Unknown URL | Visit `/nope/` on the deployed site | 404 page with navigation. Home reachable in one click | Edge case |
| 5.10 | Project detail | From `/projects/`, open a card with a detail page | Problem / Approach / Outcome plus a visual. Back link to `/projects/`. Projects marked current in nav | FR-033 |
| 5.11 | Sharing preview | Paste each page URL into a link-preview debugger (after deploy) | Correct title, description, image | FR-028 |
| 5.12 | One-click reach | From each page, reach every other top-level page and each contact link | One click or tap each | SC-003 |
| 5.13 | Frame rate | On a mid-range phone with remote DevTools, record 5 s of the Fourier Sketch playing at the maximum term count (Performance panel) | Holds about 60 fps with no long tasks over 50 ms; drops are acceptable only while the slider moves | Plan performance goals |

## 6. Pre-deploy content checks (manual)

- [ ] `public/resume.pdf` opened and read: **no phone number, no street address** (FR-036)
- [ ] Resume and About page agree on education and experience (FR-014)
- [ ] No placeholder text anywhere (also enforced by `check-content.mjs`)
- [ ] Every image's alt text describes it, not "image of…"
- [ ] Console is clean on every page (SC-009)

## 7. Post-deploy verification (constitution)

After merge to `master` and the `Deploy to GitHub Pages` run completes:

1. Open `https://athenafung1.github.io/` plus every route in [contracts/routes.md](./contracts/routes.md).
2. Repeat 5.8, 5.9 and 5.11 against the live URL.
3. Run Lighthouse against the live URL for `/` and `/fun/` and confirm the SC-004/SC-005
   thresholds hold in production.
4. In the repository's Settings → Pages, confirm **Enforce HTTPS** is enabled, and that
   `http://athenafung1.github.io/` redirects to `https://` (constitution, Technology and Hosting
   Constraints).

## 8. Add-a-page drill (SC-008, FR-030, FR-031)

Time it, aiming for under 30 minutes.

1. Create `src/pages/talks.astro` using `BaseLayout` with `title`, `description` and one `<h1>`.
2. Add `- { id: talks, label: Talks, href: /talks/, order: 5 }` to `src/data/nav.yaml`.
3. `npm run build && npm run preview`.

**Expected**: "Talks" appears in navigation on every page, styled like the rest, with correct OG
tags. Only those two files changed (`git status`). Revert afterwards.

## 9. First-impression test (SC-001, SC-002)

Show the deployed landing page to at least 3 people for 5 seconds each, then ask: "Whose site
was that and what do they do?" and "Does it look custom-built or made from a template?"

**Pass**: everyone answers the first correctly, and at least 2 of 3 say custom-built.
