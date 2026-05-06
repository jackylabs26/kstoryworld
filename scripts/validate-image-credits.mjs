#!/usr/bin/env node
// CI check: every image file under public/images/hexagons/<id>/ must have a
// matching credit entry in the sibling _credits.json. Exits non-zero on
// missing credits (warning mode: logs but exits 0 with --warn-only flag).

import { readdirSync, existsSync, readFileSync, statSync } from 'node:fs';
import { join, basename, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, '..');
const IMG_ROOT = join(REPO, 'public/images/hexagons');

const IMAGE_EXTS = new Set(['.webp', '.png', '.jpg', '.jpeg', '.avif']);
const warnOnly = process.argv.includes('--warn-only');

function main() {
  if (!existsSync(IMG_ROOT)) {
    console.log('[validate-image-credits] public/images/hexagons/ does not exist — skipping');
    return;
  }

  const hexDirs = readdirSync(IMG_ROOT).filter((name) => {
    const full = join(IMG_ROOT, name);
    return statSync(full).isDirectory() && !name.startsWith('.');
  });

  if (hexDirs.length === 0) {
    console.log('[validate-image-credits] no hexagon image directories found — skipping');
    return;
  }

  const warnings = [];

  for (const hexId of hexDirs) {
    const hexDir = join(IMG_ROOT, hexId);
    const creditsFile = join(hexDir, '_credits.json');

    const imageFiles = readdirSync(hexDir).filter(
      (f) => IMAGE_EXTS.has(extname(f).toLowerCase()) && !f.startsWith('_'),
    );

    if (imageFiles.length === 0) continue;

    if (!existsSync(creditsFile)) {
      warnings.push(`${hexId}/: has ${imageFiles.length} image(s) but no _credits.json`);
      continue;
    }

    let credits;
    try {
      credits = JSON.parse(readFileSync(creditsFile, 'utf8'));
    } catch (e) {
      warnings.push(`${hexId}/_credits.json: invalid JSON — ${e.message}`);
      continue;
    }

    if (!Array.isArray(credits)) {
      warnings.push(`${hexId}/_credits.json: root must be an array`);
      continue;
    }

    const credited = new Set(credits.map((c) => c.filename));

    for (const img of imageFiles) {
      if (!credited.has(img)) {
        warnings.push(`${hexId}/${img}: no credit entry in _credits.json`);
      }
    }

    for (const entry of credits) {
      if (!entry.filename || !entry.source || !entry.credit || !entry.license) {
        warnings.push(
          `${hexId}/_credits.json: entry "${entry.filename || '(unnamed)'}" missing required fields (filename, source, credit, license)`,
        );
      }
    }
  }

  if (warnings.length) {
    for (const w of warnings) console.warn(`⚠ ${w}`);
    console.warn(
      `\n[validate-image-credits] ${warnings.length} warning(s) across ${hexDirs.length} hexagon(s)`,
    );
    if (!warnOnly) process.exit(1);
  } else {
    console.log(`[validate-image-credits] ${hexDirs.length} hexagon(s) — all images credited`);
  }
}

main();
