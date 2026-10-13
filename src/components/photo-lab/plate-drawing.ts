// Client side: a chain of spinning circles draws a photo's line drawing on blank paper, then the
// photo develops. Shared by the "Drawn by the harmonograph" and "Film strip, drawn" displays; the
// markup is DrawnPlate.astro. A plate is waiting (blank paper marked with the rose), drawing, or developed.
//
// The drawing is the photo's strongest edges joined into one closed path (scripts/prepare-photos.mjs,
// served per photo by /photo-lab/traces/<id>.json). Its Fourier series gives the circles; the pen
// lifts while they travel between strokes.
import { dft, type Coefficient } from '../../lib/fourier.ts';
import { fitCanvas, watchTheme, type ThemeColors } from '../../islands/canvas-kit.ts';

const TERMS = 300; // circles in the chain: enough for a recognisable drawing

export type DrawState = 'waiting' | 'drawing' | 'developed';
type Trace = { points: number[]; lifts: [number, number][] };

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
  /** The DC term (the drawing's centre) first, then the largest circles. */
  private circles: Coefficient[] = [];
  /** Where the circles put the pen at each sample, in units of the photo's height. */
  private drawn: { x: number; y: number }[] = [];
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
        if (trace) this.prepare(trace);
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

  private prepare(trace: Trace) {
    const n = trace.points.length / 2;
    if (n < 8) return;
    const path = Array.from({ length: n }, (_, k) => ({ x: (trace.points[2 * k] / 1000) * this.aspect, y: trace.points[2 * k + 1] / 1000 }));
    const all = dft(path);
    const centre = all.find((c) => c.frequency === 0)!;
    const rest = all.filter((c) => c.frequency !== 0).sort((a, b) => b.amplitude - a.amplitude);
    this.circles = [centre, ...rest.slice(0, TERMS - 1)];
    this.drawn = path.map((_, k) => {
      let x = 0;
      let y = 0;
      for (const c of this.circles) {
        const angle = (2 * Math.PI * c.frequency * k) / n + c.phase;
        x += c.amplitude * Math.cos(angle);
        y += c.amplitude * Math.sin(angle);
      }
      return { x, y };
    });
    this.lifted = new Array<boolean>(n).fill(false);
    for (const [first, last] of trace.lifts) for (let k = first; k <= last; k++) this.lifted[k] = true;
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

    // The chain of circles at this moment, from the drawing's centre out to the pen.
    let x = circles[0].amplitude * Math.cos(circles[0].phase);
    let y = circles[0].amplitude * Math.sin(circles[0].phase);
    const arms: [number, number][] = [[x, y]];
    ctx.lineWidth = 1;
    ctx.strokeStyle = colors.muted;
    ctx.globalAlpha = 0.4;
    ctx.beginPath();
    for (const c of circles.slice(1)) {
      const r = c.amplitude * unit;
      if (r >= 1.5) {
        ctx.moveTo(x * unit + r, y * unit);
        ctx.arc(x * unit, y * unit, r, 0, Math.PI * 2);
      }
      const angle = 2 * Math.PI * c.frequency * t + c.phase;
      x += c.amplitude * Math.cos(angle);
      y += c.amplitude * Math.sin(angle);
      arms.push([x, y]);
    }
    ctx.stroke();
    ctx.globalAlpha = 0.85;
    ctx.beginPath();
    arms.forEach(([ax, ay], i) => (i ? ctx.lineTo(ax * unit, ay * unit) : ctx.moveTo(ax * unit, ay * unit)));
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.fillStyle = colors.text;
    ctx.beginPath();
    ctx.arc(x * unit, y * unit, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}
