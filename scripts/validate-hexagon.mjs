#!/usr/bin/env node
// Validate every content/hexagons/<slug>.yaml against the cross-domain rules
// the human-readable `_schema.yaml` documents. Source: JAC-1895 §D.
//
// Hand-rolled (no Ajv) because the on-main schema (_schema.yaml) is a
// commented YAML reference, not a JSON Schema; ajv would force us to
// duplicate every constraint into a parallel schema.json that drifts. Rules
// live in `scripts/lib/hexagon-rules.mjs` so the per-PR gate
// (`validate-hexagon-pr.mjs`, JAC-2051) shares the exact same logic.

import { readdirSync, readFileSync } from 'node:fs';
import { join, basename, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';
import { validateManifest } from './lib/hexagon-rules.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, '..');
const HEX_DIR = join(REPO, 'content/hexagons');

function listManifests(dir) {
  return readdirSync(dir)
    .filter((name) => extname(name) === '.yaml' && !name.startsWith('_'))
    .map((name) => join(dir, name));
}

function main() {
  const errors = [];
  const files = listManifests(HEX_DIR);

  if (files.length === 0) {
    console.log('[validate-hexagon] no manifests under content/hexagons/');
    return;
  }

  for (const file of files) {
    const stem = basename(file, '.yaml');
    let manifest;
    try {
      manifest = yaml.load(readFileSync(file, 'utf8'));
    } catch (e) {
      errors.push(`${file}: YAML parse error — ${e.message}`);
      continue;
    }
    validateManifest(manifest, file, stem, errors);
  }

  if (errors.length) {
    for (const e of errors) console.error(`✗ ${e}`);
    console.error(`\n[validate-hexagon] ${errors.length} problem(s) across ${files.length} manifest(s)`);
    process.exit(1);
  }

  console.log(`[validate-hexagon] ${files.length} manifest(s) ok`);
}

main();
