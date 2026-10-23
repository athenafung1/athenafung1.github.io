<script lang="ts">
  // The About page's work-and-education timeline. The entry list (newest first, the current role
  // leading) scrolls past a sticky harmonograph. The reading line (30% down the screen beside a wide
  // drawing, or below the drawing when it sits on top) sets the time the drawing shows, so the bottom
  // of the list shows the first entry's single circle and each entry above adds the next, up to the
  // whole flower at the top. The entry at the reading line, or under the pointer, lights its circle;
  // clicking a circle scrolls to its entry. Play runs from the first entry up to now; scrolling hands
  // control back. Every entry is in the HTML list, so the drawing is decoration on top of content, and
  // without JavaScript it shows the finished flower.
  import { onMount } from 'svelte';
  import { formatYears, scrollTime, type TimelineEntry } from '../../lib/timeline.ts';
  import TimelineFlower from './TimelineFlower.svelte';
  import { TimelineState } from './timeline.svelte.ts';

  let { entries }: { entries: TimelineEntry[] } = $props();

  const PLAY_MS = 9000;
  const SCROLL_KEYS = new Set(['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ']);

  // svelte-ignore state_referenced_locally
  const timeline = new TimelineState(entries);
  const { listed } = timeline;
  const activeEntry = $derived(timeline.entries.find((entry) => entry.id === timeline.active) ?? null);

  let visualEl: HTMLDivElement;
  let listEl: HTMLOListElement;
  let items: HTMLElement[] = [];
  let mounted = $state(false); // the Play button only appears once it can work
  let play = $state<'idle' | 'playing' | 'paused'>('idle');
  let follow = true; // scrolling drives the time until Play takes over
  let reduced = false;
  let wide: MediaQueryList | null = null;
  let raf = 0;
  let last = 0;

  const latestBy = (time: number) => [...timeline.entries].reverse().find((entry) => entry.start <= time)?.id ?? null;

  function readingLine() {
    if (wide?.matches) return innerHeight * 0.3;
    const bottom = visualEl.getBoundingClientRect().bottom;
    return bottom + (innerHeight - bottom) * 0.3;
  }

  function sync() {
    if (!follow) return;
    const line = readingLine();
    const tops = items.map((item) => item.getBoundingClientRect().top);
    let index = -1;
    for (let i = 0; i < tops.length; i++) if (tops[i] <= line) index = i;
    let fraction = 0;
    if (index >= 0) {
      const next = index + 1 < items.length ? tops[index + 1] : tops[index] + items[index].offsetHeight;
      fraction = (line - tops[index]) / Math.max(1, next - tops[index]);
    }
    // At the very bottom of the page the oldest entry counts as read, even if it can't reach the line.
    if (scrollY + innerHeight >= document.documentElement.scrollHeight - 2 && index >= 0) {
      index = items.length - 1;
      fraction = 1;
    }
    timeline.scrolledId = listed[Math.max(0, index)].id;
    timeline.target = scrollTime(listed, timeline.max, index, fraction);
    kick();
  }

  function frame(now: number) {
    const dt = Math.min(64, now - last);
    last = now;
    if (play === 'playing') {
      timeline.target = Math.min(timeline.max, timeline.target + (dt * (timeline.max - timeline.min)) / PLAY_MS);
      timeline.scrolledId = latestBy(timeline.target);
      if (timeline.target === timeline.max) play = 'idle';
    }
    const k = reduced ? 1 : 1 - Math.exp(-dt / 120);
    timeline.time += (timeline.target - timeline.time) * k;
    if (Math.abs(timeline.target - timeline.time) < 1e-4) timeline.time = timeline.target;
    raf = play === 'playing' || timeline.time !== timeline.target ? requestAnimationFrame(frame) : 0;
  }

  function kick() {
    if (raf) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }

  function togglePlay() {
    if (play === 'playing') {
      play = 'paused';
      return;
    }
    if (play === 'idle') timeline.target = timeline.time = timeline.min;
    follow = false;
    play = 'playing';
    kick();
  }

  onMount(() => {
    reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    wide = matchMedia('(min-width: 60rem)');
    items = Array.from(listEl.querySelectorAll<HTMLElement>(':scope > [data-entry]'));
    mounted = true;

    // Snap to the scroll position on load rather than easing in from the whole flower.
    sync();
    timeline.time = timeline.target;

    let queued = 0;
    const onScroll = () => {
      if (!queued) queued = requestAnimationFrame(() => ((queued = 0), sync()));
    };
    // A deliberate scroll hands control back to the list after Play. (Not touchstart or every key:
    // those also precede a tap or keypress on the Play button itself.)
    const takeBack = (event: Event) => {
      if (follow) return;
      if (event instanceof KeyboardEvent && (!SCROLL_KEYS.has(event.key) || (event.target as Element).closest('button'))) return;
      follow = true;
      play = 'idle';
      timeline.pinned = null;
      sync();
    };

    const entryOf = (target: EventTarget | null) =>
      target instanceof Element ? (target.closest('[data-entry]')?.getAttribute('data-entry') ?? null) : null;
    const over = (event: PointerEvent) => {
      if (event.pointerType === 'mouse') timeline.pinned = entryOf(event.target);
    };
    const leave = () => (timeline.pinned = null);
    const click = (event: MouseEvent) => {
      const id = entryOf(event.target);
      if (id) timeline.jump(id);
    };

    timeline.jump = (id) => {
      const item = items.find((el) => el.dataset.entry === id);
      if (!item) return;
      follow = true;
      play = 'idle';
      const top = scrollY + item.getBoundingClientRect().top - readingLine() + 2;
      scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
    };

    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll);
    for (const type of ['wheel', 'touchmove', 'keydown'] as const) addEventListener(type, takeBack, { passive: true });
    for (const el of [visualEl, listEl]) {
      el.addEventListener('pointerover', over);
      el.addEventListener('pointerleave', leave);
    }
    visualEl.addEventListener('click', click);

    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(queued);
      removeEventListener('scroll', onScroll);
      removeEventListener('resize', onScroll);
      for (const type of ['wheel', 'touchmove', 'keydown'] as const) removeEventListener(type, takeBack);
    };
  });
</script>

<div class="timeline" class:is-focusing={timeline.focusing}>
  <div class="timeline__visual" bind:this={visualEl}>
    <div class="timeline__stage">
      <TimelineFlower {timeline} />
    </div>
    <div class="timeline__bar">
      <p class="timeline__now" aria-hidden="true">
        <span class="label">{formatYears(timeline.time)}</span>
        {#if activeEntry}
          <span class="timeline__active">{activeEntry.role}, {activeEntry.orgShort}</span>
        {/if}
      </p>
      {#if mounted}
        <button type="button" class="timeline__play" onclick={togglePlay}>
          {play === 'playing' ? 'Pause' : play === 'paused' ? 'Resume' : 'Play through'}
        </button>
      {/if}
    </div>
  </div>

  <ol class="timeline__list" role="list" bind:this={listEl}>
    {#each listed as entry, index (entry.id)}
      <li class="entry" class:entry--lead={index === 0 && entry.ongoing} class:is-lit={timeline.isLit(entry.id)} data-entry={entry.id}>
        <p class="label entry__meta">
          <span>{entry.period}</span>
          <!-- <span>{entry.kind === 'work' ? 'Work' : 'Education'}</span> -->
        </p>
        <h3 class="entry__title">
          {entry.title}
          <span class="entry__org">{entry.org}</span>
        </h3>
        {#if entry.summary}<p>{entry.summary}</p>{/if}
        {#if entry.details}<p>{entry.details}</p>{/if}
        {#if entry.highlights}
          <ul class="entry__highlights">
            {#each entry.highlights as highlight}<li>{highlight}</li>{/each}
          </ul>
        {/if}
      </li>
    {/each}
  </ol>
</div>

<style>
  .timeline {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: var(--space-l);
  }

  /* Narrow screens: the drawing sticks to the top and the list scrolls under it, kept short so most
     of the screen is the list. */
  .timeline__visual {
    position: sticky;
    top: 0;
    z-index: 2;
    display: grid;
    grid-template-columns: minmax(0, 1fr); /* the one-line caption truncates instead of widening it */
    grid-template-rows: minmax(0, 1fr) auto;
    gap: var(--space-2xs);
    height: 38svh;
    padding-block: var(--space-2xs);
    background: var(--color-bg);
    border-block-end: 1px solid var(--color-rule);
  }

  /* The drawing fills the stage exactly; the SVG letterboxes inside it. */
  .timeline__stage {
    position: relative;
    min-height: 0;
  }

  .timeline__stage > :global(*) {
    position: absolute;
    inset: 0;
  }

  .timeline__bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-s);
    min-height: 2.25rem;
  }

  /* One line: the date, then the active entry truncated to fit beside the button. */
  .timeline__now {
    display: flex;
    flex: 1;
    align-items: baseline;
    gap: var(--space-2xs);
    min-width: 0;
    font-size: var(--step--1);
    white-space: nowrap;
  }

  .timeline__now .label {
    font-size: var(--step-0);
    color: var(--color-text);
  }

  .timeline__active {
    overflow: hidden;
    min-width: 0;
    font-weight: 600;
    text-overflow: ellipsis;
    color: var(--color-accent);
  }

  .timeline__play {
    flex: none;
    min-height: 2.25rem;
    padding: 0.3em 0.9em;
    border: 1px solid var(--color-border);
    border-radius: 999px;
    background: transparent;
    font-size: var(--step--1);
    font-weight: 600;
    cursor: pointer;
  }

  @media (hover: hover) {
    .timeline__play:hover {
      border-color: var(--color-accent);
      color: var(--color-accent);
    }
  }

  .timeline__list {
    display: grid;
    max-width: var(--measure);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .entry {
    display: grid;
    gap: var(--space-2xs);
    padding-block: var(--space-s);
    padding-inline-start: var(--space-s);
    border-block-start: 1px solid var(--color-rule);
    border-inline-start: 3px solid transparent;
    transition:
      opacity var(--dur) var(--ease),
      border-color var(--dur) var(--ease);
  }

  .entry.is-lit {
    border-inline-start-color: var(--color-accent);
  }

  .is-focusing .entry:not(.is-lit) {
    opacity: 0.45;
  }

  .entry > p:not(.label) {
    color: var(--color-muted);
  }

  .entry__meta {
    display: flex;
    flex-wrap: wrap;
    gap: 0 var(--space-s);
  }

  .entry__title {
    display: grid;
    gap: var(--space-3xs);
  }

  .entry__org {
    font-family: var(--font-text);
    font-size: var(--step-0);
    font-weight: 500;
    color: var(--color-muted);
  }

  .entry__highlights {
    padding-inline-start: 1.1em;
  }

  /* The current role leads with more room. */
  .entry--lead {
    gap: var(--space-xs);
    padding-block: var(--space-l);
  }

  .entry--lead .entry__title {
    font-size: var(--step-3);
  }

  .entry--lead .entry__org {
    font-size: var(--step-1);
  }

  .entry--lead > p:not(.label),
  .entry--lead .entry__highlights {
    font-size: var(--step-1);
    color: var(--color-text);
  }

  /* Wide screens: the drawing sits beside the list and stays in view while it scrolls; the list gets
     the larger share so the content leads. */
  @media (min-width: 60rem) {
    .timeline {
      grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
      align-items: start;
      column-gap: var(--space-xl);
    }

    .timeline__visual {
      grid-column: 2;
      grid-row: 1;
      top: var(--space-m);
      height: calc(100svh - 2 * var(--space-m));
      max-height: 34rem; /* short enough to stay stuck until the footer, so the last state stays whole */
      border: 0;
    }

    /* Room below the last entry so it can reach the reading line. (Narrow screens go without: the
       drawing sits over the top of the list there, and reaching the page bottom selects it anyway.) */
    .timeline__list {
      grid-column: 1;
      grid-row: 1;
      padding-block-end: 25svh;
    }
  }
</style>
