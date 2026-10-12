// The About page's work-and-education timeline: the profile's education and experience as one list
// of dated entries, plus the scroll-to-time mapping the timeline island uses.
// Pure, framework-free, erasable TypeScript.

export type TimelineKind = 'work' | 'education';

export type TimelineEntry = {
  id: string;
  kind: TimelineKind;
  /** Job title or credential, as written in the profile. */
  title: string;
  /** The title up to its first comma, for tight labels. */
  role: string;
  org: string;
  /** Initials for long names ("UIUC"), the name itself otherwise. */
  orgShort: string;
  /** The period exactly as written ("Summer 2024"). */
  period: string;
  /** Decimal years: 2024.5 is the start of July 2024. */
  start: number;
  end: number;
  ongoing: boolean;
  summary?: string;
  details?: string;
  highlights?: string[];
};

type Education = { institution: string; credential: string; period: string; details?: string };
type Experience = { organization: string; title: string; period: string; summary: string; highlights?: string[] };

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
// [first month, month after the last], zero-based.
const SEASONS: Record<string, [number, number]> = {
  winter: [0, 3],
  spring: [0, 5],
  summer: [5, 8],
  fall: [8, 12],
  autumn: [8, 12],
};
const PRESENT = /^(present|now|current|ongoing)$/i;

/** One side of a period ("Jan 2024", "Summer 2024", "2025") as the span of time it names. */
function parsePoint(token: string): { start: number; end: number } {
  const match = token.trim().match(/^(?:([a-z]+)\.?\s+)?(\d{4})$/i);
  if (!match) throw new Error(`Cannot read "${token}" as a date; use "2024", "Jan 2024" or "Summer 2024".`);
  const year = Number(match[2]);
  const word = match[1]?.toLowerCase();
  if (!word) return { start: year, end: year + 1 };
  const season = SEASONS[word];
  if (season) return { start: year + season[0] / 12, end: year + season[1] / 12 };
  const month = MONTHS.indexOf(word.slice(0, 3));
  if (month === -1) throw new Error(`Unknown month or season "${match[1]}" in "${token}".`);
  return { start: year + month / 12, end: year + (month + 1) / 12 };
}

/** "Aug 2020 - Dec 2023", "2025 - Present" or "Summer 2024" → decimal years. */
export function parsePeriod(period: string, now: number): { start: number; end: number; ongoing: boolean } {
  const parts = period.split(/\s*[–—]\s*|\s+-\s+|\s+to\s+/i).filter(Boolean);
  if (parts.length === 1) {
    if (PRESENT.test(parts[0])) throw new Error(`Period "${period}" needs a start date.`);
    return { ...parsePoint(parts[0]), ongoing: false };
  }
  if (parts.length !== 2) throw new Error(`Cannot read period "${period}"; write it as "Start - End".`);
  const start = parsePoint(parts[0]).start;
  const ongoing = PRESENT.test(parts[1]);
  const end = ongoing ? now : parsePoint(parts[1]).end;
  if (end <= start) throw new Error(`Period "${period}" ends before it starts.`);
  return { start, end, ongoing };
}

/** A date as decimal years, e.g. 1 July 2024 → 2024.5. */
export function toYears(date: Date): number {
  const year = date.getUTCFullYear();
  const startOfYear = Date.UTC(year, 0, 1);
  return year + (date.getTime() - startOfYear) / (Date.UTC(year + 1, 0, 1) - startOfYear);
}

/** "Mar 2023" for a decimal year. */
export function formatYears(t: number): string {
  const year = Math.floor(t + 1e-9);
  const month = Math.min(11, Math.floor((t - year) * 12 + 1e-9));
  const name = MONTHS[month];
  return `${name[0].toUpperCase()}${name.slice(1)} ${year}`;
}

/** Long names become their capitalised initials: "University of Illinois Urbana-Champaign" → "UIUC". */
export function shortName(name: string): string {
  if (name.length <= 14) return name;
  const initials = name
    .split(/[\s-]+/)
    .filter((word) => /^[A-Z]/.test(word))
    .map((word) => word[0])
    .join('');
  return initials.length >= 2 ? initials : name;
}

const slug = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/** Education and experience as one list of dated entries, oldest first. */
export function buildEntries(profile: { education: Education[]; experience: Experience[] }, now: number): TimelineEntry[] {
  const raw = [
    ...profile.education.map((item) => ({
      kind: 'education' as const,
      title: item.credential,
      org: item.institution,
      period: item.period,
      details: item.details,
    })),
    ...profile.experience.map((item) => ({
      kind: 'work' as const,
      title: item.title,
      org: item.organization,
      period: item.period,
      summary: item.summary,
      highlights: item.highlights,
    })),
  ];
  const entries = raw.map((item) => ({
    ...item,
    id: '',
    role: item.title.split(',')[0].trim(),
    orgShort: shortName(item.org),
    ...parsePeriod(item.period, now),
  }));
  entries.sort((a, b) => a.start - b.start || (a.kind === b.kind ? 0 : a.kind === 'education' ? -1 : 1));
  const used = new Set<string>();
  for (const entry of entries) {
    const base = `${slug(entry.orgShort)}-${Math.floor(entry.start)}`;
    let id = base;
    for (let n = 2; used.has(id); n++) id = `${base}-${n}`;
    used.add(id);
    entry.id = id;
  }
  return entries;
}

export const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
export const lerp = (a: number, b: number, f: number) => a + (b - a) * f;

/** The span the timeline covers: from the first whole year to the latest end. */
export function timeSpan(entries: Pick<TimelineEntry, 'start' | 'end'>[]): { min: number; max: number } {
  return { min: Math.floor(Math.min(...entries.map((e) => e.start))), max: Math.max(...entries.map((e) => e.end)) };
}

/**
 * Scroll position → time, for a newest-first list. While the reading line moves through item `index`
 * (`fraction` 0→1), time moves from the previous (newer) entry's start down to this one's; the first
 * item starts from `max`. Before the list it is `max`, after it the oldest entry's start.
 */
export function scrollTime(listed: Pick<TimelineEntry, 'start'>[], max: number, index: number, fraction: number): number {
  const n = listed.length;
  const segment = (i: number): [number, number] => [i === 0 ? max : listed[i - 1].start, listed[i].start];
  if (index < 0) return max;
  if (index >= n) return segment(n - 1)[1];
  const [from, to] = segment(index);
  return lerp(from, to, clamp(fraction));
}
