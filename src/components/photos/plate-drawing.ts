// Client side: a chain of spinning circles draws a photo's line drawing on blank paper, then the
// photo develops. Used by the Fun page's film strip (FilmStrip.astro); the markup is
// DrawnPlate.astro. A plate is waiting (blank paper marked with the site's rose), drawing, or
// developed.
//
// The drawing is the photo's strongest edges joined into one closed path (scripts/prepare-photos.mjs,
// served per photo at /photos/<id>.json and fetched only when needed). Its Fourier series gives the
// circles (src/lib/photo-trace.ts); the pen lifts while they travel between strokes.
import { chainAt, decodeTrace, penPath, traceCircles, type Trace } from '../../lib/photo-trace.ts';
import type { Coefficient } from '../../lib/fourier.ts';
import type { Point } from '../../lib/curves.ts';
import { fitCanvas, watchTheme, type ThemeColors } from '../../islands/canvas-kit.ts';

const TERMS = 300; // circles in the chain: enough for a recognisable drawing

export type DrawState = 'waiting' | 'drawing' | 'developed';

export const prefersStill = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

// One theme watcher and one animation loop for every plate on the page.
let colors: ThemeColors | null = null;
const running = new Set<PlateDrawing>();
let raf = 0;
function loop(now: number) {
  for (const plate of running) plate.frame(now);
  raf = running.size ? requestAnimationFrame(loop) : 0;
}

export class PlateDrawing {
  state: DrawState = 'waiting';
  private readonly ctx: CanvasRenderingContext2D;
  private readonly aspect: number;
  private loading: Promise<void> | null = null;
  private circles: Coefficient[] = [];
  /** Where the circles put the pen at each sample, in units of the photo's height. */
  private drawn: Point[] = [];
  /** lifted[k]: the step arriving at sample k is a jump between strokes, not drawn. */
  private lifted: boolean[] = [];
  private width = 0;
  private height = 0;
  private dpr = 1;
  private start = 0;

  constructor(
    readonly figure: HTMLElement,
    private readonly options: { drawMs: number; onChange?: (plate: PlateDrawing) => void },
  ) {
    const canvas = figure.querySelector('canvas')!;
    this.ctx = canvas.getContext('2d')!;
    this.aspect = Number(figure.dataset.aspect) || 1.5;
    if (!colors) watchTheme(document.body, (c) => (colors = c));
    fitCanvas(canvas, (w, h, dpr) => {
      [this.width, this.height, this.dpr] = [w, h, dpr];
      if (this.state === 'drawing') this.render(performance.now());
    });
    this.setState('waiting');
  }

  /** Fetch the trace and work out the circles, once; safe to call early to have it ready. */
  load(): Promise<void> {
    this.loading ??= fetch(this.figure.dataset.trace ?? '')
      .then((response) => (response.ok ? (response.json() as Promise<Trace>) : null))
      .then((trace) => {
        if (!trace) return;
        const { path, lifted } = decodeTrace(trace, this.aspect);
        if (path.length < 8) return;
        this.circles = traceCircles(path, TERMS);
        this.drawn = penPath(this.circles, path.length);
        this.lifted = lifted;
      })
      .catch(() => {});
    return this.loading;
  }

  /** Draw (or draw again). A plate whose trace can't be loaded simply develops. */
  async begin() {
    if (this.state === 'drawing') return;
    await this.load();
    if (!this.drawn.length) return this.develop();
    this.start = performance.now();
    this.setState('drawing');
    running.add(this);
    if (!raf) raf = requestAnimationFrame(loop);
  }

  develop() {
    running.delete(this);
    this.setState('developed');
  }

  frame(now: number) {
    this.render(now);
    if (now - this.start >= this.options.drawMs) this.develop();
  }

  private setState(state: DrawState) {
    this.state = state;
    for (const name of ['waiting', 'drawing', 'developed'] as const) this.figure.classList.toggle(`is-${name}`, name === state);
    this.options.onChange?.(this);
  }

  private render(now: number) {
    const { ctx, width: w, height: h, dpr, circles, drawn, lifted } = this;
    if (!colors || !w || !drawn.length) return;
    const unit = h; // one unit of the path is the photo's height
    const n = drawn.length;
    const t = Math.min(1, (now - this.start) / this.options.drawMs);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = colors.surface;
    ctx.fillRect(0, 0, w, h);

    // The drawing so far, lifting the pen between strokes.
    const upto = Math.floor(t * n);
    ctx.lineWidth = 1.6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = colors.accent;
    ctx.beginPath();
    for (let k = 1; k <= upto; k++) {
      if (lifted[k % n]) continue;
      const a = drawn[k - 1];
      const b = drawn[k % n];
      ctx.moveTo(a.x * unit, a.y * unit);
      ctx.lineTo(b.x * unit, b.y * unit);
    }
    ctx.stroke();
    if (t >= 1) return;

    // The chain of circles at this moment, from the drawing's centre out to the pen. Each circle
    // turns about the joint before it (circle 0 is the fixed centre, so it isn't drawn).
    const joints = chainAt(circles, t);
    ctx.lineWidth = 1;
    ctx.strokeStyle = colors.muted;
    ctx.globalAlpha = 0.4;
    ctx.beginPath();
    for (let i = 1; i < circles.length; i++) {
      const r = circles[i].amplitude * unit;
      if (r < 1.5) continue;
      const centre = joints[i - 1];
      ctx.moveTo(centre.x * unit + r, centre.y * unit);
      ctx.arc(centre.x * unit, centre.y * unit, r, 0, Math.PI * 2);
    }
    ctx.stroke();
    ctx.globalAlpha = 0.85;
    ctx.beginPath();
    joints.forEach((p, i) => (i ? ctx.lineTo(p.x * unit, p.y * unit) : ctx.moveTo(p.x * unit, p.y * unit)));
    ctx.stroke();
    ctx.globalAlpha = 1;
    const pen = joints[joints.length - 1];
    ctx.fillStyle = colors.text;
    ctx.beginPath();
    ctx.arc(pen.x * unit, pen.y * unit, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}
