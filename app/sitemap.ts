import type { MetadataRoute } from 'next';
import { loadAllReviews, REVIEW_CATEGORIES, CATEGORY_LABELS } from '@/lib/reviews';

export const dynamic = 'force-static';

const BASE = 'https://kstoryworld.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const reviews = loadAllReviews();

  const categoryEntries: MetadataRoute.Sitemap = REVIEW_CATEGORIES.map((cat) => ({
    url: `${BASE}/${cat}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.9,
  }));

  const reviewEntries: MetadataRoute.Sitemap = reviews.map((r) => ({
    url: `${BASE}/${r.category}/${r.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [
    {
      url: BASE,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    ...categoryEntries,
    {
      url: `${BASE}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${BASE}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    ...reviewEntries,
  ];
}
