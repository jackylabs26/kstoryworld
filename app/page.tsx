import type { Metadata } from 'next';
import { CollectionGrid, type CollectionItem } from '@/components/ksw/collection-grid';
import { HeroBold } from '@/components/ksw/hero-bold';
import { NewsletterCTA } from '@/components/ksw/newsletter';
import { SeasonCarousel } from '@/components/ksw/season-carousel';
import { StatsBand } from '@/components/ksw/stats-band';
import { loadAllReviews, totalReviewCount, uniqueDramaCount } from '@/lib/reviews';

export const metadata: Metadata = {
  title: 'KStoryWorld — K-Drama Reviews & Guides | K-드라마 리뷰',
  description:
    'KStoryWorld는 한국의 K-드라마, K-팝, K-푸드, K-뷰티, K-문학 등 K-콘텐츠를 한국어와 영어 에디토리얼로 옮기는 글로벌 매체입니다.',
};

export default function HomePage() {
  const reviews = loadAllReviews();
  const dramaCount = uniqueDramaCount();
  const totalPages = totalReviewCount();

  // Build the editorial collection: prefer KO list (richer Korean copy in current corpus)
  const collectionItems: CollectionItem[] = reviews.map((r) => ({
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt,
    image: r.image,
    season: r.season,
    lang: r.lang,
  }));

  return (
    <>
      <HeroBold />
      <CollectionGrid items={collectionItems} />
      <StatsBand dramaCount={dramaCount} totalPages={totalPages} />
      <SeasonCarousel />
      <NewsletterCTA />
    </>
  );
}
