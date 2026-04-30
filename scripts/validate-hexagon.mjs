#!/usr/bin/env node
// Validate every content/hexagons/<slug>.yaml against content/hexagons/schema.json
// plus cross-domain checks the JSON Schema cannot express. Source: JAC-1895 §D.

import { readdirSync, readFileSync } from 'node:fs';
import { join, basename, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import yaml from 'js-yaml';
import Ajv from 'ajv';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, '..');
const HEX_DIR = join(REPO, 'content/hexagons');
const SCHEMA_PATH = join(HEX_DIR, 'schema.json');

const SISTER_DOMAINS = ['k-food', 'k-pop', 'k-beauty', 'k-travel', 'k-literature'];

function readJson(p) {
  return JSON.parse(readFileSync(p, 'utf8'));
}

function listManifests(dir) {
  return readdirSync(dir)
    .filter((name) => extname(name) === '.yaml' && !name.startsWith('_'))
    .map((name) => join(dir, name));
}

function validateSisters(manifest, file, errors) {
  const sisters = manifest.sisters || [];
  const seen = new Set();
  for (const s of sisters) {
    if (!s || !s.domain) continue;
    if (seen.has(s.domain)) {
      errors.push(`${file}: duplicate sister domain "${s.domain}" — each of ${SISTER_DOMAINS.join(', ')} must appear exactly once`);
    }
    seen.add(s.domain);
  }
  for (const required of SISTER_DOMAINS) {
    if (!seen.has(required)) {
      errors.push(`${file}: missing sister domain "${required}" — manifests must include all 5 sister domains`);
    }
  }
}

function validateCrossLinks(manifest, file, errors) {
  // Per SCHEMA.md: each cross_link is `<domain>/<seed-or-anchor-key>`. The slug may
  // point at a sibling sister's seed within this hexagon OR at an out-of-cluster
  // article. Integrity here is "format + recognized domain"; the slug is free-form.
  // For k-drama the canonical key is `anchor`.
  const sisters = manifest.sisters || [];
  const allowedDomainPaths = new Set(['k-drama', ...SISTER_DOMAINS]);
  for (const s of sisters) {
    const links = (s && s.cross_links) || [];
    for (const link of links) {
      if (typeof link !== 'string') continue;
      const [domainPart, slugPart] = link.split('/');
      if (!domainPart || !slugPart) {
        errors.push(`${file}: cross_link "${link}" in ${s.domain} is not domain/slug shaped`);
        continue;
      }
      if (!allowedDomainPaths.has(domainPart)) {
        errors.push(`${file}: cross_link "${link}" in ${s.domain} points to unknown domain "${domainPart}"`);
        continue;
      }
      if (domainPart === 'k-drama' && slugPart !== 'anchor') {
        errors.push(`${file}: cross_link to k-drama must use slug "anchor" (got "${slugPart}")`);
      }
    }
  }
}

function main() {
  const schema = readJson(SCHEMA_PATH);
  const ajv = new Ajv({ allErrors: true, strict: false });
  const validate = ajv.compile(schema);

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
    if (!validate(manifest)) {
      for (const err of validate.errors || []) {
        errors.push(`${file}: ${err.instancePath || '/'} ${err.message}`);
      }
    }
    if (manifest && manifest.hexagon_id && manifest.hexagon_id !== stem) {
      errors.push(`${file}: hexagon_id "${manifest.hexagon_id}" does not match filename stem "${stem}"`);
    }
    if (manifest) {
      validateSisters(manifest, file, errors);
      validateCrossLinks(manifest, file, errors);
    }
  }

  if (errors.length) {
    for (const e of errors) console.error(`✗ ${e}`);
    console.error(`\n[validate-hexagon] ${errors.length} problem(s) across ${files.length} manifest(s)`);
    process.exit(1);
  }

  console.log(`[validate-hexagon] ${files.length} manifest(s) ok`);
}

main();
