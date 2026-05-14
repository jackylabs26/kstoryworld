'use client';

import { type ReviewCategory } from '@/lib/categories';
import { StoryCard } from './story-card';
import { useKSWTheme, type Season } from './theme-provider';

export interface CategoryItem {
  slug: string;
  title: string;
  excerpt: string;
  image?: string;
  season: Season;
  lang: 'ko' | 'en';
}

export interface CategoryDef {
  id: ReviewCategory;
  kor: string;
  en: string;
  href: string;
}

interface Props {
  category: CategoryDef;
  items: CategoryItem[];
  even?: boolean;
}

export function CategorySection({ category, items, even }: Props) {
  const { lang, dark } = useKSWTheme();

  const sameLang = items.filter((i) => i.lang === lang);
  const visible = (sameLang.length ? sameLang : items).slice(0, 4);
  const isEmpty = visible.length === 0;

  return (
    <section
      style={{
        padding: '64px 32px',
        background: even
          ? dark ? '#0a0a2e' : '#fafafa'
          : dark ? '#010120' : '#fff',
        color: dark ? '#fff' : '#000',
      }}
    >
      <div className="ksw-container">
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            marginBottom: 32,
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <div>
            <span
              className="t-mono-sm"
              style={{ color: dark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)' }}
            >
              CATEGORY
            </span>
            <h2
              style={{
                margin: '8px 0 0',
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(26px, 3.5vw, 38px)',
                letterSpacing: '-0.3px',
                fontWeight: 500,
                lineHeight: 1.15,
              }}
            >
              {lang === 'ko' ? category.kor : category.en}
            </h2>
          </div>
          <a
            href={category.href}
            className="t-mono-sm"
            style={{
              color: dark ? '#fff' : '#000',
              textDecoration: 'none',
              padding: '10px 14px',
              border: `1px solid ${dark ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.10)'}`,
              borderRadius: 4,
            }}
          >
            {lang === 'ko' ? '더보기 →' : 'View more →'}
          </a>
        </div>

        {isEmpty ? (
          <div
            style={{
              padding: '48px 24px',
              textAlign: 'center',
              border: `1px dashed ${dark ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.12)'}`,
              borderRadius: 8,
              color: dark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 18,
                fontWeight: 500,
                margin: '0 0 8px',
              }}
            >
              {lang === 'ko' ? '콘텐츠 준비 중' : 'Coming soon'}
            </p>
            <p className="t-mono-sm" style={{ margin: 0 }}>
              {lang === 'ko'
                ? `${category.kor} 콘텐츠가 곧 찾아옵니다.`
                : `${category.en} content is on the way.`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {visible.map((s, i) => (
              <StoryCard
                key={s.slug}
                href={`/reviews/${s.slug}`}
                title={s.title}
                excerpt={s.excerpt}
                image={s.image}
                num={String(i + 1).padStart(2, '0')}
                season={s.season}
                category={category.id}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
