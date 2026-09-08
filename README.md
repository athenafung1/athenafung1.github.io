# athenafung1.github.io

Personal portfolio site for Athena Fung.

**Live at: https://athenafung1.github.io**

## Repository layout

| Path | Purpose |
| --- | --- |
| `site/` | The published site. **This is the only directory GitHub Pages serves.** |
| `archive/` | Frozen snapshots of earlier versions. Never published. |
| `.github/workflows/pages.yml` | The deploy mechanism. |
| `.specify/` | Spec Kit artifacts: the project constitution, specs, and plans. |

## Deployment

Deployment happens through exactly one mechanism: the **`Deploy to GitHub Pages`**
GitHub Actions workflow in `.github/workflows/pages.yml`.

It runs on every push to `master` and uploads **only `site/`** as the Pages artifact.
Nothing outside `site/` is ever published, which is what keeps `archive/` off the
public web.

One-time setup required in the repository settings:

> Settings → Pages → Build and deployment → Source: **GitHub Actions**

Until that is switched from "Deploy from a branch" to "GitHub Actions", the workflow
will run but the published site will not change.

There is no build step. `site/` contains plain HTML, CSS, and JavaScript that is
served as-is.

## Local development

Serve `site/` over HTTP rather than opening files directly, so that root-relative
paths such as `/style.css` resolve the way they do in production:

```sh
python3 -m http.server 8000 --directory site
# then open http://localhost:8000
```

## Governance

Development follows the project constitution at `.specify/memory/constitution.md`,
which defines the hosting constraints, accessibility and performance budgets, and
the pre- and post-deploy quality gates. Read it before making changes.
