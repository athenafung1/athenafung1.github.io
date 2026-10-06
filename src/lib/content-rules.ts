// Content rules enforced at build time (content schemas, getStaticPaths) and after the build
// (scripts/check-content.mjs). Erasable TypeScript only, so Node 24 can import this file directly.

export type Hit = { match: string; index: number };

// Case-sensitive on purpose: "No." is protected, "no." ending a sentence is not.
const ABBREVIATIONS = ['e.g.', 'E.g.', 'i.e.', 'I.e.', 'etc.', 'vs.', 'approx.', 'cf.', 'et al.', 'Dr.', 'Mr.', 'Ms.', 'Mrs.', 'Prof.', 'Jr.', 'Sr.', 'St.', 'No.', 'U.S.'];
const DOT = '․'; // one-dot leader: stands in for protected periods

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Sentences end at . ! ? (plus closing quotes/brackets) followed by whitespace or end of text. */
export function countSentences(text: string): number {
  let t = text.trim();
  if (!t) return 0;
  t = t.replace(/\bhttps?:\/\/\S+/g, (url) => url.replace(/[.!?]/g, DOT));
  for (const abbr of ABBREVIATIONS) {
    t = t.replace(new RegExp(`(^|[\\s(])${escapeRegExp(abbr)}`, 'g'), (m) => m.replace(/\./g, DOT));
  }
  const parts = t.split(/[.!?]+["'”’)\]]*(?=\s|$)/);
  return parts.filter((p) => /[\p{L}\p{N}]/u.test(p)).length;
}

function stripFencedCode(markdown: string): string {
  return markdown.replace(/^(```|~~~)[^\n]*\n[\s\S]*?^\1[ \t]*$/gm, '');
}

/** Words in Markdown prose, ignoring code fences, image/link targets and syntax characters. */
export function countWords(markdown: string): number {
  const prose = stripFencedCode(markdown)
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[#>*_`~|-]+/g, ' ');
  const tokens = prose.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w));
  return tokens.length;
}

/** Level-2 headings Problem, Approach, Outcome must appear in that order (FR-033). */
export function hasDetailSections(markdown: string): boolean {
  const headings = [...stripFencedCode(markdown).matchAll(/^##[ \t]+(.+?)[ \t#]*$/gm)].map((m) =>
    m[1].trim().toLowerCase(),
  );
  let position = -1;
  for (const required of ['problem', 'approach', 'outcome']) {
    const found = headings.indexOf(required, position + 1);
    if (found === -1) return false;
    position = found;
  }
  return true;
}

/** A Markdown/HTML image or a fenced code block counts as a supporting visual (FR-033). */
export function hasVisualOrCode(markdown: string): boolean {
  if (/!\[[^\]]*\]\([^)]+\)/.test(markdown)) return true;
  if (/<(img|picture|svg)\b/i.test(markdown)) return true;
  return /^(```|~~~)[^\n]*\n[\s\S]*?^\1[ \t]*$/m.test(markdown);
}

function collect(text: string, pattern: RegExp): Hit[] {
  return [...text.matchAll(pattern)].map((m) => ({ match: m[0], index: m.index ?? 0 }));
}

// A number may not continue into other digits ("2022-2026", "24.21.0"), but a sentence-ending
// period after it is fine.
const US_PHONE = /(?<!\d)(?<!\d\.)(?:\+?1[\s.-]?)?(?:\(\d{3}\)\s?|\d{3}[\s.-])\d{3}[\s.-]\d{4}(?!\d)(?!\.\d)/g;
const INTL_PHONE = /(?<![\w+])\+(?!1[\s.-]?\(?\d{3})\d{1,3}(?:[\s.-]?\d{1,4}){2,5}(?!\d)(?!\.\d)/g;

export function findPhoneNumbers(text: string): Hit[] {
  const hits = [...collect(text, US_PHONE), ...collect(text, INTL_PHONE)];
  return hits.sort((a, b) => a.index - b.index);
}

const STREET_SUFFIX =
  'St|Street|Ave|Avenue|Rd|Road|Blvd|Boulevard|Dr|Drive|Ln|Lane|Way|Ct|Court|Pl|Place|Ter|Terrace|Pkwy|Parkway|Hwy|Highway|Cir|Circle';
const STREET_ADDRESS = new RegExp(
  `\\b\\d{1,6}\\s+(?:(?:[NSEW]|[A-Z][a-z]+)\\.?\\s+){0,4}(?:${STREET_SUFFIX})\\b\\.?`,
  'g',
);

export function findStreetAddresses(text: string): Hit[] {
  // A trailing period belongs to the sentence, not the suffix, unless the suffix is abbreviated.
  return collect(text, STREET_ADDRESS)
    .filter((h) => /\s/.test(h.match))
    .map((h) => ({ ...h, match: h.match.replace(/(Street|Avenue|Road|Boulevard|Drive|Lane|Way|Court|Place|Terrace|Parkway|Highway|Circle)\.$/, '$1') }));
}

const PLACEHOLDERS: RegExp[] = [/lorem ipsum/gi, /placeholder/gi, /\bTODO\b/g, /\bTBD\b/g, /DRAFT:/g];

export function findPlaceholders(text: string): Hit[] {
  return PLACEHOLDERS.flatMap((pattern) => collect(text, pattern)).sort((a, b) => a.index - b.index);
}
