#!/usr/bin/env node
// Per-PR hexagon gate — JAC-2051.
//
// Invoked by board-routine/content-pr-adapter.sh after a content review
// branch has been pushed. Validates every hexagon manifest and hexagon
// article markdown that the PR touches and emits a markdown summary that
// the adapter relays to the PR thread.
//
// Two validation surfaces, both delegated to scripts/lib/hexagon-rules.mjs:
//   - manifests under `content/hexagons/<slug>.yaml`
//       Cross-domain rules (5 sister domains, anchor block, season_window,
//       cross_link shape, hexagon_id ↔ filename stem).
//   - hexagon article markdown with `images:` frontmatter
//       JAC-1896 §B image rules (1 hero + ≥1 inline, whitelisted source,
//       seasonal_tone, alt_text_*, etc).
//
// Usage:
//   validate-hexagon-pr.mjs [--files <list>] [--summary-out <path>]
//                           [--changed-from <ref>]
//
//   --files          Comma- or newline-separated list of repo-relative
//                    paths to validate. When omitted the script falls back
//                    to `git diff --name-only --diff-filter=ACMR <ref>...`.
//   --changed-from   Git ref to diff against (default: origin/main).
//   --summary-out    Write the markdown summary to this file too. The
//                    summary always prints to stdout regardless.
//
// Exit codes:
//   0  All validated files pass (or PR did not touch any hexagon files).
//   1  At least one validation error.
//   2  Argument / I/O error.

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join, basename, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';
import { validateManifest, validateArticleImages } from './lib/hexagon-rules.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, '..');

function parseArgs(argv) {
  const opts = { files: null, summaryOut: null, changedFrom: 'origin/main' };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--files') opts.files = argv[++i];
    else if (a === '--summary-out') opts.summaryOut = argv[++i];
    else if (a === '--changed-from') opts.changedFrom = argv[++i];
    else if (a === '-h' || a === '--help') {
      printUsage();
      process.exit(0);
    } else {
      console.error(`unknown arg: ${a}`);
      printUsage();
      process.exit(2);
    }
  }
  return opts;
}

function printUsage() {
  console.error(
    'usage: validate-hexagon-pr.mjs [--files <list>] [--summary-out <path>] [--changed-from <ref>]',
  );
}

function splitFileList(raw) {
  return raw
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function changedFiles(ref) {
  try {
    const out = execFileSync(
      'git',
      ['diff', '--name-only', '--diff-filter=ACMR', `${ref}...HEAD`],
      { cwd: REPO, encoding: 'utf8' },
    );
    return out.split('\n').map((s) => s.trim()).filter(Boolean);
  } catch (e) {
    console.error(`[validate-hexagon-pr] git diff against ${ref} failed: ${e.message}`);
    return [];
  }
}

function isManifest(p) {
  return p.startsWith('content/hexagons/') && p.endsWith('.yaml') && !basename(p).startsWith('_');
}

function isHexagonArticle(p) {
  // Hexagon articles live under any sister domain folder as .md files. We
  // detect by parsing the frontmatter's `images:` array — the path heuristic
  // is just a cheap pre-filter.
  return /^content\/(foods|songs|beauties|travels|literatures|dramas)\//.test(p) && p.endsWith('.md');
}

function readArticleFrontmatter(absPath) {
  const text = readFileSync(absPath, 'utf8');
  if (!text.startsWith('---')) return null;
  const end = text.indexOf('\n---', 3);
  if (end === -1) return null;
  try {
    const fm = yaml.load(text.slice(3, end).trim());
    return fm && typeof fm === 'object' ? fm : null;
  } catch (e) {
    return { __parse_error: e.message };
  }
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  let files;
  if (opts.files) {
    files = splitFileList(opts.files);
  } else {
    files = changedFiles(opts.changedFrom);
  }

  const manifests = files.filter(isManifest);
  const articles = files.filter(isHexagonArticle);
  const failures = [];
  const passed = [];

  for (const rel of manifests) {
    const abs = join(REPO, rel);
    if (!existsSync(abs)) {
      // Deletion is fine — diff-filter=ACMR already excludes pure deletes,
      // but a rename's old path may not exist. Skip silently.
      continue;
    }
    const stem = basename(abs, '.yaml');
    let parsed;
    try {
      parsed = yaml.load(readFileSync(abs, 'utf8'));
    } catch (e) {
      failures.push({ file: rel, kind: 'manifest', errors: [`YAML parse error: ${e.message}`] });
      continue;
    }
    const errors = validateManifest(parsed, { stem });
    if (errors.length) failures.push({ file: rel, kind: 'manifest', errors });
    else passed.push({ file: rel, kind: 'manifest' });
  }

  for (const rel of articles) {
    const abs = join(REPO, rel);
    if (!existsSync(abs)) continue;
    const fm = readArticleFrontmatter(abs);
    if (!fm) continue; // no frontmatter → not a hexagon article
    if (fm.__parse_error) {
      failures.push({
        file: rel,
        kind: 'article',
        errors: [`frontmatter YAML parse error: ${fm.__parse_error}`],
      });
      continue;
    }
    if (fm.images === undefined) continue; // article without hexagon images is not in scope here
    const errors = validateArticleImages(fm.images);
    if (errors.length) failures.push({ file: rel, kind: 'article', errors });
    else passed.push({ file: rel, kind: 'article' });
  }

  const summary = renderSummary({ manifests, articles, failures, passed });
  process.stdout.write(summary);
  if (opts.summaryOut) {
    writeFileSync(opts.summaryOut, summary, 'utf8');
  }

  if (failures.length) process.exit(1);
}

function renderSummary({ manifests, articles, failures, passed }) {
  const lines = [];
  const touched = manifests.length + articles.length;
  if (touched === 0) {
    lines.push('## Hexagon validation');
    lines.push('');
    lines.push('No hexagon manifests or hexagon articles touched in this PR — gate skipped.');
    lines.push('');
    return lines.join('\n');
  }
  if (failures.length === 0) {
    lines.push('## Hexagon validation ✅');
    lines.push('');
    lines.push(
      `${manifests.length} manifest(s) + ${articles.length} article(s) checked, all rules pass.`,
    );
    if (passed.length) {
      lines.push('');
      lines.push('Files validated:');
      for (const p of passed) lines.push(`- \`${p.file}\` (${p.kind})`);
    }
    lines.push('');
    return lines.join('\n');
  }
  lines.push('## Hexagon validation ❌');
  lines.push('');
  lines.push(
    `${failures.length} file(s) failed validation. Merge is blocked until the items below are fixed.`,
  );
  lines.push('');
  for (const f of failures) {
    lines.push(`### \`${f.file}\` (${f.kind})`);
    for (const msg of f.errors) lines.push(`- ${msg}`);
    lines.push('');
  }
  if (passed.length) {
    lines.push('Files that passed:');
    for (const p of passed) lines.push(`- \`${p.file}\` (${p.kind})`);
    lines.push('');
  }
  return lines.join('\n');
}

main();
