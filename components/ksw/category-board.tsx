'use client';

import { useMemo, useState } from 'react';
import { StoryCard } from './story-card';
import { useKSWTheme, type Season } from './theme-provider';
import { CATEGORY_LABELS, type ReviewCategory } from '@/lib/categories';

interface Item {
  slug: string;
  title: string;
  excerpt: string;
  image?: string;
  season: Season;
  lang: 'ko' | 'en';
  category: ReviewCategory;
}

export function CategoryBoard({ items, category }: { items: Item[]; category: ReviewCategory }) {
  const { lang, dark } = useKSWTheme();
  const [filter, setFilter] = useState<'all' | 'ko' | 'en'>('all');
  const label = CATEGORY_LABELS[category];

  const visible = useMemo(() => {
    if (filter === 'all') return items.filter((i) => i.lang === lang);
    return items.filter((i) => i.lang === filter);
  }, [items, filter, lang]);

  return (
    <>
      <section
        style={{
          padding: '64px 32px',
          background: dark ? 'linear-gradient(180deg, rgba(58,74,125,0.10) 0%, transparent 100%)' : 'linear-gradient(180deg, rgba(58,74,125,0.05) 0%, transparent 100%)',
          borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)'}`,
        }}
      >
        <div className="ksw-container">
          <span className="t-mono-sm" style={{ color: 'var(--season-accent)' }}>KSTORYWORLD · {label.en.toUpperCase()}</span>
          <h1
            style={{
              margin: '12px 0 12px',
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(36px, 5vw, 64px)',
              fontWeight: 500,
              letterSpacing: '-0.5px',
              lineHeight: 1.05,
              color: dark ? '#fff' : '#000',
            }}
          >
            {lang === 'ko' ? `${label.ko} 리뷰` : `${label.en} Reviews`}
          </h1>
          <p style={{ fontSize: 18, color: dark ? 'rgba(255,255,255,0.66)' : 'rgba(0,0,0,0.66)', maxWidth: 640, lineHeight: 1.5, letterSpacing: '-0.18px' }}>
            {lang === 'ko'
              ? `에디터가 엄선한 고품질 다국어 ${label.ko} 가이드`
              : `Editor-curated ${label.en} guides — high quality, in your language`}
          </p>
          <div style={{ display: 'flex', gap: 8, marginTop: 24, flexWrap: 'wrap' }}>
            {[
              { id: 'all', ko: '전체', en: 'All' },
              { id: 'ko', ko: '한국어', en: 'Korean' },
              { id: 'en', ko: '영어', en: 'English' },
            ].map((o) => (
              <button
                key={o.id}
                onClick={() => setFilter(o.id as typeof filter)}
                style={{
                  padding: '10px 14px',
                  background: filter === o.id ? (dark ? '#fff' : '#010120') : 'transparent',
                  color: filter === o.id ? (dark ? '#010120' : '#fff') : dark ? '#fff' : '#000',
                  border: `1px solid ${filter === o.id ? 'transparent' : dark ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.10)'}`,
                  borderRadius: 4,
                  fontFamily: 'var(--font-display)',
                  fontSize: 14,
                  fontWeight: 500,
                  letterSpacing: '-0.14px',
                  cursor: 'pointer',
                }}
              >
                {lang === 'ko' ? o.ko : o.en}
              </button>
            ))}
            <span className="t-mono-sm" style={{ display: 'inline-flex', alignItems: 'center', marginLeft: 8, color: dark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)' }}>
              {visible.length} {lang === 'ko' ? '편' : 'stories'}
            </span>
          </div>
        </div>
      </section>

      <section style={{ padding: '64px 32px', background: dark ? '#010120' : '#fff' }}>
        <div className="ksw-container">
          {visible.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '80px 0',
                color: dark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)',
              }}
            >
              {lang === 'ko' ? '아직 등록된 리뷰가 없습니다.' : 'No reviews yet.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {visible.map((s, i) => (
                <StoryCard
                  key={s.slug}
                  href={`/${category}/${s.slug}`}
                  title={s.title}
                  excerpt={s.excerpt}
                  image={s.image}
                  num={String(i + 1).padStart(2, '0')}
                  season={s.season}
                  category={label.en}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
