import fs from 'fs';
import path from 'path';

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
    };
  });
}

export function loadReviewsByLang(lang: ReviewLang = 'ko'): ReviewMeta[] {
  return loadAllReviews().filter((r) => r.lang === lang);
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
