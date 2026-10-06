# Feature Specification: Personal Portfolio Site

**Feature Branch**: `001-portfolio-site` (to be created before implementation; specification work so far is on `restructure`)

**Created**: 2026-10-05

**Status**: Draft

**Input**: User description: "I am building a personal portfolio. I want it to look sleek and something that stands out and highlights my assets. There should be a main landing page, a more detailed about page, a projects page, and a fun page. Other pages should easily be added in the future."

## Clarifications

### Session 2026-10-05

- Q: Should projects only appear as summary cards that link elsewhere, or should some projects get their own detail page on the site? → A: Cards for all projects, plus an optional detail page for projects the author chooses (typically the featured ones).
- Q: Should the site have a light appearance, a dark appearance, or both? → A: Both, matching the visitor's device setting by default, plus a visible toggle that remembers the visitor's choice.
- Q: Should visitors be able to filter or group projects by type or technology on the Projects page? → A: No filtering or grouping; featured projects first, then the rest in the author's chosen order.
- Q: What kinds of media should the Fun page's creative-work entries be able to show? → A: Images stored on the site, plus plain links out to video, audio, or writing hosted elsewhere.
- Q: Should the public, downloadable resume leave out the phone number and street address? → A: Yes; the public resume shows only email, city/region, and profile links.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - First impression on the landing page (Priority: P1)

A visitor (most often a recruiter, hiring manager, or fellow engineer following a link from a
resume, LinkedIn, or GitHub) arrives at the site root. Within a few seconds they learn who Athena
is, what the author does, and what the author is best at. A distinctive but uncluttered visual identity makes
the site memorable. From the landing page the visitor can reach every other page and every
contact channel.

**Why this priority**: Most visitors decide within seconds whether to keep reading. A landing page
that names the author, states the author's strengths, and links onward is a usable portfolio on its own,
even before any other page exists.

**Independent Test**: Load only the landing page at each supported screen width. Confirm that a
first-time viewer can state the author's name, role, and top strengths, and can reach email,
GitHub, and LinkedIn, all without scrolling at a 1280×720 viewport.

**Acceptance Scenarios**:

1. **Given** a visitor opens the site root, **When** the page finishes loading, **Then** the
   author's name, a one-line description of what the author does, and 2 to 4 highlighted strengths are
   visible without scrolling at a 1280×720 viewport.
2. **Given** a visitor is on the landing page, **When** they look for ways to contact the author,
   **Then** email, GitHub, and LinkedIn links are present and work with scripting disabled.
3. **Given** a visitor is on the landing page, **When** they use the site navigation, **Then**
   they can reach the About, Projects, and Fun pages in one click or tap.
4. **Given** a visitor on a 320px-wide phone, **When** they view the landing page, **Then** all
   content is readable and the page never scrolls horizontally.

---

### User Story 2 - Evaluating work on the Projects page (Priority: P1)

A visitor who wants evidence of ability opens the Projects page and scans a set of project
entries. Each entry gives enough to judge relevance at a glance (title, short summary,
technologies, and links) and lets the visitor go deeper through a repository, demo, or writeup.

**Why this priority**: Projects are the main evidence a portfolio offers. Without them the site
makes claims it cannot back up. The constitution requires at least one real project entry before
deploy.

**Independent Test**: Open the Projects page directly by its address. Confirm each entry shows a
title, a 1 to 3 sentence summary, the technologies used, and at least one working outbound link.

**Acceptance Scenarios**:

1. **Given** a visitor opens the Projects page, **When** it loads, **Then** every project entry
   shows a title, a 1 to 3 sentence summary, the technologies used, and at least one link.
2. **Given** a project entry, **When** the visitor activates its link, **Then** they reach the
   repository, live demo, writeup, or publication it names.
3. **Given** the author marks some projects as featured, **When** the Projects page loads,
   **Then** featured projects appear before the others.
4. **Given** a visitor is on the landing page, **When** they look for work samples, **Then** at
   least one featured project is surfaced there with a path to the full Projects page.
5. **Given** a project has a detail page, **When** the visitor activates that project's card,
   **Then** they reach the detail page, which covers the problem, the author's approach, the
   outcome, and supporting visuals, and links back to the Projects page.

---

### User Story 3 - Learning more on the About page (Priority: P2)

A visitor who is interested opens the About page for the fuller story: background, education,
experience, skills, what the author is looking for, and a resume.

**Why this priority**: The About page turns interest into a contact or an interview, but it
assumes the visitor is already engaged by the landing and projects pages.

**Independent Test**: Open the About page directly. Confirm it presents background, education,
experience, skills, and a resume download, and that the download and each contact link work.

**Acceptance Scenarios**:

1. **Given** a visitor opens the About page, **When** it loads, **Then** it shows a short
   biography, education, work or research experience, and a grouped list of skills.
2. **Given** a visitor wants a resume, **When** they activate the resume link on the About page,
   **Then** they can download the author's current resume as a document, and the same experience
   is also readable on the About page itself.
3. **Given** a visitor finishes reading the About page, **When** they reach the end, **Then** a
   clear call to contact the author is present.

---

### User Story 4 - Getting a sense of personality on the Fun page (Priority: P3)

A visitor curious about the person behind the work opens the Fun page and finds content that
shows the author's personality and interests outside formal work. The page combines two kinds of
content:

- **Interests and endeavours**: short write-ups of personal interests, side pursuits, and creative
  work, with images where they help and links out to longer media (video, audio, writing) hosted
  elsewhere.
- **Interactive pieces**: at least one playful, math-flavoured interactive element (for example a
  visual animation driven by a mathematical idea, or a small toy the visitor can poke at), plus
  optional hidden "easter eggs" for curious visitors to find.

**Why this priority**: It makes the site memorable and gives conversations an opening, but a
visitor can judge the author's qualifications without it.

**Independent Test**: Open the Fun page directly. Confirm it shows interest entries and at
least one working interactive piece, uses the same navigation and visual identity as the other
pages, and stays readable with scripting disabled.

**Acceptance Scenarios**:

1. **Given** a visitor opens the Fun page, **When** it loads, **Then** it shows interest and
   endeavour entries and at least one interactive piece, in the same visual style and navigation
   as the rest of the site.
2. **Given** a visitor is on the Fun page, **When** they interact with an interactive piece using
   a mouse, touch, or keyboard, **Then** it responds visibly and can be reset or left without
   reloading the page.
3. **Given** a visitor has scripting disabled, **When** they open the Fun page, **Then** every
   interest entry is still readable, and each interactive piece is replaced by a static image or
   short description of what it does.
4. **Given** a visitor finds a hidden easter egg anywhere on the site, **When** it activates,
   **Then** it never blocks, hides, or moves core content, and it can be dismissed or ends on its
   own.

---

### User Story 5 - Adding a new page later (Priority: P3)

The author (the site's only maintainer) decides to add a new page, such as Writing or Talks. The author
creates the page from a shared starting point, adds it to the navigation in one place, and the
new page automatically matches the site's look, navigation, footer, and sharing previews.

**Why this priority**: The user asked for it explicitly. It mainly reduces future cost and does
not change what visitors see today.

**Independent Test**: Add a placeholder page on a branch by following the documented steps.
Confirm it appears in the navigation on every page, matches the site's styling, and needs no
edits to any existing page's content.

**Acceptance Scenarios**:

1. **Given** the author follows the documented add-a-page steps, **When** the author adds a new page,
   **Then** the author edits at most two places: the new page itself and one shared navigation list.
2. **Given** a new page has been added, **When** a visitor opens any existing page, **Then** the
   navigation includes the new page.
3. **Given** a new page has been added, **When** its link is shared on a social platform,
   **Then** a correct title, description, and preview image appear.

---

### Visual Identity *(applies to all stories)*

The user wants the site to look "sleek" and to "stand out." For this spec that means:

- One consistent visual identity across all pages: a single type system, a defined color palette,
  and consistent spacing and component styles.
- An **editorial** direction: expressive typography, confident magazine-like layouts, and
  generous whitespace carry most of the personality, so the site reads clearly as an engineer's
  portfolio and not as a drag-and-drop template site.
- A **small amount of bold motion**, used deliberately in a few places: the landing hero, the
  Fun page's interactive pieces, easter eggs, page transitions, and hover and focus feedback. Motion elsewhere is minimal.
- No scroll-jacking, autoplaying video or audio, or full-screen intro animations that delay
  content.
- Any motion respects the visitor's reduced-motion preference.
- The identity has a **light and a dark appearance** of equal quality. The site follows the
  visitor's device setting by default, and a visible toggle lets them switch.

### Edge Cases

- **Reduced motion**: a visitor who prefers reduced motion sees no non-essential animation, and
  content is never hidden behind an animation that does not run.
- **Scripting disabled**: all core content, navigation, and contact links still work. Only
  enhancements degrade.
- **Missing project media**: a project with no image or demo still renders cleanly with text and
  links, with no broken-image icon or empty frame.
- **Very long content**: an unusually long project title, summary, or skill list wraps cleanly at
  320px without overlapping or causing horizontal scroll.
- **Old addresses**: a visitor who follows a previously published address (for example the old
  About or Projects page addresses) reaches the equivalent new page rather than a dead end.
- **Unknown address**: a visitor who mistypes an address can get back to the landing page in one
  step.
- **Slow connection**: on a throttled mobile connection, the author's name and intro appear before
  decorative media finishes loading.
- **Appearance toggle without scripting**: with scripting disabled, the page follows the device
  setting and the toggle is hidden rather than shown in a broken state.
- **Remembered choice unavailable**: if the browser cannot store the visitor's choice (for
  example in a private window), the toggle still works for the current page and the site falls
  back to the device setting on the next visit.
- **Detail page without featured status**: a project with a detail page that is not featured
  still links to its detail page from its card.
- **Few projects**: with only one project entry, the Projects page still looks intentional, not
  empty.
- **Media-heavy Fun page**: with many photos or creative-work images, the page still stays within
  budget; media below the first screen loads only as the visitor scrolls to it.
- **Touch-only devices**: easter eggs and interactive pieces that rely on a keyboard or hover also
  have a touch way to trigger them, or are clearly optional.
- **Resume out of date**: if the downloadable resume and the About page disagree, the About page
  shows the newer information, and the mismatch is caught by the pre-deploy check.
- **Resume replaced with a full version**: if a resume containing a phone number or street
  address is added by mistake, the pre-deploy check catches it before it is published.

## Requirements *(mandatory)*

### Functional Requirements

**Site structure and navigation**

- **FR-001**: The site MUST have four top-level pages: Landing (the site root), About, Projects,
  and Fun.
- **FR-002**: Every page MUST show the same primary navigation, listing all top-level pages, with
  the current page visibly indicated.
- **FR-003**: Every page MUST show the author's contact links (email, GitHub, LinkedIn) in a
  consistent location. These links MUST work with scripting disabled.
- **FR-004**: Each page MUST have its own stable, human-readable address (for example `/about/`)
  so it can be linked to directly.
- **FR-005**: Previously published page addresses MUST lead visitors to the equivalent new page.

**Landing page**

- **FR-006**: The landing page MUST show the author's name, a one-line statement of what the author does,
  and 2 to 4 highlighted strengths or assets, all visible without scrolling at a 1280×720
  viewport.
- **FR-007**: The landing page MUST surface at least one featured project and link to the full
  Projects page.
- **FR-008**: The landing page MUST give a clear primary action (for example "View projects" or
  "Get in touch") above the fold.

**Projects page**

- **FR-009**: Each project entry MUST include a title, a 1 to 3 sentence summary, the technologies
  used, and at least one link (repository, live demo, writeup, or publication).
- **FR-010**: A project entry MAY include an image and a date or time period. When it has no
  image, it MUST still render cleanly.
- **FR-011**: Projects marked as featured MUST appear before the others. Within each group,
  entries MUST appear in the order the author specifies. The Projects page MUST NOT filter, sort,
  or group entries in any other way, so its order is identical with or without scripting.
- **FR-012**: The Projects page MUST display well with anywhere from 1 to 20 entries.
- **FR-033**: The author MAY give any project a detail page. A detail page MUST cover the
  problem, the author's approach, the outcome, and at least one supporting visual or code
  excerpt, and MUST link back to the Projects page. A project without a detail page MUST still
  be complete as a card under FR-009. Detail pages MUST NOT appear in the primary navigation.

**About page**

- **FR-013**: The About page MUST include a short biography, education, work or research
  experience, and grouped skills, rendered on the page as readable content.
- **FR-014**: The About page MUST link to a downloadable copy of the author's current resume. The
  experience and education shown on the page MUST NOT contradict the downloadable resume.
- **FR-036**: The downloadable resume and every page MUST NOT contain the author's phone number or
  street address. Personal contact details on the site are limited to email, city or region, and
  profile links (GitHub, LinkedIn).
- **FR-015**: The About page MUST end with a call to contact the author.

**Fun page**

- **FR-016**: The Fun page MUST present interest and endeavour entries (personal interests, side
  pursuits, and creative work) and at least one math-flavoured interactive piece, using the shared
  navigation and visual identity.
- **FR-017**: Each interactive piece MUST be operable by mouse, touch, and keyboard, and MUST
  have a static fallback (image or description) shown when scripting is unavailable.
- **FR-018**: Interactive pieces and media MUST NOT delay the appearance of the page's text
  content, and MUST keep the page within the site's page-weight budget.
- **FR-019**: Hidden easter eggs MAY appear on any page. They MUST be optional to discover, MUST
  NOT obstruct or alter core content, MUST be dismissible or self-ending, and MUST respect the
  reduced-motion preference.
- **FR-035**: Interest entries MUST show media only as images stored on the site. Video, audio, and
  long-form writing MUST be presented as plain links to where they are hosted elsewhere. The Fun
  page MUST NOT embed third-party media players or load third-party scripts.
- **FR-020**: The author MUST be able to add a new interest entry by editing plain content only,
  in the same way as project entries.

**Visual identity and quality**

- **FR-021**: All pages MUST share one visual identity (type, color palette, spacing, and
  component styles) following the editorial direction described under Visual Identity.
- **FR-022**: Prominent motion MUST be limited to the landing hero, interactive pieces, easter
  eggs (as constrained by FR-019), page-to-page transitions, and hover and focus feedback. Pages MUST NOT use scroll-jacking, autoplaying audio or video, or
  intro animations that delay content.
- **FR-023**: Every page MUST be readable and usable at 320px, 768px, and 1280px widths with no
  horizontal page scrolling.
- **FR-034**: Every page MUST offer a light and a dark appearance. On a first visit the page MUST
  match the visitor's device setting. A visible toggle, present on every page in the same
  location, MUST let the visitor switch, and the site MUST remember that choice on later visits
  and across pages. Pages MUST NOT briefly show the wrong appearance while loading.
- **FR-024**: All text and interactive elements MUST meet WCAG 2.1 AA contrast in both the light
  and dark appearances. All interactive
  controls MUST be keyboard-operable with a visible focus indicator.
- **FR-025**: Every non-decorative image MUST have descriptive alternative text.
- **FR-026**: Animations and transitions MUST be suppressed when the visitor has requested reduced
  motion.
- **FR-027**: All core content and navigation MUST be readable and usable with scripting disabled.
- **FR-028**: Every page MUST have a unique title, a description, and social-sharing preview
  information (title, description, image, address).
- **FR-029**: Placeholder text MUST NOT appear on any deployed page.

**Extensibility**

- **FR-030**: Adding a new top-level page MUST require changes in at most two places: the new page
  and one shared navigation list. The new page MUST inherit the shared layout, navigation,
  contact links, and styling without per-page copying of those elements. Adding a project detail
  page MUST follow the same documented steps, minus the navigation entry.
- **FR-031**: The steps for adding a page MUST be documented in the repository.
- **FR-032**: Project entries MUST be editable by the author directly in plain, human-readable
  content, without a CMS, database, or admin interface.

### Key Entities

- **Page**: A top-level destination on the site. Attributes: name shown in navigation, address,
  title, description, sharing preview image, and position in the navigation order.
- **Project**: A piece of work being showcased. Attributes: title, summary (1 to 3 sentences),
  technologies, one or more links (each with a type: repository, demo, writeup, or publication),
  optional image with alt text, optional date or period, featured flag, display order, and an
  optional project detail page.
- **Project detail page**: An in-depth page for one project. Attributes: the project it belongs
  to, problem, approach, outcome, supporting visuals or code excerpts (images with alt text), and
  its own title, description, and sharing preview. One project has at most one detail page.
- **Profile**: The author's identity and contact details. Attributes: name, one-line role
  statement, highlighted strengths (2 to 4), short biography, education, experience entries,
  skill groups, downloadable resume (public version without phone or street address), and
  contact links (email, GitHub, LinkedIn).
- **Interest entry**: A personal interest, side pursuit, or piece of creative work shown on the
  Fun page. Attributes: title, short write-up, optional category (for example creative work),
  optional images with alt text (stored on the site), optional outbound media links (each with a
  type: video, audio, or writing), and display order.
- **Interactive piece**: A playful, math-flavoured element on the Fun page. Attributes: name,
  one-line description of the idea behind it, and a static fallback (image or description).
- **Easter egg**: An optional hidden behaviour that can appear on any page. Attributes: what
  triggers it, what it does, and how it ends or is dismissed.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In an informal 5-second test with at least 3 people, every participant can recall
  the author's name and what the author does after viewing the landing page.
- **SC-002**: In the same test, at least 2 of 3 participants describe the site as custom-built
  rather than made from a website-builder template.
- **SC-003**: A visitor starting on any page can reach any other top-level page or contact link
  in one click or tap.
- **SC-004**: Every page loads with under 1 MB transferred. The main content appears within 2.5
  seconds on a simulated mid-range mobile connection.
- **SC-005**: Every page scores at least 90 for both performance and accessibility on a standard
  automated web-quality audit of the deployed site.
- **SC-006**: Every page passes manual checks at 320px, 768px, and 1280px widths with no
  horizontal scrolling and no overlapping content.
- **SC-011**: Every page passes the contrast and manual viewport checks in both the light and the
  dark appearance, and a chosen appearance persists across all pages and a browser restart.
- **SC-007**: With scripting disabled, 100% of core content, navigation links, and contact links
  remain visible and working, and every interactive piece shows its static fallback.
- **SC-008**: The author can add a new placeholder page, live in navigation on every page, in
  under 30 minutes by following the documented steps.
- **SC-009**: Zero broken internal links and zero console errors on any page of the deployed site.
- **SC-010**: Every previously published page address resolves to its equivalent new page.

## Assumptions

- **Audience**: Primary visitors are recruiters, hiring managers, and engineers evaluating the
  author for internships or jobs. Secondary visitors are peers and friends.
- **Content ownership**: The author supplies all real content (biography, education, experience,
  skills, project details, images, resume, and fun-page content). The current site content (for
  example "freshman at UIUC") is outdated and will be replaced.
- **Contact channels**: Email, GitHub, and LinkedIn are the contact channels, matching the current
  site. No contact form is included, because a form would need a server or third-party service.
- **Hosting**: The site remains a static site on GitHub Pages under the existing deploy setup, per
  the constitution. No accounts, logins, comments, or server-side features are in scope.
- **Language**: The site is in English only.
- **Not-found page**: A custom not-found page is optional under constitution v1.2.0. The existing
  one may be restyled to match or removed. The "Unknown address" edge case is satisfied either way
  as long as the visitor can get back to the landing page.
- **Out of scope**: blog or writing system, search, project filtering or category grouping,
  analytics, multilingual support, and a CMS.
  These can be added later as new pages under FR-030.
- **Prior versions**: Earlier site versions under `archive/` are reference only and are not
  modified, per the constitution.
