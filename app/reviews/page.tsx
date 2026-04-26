import type { Metadata } from 'next';
import { ReviewsBoard } from '@/components/ksw/reviews-board';
import { loadAllReviews } from '@/lib/reviews';

export const metadata: Metadata = {
  title: 'K-드라마 리뷰 & 가이드',
  description: '전 세계가 주목하는 K-드라마의 모든 것. 심층 리뷰, 캐릭터 분석, 그리고 숨겨진 명작 추천까지.',
};

export default function ReviewsPage() {
  const reviews = loadAllReviews().map((r) => ({
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt,
    image: r.image,
    season: r.season,
    lang: r.lang,
  }));

  return <ReviewsBoard items={reviews} />;
}
