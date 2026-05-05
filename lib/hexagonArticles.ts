// Hexagon article frontmatter helpers — JAC-1896 §A.
//
// New hexagon-mode articles ship with a YAML frontmatter `images:` array
// (one hero + ≥1 inline). This module provides the typed shape, a minimal
// frontmatter reader (no yaml dependency — the shape is well-known), and
// rendering helpers for the credit / license footer that every published
// article must surface per CCO/CC-BY licensing requirements.
//
// Source-of-truth schema: n8n-workflows/_lib/hexagon-input-contract.md.
// Workflow validator (writes pass/fail at draft time): n8n-workflows/_lib/hexagon-self-checks.js.
// Publish-time validator (CLI): scripts/hexagon/validate-article.mjs.

import fs from 'fs';
import {
  formatCreditFooter as formatCreditFooterImpl,
  formatImageCredit as formatImageCreditImpl,
  type HexagonImage,
  type HexagonImageRole,
  type ImageSource,
  type SeasonalTone,
} from './hexagonCredits';

export type { HexagonImage, HexagonImageRole, ImageSource, SeasonalTone };

export interface HexagonArticleFrontmatter {
  title?: string;
  slug?: string;
  category?: string;
  language?: 'ko' | 'en';
  hexagon?: string;
  anchor_backlink?: { label: string; path: string } | null;
  cross_links?: Array<{ label: string; path: string }>;
  tags?: string[];
  images: HexagonImage[];
}

const IMAGE_SOURCE_WHITELIST = new Set<ImageSource>([
  'unsplash',
  'pexels',
  'pixabay',
  'wikimedia',
  'cc0',
  'cc-by',
]);

const VALID_TONES = new Set<SeasonalTone>(['spring', 'summer', 'fall', 'winter']);

/**
 * Read a hexagon article (`.md`) from disk and return its parsed frontmatter
 * plus body. Returns `null` if the file is missing or has no frontmatter.
 *
 * The parser is intentionally minimal: it understands top-level scalars and
 * the `images:` list-of-mappings shape. Anything more exotic should bypass
 * this helper.
 */
export function loadHexagonArticle(
  filepath: string,
): { frontmatter: HexagonArticleFrontmatter; body: string } | null {
  if (!fs.existsSync(filepath)) return null;
  const text = fs.readFileSync(filepath, 'utf-8');
  if (!text.startsWith('---')) return null;
  const end = text.indexOf('\n---', 3);
  if (end === -1) return null;
  const fmRaw = text.slice(3, end).trim();
  const body = text.slice(end + 4).trimStart();
  return { frontmatter: parseFrontmatter(fmRaw), body };
}

/** True iff the image array satisfies JAC-1896 §B (used by smoke tests). */
export function imagesMeetSpec(images: HexagonImage[]): boolean {
  if (!Array.isArray(images) || images.length < 2) return false;
  const heroes = images.filter((im) => im.role === 'hero');
  const inlines = images.filter((im) => /^inline(_\d+)?$/.test(String(im.role)));
  if (heroes.length !== 1 || inlines.length < 1) return false;
  for (const im of images) {
    if (!IMAGE_SOURCE_WHITELIST.has(im.source)) return false;
    if (!VALID_TONES.has(im.seasonal_tone)) return false;
    for (const f of ['source', 'asset_id', 'license', 'credit', 'seasonal_tone'] as const) {
      if (!im[f] || String(im[f]).trim() === '') return false;
    }
    if (!im.alt_text_ko?.trim() || !im.alt_text_en?.trim()) return false;
  }
  return true;
}

/**
 * Re-exports of the canonical credit/license formatters. The implementations
 * live in `./hexagonCredits` so the admin client bundle (no `fs`) can import
 * them without dragging this server-side module into the browser.
 */
export const formatImageCredit = formatImageCreditImpl;
export const formatCreditFooter = formatCreditFooterImpl;

// ---- internal: minimal YAML frontmatter parser ----

function parseFrontmatter(src: string): HexagonArticleFrontmatter {
  const lines = src.split('\n');
  const fm: Record<string, unknown> = {};
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim() || line.trim().startsWith('#')) {
      i++;
      continue;
    }
    const indent = line.match(/^ */)![0].length;
    if (indent !== 0) {
      i++;
      continue;
    }
    const colon = line.indexOf(':');
    if (colon === -1) {
      i++;
      continue;
    }
    const key = line.slice(0, colon).trim();
    const valRaw = line.slice(colon + 1).trim();

    if (valRaw === '') {
      const block: string[] = [];
      i++;
      while (i < lines.length) {
        const nl = lines[i];
        if (nl.trim() === '' || (nl.length > 0 && nl[0] !== ' ' && nl[0] !== '\t')) break;
        block.push(nl);
        i++;
      }
      const isList = block.some((l) => /^\s*-\s/.test(l));
      fm[key] = isList ? parseListOfMappings(block) : parseFlatMapping(block);
    } else {
      fm[key] = stripQuotes(valRaw);
      i++;
    }
  }
  return fm as unknown as HexagonArticleFrontmatter;
}

function parseFlatMapping(lines: string[]): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const l of lines) {
    if (!l.trim() || l.trim().startsWith('#')) continue;
    const colon = l.indexOf(':');
    if (colon === -1) continue;
    out[l.slice(0, colon).trim()] = stripQuotes(l.slice(colon + 1).trim());
  }
  return out;
}

function parseListOfMappings(lines: string[]): Array<Record<string, unknown>> {
  const items: Array<Record<string, unknown>> = [];
  let cur: Record<string, unknown> | null = null;
  for (const l of lines) {
    if (!l.trim() || l.trim().startsWith('#')) continue;
    const trimmed = l.trim();
    if (trimmed.startsWith('- ')) {
      if (cur) items.push(cur);
      cur = {};
      const rest = trimmed.slice(2);
      if (rest.includes(':')) {
        const [k, ...vp] = rest.split(':');
        cur[k.trim()] = stripQuotes(vp.join(':').trim());
      }
    } else if (cur) {
      const colon = trimmed.indexOf(':');
      if (colon === -1) continue;
      cur[trimmed.slice(0, colon).trim()] = stripQuotes(trimmed.slice(colon + 1).trim());
    }
  }
  if (cur) items.push(cur);
  return items;
}

function stripQuotes(v: string): string {
  if (typeof v !== 'string') return v;
  const t = v.trim();
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
    return t.slice(1, -1);
  }
  return t;
}
