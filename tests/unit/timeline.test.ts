import { describe, expect, it } from 'vitest';
import { buildEntries, formatYears, parsePeriod, scrollTime, shortName, timeSpan, toYears } from '../../src/lib/timeline.ts';

const NOW = 2026.75;

describe('parsePeriod', () => {
  it('reads month ranges, inclusive of the end month', () => {
    expect(parsePeriod('Jan 2024 - Dec 2024', NOW)).toEqual({ start: 2024, end: 2025, ongoing: false });
    expect(parsePeriod('Aug 2020 - Dec 2023', NOW).start).toBeCloseTo(2020 + 7 / 12, 9);
  });

  it('reads seasons and bare years', () => {
    expect(parsePeriod('Summer 2024', NOW)).toEqual({ start: 2024 + 5 / 12, end: 2024 + 8 / 12, ongoing: false });
    expect(parsePeriod('2021', NOW)).toEqual({ start: 2021, end: 2022, ongoing: false });
  });

  it('ends ongoing periods now', () => {
    expect(parsePeriod('2025 - Present', NOW)).toEqual({ start: 2025, end: NOW, ongoing: true });
    expect(parsePeriod('March 2025 – now', NOW).ongoing).toBe(true);
  });

  it('rejects what it cannot read', () => {
    expect(() => parsePeriod('sometime', NOW)).toThrow(/Cannot read/);
    expect(() => parsePeriod('Present', NOW)).toThrow(/start date/);
    expect(() => parsePeriod('2024 - 2022', NOW)).toThrow(/ends before/);
  });
});

describe('dates', () => {
  it('converts dates to decimal years and back to labels', () => {
    expect(toYears(new Date(Date.UTC(2024, 0, 1)))).toBe(2024);
    expect(formatYears(2024 + 5 / 12)).toBe('Jun 2024');
    expect(formatYears(2023.999)).toBe('Dec 2023');
  });

  it('shortens long names to initials', () => {
    expect(shortName('University of Illinois Urbana-Champaign')).toBe('UIUC');
    expect(shortName('NVIDIA')).toBe('NVIDIA');
  });
});

const profile = {
  education: [
    { institution: 'University of Illinois Urbana-Champaign', credential: 'Master of Computer Science', period: 'Jan 2024 - Dec 2024' },
    { institution: 'University of Illinois Urbana-Champaign', credential: 'B.S. Computer Science', period: 'Aug 2020 - Dec 2023' },
  ],
  experience: [
    { organization: 'NVIDIA', title: 'Systems Performance Engineer', period: '2025 - Present', summary: 'a' },
    { organization: 'NVIDIA', title: 'Systems Performance Engineer Intern, Applied Systems', period: 'Summer 2024', summary: 'b' },
    { organization: 'Uber', title: 'Software Engineer Intern, Core Infrastructure', period: 'Summer 2022', summary: 'c' },
  ],
};

describe('buildEntries', () => {
  const entries = buildEntries(profile, NOW);

  it('merges education and work, oldest first, with readable ids', () => {
    expect(entries.map((e) => e.id)).toEqual(['uiuc-2020', 'uber-2022', 'uiuc-2024', 'nvidia-2024', 'nvidia-2025']);
    expect(entries[0].kind).toBe('education');
    expect(entries[3].role).toBe('Systems Performance Engineer Intern');
    expect(entries[4].ongoing).toBe(true);
  });

  it('spans from the first whole year to now', () => {
    expect(timeSpan(entries)).toEqual({ min: 2020, max: NOW });
  });
});

describe('scrollTime', () => {
  const listed = [...buildEntries(profile, NOW)].reverse();

  it('is now above the list and the oldest start below it', () => {
    expect(scrollTime(listed, NOW, -1, 0)).toBe(NOW);
    expect(scrollTime(listed, NOW, listed.length, 0)).toBe(listed[listed.length - 1].start);
  });

  it('runs from the newer entry’s start down to this one’s through each item', () => {
    expect(scrollTime(listed, NOW, 0, 0)).toBe(NOW);
    expect(scrollTime(listed, NOW, 0, 1)).toBe(listed[0].start);
    expect(scrollTime(listed, NOW, 2, 0.5)).toBeCloseTo((listed[1].start + listed[2].start) / 2, 9);
  });
});
