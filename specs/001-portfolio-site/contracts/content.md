# Contract: Author-Facing Content Files

These are the files the author edits to change what the site says. The build validates them
against the schemas in [data-model.md](../data-model.md); invalid content stops the build with a
message naming the file and field. Everything here is plain YAML or Markdown (constitution
Principle V, FR-020, FR-032).

## `src/data/profile.yaml`

```yaml
author:
  name: Athena Fung
  role: Software engineer building <one-line focus>
  strengths:            # optional; 2 to 4 when given
    - <strength>
    - <strength>
  location: <City, Region>          # optional; never a street address
  seeking: <what you're looking for> # optional
  bio: |
    <Plain text. Separate paragraphs with a blank line.>
  education:
    - institution: <School>
      credential: <Degree, major>
      period: <2022–2026>
  experience:
    - organization: <Org>
      title: <Role>
      period: <Summer 2025>
      summary: <one or two sentences>
      highlights:       # optional, up to 5
        - <highlight>
  skills:               # optional
    - group: Languages
      items: [<item>, <item>]
  resume: /resume.pdf   # optional; when set, the file must exist in public/ (see below)
  contact:
    email: <address>
    github: https://github.com/athenafung1
    linkedin: https://www.linkedin.com/in/athenafung1
```

Unknown keys (for example `phone` or `address`) are rejected (FR-036).

## `src/data/nav.yaml`

```yaml
- { id: home,     label: Home,     href: /,          order: 1 }
- { id: about,    label: About,    href: /about/,    order: 2 }
- { id: projects, label: Projects, href: /projects/, order: 3 }
- { id: musings,  label: Musings,  href: /musings/,  order: 4 }
- { id: fun,      label: Fun,      href: /fun/,      order: 5 }
```

This is the **only** place navigation is defined (FR-030).

## `src/content/projects/<slug>.md`

The file name becomes the slug, and the detail page URL is `/projects/<slug>/`.

```markdown
---
title: <Project name>
summary: <One to three sentences.>
tech: [<Tech>, <Tech>]      # optional
links:
  - { type: repository, url: https://github.com/... }
  - { type: demo, url: https://..., label: Live demo }
image:                      # optional
  src: ./images/<file>.png  # relative to this file
  alt: <What the image shows>
period: <Spring 2026>       # optional
featured: true              # optional, default false
order: 1
detail: true                # optional, default false
detailDescription: <50–160 chars for the detail page's meta description>
---

## Problem
...

## Approach
...
![<alt>](./images/<diagram>.png)   <!-- or a fenced code block -->

## Outcome
...
```

When `detail` is `false` (the default), leave the body empty. The card is the whole entry.

## `src/content/interests/<slug>.md`

```markdown
---
title: <Interest>
category: <Creative work>     # optional
images:                       # optional, up to 6, stored on the site
  - { src: ./images/<file>.jpg, alt: <description> }
links:                        # optional, plain outbound links, never embedded
  - { type: video, url: https://..., label: <Watch the performance> }
order: 1
---

<Write-up, 1 to 150 words.>
```

## `src/content/musings/<slug>.md`

The file name becomes the slug, and the page URL is `/musings/<slug>/` (FR-037 to FR-039). Files in
subfolders (for example a local `test/` folder of drafts) are not published.

```markdown
---
title: <Title, up to 80 characters>
description: <50–160 chars: the meta description and the one-line summary in lists>
date: 2026-10-12              # optional; undated musings are listed after dated ones
tags: [<tag>, <tag>]          # optional, up to 5
---

<Markdown body. Maths: $inline$ and $$display$$ (LaTeX), rendered to MathML at build time.
Side notes: <span class="margin-note"><b>Title</b> text</span> inside a paragraph, or an
<aside class="margin-note"> block for notes with display maths. HTML comments are dropped from
the published page.>
```

Images used by a musing go in `public/musings/<slug>/` and are referenced as
`/musings/<slug>/<file>`, with `width`, `height` and, for photos, a `srcset` no larger than the
largest size they are shown at (constitution Principle IV).

## `public/resume.pdf` (optional)

Not in the repository by default (`.gitignore` lists it). To offer a resume, save the public
version as `public/resume.pdf`, remove its line from `.gitignore`, and set `resume: /resume.pdf`
in `profile.yaml`. It must **not** contain a phone number or street address (FR-036), and it must
agree with the About page (spec edge case "Resume out of date"; quickstart §6).

## `public/og/`

`default.png` (1200×630) is required. Optional per-page images are passed to `BaseLayout` as
`ogImage`.
