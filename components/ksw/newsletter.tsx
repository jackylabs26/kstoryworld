'use client';

import { SEASONS, useKSWTheme } from './theme-provider';

export function NewsletterCTA() {
  const { season, lang, dark } = useKSWTheme();
  const accent = SEASONS[season].accent;

  return (
    <section
      style={{
        padding: '88px 32px',
        background: dark ? '#010120' : '#fff',
        color: dark ? '#fff' : '#000',
        position: 'relative',
        overflow: 'hidden',
        borderTop: `1px solid ${dark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)'}`,
      }}
    >
      {!dark && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div
            style={{
              position: 'absolute',
              width: 600,
              height: 600,
              borderRadius: '50%',
              background: accent,
              filter: 'blur(80px)',
              opacity: 0.35,
              right: -150,
              top: -100,
            }}
          />
        </div>
      )}
      <div className="ksw-container" style={{ position: 'relative' }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <span className="t-mono-sm" style={{ color: dark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)' }}>
              NEWSLETTER · 매주 금요일
            </span>
            <h2 style={{ margin: '14px 0 16px', fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 4vw, 48px)', letterSpacing: '-0.5px', fontWeight: 500, lineHeight: 1.05 }}>
              {lang === 'ko' ? (
                <>금요일 아침,<br />한국이 도착합니다.</>
              ) : (
                <>Korea, in your inbox<br />every Friday morning.</>
              )}
            </h2>
            <p style={{ margin: 0, fontSize: 16, color: dark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.66)', letterSpacing: '-0.16px', lineHeight: 1.5, maxWidth: 480 }}>
              {lang === 'ko'
                ? '한 주의 베스트 K-드라마 리뷰와 에디터 노트. 광고 없음. 언제든 구독 취소.'
                : "The week's best K-Drama reviews, plus a short note from our editor. No ads. Unsubscribe anytime."}
            </p>
          </div>
          <form onSubmit={(e) => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <input
                type="email"
                placeholder={lang === 'ko' ? '이메일 주소' : 'your@email.com'}
                style={{
                  flex: '1 1 240px',
                  padding: '14px 16px',
                  border: `1px solid ${dark ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.10)'}`,
                  borderRadius: 4,
                  background: dark ? 'rgba(255,255,255,0.06)' : '#fff',
                  color: dark ? '#fff' : '#000',
                  fontSize: 15,
                  letterSpacing: '-0.15px',
                  fontFamily: 'var(--font-body)',
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                className="btn btn-dark"
                style={{ background: dark ? '#fff' : '#010120', color: dark ? '#010120' : '#fff' }}
              >
                {lang === 'ko' ? '구독' : 'Subscribe'}
              </button>
            </div>
            <span className="t-mono-sm" style={{ color: dark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)' }}>
              {lang === 'ko' ? '한국어 · ENGLISH 중 선택 가능' : 'AVAILABLE IN KO · EN'}
            </span>
          </form>
        </div>
      </div>
    </section>
  );
}
