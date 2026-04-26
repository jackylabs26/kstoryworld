'use client';

import Link from 'next/link';
import { SEASONS, useKSWTheme } from './theme-provider';
import { AdSlot } from './ad-slot';

interface ReviewArticleProps {
  bodyHtml: string;
  slug: string;
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  title: string;
  lang: 'ko' | 'en';
  siblingSlug?: string;
}

export function ReviewArticle({ bodyHtml, slug, season, title, lang: reviewLang, siblingSlug }: ReviewArticleProps) {
  const { dark, lang } = useKSWTheme();
  const s = SEASONS[season];

  return (
    <div
      style={{
        background: dark ? '#010120' : '#fff',
        color: dark ? '#fff' : '#000',
        minHeight: '60vh',
      }}
    >
      {/* Hero banner with seasonal gradient */}
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          padding: '64px 32px 48px',
          background: dark ? 'rgba(255,255,255,0.03)' : undefined,
        }}
      >
        {!dark && (
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.4 }}>
            {s.blooms.slice(0, 2).map((b, i) => (
              <div
                key={i}
                className="bloom"
                style={{
                  width: b.w * 0.6,
                  height: b.h * 0.6,
                  background: b.bg,
                  filter: `blur(${b.b}px)`,
                  opacity: b.o,
                  left: b.x * 0.5,
                  top: b.y * 0.3,
                }}
              />
            ))}
          </div>
        )}

        <div style={{ position: 'relative', maxWidth: 800, margin: '0 auto' }}>
          <Link
            href="/reviews"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 14,
              color: dark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)',
              textDecoration: 'none',
              marginBottom: 32,
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.5px',
              textTransform: 'uppercase' as const,
            }}
          >
            <span style={{ fontSize: 18 }}>&larr;</span>
            {lang === 'ko' ? '목록으로' : 'All reviews'}
          </Link>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
            <span className="badge" style={{ background: s.accent, color: '#fff', borderColor: 'transparent' }}>
              {s.kor} · {s.en.toUpperCase()}
            </span>
            <span className="t-mono-xs" style={{ color: dark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)' }}>
              {reviewLang === 'ko' ? 'KO' : 'EN'}
            </span>
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(28px, 4vw, 48px)',
              fontWeight: 500,
              letterSpacing: '-0.8px',
              lineHeight: 1.1,
              margin: 0,
            }}
          >
            {title}
          </h1>

          {siblingSlug && (
            <Link
              href={`/reviews/${siblingSlug}`}
              className="t-mono-sm"
              style={{
                display: 'inline-block',
                marginTop: 16,
                color: s.accent,
                textDecoration: 'none',
                padding: '4px 10px',
                border: `1px solid ${dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)'}`,
                borderRadius: 4,
              }}
            >
              {reviewLang === 'ko' ? 'READ IN ENGLISH \u2192' : '\ud55c\uad6d\uc5b4\ub85c \uc77d\uae30 \u2192'}
            </Link>
          )}
        </div>
      </div>

      {/* Divider */}
      <div style={{ borderTop: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}` }} />

      {/* Article body */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 32px 80px' }}>
        <article
          className="review-body"
          dangerouslySetInnerHTML={{ __html: bodyHtml }}
        />

        {/* In-article ad slot */}
        <div style={{ marginTop: 48, paddingTop: 48, borderTop: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}` }}>
          <AdSlot variant="in-article" />
        </div>
      </div>
    </div>
  );
}
