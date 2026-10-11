// Shared runtime plumbing for canvas pieces (contracts/components.md): DPR-capped sizing, a
// render loop that pauses off-screen and in hidden tabs, reduced-motion detection, and theme
// colours resolved to rgb() strings (canvas can't use CSS light-dark() values directly).

export type ThemeColors = { bg: string; surface: string; text: string; muted: string; rule: string; accent: string };

const TOKENS: Record<keyof ThemeColors, string> = {
  bg: '--color-bg',
  surface: '--color-surface',
  text: '--color-text',
  muted: '--color-muted',
  rule: '--color-rule',
  accent: '--color-accent',
};

export const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Resolve the theme colours now, and call `onChange` whenever the theme switches. */
export function watchTheme(root: HTMLElement, onChange: (colors: ThemeColors) => void): () => void {
  const probe = document.createElement('span');
  probe.style.display = 'none';
  root.append(probe);
  const read = () => {
    const colors = {} as ThemeColors;
    for (const [key, token] of Object.entries(TOKENS) as Array<[keyof ThemeColors, string]>) {
      probe.style.color = `var(${token})`;
      colors[key] = getComputedStyle(probe).color;
    }
    onChange(colors);
  };
  const observer = new MutationObserver(read);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  const scheme = window.matchMedia('(prefers-color-scheme: dark)');
  scheme.addEventListener('change', read);
  read();
  return () => {
    observer.disconnect();
    scheme.removeEventListener('change', read);
    probe.remove();
  };
}

/** Keep the canvas backing store at min(devicePixelRatio, maxDpr) × its CSS size. */
export function fitCanvas(canvas: HTMLCanvasElement, onResize: (cssWidth: number, cssHeight: number, dpr: number) => void, maxDpr = 2) {
  const observer = new ResizeObserver(() => {
    const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
    onResize(rect.width, rect.height, dpr);
  });
  observer.observe(canvas);
  return () => observer.disconnect();
}

export type Loop = { setPlaying: (playing: boolean) => void; destroy: () => void };

/** rAF loop calling `tick(dtMs)` while playing, on screen, and in a visible tab. */
export function createLoop(root: HTMLElement, tick: (dtMs: number) => void): Loop {
  let playing = false;
  let onScreen = true;
  let raf = 0;
  let last = 0;
  const frame = (now: number) => {
    tick(Math.min(now - last, 64));
    last = now;
    raf = requestAnimationFrame(frame);
  };
  const sync = () => {
    cancelAnimationFrame(raf);
    if (playing && onScreen && !document.hidden) {
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
  };
  const visibility = new IntersectionObserver(([entry]) => {
    onScreen = entry.isIntersecting;
    sync();
  });
  visibility.observe(root);
  document.addEventListener('visibilitychange', sync);
  return {
    setPlaying(next) {
      playing = next;
      sync();
    },
    destroy() {
      cancelAnimationFrame(raf);
      visibility.disconnect();
      document.removeEventListener('visibilitychange', sync);
    },
  };
}

/** Parse "rgb(r, g, b)" from getComputedStyle into numbers (for palettes and alpha blends). */
export function rgb(color: string): [number, number, number] {
  const m = color.match(/\d+(\.\d+)?/g) ?? ['0', '0', '0'];
  return [Number(m[0]), Number(m[1]), Number(m[2])];
}

export const withAlpha = (color: string, alpha: number) => {
  const [r, g, b] = rgb(color);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};
