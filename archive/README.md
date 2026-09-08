# Archive

Frozen snapshots of earlier versions of this site. **Nothing here is published** —
the Pages workflow uploads only `site/`.

This directory is read-only by convention: it is a record, not a working area. Do not
fix, refactor, or update anything in it.

| Directory | What it is |
| --- | --- |
| `live-2021/` | The site served at athenafung1.github.io from 2021-05-27 until the rebuild. Hand-written HTML/CSS/JS. It was the starting content for `site/`. |
| `v1/` | An earlier iteration of the same hand-written site. |
| `mysite_root/` | An abandoned Jekyll experiment (2024). |
| `golden/` | Notes toward a redesign. |

## What is not here

Larger experiments were left out of the working tree to keep clones small. They remain
fully recoverable from annotated tags:

| Tag | Contents |
| --- | --- |
| `archive/live-2021` | The `master` branch as it stood on 2021-05-27. |
| `archive/jekyll-testing` | The `jekyll-testing` branch: `golden`, `mysite`, `mysite_root`, `v1`, and `website` (a Create React App attempt, including its photo assets). |
| `archive/revamp` | The `revamp` branch: `golden`, `v1`, `website`. |

To retrieve one without disturbing the current checkout:

```sh
git worktree add /tmp/old-site archive/jekyll-testing
# ... look around ...
git worktree remove /tmp/old-site
```
