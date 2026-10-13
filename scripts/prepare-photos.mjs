#!/usr/bin/env node
// Prepare original photos for the Fun page's photography (the film strip at /fun/).
//
//   node scripts/prepare-photos.mjs <photo or folder> [more photos or folders…]
//   node scripts/prepare-photos.mjs --remove <id> [more ids…]
//
// ADDING A PHOTO
//   1. Keep the original anywhere (it is not copied into the repo as is).
//   2. Run:  node scripts/prepare-photos.mjs ~/Pictures/heron.jpg
//      Only the photos you name are processed; every other photo already on the site is kept.
//   3. Add it to src/data/photos.json, where it appears in the order you want it shown:
//        { "id": "heron", "title": "Heron", "alt": "A grey heron standing in shallow water." }
//      The script prints this line for you to fill in. "alt" describes the photo for people who
//      can't see it; the build refuses a photo without one.
//   4. Check it: npm run dev, then the Photography section of /fun/.
//
// REPLACING A PHOTO: run the script on the new original with the same file name; its id stays the
// same, so photos.json needs no change.
// REMOVING A PHOTO: delete its line from src/data/photos.json, then run the script with --remove <id>
// (deletes its prepared image and its entry in photos-meta.json).
//
// WHAT IT WRITES
// For each photo, src/assets/photos/<id>.jpg: turned upright, at most 2000px on the long side, with
// ALL metadata stripped (camera files carry GPS coordinates). What the pages need from the original
// goes into src/data/photos-meta.json instead: the camera settings worth showing (never the
// location), a five-colour palette with a "signature" colour, and a line drawing of the photo's
// strongest edges for the harmonograph to draw (served per photo by src/pages/photos/[id].json.ts). The <id> is the file name in lower case with
// dashes: "Funny Trees.JPG" → "funny-trees".
import { existsSync } from 'node:fs';
import { mkdir, readdir, readFile, stat, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
if (!args.length) {
  console.error('Usage: node scripts/prepare-photos.mjs <photo or folder> [more…]\n       node scripts/prepare-photos.mjs --remove <id> [more ids…]');
  process.exit(1);
}
const outDir = path.join(root, 'src/assets/photos');
const LONG_EDGE = 2000;

// ---------- EXIF: only the camera settings, read straight from the TIFF structure ----------
const TAGS = {
  0x010f: 'make',
  0x0110: 'model',
  0xa434: 'lens',
  0x920a: 'focal',
  0xa405: 'focal35',
  0x829d: 'fnumber',
  0x829a: 'exposure',
  0x8827: 'iso',
  0x9003: 'date',
};
const SIZES = { 1: 1, 2: 1, 3: 2, 4: 4, 5: 8, 7: 1, 9: 4, 10: 8 };

function readExif(buf) {
  if (!buf) return {};
  const tiff = buf.subarray(0, 6).toString('latin1') === 'Exif\0\0' ? 6 : 0;
  const le = buf.toString('latin1', tiff, tiff + 2) === 'II';
  const u16 = (o) => (le ? buf.readUInt16LE(o) : buf.readUInt16BE(o));
  const u32 = (o) => (le ? buf.readUInt32LE(o) : buf.readUInt32BE(o));
  const out = {};
  const raw = {};
  const ifd = (offset) => {
    const at = tiff + offset;
    if (at + 2 > buf.length) return;
    for (let i = 0, n = u16(at); i < n; i++) {
      const e = at + 2 + i * 12;
      const tag = u16(e);
      const type = u16(e + 2);
      const count = u32(e + 4);
      const size = (SIZES[type] ?? 1) * count;
      const data = size > 4 ? tiff + u32(e + 8) : e + 8;
      if (data + size > buf.length) continue;
      let value;
      if (type === 2) value = buf.toString('latin1', data, data + count).replace(/\0+$/, '').trim();
      else if (type === 3) value = u16(data);
      else if (type === 4) value = u32(data);
      else if (type === 5 || type === 10) value = u32(data) / (u32(data + 4) || 1);
      raw[tag] = value;
      if (TAGS[tag]) out[TAGS[tag]] = value;
    }
  };
  ifd(u32(tiff + 4));
  if (raw[0x8769]) ifd(raw[0x8769]); // the Exif sub-IFD holds the exposure settings
  return out;
}

function cameraLine(exif) {
  const camera = {};
  if (exif.model) {
    const brand = (exif.make ?? '').split(/\s+/)[0];
    camera.body = exif.model.toLowerCase().startsWith(brand.toLowerCase()) ? exif.model : `${brand} ${exif.model}`.trim();
  }
  // Phones name their lens after themselves and have tiny real focal lengths, so show the 35 mm
  // equivalent instead of either.
  const phone = /iphone|pixel|galaxy/i.test(exif.model ?? '');
  if (exif.lens && !phone) camera.lens = exif.lens;
  if (phone && exif.focal35) camera.focal = `${exif.focal35} mm`;
  else if (exif.focal) camera.focal = `${Math.round(exif.focal)} mm`;
  if (exif.fnumber) camera.aperture = `ƒ/${Number(exif.fnumber.toFixed(1))}`;
  if (exif.exposure) camera.shutter = exif.exposure >= 1 ? `${Number(exif.exposure.toFixed(1))} s` : `1/${Math.round(1 / exif.exposure)} s`;
  if (exif.iso) camera.iso = `ISO ${exif.iso}`;
  let taken;
  const m = typeof exif.date === 'string' && exif.date.match(/^(\d{4}):(\d{2})/);
  if (m) taken = `${m[1]}-${m[2]}`;
  return { camera, taken };
}

// ---------- Colour: a small k-means palette and its most characterful colour ----------
const hex = ([r, g, b]) => `#${[r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`;
function hsl([r, g, b]) {
  const [R, G, B] = [r / 255, g / 255, b / 255];
  const max = Math.max(R, G, B);
  const min = Math.min(R, G, B);
  const l = (max + min) / 2;
  const d = max - min;
  if (!d) return { h: 0, s: 0, l };
  const s = d / (1 - Math.abs(2 * l - 1));
  const h = max === R ? ((G - B) / d) % 6 : max === G ? (B - R) / d + 2 : (R - G) / d + 4;
  return { h: (h * 60 + 360) % 360, s, l };
}

function palette(pixels, k = 5) {
  // Seed from luminance quantiles so the result is the same every run.
  const byLum = [...pixels].sort((a, b) => a[0] * 0.3 + a[1] * 0.59 + a[2] * 0.11 - (b[0] * 0.3 + b[1] * 0.59 + b[2] * 0.11));
  let centres = Array.from({ length: k }, (_, i) => [...byLum[Math.floor(((i + 0.5) / k) * byLum.length)]]);
  let counts = [];
  for (let round = 0; round < 12; round++) {
    const sums = centres.map(() => [0, 0, 0]);
    counts = centres.map(() => 0);
    for (const p of pixels) {
      let best = 0;
      let bestD = Infinity;
      centres.forEach((c, i) => {
        const d = (p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2 + (p[2] - c[2]) ** 2;
        if (d < bestD) [best, bestD] = [i, d];
      });
      counts[best]++;
      sums[best].forEach((_, j) => (sums[best][j] += p[j]));
    }
    centres = centres.map((c, i) => (counts[i] ? sums[i].map((s) => s / counts[i]) : c));
  }
  const total = pixels.length;
  const colours = centres.map((c, i) => ({ hex: hex(c), share: counts[i] / total, ...hsl(c) })).sort((a, b) => b.share - a.share);
  // Signature: the most saturated colour that still covers a fair part of the frame and isn't near
  // black or white.
  const signature = colours
    .filter((c) => c.l > 0.15 && c.l < 0.88)
    .sort((a, b) => b.s * Math.sqrt(b.share) - a.s * Math.sqrt(a.share))[0] ?? colours[0];
  return { palette: colours.map((c) => ({ hex: c.hex, share: Number(c.share.toFixed(3)) })), signature: signature.hex, hue: Math.round(signature.h) };
}

// ---------- Line drawing: the photo's strongest edges as one path for the harmonograph ----------
// Canny edges on colour (so a green bird on grey-green leaves still has an edge), linked into strokes.
// Strokes are scored by length × edge strength × local sharpness, so an in-focus subject outranks a
// blurred background; strokes much weaker than the photo's best are dropped unless they are long
// (horizons and coastlines carry a picture even when soft). The kept strokes are ordered into one
// tour, nearest end next, and resampled evenly; samples between strokes are marked as pen lifts.
const TRACE = { size: 320, sigma: 1.6, hiPct: 0.82, minHi: 40, loRatio: 0.45, minLen: 24, budget: 2.2, cutoff: 0.35, keepLong: 0.35, samples: 800 };

async function lineDrawing(input) {
  const o = TRACE;
  const { data, info } = await sharp(input).rotate().resize(o.size, o.size, { fit: 'inside' }).removeAlpha().blur(o.sigma).raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h, channels: ch } = info;
  const at = (x, y, c) => data[(Math.min(h - 1, Math.max(0, y)) * w + Math.min(w - 1, Math.max(0, x))) * ch + c];

  // Colour gradient (Di Zenzo's structure tensor over the channels): strength and direction.
  const mag = new Float32Array(w * h);
  const dir = new Uint8Array(w * h);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      let gxx = 0;
      let gyy = 0;
      let gxy = 0;
      for (let c = 0; c < ch; c++) {
        const gx = -at(x - 1, y - 1, c) - 2 * at(x - 1, y, c) - at(x - 1, y + 1, c) + at(x + 1, y - 1, c) + 2 * at(x + 1, y, c) + at(x + 1, y + 1, c);
        const gy = -at(x - 1, y - 1, c) - 2 * at(x, y - 1, c) - at(x + 1, y - 1, c) + at(x - 1, y + 1, c) + 2 * at(x, y + 1, c) + at(x + 1, y + 1, c);
        gxx += gx * gx;
        gyy += gy * gy;
        gxy += gx * gy;
      }
      const theta = 0.5 * Math.atan2(2 * gxy, gxx - gyy);
      const along = 0.5 * (gxx + gyy + (gxx - gyy) * Math.cos(2 * theta) + 2 * gxy * Math.sin(2 * theta));
      mag[y * w + x] = Math.sqrt(Math.max(0, along) / ch);
      const a = ((theta * 180) / Math.PI + 180) % 180;
      dir[y * w + x] = a < 22.5 || a >= 157.5 ? 0 : a < 67.5 ? 1 : a < 112.5 ? 2 : 3;
    }

  // Thin to one-pixel ridges (non-maximum suppression), ignoring the frame's own border.
  const nms = new Float32Array(w * h);
  const across = [[1, 0], [1, 1], [0, 1], [-1, 1]];
  for (let y = 2; y < h - 2; y++)
    for (let x = 2; x < w - 2; x++) {
      const i = y * w + x;
      const [dx, dy] = across[dir[i]];
      if (mag[i] >= mag[(y + dy) * w + x + dx] && mag[i] >= mag[(y - dy) * w + x - dx]) nms[i] = mag[i];
    }

  // Hysteresis: strong ridges, plus weaker ones connected to them. The floor keeps a mostly empty
  // frame (open sky) from promoting faint banding.
  const ridge = [...nms].filter((v) => v > 0).sort((a, b) => a - b);
  const hi = Math.max(o.minHi, ridge[Math.floor(ridge.length * o.hiPct)] ?? 1);
  const lo = hi * o.loRatio;
  const edge = new Uint8Array(w * h);
  const grow = [];
  for (let i = 0; i < w * h; i++)
    if (nms[i] >= hi) {
      edge[i] = 1;
      grow.push(i);
    }
  while (grow.length) {
    const i = grow.pop();
    const x = i % w;
    const y = (i - x) / w;
    for (let dy = -1; dy <= 1; dy++)
      for (let dx = -1; dx <= 1; dx++) {
        const j = (y + dy) * w + x + dx;
        if (!edge[j] && nms[j] >= lo) {
          edge[j] = 1;
          grow.push(j);
        }
      }
  }

  // Link edge pixels into strokes, from loose ends first, going straight on at forks.
  const N8 = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];
  const used = new Uint8Array(w * h);
  const around = (i) => {
    const x = i % w;
    const y = (i - x) / w;
    return N8.map(([dx, dy]) => [x + dx, y + dy])
      .filter(([xx, yy]) => xx >= 0 && yy >= 0 && xx < w && yy < h && edge[yy * w + xx])
      .map(([xx, yy]) => yy * w + xx);
  };
  const walk = (start) => {
    const path = [start];
    used[start] = 1;
    let cur = start;
    let prev = -1;
    for (;;) {
      const next = around(cur).filter((j) => !used[j]);
      if (!next.length) break;
      let pick = next[0];
      if (prev >= 0 && next.length > 1) {
        const px = (cur % w) - (prev % w);
        const py = Math.floor(cur / w) - Math.floor(prev / w);
        let best = -Infinity;
        for (const j of next) {
          const straight = ((j % w) - (cur % w)) * px + (Math.floor(j / w) - Math.floor(cur / w)) * py;
          if (straight > best) [best, pick] = [straight, j];
        }
      }
      used[pick] = 1;
      path.push(pick);
      prev = cur;
      cur = pick;
    }
    return path;
  };
  const strokes = [];
  for (let i = 0; i < w * h; i++) if (edge[i] && !used[i] && around(i).length === 1) strokes.push(walk(i));
  for (let i = 0; i < w * h; i++) if (edge[i] && !used[i]) strokes.push(walk(i));

  // Sharpness: fine detail in the unblurred image (Laplacian), averaged over a small neighbourhood.
  const { data: g } = await sharp(input).rotate().resize(w, h, { fit: 'fill' }).greyscale().raw().toBuffer({ resolveWithObject: true });
  const lap = new Float32Array(w * h);
  for (let y = 1; y < h - 1; y++)
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      lap[i] = Math.abs(4 * g[i] - g[i - 1] - g[i + 1] - g[i - w] - g[i + w]);
    }
  const sharpness = (i) => {
    const x = i % w;
    const y = (i - x) / w;
    let sum = 0;
    let n = 0;
    for (let dy = -3; dy <= 3; dy++)
      for (let dx = -3; dx <= 3; dx++) {
        const xx = x + dx;
        const yy = y + dy;
        if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
        sum += lap[yy * w + xx];
        n++;
      }
    return sum / n;
  };

  // Score, cut the weak ones, keep the best up to a total length.
  const scored = strokes
    .filter((stroke) => stroke.length >= o.minLen)
    .map((stroke) => {
      const strength = stroke.reduce((a, i) => a + mag[i], 0) / stroke.length;
      const focus = stroke.reduce((a, i) => a + sharpness(i), 0) / stroke.length;
      return { stroke, quality: strength * focus, score: stroke.length * strength * focus };
    })
    .sort((a, b) => b.score - a.score);
  const qualities = scored.map((s) => s.quality).sort((a, b) => b - a);
  const reference = qualities[Math.floor(qualities.length * 0.1)] ?? 0;
  const kept = [];
  let total = 0;
  for (const { stroke, quality } of scored) {
    if (total > o.budget * (w + h) * 2) break;
    if (quality < o.cutoff * reference && stroke.length < o.keepLong * w) continue;
    kept.push(stroke.map((i) => [i % w, Math.floor(i / w)]));
    total += stroke.length;
  }
  if (!kept.length) return { points: [], lifts: [] };

  // One tour: the longest stroke first, then always the nearest stroke end.
  const left = kept.slice(1);
  const tour = [kept[0]];
  let end = kept[0][kept[0].length - 1];
  while (left.length) {
    let best = 0;
    let bestD = Infinity;
    let flip = false;
    left.forEach((stroke, k) => {
      const d0 = Math.hypot(stroke[0][0] - end[0], stroke[0][1] - end[1]);
      const d1 = Math.hypot(stroke[stroke.length - 1][0] - end[0], stroke[stroke.length - 1][1] - end[1]);
      if (d0 < bestD) [best, bestD, flip] = [k, d0, false];
      if (d1 < bestD) [best, bestD, flip] = [k, d1, true];
    });
    const stroke = left.splice(best, 1)[0];
    const oriented = flip ? [...stroke].reverse() : stroke;
    tour.push(oriented);
    end = oriented[oriented.length - 1];
  }

  // Resample the closed loop evenly, jumps included so the circles move smoothly between strokes.
  // lifted[i]: the segment arriving at pts[i] is a jump (pts.length means back to the start).
  const pts = [];
  const lifted = [];
  for (const stroke of tour)
    stroke.forEach((p, k) => {
      lifted.push(k === 0 && pts.length > 0);
      pts.push(p);
    });
  lifted.push(true);
  const lens = [0];
  for (let i = 1; i <= pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i % pts.length];
    lens.push(lens[i - 1] + Math.hypot(b[0] - a[0], b[1] - a[1]));
  }
  const length = lens[lens.length - 1];
  const points = [];
  const lifts = [];
  let seg = 1;
  for (let k = 0; k < o.samples; k++) {
    const target = (length * k) / o.samples;
    while (seg < lens.length - 1 && lens[seg] < target) seg++;
    const f = (target - lens[seg - 1]) / (lens[seg] - lens[seg - 1] || 1);
    const a = pts[seg - 1];
    const b = pts[seg % pts.length];
    points.push(Math.round(((a[0] + (b[0] - a[0]) * f + 0.5) / w) * 1000), Math.round(((a[1] + (b[1] - a[1]) * f + 0.5) / h) * 1000));
    // Pen-up runs as [first, last] sample indices: the segment arriving at each of those samples is a jump.
    if (lifted[seg]) {
      const last = lifts[lifts.length - 1];
      if (last && last[1] === k - 1) last[1] = k;
      else lifts.push([k, k]);
    }
  }
  return { points, lifts };
}

// ---------- Run ----------
const metaFile = path.join(root, 'src/data/photos-meta.json');
const listFile = path.join(root, 'src/data/photos.json');
const IMAGE = /\.(jpe?g|png|webp|tiff?)$/i;

/** "Funny Trees.JPG" → "funny-trees". */
const idOf = (file) =>
  path
    .parse(file)
    .name.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

// Start from what is already there, so naming one photo never drops the others.
const meta = existsSync(metaFile) ? JSON.parse(await readFile(metaFile, 'utf8')) : {};

async function save() {
  // Indented for reading, but arrays of numbers (the traces) on one line each.
  const json = JSON.stringify(meta, null, 2).replace(/\[\s*(-?\d[\d.,\s-]*?)\s*\]/g, (_, list) => `[${list.replace(/\s+/g, '')}]`);
  await writeFile(metaFile, `${json}\n`);
}

if (args[0] === '--remove') {
  for (const id of args.slice(1)) {
    const image = path.join(outDir, `${id}.jpg`);
    if (!meta[id] && !existsSync(image)) {
      console.error(`No photo "${id}" to remove.`);
      continue;
    }
    delete meta[id];
    if (existsSync(image)) await unlink(image);
    console.log(`removed ${id}`);
  }
  await save();
  process.exit(0);
}

// The originals: each argument is a photo, or a folder whose photos are all taken.
const inputs = [];
for (const arg of args) {
  const info = await stat(arg).catch(() => null);
  if (!info) {
    console.error(`Not found: ${arg}`);
    process.exit(1);
  }
  if (info.isDirectory()) {
    for (const file of (await readdir(arg)).filter((f) => IMAGE.test(f)).sort()) inputs.push(path.join(arg, file));
  } else if (IMAGE.test(arg)) inputs.push(arg);
  else console.error(`Skipped (not a JPEG, PNG, WebP or TIFF): ${arg}`);
}

await mkdir(outDir, { recursive: true });
const done = [];
for (const input of inputs) {
  const id = idOf(input);
  const info = await sharp(input).metadata();
  const { camera, taken } = cameraLine(readExif(info.exif));
  // rotate() applies the EXIF orientation; sharp writes no metadata unless asked, so GPS is gone.
  const out = await sharp(input)
    .rotate()
    .resize(LONG_EDGE, LONG_EDGE, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(path.join(outDir, `${id}.jpg`));
  const small = await sharp(input).rotate().resize(64, 64, { fit: 'inside' }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const pixels = [];
  for (let i = 0; i < small.data.length; i += 3) pixels.push([small.data[i], small.data[i + 1], small.data[i + 2]]);
  meta[id] = {
    width: out.width,
    height: out.height,
    ...(taken ? { taken } : {}),
    camera,
    ...palette(pixels),
    trace: await lineDrawing(input),
  };
  done.push(id);
  console.log(`${id}.jpg  ${out.width}×${out.height}  ${(out.size / 1024).toFixed(0)} KB  ${Object.values(camera).join('  ')}`);
}
await save();
console.log(`src/data/photos-meta.json  ${done.length} prepared, ${Object.keys(meta).length} photos in all`);

// What's left to do by hand: list new photos in photos.json (with a title and alt text).
const listed = new Set(JSON.parse(await readFile(listFile, 'utf8').catch(() => '[]')).map((photo) => photo.id));
const unlisted = done.filter((id) => !listed.has(id));
if (unlisted.length) {
  console.log('\nNot shown yet. Add to src/data/photos.json, with a title and a description for "alt":');
  for (const id of unlisted) console.log(`  { "id": "${id}", "title": "", "alt": "" },`);
}
