import type { Metadata } from 'next';
import {
  REVIEW_CATEGORIES,
  CATEGORY_LABELS,
  isReviewCategory,
  loadByCategory,
  type ReviewCategory,
} from '@/lib/reviews';
import { notFound } from 'next/navigation';
import { CategoryBoard } from '@/components/ksw/category-board';

interface Props {
  params: Promise<{ category: string }>;
}

export async function generateStaticParams() {
  return REVIEW_CATEGORIES.map((c) => ({ category: c }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  if (!isReviewCategory(category)) return { title: 'Not Found' };
  const label = CATEGORY_LABELS[category];
  return {
    title: `${label.ko} 리뷰 & 가이드 | KStoryWorld`,
    description: `${label.ko} 콘텐츠의 모든 것. 심층 리뷰, 분석, 그리고 숨겨진 명작 추천까지.`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;
  if (!isReviewCategory(category)) notFound();

  const cat = category as ReviewCategory;
  const reviews = loadByCategory(cat).map((r) => ({
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt,
    image: r.image,
    season: r.season,
    lang: r.lang,
    category: r.category,
  }));

  return <CategoryBoard items={reviews} category={cat} />;
}
