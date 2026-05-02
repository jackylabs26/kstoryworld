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
  const title = titleMatch ? titleMatch[1].trim() : slug;
  const description = descMatch ? descMatch[1].trim() : 'KStoryWorld 리뷰';

  const isEn = slug.endsWith('-en');
  const isKo = slug.endsWith('-ko');
  const baseSlug = isEn || isKo ? slug.slice(0, -3) : slug;
  const siblingSlug = isEn ? `${baseSlug}-ko` : isKo ? `${baseSlug}-en` : null;
  const hasSibling = siblingSlug
    ? fs.existsSync(path.join(reviewsDir(), `${siblingSlug}.html`))
    : false;

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
    },
    twitter: { card: 'summary_large_image', title, description },
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
  const descMatch = html.match(/<meta name="description" content="([\s\S]*?)"/i);
  const description = descMatch ? descMatch[1].trim() : '';

  const isEn = slug.endsWith('-en');
  const isKo = slug.endsWith('-ko');
  const lang = isEn ? ('en' as const) : ('ko' as const);
  const baseSlug = isEn ? slug.slice(0, -3) : isKo ? slug.slice(0, -3) : slug;
  const siblingSlug = isEn ? `${baseSlug}-ko` : `${baseSlug}-en`;
  const siblingPath = path.join(reviewsDir(), `${siblingSlug}.html`);
  const hasSibling = fs.existsSync(siblingPath);

  const season: Season = meta.season ?? 'winter';

  const url = `https://kstoryworld.com/${category}/${slug}`;
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    inLanguage: lang,
    image: meta.image ? `https://kstoryworld.com${meta.image}` : undefined,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    author: { '@type': 'Organization', name: 'KStoryWorld' },
    publisher: {
      '@type': 'Organization',
      name: 'KStoryWorld',
      logo: {
        '@type': 'ImageObject',
        url: 'https://kstoryworld.com/design-assets/logo.png',
      },
    },
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
      />
    </>
  );
}
