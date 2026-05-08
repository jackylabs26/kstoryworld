import fs from 'fs';
import path from 'path';

const REVIEW_CATEGORIES = ['k-pop', 'k-drama', 'k-food', 'k-beauty', 'k-literature', 'k-travel'] as const;
const RETIRED_DUPLICATE_SLUG = 'michelin-hansik-korean-fine-dining-guide-ko';
const RETIRED_DUPLICATE_TARGET = 'michelin-starred-hansik-korean-fine-dining-guide-ko';
const MANUAL_OVERRIDE_COMMENT = '# Manual canonicalization overrides for retired duplicate slugs.';
const MANUAL_OVERRIDE_LINES = [
  `/reviews/${RETIRED_DUPLICATE_SLUG} /k-food/${RETIRED_DUPLICATE_TARGET}/ 301`,
  `/reviews/${RETIRED_DUPLICATE_SLUG}/ /k-food/${RETIRED_DUPLICATE_TARGET}/ 301`,
  `/k-food/${RETIRED_DUPLICATE_SLUG} /k-food/${RETIRED_DUPLICATE_TARGET}/ 301`,
  `/k-food/${RETIRED_DUPLICATE_SLUG}/ /k-food/${RETIRED_DUPLICATE_TARGET}/ 301`,
];

const reviewsDir = path.join(process.cwd(), 'content/reviews');
const outPath = path.join(process.cwd(), 'public/_redirects');

function extractCategory(html: string, slug: string): string {
  const match = html.match(/<meta\s+name=["']category["']\s+content=["']([^"']+)["']/i);
  const raw = match ? match[1].trim() : '';
  if (!raw || !REVIEW_CATEGORIES.includes(raw as any)) {
    throw new Error(`[generate-redirects] invalid category for ${slug}: "${raw}"`);
  }
  return raw;
}

const files = fs.readdirSync(reviewsDir).filter((f) => f.endsWith('.html'));
const lines: string[] = [];

for (const file of files) {
  const slug = file.replace('.html', '');
  const html = fs.readFileSync(path.join(reviewsDir, file), 'utf-8').slice(0, 2000);
  const category = extractCategory(html, slug);
  lines.push(`/reviews/${slug}/ /${category}/${slug}/ 301`);
  lines.push(`/reviews/${slug} /${category}/${slug}/ 301`);
}

const existing = fs.existsSync(outPath) ? fs.readFileSync(outPath, 'utf-8') : '';
const marker = '# === AUTO-GENERATED REVIEW REDIRECTS (do not edit below) ===';
const base = existing.includes(marker)
  ? existing.slice(0, existing.indexOf(marker)).trimEnd()
  : existing.trimEnd();
const preservedBaseLines = base
  .split('\n')
  .map((line) => line.trim())
  .filter(Boolean)
  .filter((line) => line !== MANUAL_OVERRIDE_COMMENT)
  .filter((line) => !MANUAL_OVERRIDE_LINES.includes(line));
const manualSection = [MANUAL_OVERRIDE_COMMENT, ...MANUAL_OVERRIDE_LINES];

const output = [...preservedBaseLines, ...manualSection, marker, ...lines.sort()].join('\n') + '\n';
fs.writeFileSync(outPath, output, 'utf-8');

console.log(`[generate-redirects] wrote ${lines.length} redirect rules to public/_redirects`);
