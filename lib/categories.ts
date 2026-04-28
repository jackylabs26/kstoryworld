export const REVIEW_CATEGORIES = [
  'k-pop',
  'k-drama',
  'k-food',
  'k-beauty',
  'k-literature',
  'k-travel',
] as const;

export type ReviewCategory = (typeof REVIEW_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<ReviewCategory, { ko: string; en: string }> = {
  'k-pop': { ko: 'K-팝', en: 'K-Pop' },
  'k-drama': { ko: 'K-드라마', en: 'K-Drama' },
  'k-food': { ko: 'K-푸드', en: 'K-Food' },
  'k-beauty': { ko: 'K-뷰티', en: 'K-Beauty' },
  'k-literature': { ko: 'K-문학', en: 'K-Literature' },
  'k-travel': { ko: 'K-트래블', en: 'K-Travel' },
};

export function isReviewCategory(value: unknown): value is ReviewCategory {
  return typeof value === 'string' && (REVIEW_CATEGORIES as readonly string[]).includes(value);
}
