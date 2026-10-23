import { describe, expect, it } from 'vitest';
import { formatMusingDate, isoDate, readingMinutes, sortMusings } from '../../src/lib/musings.ts';

const musing = (id: string, date: string) => ({ id, data: { date: new Date(date) } });

describe('sortMusings', () => {
  it('puts the newest first and breaks same-day ties by slug', () => {
    const sorted = sortMusings([musing('b', '2026-10-01'), musing('c', '2026-10-12'), musing('a', '2026-10-12')]);
    expect(sorted.map((n) => n.id)).toEqual(['a', 'c', 'b']);
  });

  it('leaves the original list alone', () => {
    const list = [musing('old', '2025-01-01'), musing('new', '2026-01-01')];
    sortMusings(list);
    expect(list[0].id).toBe('old');
  });
});

describe('readingMinutes', () => {
  it('is at least one minute', () => {
    expect(readingMinutes('A short musing.')).toBe(1);
  });

  it('counts prose at 220 words a minute and skips code blocks', () => {
    const prose = Array.from({ length: 660 }, () => 'word').join(' ');
    const code = '```js\n' + Array.from({ length: 2000 }, () => 'x').join(' ') + '\n```';
    expect(readingMinutes(`${prose}\n\n${code}`)).toBe(3);
  });
});

describe('dates', () => {
  it('shows the day as written, whatever the time zone', () => {
    expect(formatMusingDate(new Date('2026-10-12'))).toBe('12 Oct 2026');
    expect(formatMusingDate(new Date('2026-01-01'))).toBe('1 Jan 2026');
    expect(isoDate(new Date('2026-10-12'))).toBe('2026-10-12');
  });
});
