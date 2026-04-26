'use client';

import { SEASONS, useKSWTheme } from './theme-provider';

export function HeroBold() {
  const { season, lang, dark } = useKSWTheme();
  const s = SEASONS[season];

  return (
    <section style={{ position: 'relative', overflow: 'hidden', background: dark ? '#010120' : '#fff', color: dark ? '#fff' : '#000' }}>
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

      {/* meta line */}
      <div style={{ position: 'relative', padding: '48px 32px 0' }}>
        <div className="ksw-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 32, padding: 0 }}>
          <span className="t-mono-sm" style={{ color: dark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)' }}>
            VOL.04 · {s.en.toUpperCase()} · KSTORYWORLD
          </span>
          <span className="t-mono-sm" style={{ color: dark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)' }}>
            SEOUL · 26.04.27 · KST
          </span>
        </div>
      </div>

      {/* Giant hangul wordmark */}
      <div style={{ position: 'relative', padding: '24px 32px 0' }}>
        <div className="ksw-container" style={{ position: 'relative', padding: 0 }}>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 500,
              fontSize: 'clamp(140px, 26vw, 340px)',
              lineHeight: 0.82,
              letterSpacing: '-12px',
              color: dark ? '#fff' : '#000',
              whiteSpace: 'nowrap',
              userSelect: 'none',
            }}
          >
            {s.kor}
            <span style={{ color: s.accent }}>·</span>
          </div>
          <div style={{ position: 'absolute', right: 0, bottom: 32, maxWidth: 520 }} className="hidden md:block">
            <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 'clamp(22px, 2.4vw, 36px)', letterSpacing: '-0.4px', lineHeight: 1.12, fontWeight: 500 }}>
              {lang === 'ko' ? (
                <>
                  {s.kor}이 오는 방식 —{' '}
                  <span style={{ color: dark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)' }}>
                    드라마, K팝, 식탁, 그리고 한 편의 시.
                  </span>
                </>
              ) : (
                <>
                  The way {s.en.toLowerCase()} arrives —{' '}
                  <span style={{ color: dark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)' }}>
                    in drama, in music, on the table, in a single poem.
                  </span>
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Featured headline + story tiles */}
      <div
        style={{
          position: 'relative',
          padding: '40px 32px 80px',
          borderTop: `1px solid ${dark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)'}`,
          marginTop: 40,
        }}
      >
        <div className="ksw-container" style={{ padding: 0 }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <span className="badge">FEATURED · 이번 호의 표지</span>
              <h1 style={{ margin: '16px 0 0', fontFamily: 'var(--font-display)', fontSize: 'clamp(34px, 4.5vw, 56px)', letterSpacing: '-0.4px', lineHeight: 1.05, fontWeight: 500 }}>
                {lang === 'ko' ? (
                  <>한 회차가 한 세대를<br />정의할 때.</>
                ) : (
                  <>When a single episode<br />defines a generation.</>
                )}
              </h1>
              <p style={{ marginTop: 18, fontSize: 16, color: dark ? 'rgba(255,255,255,0.72)' : 'rgba(0,0,0,0.66)', letterSpacing: '-0.16px', lineHeight: 1.5, maxWidth: 480 }}>
                {lang === 'ko'
                  ? 'AI가 정리한 K-드라마 한 편씩 — KStoryWorld는 매주 한국의 컨텐츠를 8개 언어의 에디토리얼로 옮깁니다.'
                  : 'One K-drama at a time — KStoryWorld delivers Korean stories as editorial in eight world languages.'}
              </p>
              <div style={{ display: 'flex', gap: 10, marginTop: 24, flexWrap: 'wrap' }}>
                <a href="/reviews" className="btn btn-dark" style={{ background: dark ? '#fff' : '#010120', color: dark ? '#010120' : '#fff' }}>
                  {lang === 'ko' ? '전체 리뷰 읽기 →' : 'Read all reviews →'}
                </a>
                <a href="/reviews" className="btn btn-outline" style={{ borderColor: dark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.10)', color: dark ? '#fff' : '#000' }}>
                  {lang === 'ko' ? '이번 주 발간' : "This week's issue"}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
