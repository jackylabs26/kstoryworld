'use client';

import { type ReviewCategory } from '@/lib/categories';
import { StoryCard } from './story-card';
import { useKSWTheme, type Season } from './theme-provider';

export interface PickItem {
  slug: string;
  title: string;
  excerpt: string;
  image?: string;
  season: Season;
  lang: 'ko' | 'en';
  category: ReviewCategory;
}

interface Props {
  items: PickItem[];
}

export function EditorsPickSection({ items }: Props) {
  const { lang, dark } = useKSWTheme();

  const sameLang = items.filter((i) => i.lang === lang);
  const visible = (sameLang.length ? sameLang : items).slice(0, 5);

  if (visible.length === 0) return null;

  const featured = visible[0];
  const rest = visible.slice(1);

  return (
    <section
      style={{
        padding: '72px 32px',
        background: dark ? '#010120' : '#fff',
        color: dark ? '#fff' : '#000',
      }}
    >
      <div className="ksw-container">
        <div style={{ marginBottom: 36 }}>
          <span
            className="t-mono-sm"
            style={{ color: dark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)' }}
          >
            EDITOR&apos;S PICK
          </span>
          <h2
            style={{
              margin: '8px 0 0',
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(28px, 3.5vw, 40px)',
              letterSpacing: '-0.4px',
              fontWeight: 500,
              lineHeight: 1.12,
            }}
          >
            {lang === 'ko' ? '에디터 추천' : "Editor's Pick"}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          <div className="lg:col-span-2">
            <StoryCard
              href={`/reviews/${featured.slug}`}
              title={featured.title}
              excerpt={featured.excerpt}
              image={featured.image}
              num="★"
              season={featured.season}
              category={featured.category}
              large
            />
          </div>
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-5">
            {rest.map((s, i) => (
              <StoryCard
                key={s.slug}
                href={`/reviews/${s.slug}`}
                title={s.title}
                excerpt={s.excerpt}
                image={s.image}
                num={String(i + 2).padStart(2, '0')}
                season={s.season}
                category={s.category}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
