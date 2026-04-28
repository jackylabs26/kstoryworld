import { notFound } from 'next/navigation';
import fs from 'fs';
import path from 'path';
import type { Metadata } from 'next';
import { ReviewArticle } from '@/components/ksw/review-article';
import {
  loadAllReviews,
  REVIEW_CATEGORIES,
  isReviewCategory,
  type Season,
} from '@/lib/reviews';

interface Props {
  params: Promise<{ category: string; slug: string }>;
}

function reviewsDir() {
  return path.join(process.cwd(), 'content/reviews');
}

export async function generateStaticParams() {
  const reviews = loadAllReviews();
  return reviews.map((r) => ({ category: r.category, slug: r.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, slug } = await params;
  if (!isReviewCategory(category)) return { title: 'Not Found' };

  const filePath = path.join(reviewsDir(), `${slug}.html`);
  if (!fs.existsSync(filePath)) return { title: 'Review Not Found' };

  const html = fs.readFileSync(filePath, 'utf-8');
  const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
  const descMatch = html.match(/<meta name="description" content="([\s\S]*?)"/i);

  return {
    title: titleMatch ? titleMatch[1] : slug,
    description: descMatch ? descMatch[1] : 'KStoryWorld 리뷰',
  };
}

export default async function CategorySlugPage({ params }: Props) {
  const { category, slug } = await params;
  if (!isReviewCategory(category)) notFound();

  const filePath = path.join(reviewsDir(), `${slug}.html`);
  if (!fs.existsSync(filePath)) notFound();

  const html = fs.readFileSync(filePath, 'utf-8');

  const allReviews = loadAllReviews();
  const meta = allReviews.find((r) => r.slug === slug);
  if (!meta || meta.category !== category) notFound();

  const bodyMatch = html.match(/<body>([\s\S]*?)<\/body>/i);
  const bodyContent = bodyMatch ? bodyMatch[1] : html;

  const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : slug;

  const isEn = slug.endsWith('-en');
  const isKo = slug.endsWith('-ko');
  const lang = isEn ? ('en' as const) : ('ko' as const);
  const baseSlug = isEn ? slug.slice(0, -3) : isKo ? slug.slice(0, -3) : slug;
  const siblingSlug = isEn ? `${baseSlug}-ko` : `${baseSlug}-en`;
  const siblingPath = path.join(reviewsDir(), `${siblingSlug}.html`);
  const hasSibling = fs.existsSync(siblingPath);

  const season: Season = meta.season ?? 'winter';

  return (
    <ReviewArticle
      bodyHtml={bodyContent}
      slug={slug}
      season={season}
      title={title}
      lang={lang}
      siblingSlug={hasSibling ? siblingSlug : undefined}
      category={category}
    />
  );
}
