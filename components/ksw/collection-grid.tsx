'use client';

import { useState } from 'react';
import { CategoryTabs } from './category-tabs';
import { StoryCard } from './story-card';
import { useKSWTheme, type Season } from './theme-provider';
import { CATEGORY_LABELS, type ReviewCategory } from '@/lib/categories';

export interface CollectionItem {
  slug: string;
  title: string;
  excerpt: string;
  image?: string;
  season: Season;
  lang: 'ko' | 'en';
  category: ReviewCategory;
}

interface Props {
  items: CollectionItem[];
}

export function CollectionGrid({ items }: Props) {
  const { lang, dark } = useKSWTheme();
  const [activeCat, setActiveCat] = useState('all');

  // language filter — show items matching the current UI lang first, fall back to other lang
  const sameLang = items.filter((i) => i.lang === lang);
  const visible = (sameLang.length ? sameLang : items).slice(0, 6);

  return (
    <>
      <CategoryTabs active={activeCat} onChange={setActiveCat} />
      <section style={{ padding: '80px 32px', background: dark ? '#010120' : '#fff', color: dark ? '#fff' : '#000' }}>
        <div className="ksw-container">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 36, gap: 20, flexWrap: 'wrap' }}>
            <div>
              <span className="t-mono-sm" style={{ color: dark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)' }}>
                EDITORIAL · 이번 주 발간
              </span>
              <h2 style={{ margin: '12px 0 0', fontFamily: 'var(--font-display)', fontSize: 'clamp(30px, 4vw, 44px)', letterSpacing: '-0.4px', fontWeight: 500, lineHeight: 1.1 }}>
                {lang === 'ko' ? '이번 주의 한국' : 'This week, in Korean'}
              </h2>
            </div>
            <a
              href="/reviews"
              className="t-mono-sm"
              style={{
                color: dark ? '#fff' : '#000',
                textDecoration: 'none',
                padding: '10px 14px',
                border: `1px solid ${dark ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.10)'}`,
                borderRadius: 4,
              }}
            >
              {lang === 'ko' ? '전체 보기 →' : 'View all →'}
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {visible.map((s, i) => (
              <StoryCard
                key={s.slug + i}
                href={`/${s.category}/${s.slug}`}
                title={s.title}
                excerpt={s.excerpt}
                image={s.image}
                num={String(i + 1).padStart(2, '0')}
                season={s.season}
                category={CATEGORY_LABELS[s.category].en}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
