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
  strengths:            # 2 to 4
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
  skills:
    - group: Languages
      items: [<item>, <item>]
  resume: /resume.pdf   # file must exist in public/
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
- { id: fun,      label: Fun,      href: /fun/,      order: 4 }
```

This is the **only** place navigation is defined (FR-030).

## `src/content/projects/<slug>.md`

The file name becomes the slug, and the detail page URL is `/projects/<slug>/`.

```markdown
---
title: <Project name>
summary: <One to three sentences.>
tech: [<Tech>, <Tech>]
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

## `public/resume.pdf`

The public resume. It must **not** contain a phone number or street address (FR-036). Replace the
file in place to update it, and check that it agrees with the About page (spec edge case "Resume
out of date"; quickstart §6).

## `public/og/`

`default.png` (1200×630) is required. Optional per-page images are passed to `BaseLayout` as
`ogImage`.
