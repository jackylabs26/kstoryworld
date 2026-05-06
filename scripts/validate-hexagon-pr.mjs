#!/usr/bin/env node
// JAC-2051 — per-PR hexagon validator. Runs against a worktree (or git ref
// range) to catch hexagon contract violations BEFORE a content review PR
// is merged. Lives alongside `validate-hexagon.mjs`; both share the rules
// in `scripts/lib/hexagon-rules.mjs` so the in-repo full-scan gate and
// this per-PR gate cannot drift.
//
// Why this exists: PR #18 (JAC-1988) merged a hexagon backfill that bypassed
// every contract check (filename↔hexagon_id mismatch, partial sister
// coverage, etc.). The n8n→GitHub adapter (board-routine/content-pr-adapter.sh,
// JAC-1984) now invokes this validator after staging files into the
// ephemeral worktree and before opening the PR. On failure the adapter
// still opens the PR but adds the `merge-blocked` label and posts the
// errors as a PR comment.
//
// Usage:
//   node scripts/validate-hexagon-pr.mjs --worktree <path> [--base <git-ref>]
//   node scripts/validate-hexagon-pr.mjs --dryrun-json <path>
//   node scripts/validate-hexagon-pr.mjs --manifest <path>
//
// --worktree:    walks `git diff --name-only <base>..HEAD` inside the worktree,
//                validates any added/modified hexagon manifests + hexagon-mode
//                article frontmatter (`hexagon: <id>`).
// --dryrun-json: parses an n8n dry-run sample; if `hexagon_id` is set, validates
//                an embedded `hexagon_manifest` (when present) and the
//                `draft.{ko,en}.images` arrays.
// --manifest:    validates a single manifest file (used by ad-hoc CLI checks).
//
// Output:
//   stdout: a single JSON line {ok, mode, detected, errors, scanned}
//   stderr: human-readable lines (one per error) for caller log capture
//
// Exit codes:
//   0 — ok (passed) OR no hexagon content detected (skipped)
//   1 — hexagon content detected AND validation failed
//   2 — invocation error (bad args, missing files, parse error)

import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, basename, extname, dirname, relative, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import yaml from 'js-yaml';
import { validateManifest, validateImages } from './lib/hexagon-rules.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(HERE, '..');

function parseArgs(argv) {
  const out = { mode: null, worktree: null, base: 'origin/main', dryrunJson: null, manifest: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    switch (a) {
      case '--worktree':    out.worktree = argv[++i]; out.mode = 'worktree'; break;
      case '--base':        out.base = argv[++i]; break;
      case '--dryrun-json': out.dryrunJson = argv[++i]; out.mode = 'dryrun-json'; break;
      case '--manifest':    out.manifest = argv[++i]; out.mode = 'manifest'; break;
      case '-h': case '--help':
        printHelpAndExit(0); break;
      default:
        process.stderr.write(`[validate-hexagon-pr] unknown arg: ${a}\n`);
        printHelpAndExit(2);
    }
  }
  if (!out.mode) {
    process.stderr.write('[validate-hexagon-pr] one of --worktree, --dryrun-json, --manifest is required\n');
    printHelpAndExit(2);
  }
  return out;
}

function printHelpAndExit(code) {
  process.stderr.write([
    'usage:',
    '  node scripts/validate-hexagon-pr.mjs --worktree <path> [--base <git-ref>]',
    '  node scripts/validate-hexagon-pr.mjs --dryrun-json <path>',
    '  node scripts/validate-hexagon-pr.mjs --manifest <path>',
    '',
  ].join('\n'));
  process.exit(code);
}

function emitResult(result, exitCode) {
  process.stdout.write(JSON.stringify(result) + '\n');
  for (const e of result.errors) process.stderr.write(`✗ ${e}\n`);
  process.exit(exitCode);
}

function loadYaml(path, errors) {
  try {
    return yaml.load(readFileSync(path, 'utf8'));
  } catch (e) {
    errors.push(`${path}: YAML parse error — ${e.message}`);
    return null;
  }
}

function loadJson(path, errors) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (e) {
    errors.push(`${path}: JSON parse error — ${e.message}`);
    return null;
  }
}

// Minimal frontmatter extractor — same shape as lib/hexagonArticles.ts.
// We only need the top-level `hexagon` scalar and the `images:` list, so we
// re-parse the YAML block with js-yaml (this script already imports it).
function loadArticleFrontmatter(path, errors) {
  const text = readFileSync(path, 'utf8');
  if (!text.startsWith('---')) return null;
  const end = text.indexOf('\n---', 3);
  if (end === -1) return null;
  const fmRaw = text.slice(3, end).trim();
  try {
    const fm = yaml.load(fmRaw);
    return fm && typeof fm === 'object' ? fm : null;
  } catch (e) {
    errors.push(`${path}: frontmatter YAML parse error — ${e.message}`);
    return null;
  }
}

function listChangedFiles(worktree, base) {
  // Use `git diff --name-status` so we can skip deletions.
  const out = execSync(
    `git -C ${JSON.stringify(worktree)} diff --name-status ${JSON.stringify(base)}..HEAD`,
    { encoding: 'utf8' },
  );
  const files = [];
  for (const line of out.split('\n')) {
    if (!line.trim()) continue;
    const [status, ...rest] = line.split('\t');
    if (!status || status.startsWith('D')) continue;
    const path = rest[rest.length - 1];
    if (path) files.push(path);
  }
  return files;
}

function modeWorktree(worktree, base) {
  const errors = [];
  const detected = { manifests: [], articles: [] };
  let scanned = 0;

  if (!existsSync(worktree) || !statSync(worktree).isDirectory()) {
    return { ok: false, mode: 'worktree', detected, errors: [`worktree not a directory: ${worktree}`], scanned, fatal: true };
  }

  let changed;
  try {
    changed = listChangedFiles(worktree, base);
  } catch (e) {
    return { ok: false, mode: 'worktree', detected, errors: [`git diff failed: ${e.message}`], scanned, fatal: true };
  }

  for (const rel of changed) {
    if (rel.startsWith('content/hexagons/') && extname(rel) === '.yaml' && !basename(rel).startsWith('_')) {
      const abs = join(worktree, rel);
      if (!existsSync(abs)) continue;
      const stem = basename(rel, '.yaml');
      const manifest = loadYaml(abs, errors);
      if (manifest) validateManifest(manifest, rel, stem, errors);
      detected.manifests.push(rel);
      scanned++;
    } else if (rel.startsWith('content/') && extname(rel) === '.md') {
      const abs = join(worktree, rel);
      if (!existsSync(abs)) continue;
      const fm = loadArticleFrontmatter(abs, errors);
      if (!fm || !fm.hexagon) continue; // only hexagon-mode articles
      detected.articles.push(rel);
      scanned++;
      if (!Array.isArray(fm.images)) {
        errors.push(`${rel}: hexagon-mode article missing images: array`);
        continue;
      }
      validateImages(fm.images, rel, errors);
    }
  }

  const detectedAny = detected.manifests.length > 0 || detected.articles.length > 0;
  return {
    ok: errors.length === 0,
    mode: 'worktree',
    detected,
    detectedAny,
    errors,
    scanned,
  };
}

function modeDryrunJson(jsonPath) {
  const errors = [];
  const detected = { manifests: [], articles: [] };

  if (!existsSync(jsonPath)) {
    return { ok: false, mode: 'dryrun-json', detected, errors: [`dryrun JSON not found: ${jsonPath}`], scanned: 0, fatal: true };
  }
  const raw = loadJson(jsonPath, errors);
  if (!raw) return { ok: false, mode: 'dryrun-json', detected, errors, scanned: 0, fatal: true };

  // n8n samples sometimes wrap content under `final_output`.
  const root = (raw && typeof raw === 'object' && raw.final_output && typeof raw.final_output === 'object')
    ? raw.final_output
    : raw;

  const hexagonId = root.hexagon_id || (root.metadata && root.metadata.hexagon_id) || null;
  const embeddedManifest = root.hexagon_manifest || null;
  const draft = root.draft || {};
  const koImages = (draft.ko && Array.isArray(draft.ko.images)) ? draft.ko.images : null;
  const enImages = (draft.en && Array.isArray(draft.en.images)) ? draft.en.images : null;

  if (!hexagonId && !embeddedManifest && !koImages && !enImages) {
    // Not hexagon-mode — skip cleanly.
    return { ok: true, mode: 'dryrun-json', detected, detectedAny: false, errors, scanned: 0 };
  }

  if (embeddedManifest) {
    detected.manifests.push(`<dryrun:${basename(jsonPath)}>:hexagon_manifest`);
    validateManifest(embeddedManifest, `<dryrun>:hexagon_manifest`, hexagonId || null, errors);
  } else if (hexagonId) {
    // Hexagon mode declared but no embedded manifest — that's fine if the
    // manifest is already on main; we cannot validate it here. Note in detected
    // so the caller knows the dryrun referenced an existing hexagon.
    detected.manifests.push(`<dryrun:${basename(jsonPath)}>:references=${hexagonId}`);
  }

  if (koImages) {
    detected.articles.push(`<dryrun:${basename(jsonPath)}>:draft.ko.images`);
    validateImages(koImages, `<dryrun>:draft.ko.images`, errors);
  } else if (hexagonId) {
    errors.push(`<dryrun>: hexagon mode declared but draft.ko.images missing`);
  }
  if (enImages) {
    detected.articles.push(`<dryrun:${basename(jsonPath)}>:draft.en.images`);
    validateImages(enImages, `<dryrun>:draft.en.images`, errors);
  }

  return {
    ok: errors.length === 0,
    mode: 'dryrun-json',
    detected,
    detectedAny: true,
    errors,
    scanned: detected.manifests.length + detected.articles.length,
  };
}

function modeManifest(manifestPath) {
  const errors = [];
  const detected = { manifests: [], articles: [] };
  if (!existsSync(manifestPath)) {
    return { ok: false, mode: 'manifest', detected, errors: [`manifest not found: ${manifestPath}`], scanned: 0, fatal: true };
  }
  const stem = basename(manifestPath, '.yaml');
  const manifest = loadYaml(manifestPath, errors);
  if (manifest) validateManifest(manifest, manifestPath, stem, errors);
  detected.manifests.push(manifestPath);
  return {
    ok: errors.length === 0,
    mode: 'manifest',
    detected,
    detectedAny: true,
    errors,
    scanned: 1,
  };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  let result;
  switch (args.mode) {
    case 'worktree':    result = modeWorktree(args.worktree, args.base); break;
    case 'dryrun-json': result = modeDryrunJson(args.dryrunJson); break;
    case 'manifest':    result = modeManifest(args.manifest); break;
  }
  // Exit code policy:
  //   - fatal invocation error → 2
  //   - hexagon detected + errors present → 1
  //   - no hexagon detected → 0 (skip path; the adapter treats this as no-op)
  //   - hexagon detected + clean → 0
  let exitCode;
  if (result.fatal) exitCode = 2;
  else if (result.detectedAny && !result.ok) exitCode = 1;
  else exitCode = 0;
  emitResult(result, exitCode);
}

main();
