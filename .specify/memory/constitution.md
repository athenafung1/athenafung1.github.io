<!--
Sync Impact Report
- Version change: 1.0.0 → 1.1.0
- Rationale: MINOR. Principle V is relaxed to permit a non-published `archive/` tree, and the
  hosting section is narrowed from "one documented mechanism" to the specific mechanism now in
  place. Nothing previously compliant becomes non-compliant.
- Modified principles:
  - V. Minimum Viable Complexity — added the `archive/` carve-out and its read-only constraint
  - I. Static-First Delivery — `404.html` located precisely at `site/404.html`
- Modified sections:
  - Technology and Hosting Constraints — named `site/` as the sole published directory and
    `.github/workflows/pages.yml` as the sole deploy path; added the Pages source-setting rule
  - Development Workflow and Quality Gates — pre-deploy check reworded for a no-build site
- Added sections: none
- Removed sections: none
- Deferred TODOs: none
-->

# Portfolio Website Constitution

## Core Principles

### I. Static-First Delivery (NON-NEGOTIABLE)

The site MUST be publishable as static files (HTML, CSS, JS, and assets) served by GitHub Pages.

- No server-side runtime, application server, or database MAY be required to serve the site.
- Any dynamic behavior MUST run in the browser or call a third-party API from the client.
- No secret, API key, or credential MAY be committed to the repository or embedded in shipped
  assets; only public, rate-limited endpoints are permitted from client code.
- All internal links and asset references MUST resolve correctly under the published GitHub Pages
  base path, verified on the live URL after deploy.
- A custom `404.html` MUST exist at the published site root (`site/404.html`).

Rationale: GitHub Pages serves static content only. Treating that as a hard boundary keeps hosting
free, keeps deploys reversible, and prevents architecture the platform cannot run.

### II. Content Before Chrome

The site exists to communicate the engineer's work. Content requirements come before visual or
interactive enhancements.

- The site MUST include, at minimum: an identity/intro section (name and what the author does), a
  projects section, a way to contact the author, and a link to a resume or a resume-equivalent
  experience section.
- Every project entry MUST carry a title, a one-to-three sentence summary, the technologies used,
  and at least one link (repository, live demo, writeup, or publication).
- The site MUST ship with at least one real project entry; placeholder or lorem-ipsum content MUST
  NOT be present in a deployed build.
- Contact information MUST be reachable without JavaScript (a plain `mailto:` or profile link
  satisfies this).

Rationale: A portfolio with beautiful transitions and no legible project record fails its only job.

### III. Accessible and Responsive by Default

Accessibility and responsiveness are build requirements, not later passes.

- Every page MUST render usable and readable at 320px, 768px, and 1280px viewport widths with no
  horizontal scrolling of the page body.
- Markup MUST use semantic HTML landmarks (`header`, `nav`, `main`, `footer`) and a single `h1`
  per page with a non-skipping heading hierarchy.
- All non-decorative images MUST have descriptive `alt` text; decorative images MUST have `alt=""`.
- Text and interactive elements MUST meet WCAG 2.1 AA contrast (4.5:1 body text, 3:1 large text
  and UI boundaries).
- All interactive controls MUST be reachable and operable by keyboard with a visible focus
  indicator.
- Core content MUST remain readable with JavaScript disabled.

Rationale: Recruiters, screen readers, and phones are the actual audience; failing any of them
loses the reader before the work is seen.

### IV. Performance Budget

Page weight is capped and measured, not assumed.

- Initial page load MUST transfer under 1 MB total (all resources, compressed) for any page.
- Largest Contentful Paint MUST be under 2.5s under Lighthouse's simulated mobile throttling.
- Lighthouse Performance and Accessibility scores MUST each be at least 90 on the deployed site.
- Images MUST be served in a modern format (WebP or AVIF) with explicit `width` and `height`
  attributes, and MUST be sized no larger than their maximum rendered dimensions.
- Third-party scripts, web fonts beyond two families, and analytics MUST NOT be added without
  recording the measured cost against this budget in the pull request.

Rationale: A portfolio is judged on load, and the budget makes "just one more library" a decision
with a number attached rather than a reflex.

### V. Minimum Viable Complexity

Build the smallest thing that satisfies the requirement.

- Plain HTML/CSS/JS is the default. A framework, build step, or CSS pipeline MUST NOT be added
  unless the plan states a concrete need it resolves that the default cannot.
- Runtime dependencies MUST be justified individually in the plan; a dependency that saves fewer
  than roughly 50 lines of code MUST NOT be added.
- Content MUST live in a form the author can edit directly (Markdown, HTML, or a data file);
  content MUST NOT require a CMS, database, or admin UI.
- Abandoned experiments, unused templates, and dead assets MUST NOT remain in the published
  tree. They are either deleted outright or moved under `archive/`, which is never published.
- `archive/` is a frozen record, not a working area. Its contents MUST NOT be edited, fixed, or
  refactored, and MUST NOT be imported by or linked from the published site.
- Anything already recoverable from an annotated git tag SHOULD be deleted rather than copied
  into `archive/`. The folder is for snapshots worth reading without a checkout; the tags are the
  complete record.

Rationale: A personal site outlives its build tooling. Fewer moving parts means it still deploys
after a year of not touching it.

## Technology and Hosting Constraints

- Hosting is GitHub Pages at https://athenafung1.github.io, served from the
  `athenafung1.github.io` repository.
- `site/` is the published directory and the only one. Any file that must reach the public web
  MUST live under `site/`; any file that must not MUST live outside it.
- Deployment happens through exactly one mechanism: the GitHub Actions workflow at
  `.github/workflows/pages.yml`, which uploads `site/` on every push to `master`. A second deploy
  path (a publishing branch, a `/docs` source, a manual upload) MUST NOT be added.
- The repository's Pages source setting MUST remain "GitHub Actions". Switching it to "Deploy
  from a branch" would publish the entire repository, `archive/` included.
- The default branch MUST always be in a deployable state; broken work stays on a feature branch.
- Generated build output MUST NOT be hand-edited; changes are made to source and rebuilt.
- The site MUST include a `<title>`, a meta description, and Open Graph tags (title, description,
  image, url) on every page so shared links preview correctly.
- The site MUST be served over HTTPS ("Enforce HTTPS" enabled in Pages settings).
- If a custom domain is used, its `CNAME` file and DNS configuration MUST be documented in the
  README.
- Browser support target is the current and prior major version of Chrome, Firefox, Safari, and
  Edge. Features outside that support set MUST have a graceful fallback.

## Development Workflow and Quality Gates

- Work follows the Spec Kit flow: specify, plan, tasks, implement. Features MUST be developed on a
  branch, never committed directly to the default branch.
- Before any deploy, the author MUST verify: the site renders correctly when served over HTTP
  locally (not opened as `file://`, which hides root-relative path errors), it renders at all
  three viewport widths in Principle III, no console errors are present, and every link on changed
  pages resolves (no 404s).
- Any change touching layout, images, fonts, or dependencies MUST be checked against the
  Principle IV budget before merge, and the measurement recorded in the pull request description.
- After deploy, the author MUST load the live GitHub Pages URL and confirm the changed pages render
  correctly there, since base-path and case-sensitivity failures appear only in production.
- Automated tests are not required for static content pages. Any client-side JavaScript containing
  non-trivial logic (data transformation, filtering, form handling) MUST have unit tests.
- A change that violates a principle MUST NOT be merged until either the change is revised or this
  constitution is amended to permit it.

## Governance

This constitution supersedes other practices and preferences for this project. Where a tutorial,
template, or generated scaffold conflicts with it, this document wins.

- Amendments MUST be made by editing this file in a dedicated commit that states what changed and
  why. An amendment takes effect once merged to the default branch.
- Versioning follows semantic versioning: MAJOR for removing or redefining a principle in a way
  that invalidates prior work; MINOR for adding a principle or section, or materially expanding an
  existing rule; PATCH for clarifications and wording that do not change what is permitted.
- Every version change MUST update the version line below, set **Last Amended** to the merge date,
  and prepend an updated Sync Impact Report comment at the top of this file.
- Compliance is reviewed at two points: during `/speckit-plan`, where the plan MUST record how it
  satisfies each principle it touches, and before each deploy via the checks in Development
  Workflow and Quality Gates.
- Complexity that violates Principle V MUST be justified in writing in the plan, naming the
  simpler approach that was rejected and why it was insufficient.
- Agent-facing runtime guidance belongs in `CLAUDE.md` at the repository root; that file MUST NOT
  contradict this constitution.

**Version**: 1.1.0 | **Ratified**: 2026-09-07 | **Last Amended**: 2026-09-07
