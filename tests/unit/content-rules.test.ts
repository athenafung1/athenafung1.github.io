import { describe, expect, it } from 'vitest';
import {
  countSentences,
  countWords,
  findPhoneNumbers,
  findPlaceholders,
  findStreetAddresses,
  hasDetailSections,
  hasVisualOrCode,
} from '../../src/lib/content-rules.ts';

const matches = (hits: { match: string }[]) => hits.map((h) => h.match);

describe('countSentences', () => {
  it('counts simple sentences', () => {
    expect(countSentences('One. Two! Three?')).toBe(3);
    expect(countSentences('Just one sentence.')).toBe(1);
  });

  it('counts a final sentence without terminal punctuation', () => {
    expect(countSentences('First sentence. Second without a period')).toBe(2);
  });

  it('returns 0 for empty or whitespace-only text', () => {
    expect(countSentences('')).toBe(0);
    expect(countSentences('   ')).toBe(0);
  });

  it('does not split on common abbreviations', () => {
    expect(countSentences('Built tools, e.g. a parser and a linter. It shipped.')).toBe(2);
    expect(countSentences('Uses a graph, i.e. a DAG, for scheduling.')).toBe(1);
    expect(countSentences('Supports CSV, JSON, etc. and more.')).toBe(1);
  });

  it('does not split on decimals, version numbers or URLs', () => {
    expect(countSentences('Cut latency by 3.5x with Node 24.1.0 tooling.')).toBe(1);
    expect(countSentences('Live at https://example.com/a.b.c today. Try it.')).toBe(2);
    expect(countSentences('Released v1.2.0 last spring.')).toBe(1);
  });

  it('handles closing quotes and parentheses after punctuation', () => {
    expect(countSentences('It said "done." Then it stopped.')).toBe(2);
    expect(countSentences('A side note (really.) Another one.')).toBe(2);
  });
});

describe('countWords', () => {
  it('counts plain words', () => {
    expect(countWords('one two  three\nfour')).toBe(4);
    expect(countWords('')).toBe(0);
  });

  it('ignores Markdown syntax and image/link URLs', () => {
    expect(countWords('## Title\n\nSome **bold** text with a [link](https://x.y/z).')).toBe(7);
    expect(countWords('![a diagram](./img.png) caption here')).toBe(2);
  });

  it('ignores fenced code blocks', () => {
    expect(countWords('Before\n\n```js\nconst a = 1;\n```\n\nafter')).toBe(2);
  });
});

describe('hasDetailSections', () => {
  it('requires Problem, Approach and Outcome as level-2 headings in order', () => {
    expect(hasDetailSections('## Problem\nx\n## Approach\ny\n## Outcome\nz')).toBe(true);
  });

  it('allows other sections in between and is case-insensitive', () => {
    expect(
      hasDetailSections('## problem\nx\n## Context\n## APPROACH\ny\n## Results\n## Outcome\nz'),
    ).toBe(true);
  });

  it('fails when a section is missing or out of order', () => {
    expect(hasDetailSections('## Problem\n## Approach\n')).toBe(false);
    expect(hasDetailSections('## Approach\n## Problem\n## Outcome\n')).toBe(false);
  });

  it('ignores headings of other levels and headings inside code fences', () => {
    expect(hasDetailSections('# Problem\n### Approach\n## Outcome')).toBe(false);
    expect(hasDetailSections('```md\n## Problem\n## Approach\n## Outcome\n```')).toBe(false);
  });
});

describe('hasVisualOrCode', () => {
  it('is true for a Markdown image', () => {
    expect(hasVisualOrCode('Text\n\n![alt](./a.png)')).toBe(true);
  });

  it('is true for a fenced code block', () => {
    expect(hasVisualOrCode('Text\n\n```ts\nlet a = 1;\n```')).toBe(true);
  });

  it('is false for plain prose and inline code', () => {
    expect(hasVisualOrCode('Just text with `inline` code.')).toBe(false);
  });
});

describe('findPhoneNumbers', () => {
  it('finds US formats', () => {
    expect(matches(findPhoneNumbers('Call (217) 555-0123 now'))).toEqual(['(217) 555-0123']);
    expect(matches(findPhoneNumbers('217-555-0123'))).toEqual(['217-555-0123']);
    expect(matches(findPhoneNumbers('217.555.0123'))).toEqual(['217.555.0123']);
    expect(matches(findPhoneNumbers('+1 217 555 0123'))).toEqual(['+1 217 555 0123']);
  });

  it('finds international formats', () => {
    expect(findPhoneNumbers('Reach me at +44 20 7946 0958.')).toHaveLength(1);
    expect(findPhoneNumbers('+852 9123 4567')).toHaveLength(1);
  });

  it('does not flag years, date ranges or version strings', () => {
    expect(findPhoneNumbers('2022–2026')).toEqual([]);
    expect(findPhoneNumbers('2022-2026 and Summer 2025')).toEqual([]);
    expect(findPhoneNumbers('astro 7.3.5, node 24.21.0, build 2026.10.05')).toEqual([]);
  });
});

describe('findStreetAddresses', () => {
  it('finds a number followed by a street name and suffix', () => {
    expect(matches(findStreetAddresses('Lives at 1234 Maple Street.'))).toEqual([
      '1234 Maple Street',
    ]);
    expect(findStreetAddresses('201 N Goodwin Ave')).toHaveLength(1);
    expect(findStreetAddresses('55 Elm Rd')).toHaveLength(1);
    expect(findStreetAddresses('9 Sunset Blvd')).toHaveLength(1);
  });

  it('does not flag ordinary text', () => {
    expect(findStreetAddresses('Built 3 apps in 2025')).toEqual([]);
    expect(findStreetAddresses('Champaign, Illinois')).toEqual([]);
  });
});

describe('findPlaceholders', () => {
  it('finds placeholder markers', () => {
    expect(findPlaceholders('Lorem ipsum dolor')).toHaveLength(1);
    expect(findPlaceholders('This is a placeholder')).toHaveLength(1);
    expect(findPlaceholders('TODO: write this')).toHaveLength(1);
    expect(findPlaceholders('Date TBD')).toHaveLength(1);
    expect(findPlaceholders('DRAFT: add a summary')).toHaveLength(1);
  });

  it('matches TODO, TBD and DRAFT: case-sensitively', () => {
    expect(findPlaceholders('My Todo app')).toEqual([]);
    expect(findPlaceholders('a todo list, tbd later, a rough draft: v2')).toEqual([]);
  });
});
