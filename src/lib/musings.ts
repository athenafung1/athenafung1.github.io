// Musings: short write-ups (src/content/musings/<slug>.md), listed at /musings/ and on the landing page.
// Pure, framework-free, erasable TypeScript.
import { countWords } from './content-rules.ts';

type Dated = { id: string; data: { date?: Date } };

/** Newest first, then the undated ones; ties by slug, so the order never depends on file order. */
export function sortMusings<T extends Dated>(musings: readonly T[]): T[] {
  const time = (musing: Dated) => musing.data.date?.getTime() ?? -Infinity;
  return [...musings].sort((a, b) => time(b) - time(a) || a.id.localeCompare(b.id));
}

/** Minutes to read at 220 words a minute, at least one. Code blocks don't count. */
export function readingMinutes(markdown: string): number {
  return Math.max(1, Math.round(countWords(markdown) / 220));
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "12 Oct 2026". Dates are read as written (UTC), so a musing dated the 12th shows the 12th everywhere. */
export function formatMusingDate(date: Date): string {
  return `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

/** "2026-10-12", for the <time datetime> attribute. */
export const isoDate = (date: Date) => date.toISOString().slice(0, 10);
