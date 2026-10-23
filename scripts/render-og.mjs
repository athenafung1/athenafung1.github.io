#!/usr/bin/env node
// Rasterize social-sharing images: every src/assets/og/*.svg → public/og/<name>.png (1200×630).
// PNG on purpose: link-preview services often reject WebP/AVIF (see plan.md Constitution Check).
// Run after editing an OG source SVG, then commit the PNG:  node scripts/render-og.mjs
import { readdir, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceDir = path.join(root, 'src/assets/og');
const outDir = path.join(root, 'public/og');

await mkdir(outDir, { recursive: true });
const sources = (await readdir(sourceDir)).filter((file) => file.endsWith('.svg'));
if (sources.length === 0) {
  console.error(`No SVG sources in ${path.relative(root, sourceDir)}`);
  process.exit(1);
}

for (const file of sources) {
  const target = path.join(outDir, file.replace(/\.svg$/, '.png'));
  const info = await sharp(path.join(sourceDir, file), { density: 72 })
    .resize(1200, 630, { fit: 'fill' })
    .png({ compressionLevel: 9, palette: true, quality: 90 })
    .toFile(target);
  console.log(`${path.relative(root, target)}  ${info.width}×${info.height}  ${(info.size / 1024).toFixed(1)} KB`);
}
