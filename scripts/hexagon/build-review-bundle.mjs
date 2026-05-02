#!/usr/bin/env node
// Hexagon Review Bundle Builder (JAC-1952)
//
// Assembles per-hexagon review artifacts so the board can review
// 6편 묶음(앵커 + 자매 5)에 대해 게이트 2 confirmation을 내릴 때 인쇄/저장
// 가능한 단일 묶음을 받습니다.
//
// Usage:
//   node scripts/hexagon/build-review-bundle.mjs <hexagon-slug>
//   node scripts/hexagon/build-review-bundle.mjs my-love-from-the-star
//
// Outputs (relative to repo root):
//   artifacts/review/<slug>/bundle.md         — 6편 ko+en 본문 + 메타 합본 (인쇄/저장용)
//   artifacts/review/<slug>/manifest.json     — 페르소나·이미지·유튜브 URL·게이트 결과 1페이지 요약
//   artifacts/review/<slug>/preview/<file>    — 원본 ko/en 본문 사본 (HTML/MD 그대로)
//
// PDF 변환은 (Pandoc 또는 headless Chromium) 환경 가용성에 의존하므로 별도
// `--pdf` 플래그가 들어왔을 때만 시도하고, 없으면 안내만 출력합니다.

import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const __filename = url.fileURLToPath(import.meta.url);
const REPO_ROOT = path.resolve(path.dirname(__filename), '..', '..');

const args = process.argv.slice(2);
if (args.length === 0 || args[0].startsWith('-')) {
  console.error('Usage: node scripts/hexagon/build-review-bundle.mjs <hexagon-slug> [--pdf]');
  process.exit(2);
}
const slug = args[0];
const wantPdf = args.includes('--pdf');

const manifestPath = path.join(REPO_ROOT, 'content', 'hexagons', `${slug}.yaml`);
if (!fs.existsSync(manifestPath)) {
  console.error(`hexagon manifest not found: ${manifestPath}`);
  process.exit(1);
}

const manifestRaw = fs.readFileSync(manifestPath, 'utf8');
const hex = parseHexagonManifest(manifestRaw);

const outDir = path.join(REPO_ROOT, 'artifacts', 'review', slug);
const previewDir = path.join(outDir, 'preview');
fs.mkdirSync(previewDir, { recursive: true });

const sections = [];
const personaCounts = {};
const youtubeUrls = [];
const imageCounts = { hero: 0, inline: 0 };
const articles = [];

const candidates = [
  { role: 'anchor', drama: hex.anchor_drama || (hex.anchor && hex.anchor.title_ko) || null, slug: (hex.anchor && hex.anchor.slug) || null, files: anchorFiles(hex) },
  ...(hex.sisters || []).map((s) => ({ role: s.domain || 'sister', drama: hex.anchor_drama || null, slug: s.seed || s.slug || null, files: sisterFiles(s) })),
];

for (const cand of candidates) {
  for (const rel of cand.files) {
    const abs = path.join(REPO_ROOT, rel);
    if (!fs.existsSync(abs)) {
      console.warn(`skip missing file: ${rel}`);
      continue;
    }
    const text = fs.readFileSync(abs, 'utf8');
    const article = inspectArticle(text, rel);
    articles.push(Object.assign({ role: cand.role, slug: cand.slug }, article));
    if (article.narrator_persona_slug) {
      personaCounts[article.narrator_persona_slug] = (personaCounts[article.narrator_persona_slug] || 0) + 1;
    }
    youtubeUrls.push(...article.youtube_urls);
    imageCounts.hero += article.hero_count;
    imageCounts.inline += article.inline_count;

    fs.copyFileSync(abs, path.join(previewDir, path.basename(rel)));
    sections.push(renderSection(article, cand));
  }
}

const bundleMd = renderBundleMarkdown(slug, hex, sections);
fs.writeFileSync(path.join(outDir, 'bundle.md'), bundleMd, 'utf8');

const manifest = {
  hexagon_slug: slug,
  anchor_drama: hex.anchor_drama || null,
  generated_at: new Date().toISOString(),
  article_count: articles.length,
  persona_distribution: personaCounts,
  unique_youtube_urls: Array.from(new Set(youtubeUrls)),
  image_counts: imageCounts,
  articles: articles.map((a) => ({
    role: a.role,
    slug: a.slug,
    file: a.file,
    title: a.title,
    narrator_persona_slug: a.narrator_persona_slug || null,
    youtube_url_count: a.youtube_urls.length,
    bold_emphasis_hits: a.bold_hits,
    image_total: a.images.length,
  })),
};
fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');

if (wantPdf) {
  console.warn('--pdf 옵션은 현재 환경 의존(Pandoc 또는 headless Chromium)이라 미구현 stub입니다. bundle.md 를 사용해 외부 도구로 변환하세요.');
}

console.log(JSON.stringify({
  ok: true,
  out_dir: path.relative(REPO_ROOT, outDir),
  bundle_md: path.relative(REPO_ROOT, path.join(outDir, 'bundle.md')),
  manifest: path.relative(REPO_ROOT, path.join(outDir, 'manifest.json')),
  article_count: articles.length,
  persona_distribution: personaCounts,
}, null, 2));

// ---------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------

function parseHexagonManifest(raw) {
  // Indentation-aware mini YAML reader scoped to KStoryWorld hexagon manifests.
  // Builds `anchor` (object with .articles.{ko,en} + .slug), `sisters` (array of
  // objects with .domain + .seed + .articles.{ko,en}) plus top-level scalars.
  const out = { sisters: [] };
  const lines = raw.split('\n');
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
      if (key === 'anchor') {
        const block = readMapping(lines, i + 1, 0);
        out.anchor = block.value;
        i = block.next;
        continue;
      }
      if (key === 'sisters') {
        const block = readListOfMappings(lines, i + 1, 0);
        out.sisters = block.value;
        i = block.next;
        continue;
      }
      const block = readMapping(lines, i + 1, 0);
      out[key] = block.value;
      i = block.next;
      continue;
    }
    out[key] = stripQuotes(valRaw);
    i++;
  }
  return out;
}

function stripQuotes(v) {
  return String(v == null ? '' : v).replace(/^["']|["']$/g, '');
}

function readMapping(lines, start, parentIndent) {
  const value = {};
  let i = start;
  let myIndent = null;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim() || line.trim().startsWith('#')) { i++; continue; }
    const ind = line.match(/^ */)[0].length;
    if (ind <= parentIndent) break;
    if (myIndent === null) myIndent = ind;
    if (ind < myIndent) break;
    if (ind > myIndent) { i++; continue; }
    const colon = line.indexOf(':');
    if (colon === -1) { i++; continue; }
    const key = line.slice(0, colon).trim();
    const valRaw = line.slice(colon + 1).trim();
    if (valRaw === '') {
      // Look ahead: is the next non-empty line a `- ...` (list) or a deeper mapping?
      let j = i + 1;
      while (j < lines.length && !lines[j].trim()) j++;
      if (j < lines.length && /^\s*-\s/.test(lines[j])) {
        const block = readListOfMappings(lines, i + 1, ind);
        value[key] = block.value;
        i = block.next;
        continue;
      }
      const block = readMapping(lines, i + 1, ind);
      value[key] = block.value;
      i = block.next;
      continue;
    }
    value[key] = stripQuotes(valRaw);
    i++;
  }
  return { value, next: i };
}

function readListOfMappings(lines, start, parentIndent) {
  const value = [];
  let i = start;
  let dashIndent = null;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim() || line.trim().startsWith('#')) { i++; continue; }
    const ind = line.match(/^ */)[0].length;
    if (ind <= parentIndent) break;
    const dash = line.match(/^(\s*)-\s+(.*)$/);
    if (dash) {
      if (dashIndent === null) dashIndent = ind;
      if (ind !== dashIndent) break;
      const item = {};
      const inline = dash[2];
      if (inline) {
        const cIdx = inline.indexOf(':');
        if (cIdx > -1) {
          const k = inline.slice(0, cIdx).trim();
          const v = inline.slice(cIdx + 1).trim();
          // List of plain scalars (e.g. - chimaek)?
          if (k === '' || /\s/.test(k)) {
            value.push(stripQuotes(inline));
            i++;
            continue;
          }
          item[k] = stripQuotes(v);
        } else {
          // bare scalar item
          value.push(stripQuotes(inline));
          i++;
          continue;
        }
      }
      // Read remaining nested mapping for this list item
      i++;
      while (i < lines.length) {
        const sub = lines[i];
        if (!sub.trim() || sub.trim().startsWith('#')) { i++; continue; }
        const subInd = sub.match(/^ */)[0].length;
        if (subInd <= dashIndent) break;
        const subColon = sub.indexOf(':');
        if (subColon === -1) { i++; continue; }
        const subKey = sub.slice(0, subColon).trim();
        const subVal = sub.slice(subColon + 1).trim();
        if (subVal === '') {
          let j = i + 1;
          while (j < lines.length && !lines[j].trim()) j++;
          if (j < lines.length && /^\s*-\s/.test(lines[j])) {
            const block = readListOfMappings(lines, i + 1, subInd);
            item[subKey] = block.value;
            i = block.next;
            continue;
          }
          const block = readMapping(lines, i + 1, subInd);
          item[subKey] = block.value;
          i = block.next;
          continue;
        }
        item[subKey] = stripQuotes(subVal);
        i++;
      }
      value.push(item);
      continue;
    }
    break;
  }
  return { value, next: i };
}

function anchorFiles(hex) {
  const a = hex.anchor;
  if (!a || !a.articles) return [];
  return [a.articles.ko, a.articles.en].filter(Boolean);
}

function sisterFiles(s) {
  if (!s || !s.articles) return [];
  return [s.articles.ko, s.articles.en].filter(Boolean);
}

function inspectArticle(text, relPath) {
  const fm = extractFrontmatter(text);
  const titleMatch = (fm.frontmatter && fm.frontmatter.title) ||
    (fm.body.match(/^#\s+(.+)$/m) || [, null])[1] || null;
  const personaMatch = (fm.frontmatter && fm.frontmatter.narrator_persona_slug) ||
    (fm.body.match(/narrator_persona_slug:\s*([\w-]+)/) || [, null])[1] || null;
  const youtube = Array.from(text.matchAll(/https?:\/\/(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)[\w-]{11}/g)).map((m) => m[0]);
  const bold = (text.match(/\*\*[^*\n]+\*\*/g) || []).length;
  const images = Array.from(text.matchAll(/!\[[^\]]*\]\(([^)]+)\)|<img[^>]+src=["']([^"']+)["']/g));
  let hero = 0, inline = 0;
  if (fm.frontmatter && Array.isArray(fm.frontmatter.images)) {
    for (const im of fm.frontmatter.images) {
      const role = String(im.role || '').toLowerCase();
      if (role === 'hero') hero++;
      else if (/^inline(_\d+)?$/.test(role)) inline++;
    }
  }
  return {
    file: relPath,
    title: titleMatch,
    narrator_persona_slug: personaMatch,
    youtube_urls: youtube,
    bold_hits: bold,
    images,
    hero_count: hero,
    inline_count: inline,
    body: fm.body,
  };
}

function extractFrontmatter(text) {
  if (!text.startsWith('---')) return { frontmatter: null, body: text };
  const end = text.indexOf('\n---', 3);
  if (end === -1) return { frontmatter: null, body: text };
  const fmRaw = text.slice(3, end).trim();
  const body = text.slice(end + 4).trimStart();
  const fm = parseSimpleYaml(fmRaw);
  return { frontmatter: fm, body };
}

function parseSimpleYaml(src) {
  const out = {};
  const lines = src.split('\n');
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim() || line.trim().startsWith('#')) { i++; continue; }
    const indent = line.match(/^ */)[0].length;
    if (indent !== 0) { i++; continue; }
    const colon = line.indexOf(':');
    if (colon === -1) { i++; continue; }
    const key = line.slice(0, colon).trim();
    const val = line.slice(colon + 1).trim();
    if (val === '') {
      const block = [];
      i++;
      while (i < lines.length) {
        const next = lines[i];
        if (!next.trim()) { i++; continue; }
        const nextIndent = next.match(/^ */)[0].length;
        if (nextIndent === 0) break;
        if (next.match(/^\s*-\s/)) {
          const item = {};
          const inline = next.replace(/^\s*-\s*/, '');
          if (inline) {
            const cIdx = inline.indexOf(':');
            if (cIdx > -1) item[inline.slice(0, cIdx).trim()] = inline.slice(cIdx + 1).trim().replace(/^["']|["']$/g, '');
          }
          i++;
          while (i < lines.length) {
            const sub = lines[i];
            if (!sub.trim() || sub.match(/^\s*-\s/) || sub.match(/^ */)[0].length <= nextIndent) break;
            const cIdx = sub.indexOf(':');
            if (cIdx > -1) {
              const k = sub.slice(0, cIdx).trim();
              const v = sub.slice(cIdx + 1).trim().replace(/^["']|["']$/g, '');
              item[k] = v;
            }
            i++;
          }
          block.push(item);
        } else {
          i++;
        }
      }
      out[key] = block;
    } else {
      out[key] = val.replace(/^["']|["']$/g, '');
      i++;
    }
  }
  return out;
}

function renderSection(article, cand) {
  return [
    `## ${cand.role.toUpperCase()} — ${article.title || article.file}`,
    `- **file**: \`${article.file}\``,
    `- **narrator_persona_slug**: \`${article.narrator_persona_slug || '(unresolved)'}\``,
    `- **youtube_urls**: ${article.youtube_urls.length}`,
    `- **bold_emphasis_hits**: ${article.bold_hits}`,
    `- **images** (hero/inline): ${article.hero_count}/${article.inline_count}`,
    '',
    article.body,
    '',
    '---',
    '',
  ].join('\n');
}

function renderBundleMarkdown(slug, hex, sections) {
  return [
    `# Review Bundle — ${slug}`,
    '',
    `- anchor_drama: ${hex.anchor_drama || '(none)'}`,
    `- generated_at: ${new Date().toISOString()}`,
    `- 본 묶음은 헥사곤 게이트 2 검토용 인쇄/저장 산출물입니다 (JAC-1952).`,
    '',
    '---',
    '',
    sections.join('\n'),
  ].join('\n');
}
