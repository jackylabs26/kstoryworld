#!/usr/bin/env node
// Hexagon publish-time validator (JAC-1893)
// Runs self-check #14 (anchor_backlink_present) + #15 (images_present_with_license, seasonal_tone)
// against rendered article files (HTML or Markdown with YAML frontmatter).
//
// Usage:
//   node scripts/hexagon/validate-article.mjs <article-path> [--anchor-url <url>] [--publish-month YYYY-MM]
//   node scripts/hexagon/validate-article.mjs --hexagon content/hexagons/<slug>.yaml
//
// Exit 0 = pass, exit 1 = fail (publish blocked). JSON report written to stdout.

import fs from 'node:fs';
import path from 'node:path';

const IMAGE_SOURCE_WHITELIST = new Set([
  'unsplash', 'pexels', 'pixabay', 'wikimedia', 'cc0', 'cc-by',
]);
const REQUIRED_IMAGE_FIELDS = ['source', 'asset_id', 'license', 'credit', 'seasonal_tone'];
const REQUIRED_ALT_FIELDS = ['alt_text_ko', 'alt_text_en'];

export function defaultSeasonalTone(publishMonth) {
  // publishMonth: "YYYY-MM"
  const m = parseInt(String(publishMonth || '').slice(5, 7), 10);
  if (m >= 4 && m <= 6) return 'spring';
  if (m >= 7 && m <= 9) return 'summer';
  if (m >= 10 && m <= 12) return 'fall';
  if (m >= 1 && m <= 3) return 'winter';
  return null;
}

function extractFrontmatter(text) {
  if (!text.startsWith('---')) return { frontmatter: null, body: text };
  const end = text.indexOf('\n---', 3);
  if (end === -1) return { frontmatter: null, body: text };
  const fmRaw = text.slice(3, end).trim();
  const body = text.slice(end + 4).trimStart();
  return { frontmatter: parseFrontmatter(fmRaw), body };
}

// Targeted extractor for the hexagon frontmatter shape (avoids adding a yaml dep).
// Recognizes: top-level scalars, top-level `images:` array of mappings.
function parseFrontmatter(src) {
  const lines = src.split('\n');
  const fm = {};
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim() || line.trim().startsWith('#')) { i++; continue; }
    const indent = line.match(/^ */)[0].length;
    if (indent !== 0) { i++; continue; }
    const colon = line.indexOf(':');
    if (colon === -1) { i++; continue; }
    const key = line.slice(0, colon).trim();
    const valRaw = line.slice(colon + 1).trim();

    if (valRaw === '') {
      // expect indented block (array of mappings or nested mapping)
      const block = [];
      i++;
      while (i < lines.length) {
        const nl = lines[i];
        if (nl.trim() === '' || (nl.length && nl[0] !== ' ' && nl[0] !== '\t')) break;
        block.push(nl);
        i++;
      }
      // Decide: is it a list (any line starts with "- ") or mapping?
      const isList = block.some((l) => /^\s*-\s/.test(l));
      if (isList) {
        fm[key] = parseListOfMappings(block);
      } else {
        fm[key] = parseFlatMapping(block);
      }
    } else {
      fm[key] = stripQuotes(valRaw);
      i++;
    }
  }
  return fm;
}

function parseFlatMapping(lines) {
  const out = {};
  for (const l of lines) {
    if (!l.trim() || l.trim().startsWith('#')) continue;
    const colon = l.indexOf(':');
    if (colon === -1) continue;
    out[l.slice(0, colon).trim()] = stripQuotes(l.slice(colon + 1).trim());
  }
  return out;
}

function parseListOfMappings(lines) {
  const items = [];
  let cur = null;
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

function stripQuotes(v) {
  if (typeof v !== 'string') return v;
  const t = v.trim();
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
    return t.slice(1, -1);
  }
  return t;
}

function extractHtmlMeta(html) {
  const meta = {};
  const metaRe = /<meta\s+name=["']([^"']+)["']\s+content=["']([^"']*)["']\s*\/?>/gi;
  let m;
  while ((m = metaRe.exec(html)) !== null) meta[m[1]] = m[2];
  const titleM = html.match(/<title>([^<]*)<\/title>/i);
  if (titleM) meta.title = titleM[1];
  return meta;
}

function extractHtmlImages(html) {
  const images = [];
  const imgRe = /<img\s+([^>]*?)\/?>([^]*?)(?=<img|<\/body>|<h\d|<p\s+class="image-credit"|<p\s|<\/?(?:div|section))/gi;
  // Simpler: pair each <img> with its following <p class="image-credit">…</p> if any
  const imgTagRe = /<img\s+([^>]*)\/?>/gi;
  let mi;
  while ((mi = imgTagRe.exec(html)) !== null) {
    const attrs = mi[1];
    const src = (attrs.match(/src=["']([^"']+)["']/i) || [])[1] || '';
    const alt = (attrs.match(/alt=["']([^"']*)["']/i) || [])[1] || '';
    const after = html.slice(mi.index + mi[0].length, mi.index + mi[0].length + 600);
    const credit = (after.match(/<p\s+class=["']image-credit["'][^>]*>([\s\S]*?)<\/p>/i) || [])[1] || '';
    images.push({ src, alt, credit_html: credit.trim() });
  }
  return images;
}

function looksLikeWhitelistedSource(creditOrSrc) {
  const s = (creditOrSrc || '').toLowerCase();
  for (const w of IMAGE_SOURCE_WHITELIST) {
    if (s.includes(w)) return w;
  }
  return null;
}

export function validateArticle({ filepath, anchorUrl, publishMonth, isAnchor = false, manifestHeroTone = null }) {
  const ext = path.extname(filepath).toLowerCase();
  const text = fs.readFileSync(filepath, 'utf-8');
  const failures = [];
  const expectedTone = defaultSeasonalTone(publishMonth);
  let images = [];
  let bodyText = '';
  let metaSummary = {};

  if (ext === '.md' || ext === '.markdown') {
    const { frontmatter, body } = extractFrontmatter(text);
    if (!frontmatter) {
      failures.push('frontmatter_missing');
    } else {
      images = Array.isArray(frontmatter.images) ? frontmatter.images : [];
      metaSummary = {
        hexagon_id: frontmatter.hexagon_id,
        anchor_drama: frontmatter.anchor_drama,
        anchor_backlink: frontmatter.anchor_backlink,
      };
      bodyText = body;
    }
  } else if (ext === '.html' || ext === '.htm') {
    const meta = extractHtmlMeta(text);
    metaSummary = {
      hexagon_id: meta.hexagon || meta['hexagon-id'],
      anchor_drama: meta['anchor-drama'],
      anchor_backlink: null,
    };
    images = extractHtmlImages(text).map((img) => ({
      role: img.src.includes('hero') ? 'hero' : 'inline',
      asset_url: img.src,
      credit: img.credit_html.replace(/<[^>]+>/g, '').trim(),
      alt_text_ko: /[가-힯]/.test(img.alt) ? img.alt : null,
      alt_text_en: /^[\x00-\x7F\s]+$/.test(img.alt) ? img.alt : null,
      _src: img.src,
    }));
    bodyText = text;
  } else {
    return { ok: false, failures: ['unsupported_extension'], file: filepath };
  }

  // ----- self-check #14: anchor_backlink_present -----
  // Skip for anchor article itself.
  if (!isAnchor) {
    const candidates = [];
    if (anchorUrl) candidates.push(anchorUrl);
    if (metaSummary.anchor_backlink) candidates.push(metaSummary.anchor_backlink);
    const slugMatch = anchorUrl?.match(/\/([^/]+)-(?:ko|en)\.(?:html|md)$/);
    if (slugMatch) candidates.push(slugMatch[1]); // slug fragment

    let found = false;
    for (const c of candidates) {
      if (c && bodyText.includes(c)) { found = true; break; }
    }
    if (!found) failures.push('14_anchor_backlink_present');
  }

  // ----- self-check #15: images_present_with_license (JAC-1896 §B) -----
  // Strict per spec for .md (frontmatter): exactly 1 role===hero, ≥1 inline_*, all 5 fields + alt_text_ko/en.
  // Relaxed fallback for legacy .html: credit + alt + recognizable whitelisted source.
  const inlineRolePattern = /^inline(_\d+)?$/;
  const heroes = images.filter((im) => String(im.role || '').toLowerCase() === 'hero');
  const inlines = images.filter((im) => inlineRolePattern.test(String(im.role || '').toLowerCase()));

  if (images.length < 2) failures.push(`15_images_length_below_2_actual_${images.length}`);

  if (ext === '.md' || ext === '.markdown') {
    if (heroes.length !== 1) failures.push(`15_hero_role_count_must_be_1_actual_${heroes.length}`);
    if (inlines.length < 1) failures.push(`15_inline_role_count_must_be_ge_1_actual_${inlines.length}`);
  } else {
    // HTML lacks structured roles — fall back to "≥1 image looking like hero, ≥1 not".
    const htmlHeroes = images.filter((im) => /hero/i.test(im._src || im.asset_url || ''));
    const htmlInlines = images.filter((im) => !htmlHeroes.includes(im));
    if (htmlHeroes.length < 1) failures.push('15_hero_image_missing');
    if (htmlInlines.length < 1) failures.push('15_inline_image_missing');
  }

  for (const [idx, im] of images.entries()) {
    if (ext === '.md' || ext === '.markdown') {
      for (const f of REQUIRED_IMAGE_FIELDS) {
        if (!im[f] || String(im[f]).trim() === '') {
          failures.push(`15_image_${idx}_missing_${f}`);
        }
      }
      for (const f of REQUIRED_ALT_FIELDS) {
        if (!im[f] || String(im[f]).trim() === '') {
          failures.push(`15_image_${idx}_missing_${f}`);
        }
      }
      const src = String(im.source || '').toLowerCase();
      if (src && !IMAGE_SOURCE_WHITELIST.has(src)) {
        failures.push(`15_image_${idx}_source_not_whitelisted_${src}`);
      }
    } else {
      if (!im.credit) failures.push(`15_image_${idx}_missing_credit`);
      if (!im.alt_text_ko && !im.alt_text_en) failures.push(`15_image_${idx}_missing_alt`);
      const src = looksLikeWhitelistedSource(im.credit) || looksLikeWhitelistedSource(im._src);
      if (!src) failures.push(`15_image_${idx}_source_not_whitelisted`);
    }
  }

  // ----- 15a. seasonal_tone_quarter_policy (JAC-1896 §C) -----
  // pass A: hero.seasonal_tone === expected_tone
  // pass B: fidelity exception — manifest declares off-tone hero AND ≥1 inline matches expected
  // (manifestHeroTone arg passed by validateHexagon; CLI single-file mode skips the check)
  if (expectedTone && (ext === '.md' || ext === '.markdown')) {
    const hero = heroes[0] || null;
    const heroTone = hero ? String(hero.seasonal_tone || '').toLowerCase() : null;
    if (heroTone === expectedTone) {
      // pass
    } else if (!hero) {
      failures.push(`15a_no_hero_to_check_expected_${expectedTone}`);
    } else {
      const manifestDeclares = manifestHeroTone && manifestHeroTone !== expectedTone;
      const inlineCovers = inlines.some((im) => String(im.seasonal_tone || '').toLowerCase() === expectedTone);
      if (!(manifestDeclares && inlineCovers)) {
        if (!manifestDeclares) {
          failures.push(`15a_fidelity_exception_not_declared_hero_${heroTone || 'null'}_expected_${expectedTone}`);
        }
        if (!inlineCovers) {
          failures.push(`15a_no_inline_image_with_expected_tone_${expectedTone}`);
        }
      }
    }
  }

  return {
    ok: failures.length === 0,
    file: filepath,
    expected_seasonal_tone: expectedTone,
    failures,
    image_count: images.length,
    hero_count: heroes.length,
    inline_count: inlines.length,
    meta: metaSummary,
  };
}

export function validateHexagon(hexagonYamlPath) {
  const text = fs.readFileSync(hexagonYamlPath, 'utf-8');
  const fm = parseFrontmatter(text);
  const reports = [];
  const root = path.dirname(path.dirname(hexagonYamlPath)); // content/hexagons/X.yaml -> content/

  const publishMonth = fm.season_window?.replace(/-(spring|summer|fall|winter)$/, (_, s) => {
    const map = { spring: '-04', summer: '-07', fall: '-10', winter: '-01' };
    return map[s];
  });

  const anchorUrl = fm.anchor?.url?.ko || null;
  const anchorEn = fm.anchor?.url?.en || null;

  const articles = [];
  const anchorManifestTone = fm.anchor?.hero_image?.seasonal_tone || null;
  if (fm.anchor?.url?.ko) articles.push({ url: fm.anchor.url.ko, isAnchor: true, manifestHeroTone: anchorManifestTone });
  if (fm.anchor?.url?.en) articles.push({ url: fm.anchor.url.en, isAnchor: true, manifestHeroTone: anchorManifestTone });
  for (const s of fm.sisters || []) {
    const sisterTone = s.hero_image?.seasonal_tone || null;
    if (s.url?.ko) articles.push({ url: s.url.ko, isAnchor: false, manifestHeroTone: sisterTone });
    if (s.url?.en) articles.push({ url: s.url.en, isAnchor: false, manifestHeroTone: sisterTone });
  }

  for (const a of articles) {
    const filepath = path.join(root, '..', a.url.replace(/^\//, ''));
    if (!fs.existsSync(filepath)) {
      reports.push({ ok: false, file: a.url, failures: ['article_file_not_found'] });
      continue;
    }
    reports.push(validateArticle({
      filepath,
      anchorUrl,
      publishMonth,
      isAnchor: a.isAnchor,
      manifestHeroTone: a.manifestHeroTone,
    }));
  }

  const allOk = reports.every((r) => r.ok);
  return { ok: allOk, hexagon_id: fm.hexagon_id, season_window: fm.season_window, reports };
}

// CLI entry
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  let hexagonPath = null;
  let articlePath = null;
  let anchorUrl = null;
  let publishMonth = null;
  let isAnchor = false;
  let manifestHeroTone = null;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--hexagon') hexagonPath = args[++i];
    else if (args[i] === '--anchor-url') anchorUrl = args[++i];
    else if (args[i] === '--publish-month') publishMonth = args[++i];
    else if (args[i] === '--is-anchor') isAnchor = true;
    else if (args[i] === '--manifest-hero-tone') manifestHeroTone = args[++i];
    else if (!articlePath && !args[i].startsWith('--')) articlePath = args[i];
  }
  let result;
  if (hexagonPath) {
    result = validateHexagon(hexagonPath);
  } else if (articlePath) {
    result = validateArticle({ filepath: articlePath, anchorUrl, publishMonth, isAnchor, manifestHeroTone });
  } else {
    console.error('Usage: validate-article.mjs <article> [--anchor-url <url>] [--publish-month YYYY-MM] [--is-anchor] [--manifest-hero-tone <tone>]');
    console.error('       validate-article.mjs --hexagon content/hexagons/<slug>.yaml');
    process.exit(2);
  }
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.ok ? 0 : 1);
}
