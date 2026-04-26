import { loadAllReviews } from '@/lib/reviews';

const BASE = 'https://kstoryworld.com';

export async function GET() {
  const reviews = loadAllReviews();

  const items = reviews
    .slice(0, 30)
    .map(
      (r) => `    <item>
      <title><![CDATA[${r.title}]]></title>
      <link>${BASE}/reviews/${r.slug}</link>
      <guid isPermaLink="true">${BASE}/reviews/${r.slug}</guid>
      <description><![CDATA[${r.excerpt}]]></description>
      <language>${r.lang === 'ko' ? 'ko' : 'en'}</language>
      <pubDate>${new Date().toUTCString()}</pubDate>
    </item>`,
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>KStoryWorld — K-Drama Reviews</title>
    <link>${BASE}</link>
    <description>K-Drama reviews, guides, and Korean storytelling — in Korean and English.</description>
    <language>ko</language>
    <atom:link href="${BASE}/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
