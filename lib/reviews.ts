import fs from 'fs';
import path from 'path';

export { REVIEW_CATEGORIES, CATEGORY_LABELS, isReviewCategory } from './categories';
export type { ReviewCategory } from './categories';
import { REVIEW_CATEGORIES, isReviewCategory, type ReviewCategory } from './categories';

export type Season = 'spring' | 'summer' | 'autumn' | 'winter';
export type ReviewLang = 'ko' | 'en';

export interface ReviewMeta {
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  lang: ReviewLang;
  /** Slug stem without language suffix, e.g. "squid-game" */
  baseSlug: string;
  season: Season;
  category: ReviewCategory;
}

const SEASON_CYCLE: Season[] = ['spring', 'summer', 'autumn', 'winter'];

/**
 * Pick a stable season for a slug so cards stay seasonally consistent across reloads.
 */
function seasonForSlug(slug: string): Season {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) | 0;
  const idx = Math.abs(h) % SEASON_CYCLE.length;
  return SEASON_CYCLE[idx];
}

function reviewsDir() {
  return path.join(process.cwd(), 'content/reviews');
}

function extractCategory(html: string, slug: string): ReviewCategory {
  const match = html.match(/<meta\s+name=["']category["']\s+content=["']([^"']+)["']/i);
  const raw = match ? match[1].trim() : '';
  if (!raw) {
    throw new Error(
      `[reviews] category 메타데이터 누락: ${slug}.html — <meta name="category" content="..."> 를 추가하세요.`
    );
  }
  if (!isReviewCategory(raw)) {
    throw new Error(
      `[reviews] category 값이 유효하지 않음: ${slug}.html → "${raw}" (허용: ${REVIEW_CATEGORIES.join(', ')})`
    );
  }
  return raw;
}

export function loadAllReviews(): ReviewMeta[] {
  const dir = reviewsDir();
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.html'));
  return files.map((file) => {
    const slug = file.replace('.html', '');
    const fullPath = path.join(dir, file);
    const content = fs.readFileSync(fullPath, 'utf-8');
    const titleMatch = content.match(/<title>([\s\S]*?)<\/title>/i);
    const descMatch = content.match(/<meta name="description" content="([\s\S]*?)"/i);
    const imgMatch = content.match(/<img[^>]+src="([^"]+)"/i);
    const isEn = slug.endsWith('-en');
    const isKo = slug.endsWith('-ko');
    const baseSlug = isEn ? slug.slice(0, -3) : isKo ? slug.slice(0, -3) : slug;
    return {
      slug,
      baseSlug,
      title: titleMatch ? titleMatch[1].trim() : slug,
      excerpt: descMatch ? descMatch[1].trim() : '',
      image: imgMatch ? imgMatch[1] : '',
      lang: isEn ? 'en' : 'ko',
      season: seasonForSlug(baseSlug),
      category: extractCategory(content, slug),
    };
  });
}

export function loadReviewsByLang(lang: ReviewLang = 'ko'): ReviewMeta[] {
  return loadAllReviews().filter((r) => r.lang === lang);
}

export function loadByCategory(category: ReviewCategory, lang?: ReviewLang): ReviewMeta[] {
  const all = loadAllReviews().filter((r) => r.category === category);
  return lang ? all.filter((r) => r.lang === lang) : all;
}

export function totalReviewCount(): number {
  const dir = reviewsDir();
  if (!fs.existsSync(dir)) return 0;
  return fs.readdirSync(dir).filter((f) => f.endsWith('.html')).length;
}

export function uniqueDramaCount(): number {
  const all = loadAllReviews();
  const set = new Set(all.map((r) => r.baseSlug));
  return set.size;
}

export function uniqueCountByCategory(): Record<ReviewCategory, number> {
  const counts = REVIEW_CATEGORIES.reduce(
    (acc, cat) => ({ ...acc, [cat]: 0 }),
    {} as Record<ReviewCategory, number>
  );
  const seen = new Set<string>();
  for (const r of loadAllReviews()) {
    const key = `${r.category}::${r.baseSlug}`;
    if (seen.has(key)) continue;
    seen.add(key);
    counts[r.category] += 1;
  }
  return counts;
}
