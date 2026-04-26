'use client';

import { SEASONS, useKSWTheme } from './theme-provider';

export function HeroStandard() {
  const { season, lang, dark } = useKSWTheme();
  const s = SEASONS[season];

  return (
    <section
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: dark ? '#010120' : '#fff',
        color: dark ? '#fff' : '#000',
      }}
    >
      {!dark && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          {s.blooms.map((b, i) => (
            <div
              key={i}
              className="bloom"
              style={{
                width: b.w,
                height: b.h,
                background: b.bg,
                filter: `blur(${b.b}px)`,
                opacity: b.o,
                left: b.x,
                top: b.y,
              }}
            />
          ))}
        </div>
      )}

      {/* Meta line */}
      <div style={{ position: 'relative', padding: '48px 32px 0' }}>
        <div
          className="ksw-container"
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 32, padding: 0 }}
        >
          <span className="t-mono-sm" style={{ color: dark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)' }}>
            VOL.04 · {s.en.toUpperCase()} · KSTORYWORLD
          </span>
        </div>
      </div>

      {/* Headline + subtext */}
      <div style={{ position: 'relative', padding: '32px 32px 0' }}>
        <div className="ksw-container" style={{ padding: 0 }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-end">
            <div>
              <h1
                style={{
                  margin: 0,
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(40px, 5.5vw, 72px)',
                  letterSpacing: '-1.2px',
                  lineHeight: 1.05,
                  fontWeight: 500,
                }}
              >
                {lang === 'ko' ? (
                  <>
                    {s.kor}의 이야기,
                    <br />
                    <span style={{ color: s.accent }}>세계</span>의 언어로.
                  </>
                ) : (
                  <>
                    Stories of {s.en.toLowerCase()},
                    <br />
                    in <span style={{ color: s.accent }}>every</span> language.
                  </>
                )}
              </h1>
            </div>
            <div style={{ maxWidth: 440 }}>
              <p
                style={{
                  margin: 0,
                  fontSize: 16,
                  color: dark ? 'rgba(255,255,255,0.66)' : 'rgba(0,0,0,0.66)',
                  letterSpacing: '-0.16px',
                  lineHeight: 1.5,
                }}
              >
                {lang === 'ko'
                  ? 'KStoryWorld는 K-드라마, K-팝, K-푸드, K-뷰티, K-문학 등 한국의 K-콘텐츠를 8개 언어의 에디토리얼로 옮기는 글로벌 매체입니다.'
                  : 'KStoryWorld delivers K-drama, K-pop, K-food, K-beauty, and K-literature as editorial content in eight world languages.'}
              </p>
              <div style={{ display: 'flex', gap: 10, marginTop: 24, flexWrap: 'wrap' }}>
                <a
                  href="/reviews"
                  className="btn btn-dark"
                  style={{
                    background: dark ? '#fff' : '#010120',
                    color: dark ? '#010120' : '#fff',
                  }}
                >
                  {lang === 'ko' ? '전체 리뷰 읽기 \u2192' : 'Read reviews \u2192'}
                </a>
                <a
                  href="/reviews"
                  className="btn btn-outline"
                  style={{
                    borderColor: dark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.10)',
                    color: dark ? '#fff' : '#000',
                  }}
                >
                  {lang === 'ko' ? '이번 주 발간' : "This week's issue"}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Season stat band inline */}
      <div
        style={{
          position: 'relative',
          padding: '48px 32px 64px',
          marginTop: 48,
          borderTop: `1px solid ${dark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)'}`,
        }}
      >
        <div className="ksw-container" style={{ padding: 0 }}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { n: s.kor, label: s.en.toUpperCase() },
              { n: '8', label: 'LANGUAGES' },
              { n: '30+', label: 'K-DRAMA REVIEWS' },
              { n: '60', label: 'EDITORIAL PAGES' },
            ].map((item, i) => (
              <div key={i}>
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(28px, 3.5vw, 48px)',
                    fontWeight: 500,
                    letterSpacing: '-0.8px',
                    lineHeight: 1,
                  }}
                >
                  {item.n}
                </div>
                <div className="t-mono-sm" style={{ marginTop: 10, color: dark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)' }}>
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
