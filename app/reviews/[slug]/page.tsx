import { notFound } from 'next/navigation';
import fs from 'fs';
import path from 'path';
import type { Metadata } from 'next';
import { ReviewArticle } from '@/components/ksw/review-article';
import { loadAllReviews, type Season } from '@/lib/reviews';

interface ReviewPageProps {
  params: Promise<{ slug: string }>;
}

function reviewsDir() {
  return path.join(process.cwd(), 'content/reviews');
}

export async function generateMetadata({ params }: ReviewPageProps): Promise<Metadata> {
  const { slug } = await params;
  const filePath = path.join(reviewsDir(), `${slug}.html`);

  if (!fs.existsSync(filePath)) {
    return { title: 'Review Not Found' };
  }

  const html = fs.readFileSync(filePath, 'utf-8');
  const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
  const descMatch = html.match(/<meta name="description" content="([\s\S]*?)"/i);

  return {
    title: titleMatch ? titleMatch[1] : slug,
    description: descMatch ? descMatch[1] : 'KStoryWorld K-드라마 리뷰',
  };
}

export async function generateStaticParams() {
  const dir = reviewsDir();
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.html'))
    .map((f) => ({ slug: f.replace('.html', '') }));
}

export default async function ReviewDetailPage({ params }: ReviewPageProps) {
  const { slug } = await params;
  const filePath = path.join(reviewsDir(), `${slug}.html`);

  if (!fs.existsSync(filePath)) {
    notFound();
  }

  const html = fs.readFileSync(filePath, 'utf-8');

  // Extract body content (strip inline styles from content HTML to use our design system)
  const bodyMatch = html.match(/<body>([\s\S]*?)<\/body>/i);
  const bodyContent = bodyMatch ? bodyMatch[1] : html;

  // Extract metadata
  const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : slug;

  // Detect language and find sibling
  const isEn = slug.endsWith('-en');
  const isKo = slug.endsWith('-ko');
  const lang = isEn ? ('en' as const) : ('ko' as const);
  const baseSlug = isEn ? slug.slice(0, -3) : isKo ? slug.slice(0, -3) : slug;
  const siblingSlug = isEn ? `${baseSlug}-ko` : `${baseSlug}-en`;
  const siblingPath = path.join(reviewsDir(), `${siblingSlug}.html`);
  const hasSibling = fs.existsSync(siblingPath);

  // Get season from reviews lib
  const allReviews = loadAllReviews();
  const meta = allReviews.find((r) => r.slug === slug);
  const season: Season = meta?.season ?? 'winter';

  return (
    <ReviewArticle
      bodyHtml={bodyContent}
      slug={slug}
      season={season}
      title={title}
      lang={lang}
      siblingSlug={hasSibling ? siblingSlug : undefined}
    />
  );
}
