'use client';

import Link from 'next/link';
import { KSWLogoMark } from './ksw/logo-mark';
import { SEASONS, useKSWTheme } from './ksw/theme-provider';

export default function Footer() {
  const { season, lang } = useKSWTheme();
  const accent = SEASONS[season].accent;

  const cols = [
    {
      h: lang === 'ko' ? '카테고리' : 'Categories',
      links: (lang === 'ko'
        ? ['K-드라마', 'K-팝', 'K-푸드', 'K-뷰티', 'K-문학']
        : ['K-Drama', 'K-Pop', 'K-Food', 'K-Beauty', 'K-Literature']
      ).map((x) => ({ label: x, href: '/reviews/' })),
    },
    {
      h: lang === 'ko' ? '회사' : 'Company',
      links: [
        { label: lang === 'ko' ? '소개' : 'About', href: '/about/' },
        { label: lang === 'ko' ? '문의' : 'Contact', href: 'mailto:hello@kstoryworld.com' },
      ],
    },
    {
      h: lang === 'ko' ? '법적 고지' : 'Legal',
      links: [
        { label: lang === 'ko' ? '이용약관' : 'Terms', href: '/terms/' },
        { label: lang === 'ko' ? '개인정보처리방침' : 'Privacy', href: '/privacy/' },
      ],
    },
  ];

  return (
    <footer style={{ background: '#010120', color: '#fff', position: 'relative', overflow: 'hidden', paddingTop: 80 }}>
      <div
        className="ksw-container"
        style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48 }}
      >
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <KSWLogoMark season={season} size={36} />
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 23, fontWeight: 500, letterSpacing: '-0.46px', color: '#fff' }}>
              kstoryworld
            </span>
            <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: accent, transform: 'translateY(-1px)' }} />
          </div>
          <p style={{ marginTop: 18, maxWidth: 340, fontSize: 14, color: 'rgba(255,255,255,0.7)', letterSpacing: '-0.07px', lineHeight: 1.55 }}>
            {lang === 'ko'
              ? '한국의 모든 이야기, 세계의 언어로. JackyLabs가 만듭니다.'
              : 'Every Korean story, in world languages. Made by JackyLabs.'}
          </p>
          <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
            {[
              { l: 'IG', n: 'Instagram' },
              { l: 'YT', n: 'YouTube' },
              { l: 'X', n: 'X / Twitter' },
              { l: 'TT', n: 'TikTok' },
            ].map((s) => (
              <a
                key={s.l}
                href="#"
                aria-label={s.n}
                style={{
                  width: 38,
                  height: 38,
                  border: '1px solid rgba(255,255,255,0.16)',
                  borderRadius: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  textDecoration: 'none',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  letterSpacing: '0.5px',
                }}
              >
                {s.l}
              </a>
            ))}
          </div>
        </div>
        {cols.map((c, i) => (
          <div key={i}>
            <div className="t-mono-sm" style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 14 }}>{c.h}</div>
            {c.links.map((item) => (
              <div key={item.label} style={{ marginBottom: 8, fontSize: 14 }}>
                <Link
                  href={item.href}
                  style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none', letterSpacing: '-0.14px' }}
                >
                  {item.label}
                </Link>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Giant wordmark */}
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(120px, 22vw, 280px)',
          fontWeight: 500,
          letterSpacing: '-9px',
          color: 'rgba(255,255,255,0.06)',
          lineHeight: 0.85,
          whiteSpace: 'nowrap',
          marginTop: 60,
          paddingLeft: 32,
          userSelect: 'none',
          overflow: 'hidden',
        }}
      >
        kstoryworld<span style={{ color: accent, opacity: 0.4 }}>·</span>
      </div>
      <div
        style={{
          borderTop: '1px solid rgba(255,255,255,0.08)',
          padding: '18px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 12,
          color: 'rgba(255,255,255,0.55)',
          letterSpacing: '0.02px',
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        <span>© 2026 KStoryWorld · Powered by JackyLabs</span>
        <span style={{ display: 'flex', gap: 16 }}>
          <Link href="/privacy/" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy</Link>
          <Link href="/terms/" style={{ color: 'inherit', textDecoration: 'none' }}>Terms</Link>
          <Link href="/about/" style={{ color: 'inherit', textDecoration: 'none' }}>About</Link>
        </span>
      </div>
    </footer>
  );
}
