#!/usr/bin/env node
// Validate every content/hexagons/<slug>.yaml against the cross-domain rules
// the human-readable `_schema.yaml` documents. Source: JAC-1895 §D.
//
// Hand-rolled (no Ajv) because the on-main schema (_schema.yaml) is a
// commented YAML reference, not a JSON Schema; ajv would force us to
// duplicate every constraint into a parallel schema.json that drifts. The
// checks below cover the rules that matter for the hexagon contract:
//   - hexagon_id matches filename stem
//   - all 5 sister domains present + unique
//   - cross_link shape `<domain>/<slug>` and recognized domain
//   - presence of the anchor block + required scalar fields
//   - season_window matches `YYYY-(spring|summer|fall|winter)`

import { readdirSync, readFileSync } from 'node:fs';
import { join, basename, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, '..');
const HEX_DIR = join(REPO, 'content/hexagons');

const SISTER_DOMAINS = ['k-food', 'k-pop', 'k-beauty', 'k-travel', 'k-literature'];
const ALL_DOMAINS = new Set(['k-drama', ...SISTER_DOMAINS]);
const SEASON_RE = /^[0-9]{4}-(spring|summer|fall|winter)$/;
const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function listManifests(dir) {
  return readdirSync(dir)
    .filter((name) => extname(name) === '.yaml' && !name.startsWith('_'))
    .map((name) => join(dir, name));
}

function validateAnchor(manifest, file, errors) {
  const a = manifest.anchor;
  if (!a || typeof a !== 'object') {
    errors.push(`${file}: missing anchor block`);
    return;
  }
  if (a.domain !== 'k-drama') {
    errors.push(`${file}: anchor.domain must be "k-drama" (got ${JSON.stringify(a.domain)})`);
  }
  for (const f of ['title_ko', 'title_en', 'year', 'network']) {
    if (a[f] === undefined || a[f] === null || String(a[f]).trim() === '') {
      errors.push(`${file}: anchor.${f} is required`);
    }
  }
  if (a.year !== undefined && (typeof a.year !== 'number' || a.year < 1900 || a.year > 2100)) {
    errors.push(`${file}: anchor.year must be an integer 1900–2100 (got ${a.year})`);
  }
}

function validateSisters(manifest, file, errors) {
  const sisters = manifest.sisters;
  if (!Array.isArray(sisters)) {
    errors.push(`${file}: sisters must be an array`);
    return;
  }
  const seen = new Set();
  for (const s of sisters) {
    if (!s || !s.domain) {
      errors.push(`${file}: sister entry missing domain`);
      continue;
    }
    if (seen.has(s.domain)) {
      errors.push(
        `${file}: duplicate sister domain "${s.domain}" — each of ${SISTER_DOMAINS.join(', ')} must appear exactly once`,
      );
    }
    if (!SISTER_DOMAINS.includes(s.domain)) {
      errors.push(`${file}: sister domain "${s.domain}" is not one of ${SISTER_DOMAINS.join(', ')}`);
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
  // Each cross_link is `<domain>/<slug>`. The slug may point at a sibling
  // sister's seed within this hexagon OR at an out-of-cluster article;
  // integrity here is shape + recognized domain. K-drama uses slug "anchor"
  // as the canonical pointer to this manifest's own k-drama anchor.
  const sisters = manifest.sisters || [];
  for (const s of sisters) {
    const links = (s && s.cross_links) || [];
    if (!Array.isArray(links)) {
      errors.push(`${file}: cross_links in ${s.domain} must be an array`);
      continue;
    }
    for (const link of links) {
      if (typeof link !== 'string') {
        errors.push(`${file}: cross_link in ${s.domain} must be a string (got ${typeof link})`);
        continue;
      }
      const [domainPart, slugPart] = link.split('/');
      if (!domainPart || !slugPart) {
        errors.push(`${file}: cross_link "${link}" in ${s.domain} is not domain/slug shaped`);
        continue;
      }
      if (!ALL_DOMAINS.has(domainPart)) {
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
    if (!manifest || typeof manifest !== 'object') {
      errors.push(`${file}: manifest is not a YAML object`);
      continue;
    }
    if (!manifest.hexagon_id) {
      errors.push(`${file}: missing hexagon_id`);
    } else if (!SLUG_RE.test(manifest.hexagon_id)) {
      errors.push(`${file}: hexagon_id "${manifest.hexagon_id}" must be lowercase kebab-case`);
    } else if (manifest.hexagon_id !== stem) {
      errors.push(`${file}: hexagon_id "${manifest.hexagon_id}" does not match filename stem "${stem}"`);
    }
    if (!manifest.season_window) {
      errors.push(`${file}: missing season_window`);
    } else if (!SEASON_RE.test(manifest.season_window)) {
      errors.push(`${file}: season_window "${manifest.season_window}" must match YYYY-(spring|summer|fall|winter)`);
    }
    validateAnchor(manifest, file, errors);
    validateSisters(manifest, file, errors);
    validateCrossLinks(manifest, file, errors);
  }

  if (errors.length) {
    for (const e of errors) console.error(`✗ ${e}`);
    console.error(`\n[validate-hexagon] ${errors.length} problem(s) across ${files.length} manifest(s)`);
    process.exit(1);
  }

  console.log(`[validate-hexagon] ${files.length} manifest(s) ok`);
}

main();
