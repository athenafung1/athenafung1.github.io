#!/usr/bin/env node
// Post-build content gate. Run after `npm run build`:  node scripts/check-content.mjs [dir]
//
// Scans every HTML page in the build output (default `dist/`) and exits 1 on:
//   - placeholder text: lorem ipsum, placeholder, TODO, TBD, DRAFT:   (FR-029)
//   - phone numbers or street addresses                                (FR-036)
//   - <iframe>, <video> or <audio> on /fun/ (media must be links)      (FR-035)
//   - a PDF still containing the "DRAFT:" marker of the generated stand-in resume (FR-014).
//     Real resumes are compressed PDFs and never match; their privacy check is manual
//     (quickstart §6).
//   - a page without exactly one <title>, duplicate titles, or a missing / out-of-range
//     (50–160 chars) meta description. Legacy redirect stubs (meta refresh) are exempt from the
//     title-uniqueness and description rules; 404.html is exempt from title uniqueness. (FR-028)
// Requires Node ≥ 22.18 (imports the TypeScript rules module via native type stripping).
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { findPhoneNumbers, findPlaceholders, findStreetAddresses } from '../src/lib/content-rules.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.resolve(root, process.argv[2] ?? 'dist');

async function filesWithExtension(dir, extension) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) return filesWithExtension(full, extension);
      return entry.name.endsWith(extension) ? [full] : [];
    }),
  );
  return files.flat();
}

const decode = (text) =>
  text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)));

function visibleText(html) {
  return decode(
    html
      .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
      .replace(/<!--[\s\S]*?-->/g, ' ')
      .replace(/<[^>]+>/g, ' '),
  ).replace(/\s+/g, ' ');
}

function excerpt(text, index, length) {
  const start = Math.max(0, index - 30);
  return `…${text.slice(start, index + length + 30).trim()}…`;
}

const problems = [];
const report = (file, rule, detail) => problems.push(`${path.relative(root, file)}: ${rule}: ${detail}`);

let files;
try {
  files = await filesWithExtension(outDir, '.html');
} catch {
  console.error(`check-content: ${path.relative(root, outDir)}/ not found. Run \`npm run build\` first.`);
  process.exit(1);
}

const titles = new Map();

for (const file of files) {
  const html = await readFile(file, 'utf8');
  const rel = path.relative(outDir, file).split(path.sep).join('/');
  const isStub = /<meta[^>]+http-equiv=["']refresh["']/i.test(html);
  const text = visibleText(html);

  for (const [rule, finder] of [
    ['placeholder', findPlaceholders],
    ['phone number', findPhoneNumbers],
    ['street address', findStreetAddresses],
  ]) {
    for (const hit of finder(text)) report(file, rule, excerpt(text, hit.index, hit.match.length));
  }

  // Also scan attribute text people can see or that crawlers index.
  for (const [, dq, sq] of html.matchAll(/\b(?:alt|title|content|aria-label)=(?:"([^"]*)"|'([^']*)')/gi)) {
    const value = decode(dq ?? sq);
    for (const hit of findPlaceholders(value)) report(file, 'placeholder (attribute)', `${hit.match} in "${value}"`);
  }

  if (rel === 'fun/index.html' && /<(iframe|video|audio)\b/i.test(html)) {
    report(file, 'embedded media', 'the Fun page must link to video/audio, never embed it (FR-035)');
  }

  const titleTags = [...html.matchAll(/<title>([\s\S]*?)<\/title>/gi)].map((m) => decode(m[1]).trim());
  if (titleTags.length !== 1) {
    report(file, 'title', `expected exactly one <title>, found ${titleTags.length}`);
  } else if (!isStub && rel !== '404.html') {
    const seen = titles.get(titleTags[0]);
    if (seen) report(file, 'title', `"${titleTags[0]}" duplicates ${path.relative(root, seen)}`);
    else titles.set(titleTags[0], file);
  }

  if (!isStub) {
    const description = html.match(/<meta[^>]+name=["']description["'][^>]+content=(?:"([^"]*)"|'([^']*)')/i);
    if (!description) report(file, 'description', 'missing meta description');
    else {
      const length = decode(description[1] ?? description[2]).trim().length;
      if (length < 50 || length > 160) report(file, 'description', `length ${length}, expected 50–160`);
    }
  }
}

for (const file of await filesWithExtension(outDir, '.pdf')) {
  const bytes = await readFile(file, 'latin1');
  if (bytes.includes('DRAFT:')) report(file, 'placeholder', 'stand-in PDF still contains "DRAFT:"; replace it');
}

if (problems.length > 0) {
  console.error(`check-content: ${problems.length} problem(s) in ${files.length} page(s)\n`);
  for (const problem of problems) console.error(`  ${problem}`);
  process.exit(1);
}
console.log(`check-content: ${files.length} page(s) clean.`);
