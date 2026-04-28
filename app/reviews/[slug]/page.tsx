import fs from 'fs';
import path from 'path';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { loadAllReviews } from '@/lib/reviews';
import { ReviewRedirect } from '@/components/ksw/review-redirect';

interface Props {
  params: Promise<{ slug: string }>;
}

function reviewsDir() {
  return path.join(process.cwd(), 'content/reviews');
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
  const dir = reviewsDir();
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.html'))
    .map((f) => ({ slug: f.replace('.html', '') }));
}

export default async function ReviewSlugRedirect({ params }: Props) {
  const { slug } = await params;
  const filePath = path.join(reviewsDir(), `${slug}.html`);
  if (!fs.existsSync(filePath)) notFound();

  const target = resolveTarget(slug);
  if (!target) notFound();

  return <ReviewRedirect target={target} />;
}
