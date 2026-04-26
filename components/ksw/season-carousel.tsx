'use client';

import { SEASONS, useKSWTheme, type Season } from './theme-provider';

const ORDER: Season[] = ['spring', 'summer', 'autumn', 'winter'];

export function SeasonCarousel() {
  const { season, setSeason, lang, dark } = useKSWTheme();

  return (
    <section
      style={{
        padding: '80px 32px',
        background: dark ? '#010120' : '#fff',
        color: dark ? '#fff' : '#000',
        borderTop: `1px solid ${dark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)'}`,
      }}
    >
      <div className="ksw-container">
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 36, gap: 20, flexWrap: 'wrap' }}>
          <div>
            <span className="t-mono-sm" style={{ color: dark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)' }}>
              사계 · FOUR SEASONS COLLECTION
            </span>
            <h2 style={{ margin: '12px 0 0', fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 3.5vw, 40px)', letterSpacing: '-0.4px', fontWeight: 500, lineHeight: 1.1 }}>
              {lang === 'ko' ? '계절을 따라 읽는 한국' : 'Reading Korea, season by season'}
            </h2>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {ORDER.map((o) => (
              <button
                key={o}
                onClick={() => setSeason(o)}
                style={{
                  padding: '10px 14px',
                  background: season === o ? (dark ? '#fff' : '#010120') : 'transparent',
                  color: season === o ? (dark ? '#010120' : '#fff') : dark ? '#fff' : '#000',
                  border: `1px solid ${season === o ? 'transparent' : dark ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.10)'}`,
                  borderRadius: 4,
                  fontFamily: 'var(--font-display)',
                  fontSize: 14,
                  fontWeight: 500,
                  letterSpacing: '-0.14px',
                  cursor: 'pointer',
                }}
              >
                {SEASONS[o].kor} · {SEASONS[o].en}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
          {ORDER.map((o, i) => {
            const ss = SEASONS[o];
            const active = season === o;
            return (
              <button
                key={o}
                onClick={() => setSeason(o)}
                style={{
                  position: 'relative',
                  aspectRatio: '3 / 4',
                  background: ss.grad,
                  border: 'none',
                  borderRadius: 8,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  padding: 0,
                  outline: active ? `2px solid ${dark ? '#fff' : '#010120'}` : 'none',
                  outlineOffset: active ? 2 : 0,
                  transform: active ? 'translateY(-3px)' : 'translateY(0)',
                  transition: 'all 240ms cubic-bezier(0.2,0.8,0.2,1)',
                  boxShadow: active ? '0 12px 28px rgba(1,1,32,0.18)' : '0 4px 10px rgba(1,1,32,0.10)',
                }}
              >
                <div style={{ position: 'absolute', top: 16, left: 16, right: 16, display: 'flex', justifyContent: 'space-between' }}>
                  <span className="t-mono-sm" style={{ padding: '3px 8px', background: 'rgba(255,255,255,0.92)', borderRadius: 4, color: '#000' }}>
                    0{i + 1}
                  </span>
                  <span className="t-mono-sm" style={{ color: '#000', opacity: 0.7 }}>
                    {ss.en.toUpperCase()}
                  </span>
                </div>
                <div style={{ position: 'absolute', left: 16, bottom: 14, right: 16, textAlign: 'left' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 64, fontWeight: 500, letterSpacing: '-1.5px', lineHeight: 0.9, color: '#000' }}>
                    {ss.kor}
                  </div>
                  <div className="t-mono-sm" style={{ marginTop: 10, color: 'rgba(0,0,0,0.7)' }}>
                    KSTORYWORLD · K-DRAMA
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
