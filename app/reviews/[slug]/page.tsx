import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { loadAllReviews } from '@/lib/reviews';
import { ReviewRedirect } from '@/components/ksw/review-redirect';

interface Props {
  params: Promise<{ slug: string }>;
}

function resolveTarget(slug: string): string | null {
  const meta = loadAllReviews().find((r) => r.slug === slug);
  return meta ? `/${meta.category}/${slug}` : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const target = resolveTarget(slug);
  if (!target) return { title: 'Not Found' };

  return {
    title: 'Redirecting…',
    other: { 'http-equiv': 'refresh', content: `0;url=${target}` },
    robots: { index: false, follow: true },
  };
}

export async function generateStaticParams() {
  return loadAllReviews().map((r) => ({ slug: r.slug }));
}

export default async function ReviewSlugRedirect({ params }: Props) {
  const { slug } = await params;
  const target = resolveTarget(slug);
  if (!target) notFound();

  return <ReviewRedirect target={target} />;
}
