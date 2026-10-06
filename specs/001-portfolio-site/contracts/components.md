# Contract: Shared Components and Client Behavior

The interfaces that pages, islands and client scripts rely on. Field-level rules are in
[data-model.md](../data-model.md).

## `BaseLayout.astro`

Every page, including project detail pages and 404, uses `BaseLayout`. It is the mechanism behind
FR-030: a page gets the shared shell by using this layout, never by copying markup.

**Props**

```ts
interface Props {
  title: string;          // required, ≤ 60, unique per page
  description: string;    // required, 50–160
  ogImage?: string;       // default '/og/default.png'
  noindex?: boolean;      // default false
}
```

**Slots**: the default slot is the page's `<main>` content. The page supplies exactly one `<h1>`
inside it. The layout renders no `h1`.

**Guarantees** (each page inherits these without doing anything):

| Guarantee | Spec |
|---|---|
| `<html lang="en">`, charset, viewport meta | III |
| Inline theme bootstrap as the first script in `<head>`; no flash of the wrong theme | FR-034 |
| `<title>`, meta description, OG and canonical tags from props + `Astro.site` | FR-028 |
| Font preload and fallback metrics from the Fonts API | IV |
| A skip link to `#main` | III |
| `<header>` with site mark, `SiteNav` (from `nav.yaml`, `aria-current` on the active item) and `ThemeToggle` | FR-002, FR-034 |
| `<main id="main">` wrapping the slot | III |
| `<footer>` with `ContactLinks` (plain `mailto:` and profile links, inline SVG icons with accessible names) | FR-003 |
| `eggs.ts` listener module (≤ 1.5 KB gzipped) | FR-019 |
| Cross-document view transition CSS, disabled under reduced motion | R17 |

**Whitespace**: Astro 7's default `compressHTML: 'jsx'` removes whitespace between adjacent
inline elements. Components must use `{' '}` or CSS `gap` wherever words sit in separate inline
elements.

## `ThemeToggle.astro` + `src/scripts/theme.ts`

- Markup: `<button type="button" class="theme-toggle" aria-pressed="false" hidden>` with a
  visible icon and an accessible name ("Dark theme").
- Without JavaScript: stays `hidden`, and the page follows the device setting.
- With JavaScript: the script un-hides it and sets `aria-pressed` to whether dark is active. On
  click it toggles `data-theme` on `<html>` and writes `localStorage.theme`. While nothing is
  stored, it tracks `prefers-color-scheme` changes live.
- Storage failure: the toggle still works for the current page view, and nothing is thrown.
- Contract for the inline bootstrap: it reads `localStorage.theme` inside try/catch, and if it is
  `"light"` or `"dark"` sets `document.documentElement.dataset.theme` before any stylesheet
  paints. It must stay small enough to inline (≤ 400 bytes).

## `PieceFrame.astro` + interactive piece islands

**PieceFrame props**

```ts
interface Props {
  id: string;        // section anchor on /fun/
  name: string;      // visible <h2>/<h3>
  idea: string;      // caption: the math behind it
}
```

**Slot**: a single default slot. The page places the island there with its fallback as
children:

```astro
<PieceFrame id="fourier-sketch" name="Fourier Sketch" idea="…">
  <FourierSketch client:visible><FourierFallback /></FourierSketch>
</PieceFrame>
```

Astro renders the children as static HTML inside the island, and the island shows them until it
mounts. PieceFrame can't inject slot content into another slotted component, so pairing the
island with its fallback is the page's job.

**Every island MUST**:

| Behavior | Spec |
|---|---|
| Render its `children` (the fallback) until mounted, then replace them with the live view | FR-017, edge case "Scripting disabled" |
| Be operable by mouse, touch and keyboard. Every action available by pointer has a button or slider equivalent | FR-017, FR-024 |
| Expose visible controls: at minimum **play/pause** and **reset** | US4 scenario 2 |
| Start paused and offer a **step** control under `prefers-reduced-motion: reduce` | FR-026 |
| Pause when off screen (`IntersectionObserver`) or tab hidden (`visibilitychange`), and resume when visible | Performance goals |
| Cap canvas backing resolution at `devicePixelRatio ≤ 2` and redraw on resize | R8 |
| Set `touch-action: none` only on the drawing surface, never on the frame, so the page still scrolls | R8 |
| Keep math and state transitions in `src/lib/` (unit-tested), with the component handling only rendering and events | Constitution (unit tests) |
| Make no network requests and load no third-party code | FR-035, IV |
| Give the canvas an accessible name and a live text summary of the current state (e.g. "Drawing with 24 of 128 terms") | III |

## Easter eggs: `src/scripts/eggs.ts` + `src/islands/eggs/*.svelte`

**Registration (in `eggs.ts`)**

```ts
interface EggDefinition {
  id: string;
  keyTrigger: string[];                 // key sequence, e.g. ['ArrowUp', 'ArrowUp', ...]
  touchTrigger: { target: string; taps: number; withinMs: number };
  pages: string[] | '*';
  maxDurationMs: number;                // ≤ 6000
  load: () => Promise<{ default: Component }>;
}
```

**Runtime contract**:
- The listener module imports no Svelte code. The component and Svelte runtime are fetched by
  `load()` only on trigger.
- The egg mounts into a single overlay root:
  `position: fixed; inset: 0; pointer-events: none; z-index` above content. It must never cover
  interactive content in a way that intercepts input (FR-019), and must never change document
  layout or scroll position.
- Ends after `maxDurationMs`, on `Esc`, or on a tap or click on the egg's own dismiss affordance.
  It then unmounts and the overlay root is removed.
- Under reduced motion it shows a static card (≤ 6 s or until dismissed) instead of animating.
- Triggers are ignored while focus is in a text input, so typing is never hijacked.
- Never re-triggers while playing.

## `Picture.astro`

A wrapper over `astro:assets` `<Picture>` with `formats={['avif', 'webp']}`, explicit
`width`/`height`, responsive `widths`, and `loading="lazy"` unless an `eager` prop is passed.
`alt` is required (`decorative` produces `alt=""`). This is the only way to render content
images.
