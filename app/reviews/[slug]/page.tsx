import { notFound } from 'next/navigation';
import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import type { Metadata } from 'next';

interface ReviewPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ReviewPageProps): Promise<Metadata> {
  const { slug } = await params;
  const filePath = path.join(process.cwd(), 'content/reviews', `${slug}.html`);

  if (!fs.existsSync(filePath)) {
    return {
      title: 'Review Not Found',
    };
  }

  const htmlContent = fs.readFileSync(filePath, 'utf-8');
  const titleMatch = htmlContent.match(/<title>([\s\S]*?)<\/title>/i);
  const descMatch = htmlContent.match(/<meta name="description" content="([\s\S]*?)"/i);

  return {
    title: titleMatch ? titleMatch[1] : slug,
    description: descMatch ? descMatch[1] : 'MJG Content Hub K-드라마 리뷰',
  };
}

export async function generateStaticParams() {
  const reviewsDir = path.join(process.cwd(), 'content/reviews');
  if (!fs.existsSync(reviewsDir)) return [];
  
  const files = fs.readdirSync(reviewsDir);
  return files
    .filter(file => file.endsWith('.html'))
    .map(file => ({
      slug: file.replace('.html', ''),
    }));
}

export default async function ReviewDetailPage({ params }: ReviewPageProps) {
  const { slug } = await params;
  const filePath = path.join(process.cwd(), 'content/reviews', `${slug}.html`);

  if (!fs.existsSync(filePath)) {
    notFound();
  }

  const htmlContent = fs.readFileSync(filePath, 'utf-8');

  // Extract body content and styles
  const bodyMatch = htmlContent.match(/<body>([\s\S]*?)<\/body>/i);
  const styleMatch = htmlContent.match(/<style>([\s\S]*?)<\/style>/i);
  
  const bodyContent = bodyMatch ? bodyMatch[1] : htmlContent;
  const rawStyles = styleMatch ? styleMatch[1] : '';
  
  // Clean up styles to avoid affecting global styles (prefixing with .review-content-wrapper)
  const namespacedStyles = rawStyles.replace(/(^|\}|,)\s*([a-zA-Z0-9.#_:-]+)/g, (match, p1, p2) => {
    if (p2.startsWith('.review-content-wrapper') || p2.startsWith('@') || p2.startsWith('body')) {
      if (p2 === 'body') return p1 + ' .review-content-wrapper';
      return match;
    }
    return `${p1} .review-content-wrapper ${p2}`;
  });

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .review-content-wrapper {
          max-width: 800px;
          margin: 0 auto;
          padding: 60px 40px;
          line-height: 1.8;
          color: #ccc;
        }
        .review-content-wrapper h1 { color: #f5f0e8; font-size: 2.5rem; font-weight: bold; margin-bottom: 2rem; border-bottom: 1px solid #333; padding-bottom: 1rem; }
        .review-content-wrapper h2 { color: #c9a84c; font-size: 1.8rem; margin-top: 2.5rem; margin-bottom: 1.5rem; }
        .review-content-wrapper h3 { color: #f5f0e8; font-size: 1.4rem; margin-top: 2rem; margin-bottom: 1rem; }
        .review-content-wrapper p { margin-bottom: 1.2rem; }
        .review-content-wrapper img { max-width: 100%; height: auto; border-radius: 16px; margin: 2rem 0; box-shadow: 0 20px 50px rgba(0,0,0,0.5); }
        .review-content-wrapper ul { list-style: disc; margin-left: 2rem; margin-bottom: 1.5rem; }
        .review-content-wrapper li { margin-bottom: 0.8rem; }
        .review-content-wrapper blockquote { border-left: 4px solid #c9a84c; margin: 2.5rem 0; padding: 1.5rem 2.5rem; background: rgba(201,168,76,0.05); font-style: italic; border-radius: 0 16px 16px 0; }
        .review-content-wrapper .meta { color: #666; font-size: 0.9em; margin-bottom: 3rem; }
        ${namespacedStyles}
      ` }} />
      
      <div className="py-20" style={{ background: '#0a0a0a' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <Link href="/reviews" className="inline-flex items-center gap-2 text-sm mb-12 transition-colors hover:text-gold" style={{ color: '#666' }}>
            <span className="text-xl">←</span> 목록으로 돌아가기
          </Link>
          
          <article className="review-content-wrapper bg-[#111] rounded-3xl border border-white/5 shadow-2xl overflow-hidden">
            <div dangerouslySetInnerHTML={{ __html: bodyContent }} />
            
            {/* AdSense Placeholder in post */}
            <div className="mt-16 pt-16 border-t border-white/5">
               <div className="h-32 w-full flex items-center justify-center rounded-xl bg-white/5 border border-dashed border-white/10">
                 <p className="text-xs text-gray-600">AdSense Display Unit Placeholder</p>
               </div>
            </div>
          </article>
        </div>
      </div>
    </>
  );
}
