// Site-wide easter-egg listeners (FR-019; contracts/components.md). This module is on every page,
// so it stays tiny: Svelte and the egg component are fetched only when an egg is triggered.
import { KONAMI, createSequenceMatcher, createTapCounter, shouldIgnoreEvent } from '../lib/eggs.ts';

type Origin = { x: number; y: number };
type EggProps = { reducedMotion: boolean; origin: Origin; onEnd: () => void };

type EggDefinition = {
  id: string;
  keyTrigger: string[];
  /** Touch path: tap the target element `taps` times within `withinMs`. */
  touchTrigger: { target: string; taps: number; withinMs: number };
  pages: string[] | '*';
  maxDurationMs: number;
  load: () => Promise<{ default: import('svelte').Component<EggProps> }>;
};

const EGGS: EggDefinition[] = [
  {
    id: 'curve-bloom',
    keyTrigger: KONAMI,
    // The footer © line, not the site mark: the site mark is a link, so tapping it navigates.
    touchTrigger: { target: '[data-egg-target]', taps: 5, withinMs: 2000 },
    pages: '*',
    maxDurationMs: 6000,
    load: () => import('../islands/eggs/CurveBloom.svelte'),
  },
];

let playing = false;

async function play(egg: EggDefinition, origin: Origin) {
  if (playing) return;
  playing = true;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const [{ mount, unmount }, module] = await Promise.all([import('svelte'), egg.load()]);

  const host = document.createElement('div');
  host.dataset.egg = egg.id;
  host.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:1000;';
  document.body.append(host);

  let timer = 0;
  let instance: Record<string, unknown> | undefined;
  const end = () => {
    if (!playing) return;
    window.clearTimeout(timer);
    window.removeEventListener('keydown', onEscape);
    if (instance) void unmount(instance);
    host.remove();
    playing = false;
  };
  const onEscape = (event: KeyboardEvent) => {
    if (event.key === 'Escape') end();
  };

  window.addEventListener('keydown', onEscape);
  timer = window.setTimeout(end, egg.maxDurationMs);
  instance = mount(module.default, { target: host, props: { reducedMotion, origin, onEnd: end } });
}

const active = EGGS.filter((egg) => egg.pages === '*' || egg.pages.includes(window.location.pathname));
const center = (): Origin => ({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

for (const egg of active) {
  const matches = createSequenceMatcher(egg.keyTrigger);
  window.addEventListener('keydown', (event) => {
    if (event.repeat || shouldIgnoreEvent(event.target as HTMLElement | null)) return;
    if (matches(event.key)) void play(egg, center());
  });

  const tapped = createTapCounter(egg.touchTrigger.taps, egg.touchTrigger.withinMs);
  document.addEventListener('click', (event) => {
    const target = (event.target as Element | null)?.closest(egg.touchTrigger.target);
    if (!target || !tapped(event.timeStamp)) return;
    const box = target.getBoundingClientRect();
    void play(egg, { x: box.left + box.width / 2, y: box.top + box.height / 2 });
  });
}

// A hello for anyone who opens the developer console.
console.info(
  '%cHi, curious engineer.%c\nThis site is plain HTML from Astro, with Svelte only where things move.\nSource: https://github.com/athenafung1/athenafung1.github.io\nPsst: try ↑ ↑ ↓ ↓ ← → ← → B A.',
  'font: 600 14px/1.4 Georgia, serif; color: #b3401d',
  'font: 12px/1.5 system-ui, sans-serif',
);
