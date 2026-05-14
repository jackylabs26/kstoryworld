'use client';

import { SEASONS, useKSWTheme } from './theme-provider';

interface Props {
  dramaCount: number;
  totalPages: number;
}

export function StatsBand({ dramaCount, totalPages }: Props) {
  const { season, lang, dark } = useKSWTheme();
  const accent = SEASONS[season].accent;

  const stats = [
    { n: `${dramaCount}+`, ko: 'K-드라마 리뷰', en: 'K-Drama reviews' },
    { n: '2', ko: '서비스 언어', en: 'Languages live' },
    { n: `${totalPages}`, ko: '에디토리얼 페이지', en: 'Editorial pages' },
    { n: '100%', ko: '오리지널 에디토리얼', en: 'Original editorial' },
  ];

  return (
    <section
      className="px-5 py-8 md:px-8 md:py-14"
      style={{
        borderTop: `1px solid ${dark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)'}`,
        borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)'}`,
        background: dark ? '#010120' : '#fff',
        color: dark ? '#fff' : '#000',
      }}
    >
      <div className="ksw-container grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
        {stats.map((st, i) => (
          <div
            key={i}
            style={{
              borderLeft: i === 0 ? 'none' : `1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
              paddingLeft: i === 0 ? 0 : 'clamp(16px, 3vw, 32px)',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(36px, 5vw, 64px)',
                fontWeight: 500,
                letterSpacing: '-1.2px',
                lineHeight: 1,
                color: i === 1 ? accent : undefined,
              }}
            >
              {st.n}
            </div>
            <div className="t-mono-sm" style={{ marginTop: 14, color: dark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)' }}>
              {lang === 'ko' ? st.ko : st.en}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
