// State shared by the About timeline's drawing and its entry list: the time the drawing shows
// (driven by scrolling, eased toward its target), the entry under the reading line, and the entry
// the pointer is over. Safe to construct during SSR; AboutTimeline.svelte drives it in the browser.
import { timeSpan, type TimelineEntry } from '../../lib/timeline.ts';

export class TimelineState {
  /** Oldest first. */
  readonly entries: TimelineEntry[];
  /** Newest first, as the list shows them. */
  readonly listed: TimelineEntry[];
  readonly min: number;
  readonly max: number;

  /** The time drawn, eased toward `target`. Starts at now: the whole flower. */
  time = $state(0);
  target = $state(0);
  /** The entry at the reading line; the first (newest) one until anything reaches it. */
  scrolledId = $state<string | null>(null);
  /** The entry the pointer is over, if any. */
  pinned = $state<string | null>(null);

  constructor(entries: TimelineEntry[]) {
    this.entries = entries;
    this.listed = [...entries].reverse();
    const span = timeSpan(entries);
    this.min = span.min;
    this.max = span.max;
    this.time = this.target = this.max;
    this.scrolledId = this.listed[0]?.id ?? null;
  }

  /** Highlighted: the pinned entry, or the one at the reading line. */
  get active(): string | null {
    return this.pinned ?? this.scrolledId;
  }

  isLit(id: string): boolean {
    return this.active === id;
  }

  /** True while the pointer is pinning an entry, so the list can dim the rest. */
  get focusing(): boolean {
    return this.pinned !== null;
  }

  /** Scroll the list to an entry; AboutTimeline replaces this once mounted. */
  jump: (id: string) => void = () => {};
}
