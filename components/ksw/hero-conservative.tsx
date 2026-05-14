'use client';

import { SEASONS, useKSWTheme } from './theme-provider';

export function HeroConservative() {
  const { season, lang, dark } = useKSWTheme();
  const s = SEASONS[season];

  return (
    <section
      className="px-5 py-14 md:px-8 md:py-[100px] md:pb-[120px]"
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
                opacity: b.o * 0.6,
                left: b.x,
                top: b.y,
              }}
            />
          ))}
        </div>
      )}

      <div className="ksw-container" style={{ position: 'relative', padding: 0 }}>
        <span className="badge">
          {s.kor} · {s.en.toUpperCase()} · ISSUE 04
        </span>

        <h1
          className="t-display"
          style={{
            margin: '18px 0 0',
            maxWidth: 880,
            fontSize: 'clamp(36px, 5vw, 64px)',
            letterSpacing: 'clamp(-1.08px, -1.5vw, -1.92px)',
            lineHeight: 1.05,
          }}
        >
          {lang === 'ko' ? (
            <>
              한국의 모든 이야기,
              <br />
              세심하게 전합니다.
            </>
          ) : (
            <>
              Every Korean story,
              <br />
              told with care.
            </>
          )}
        </h1>

        <p
          className="t-body-l"
          style={{
            margin: '20px 0 32px',
            maxWidth: 560,
            color: dark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
          }}
        >
          {lang === 'ko'
            ? '판소리에서 오늘의 K-드라마까지, 정(情)의 실은 우리가 번역하는 모든 것에 흐릅니다.'
            : "From p'ansori to today's K-drama, the thread of jeong runs through everything we publish \u2014 translated by humans, illustrated with restraint."}
        </p>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <a
            href="/reviews"
            className="btn btn-dark"
            style={{
              background: dark ? '#fff' : '#010120',
              color: dark ? '#010120' : '#fff',
            }}
          >
            {lang === 'ko' ? '이야기 시작하기 \u2192' : 'Start with a tale \u2192'}
          </a>
          <a
            href="/reviews"
            className="btn btn-outline"
            style={{
              borderColor: dark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.10)',
              color: dark ? '#fff' : '#000',
            }}
          >
            {lang === 'ko' ? '이야기 둘러보기' : 'Browse stories'}
          </a>
        </div>
      </div>
    </section>
  );
}
