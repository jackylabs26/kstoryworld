import { notFound } from 'next/navigation';
import fs from 'fs';
import path from 'path';
import type { Metadata } from 'next';
import { ReviewArticle } from '@/components/ksw/review-article';
import {
  loadAllReviews,
  REVIEW_CATEGORIES,
  CATEGORY_CONTENT_DIRS,
  isReviewCategory,
  type ReviewMeta,
  type Season,
} from '@/lib/reviews';

interface Props {
  params: Promise<{ category: string; slug: string }>;
}

function reviewsDir() {
  return path.join(process.cwd(), 'content/reviews');
}

function findReview(category: string, slug: string): ReviewMeta | undefined {
  return loadAllReviews().find((r) => r.category === category && r.slug === slug);
}

function findSiblingPath(category: string, siblingSlug: string): string | null {
  const sibling = loadAllReviews().find(
    (r) => r.category === category && r.slug === siblingSlug,
  );
  return sibling ? sibling.contentPath : null;
}

export async function generateStaticParams() {
  const reviews = loadAllReviews();
  return reviews.map((r) => ({ category: r.category, slug: r.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, slug } = await params;
  if (!isReviewCategory(category)) return { title: 'Not Found' };

  const meta = findReview(category, slug);
  if (!meta) return { title: 'Review Not Found' };

  const title = meta.title;
  const description = meta.excerpt || 'KStoryWorld 리뷰';

  const isEn = slug.endsWith('-en');
  const isKo = slug.endsWith('-ko');
  const baseSlug = isEn || isKo ? slug.slice(0, -3) : slug;
  const siblingSlug = isEn ? `${baseSlug}-ko` : isKo ? `${baseSlug}-en` : null;
  const hasSibling = siblingSlug ? !!findSiblingPath(category, siblingSlug) : false;

  const path_ = `/${category}/${slug}`;
  const url = `https://kstoryworld.com${path_}`;
  const locale = isEn ? 'en_US' : 'ko_KR';

  const languages: Record<string, string> = {};
  if (hasSibling && siblingSlug) {
    languages[isEn ? 'ko' : 'en'] = `/${category}/${siblingSlug}`;
    languages[isEn ? 'en' : 'ko'] = path_;
    languages['x-default'] = path_;
  }

  return {
    title,
    description,
    alternates: {
      canonical: path_,
      ...(Object.keys(languages).length > 0 ? { languages } : {}),
    },
    openGraph: {
      title,
      description,
      url,
      type: 'article',
      siteName: 'KStoryWorld',
      locale,
      ...(meta.datePublished ? { publishedTime: meta.datePublished } : {}),
      ...(meta.dateModified ? { modifiedTime: meta.dateModified } : {}),
      ...(meta.author ? { authors: [meta.author] } : {}),
    },
    twitter: { card: 'summary_large_image', title, description },
  };
}

function extractBody(filePath: string, raw: string): string {
  if (filePath.endsWith('.md')) {
    if (!raw.startsWith('---')) return raw;
    const end = raw.indexOf('\n---', 3);
    return end === -1 ? raw : raw.slice(end + 4).trimStart();
  }
  const bodyMatch = raw.match(/<body>([\s\S]*?)<\/body>/i);
  return bodyMatch ? bodyMatch[1] : raw;
}

export default async function CategorySlugPage({ params }: Props) {
  const { category, slug } = await params;
  if (!isReviewCategory(category)) notFound();

  const meta = findReview(category, slug);
  if (!meta) notFound();

  const raw = fs.readFileSync(meta.contentPath, 'utf-8');
  const bodyContent = extractBody(meta.contentPath, raw);

  const title = meta.title;
  const description = meta.excerpt;

  const isEn = slug.endsWith('-en');
  const isKo = slug.endsWith('-ko');
  const lang = isEn ? ('en' as const) : ('ko' as const);
  const baseSlug = isEn ? slug.slice(0, -3) : isKo ? slug.slice(0, -3) : slug;
  const siblingSlug = isEn ? `${baseSlug}-ko` : `${baseSlug}-en`;
  const hasSibling = !!findSiblingPath(category, siblingSlug);

  const season: Season = meta.season ?? 'winter';

  const url = `https://kstoryworld.com/${category}/${slug}`;
  const authorJsonLd = meta.author
    ? { '@type': 'Person' as const, name: meta.author }
    : { '@type': 'Organization' as const, name: 'KStoryWorld' };
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    inLanguage: lang,
    image: meta.image ? `https://kstoryworld.com${meta.image}` : undefined,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    author: authorJsonLd,
    publisher: {
      '@type': 'Organization',
      name: 'KStoryWorld',
      logo: {
        '@type': 'ImageObject',
        url: 'https://kstoryworld.com/design-assets/logo.png',
      },
    },
    ...(meta.datePublished ? { datePublished: meta.datePublished } : {}),
    ...(meta.dateModified ? { dateModified: meta.dateModified } : {}),
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://kstoryworld.com' },
      {
        '@type': 'ListItem',
        position: 2,
        name: category,
        item: `https://kstoryworld.com/${category}`,
      },
      { '@type': 'ListItem', position: 3, name: title, item: url },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ReviewArticle
        bodyHtml={bodyContent}
        slug={slug}
        season={season}
        title={title}
        lang={lang}
        siblingSlug={hasSibling ? siblingSlug : undefined}
        category={category}
        author={meta.author}
        datePublished={meta.datePublished}
        dateModified={meta.dateModified}
      />
    </>
  );
}
