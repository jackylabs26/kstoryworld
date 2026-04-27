import type { MetadataRoute } from 'next';
import { loadAllReviews } from '@/lib/reviews';

export const dynamic = 'force-static';

const BASE = 'https://kstoryworld.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const reviews = loadAllReviews();

  const reviewEntries: MetadataRoute.Sitemap = reviews.map((r) => ({
    url: `${BASE}/reviews/${r.slug}`,
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
    {
      url: `${BASE}/reviews`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
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
