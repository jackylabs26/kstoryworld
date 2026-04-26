'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { KSWLogoMark } from './ksw/logo-mark';
import { SEASONS, useKSWTheme, type Lang } from './ksw/theme-provider';

const NAV = [
  { href: '/', ko: '홈', en: 'Home' },
  { href: '/reviews', ko: '스토리', en: 'Stories' },
  { href: '/reviews?cat=drama', ko: 'K-드라마', en: 'K-Drama' },
];

const LANG_OPTS: { c: Lang; l: string }[] = [
  { c: 'ko', l: '한국어' },
  { c: 'en', l: 'EN' },
];

export default function Navigation() {
  const { season, lang, setLang, dark, setDark } = useKSWTheme();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const fg = dark ? '#fff' : '#000';
  const bg = dark
    ? scrolled ? 'rgba(1,1,32,0.78)' : 'rgba(1,1,32,0.4)'
    : scrolled ? 'rgba(255,255,255,0.82)' : 'rgba(255,255,255,0.55)';
  const border = dark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.06)';

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 30,
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        background: bg,
        borderBottom: `1px solid ${scrolled ? border : 'transparent'}`,
        transition: 'all 240ms cubic-bezier(0.2,0.8,0.2,1)',
      }}
    >
      <div
        className="ksw-container"
        style={{
          height: scrolled ? 56 : 72,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transition: 'height 240ms cubic-bezier(0.2,0.8,0.2,1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
          <Link
            href="/"
            aria-label="kstoryworld"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: fg }}
          >
            <KSWLogoMark season={season} size={36} />
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 21, fontWeight: 500, letterSpacing: '-0.42px' }}>
              kstoryworld
            </span>
            <span
              style={{
                display: 'inline-block',
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: SEASONS[season].accent,
                transform: 'translateY(-1px)',
              }}
            />
          </Link>
          <nav style={{ display: 'flex', gap: 22 }} className="hidden md:flex">
            {NAV.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                style={{ fontSize: 14, color: fg, opacity: 0.85, textDecoration: 'none', letterSpacing: '-0.14px' }}
              >
                {lang === 'ko' ? l.ko : l.en}
              </Link>
            ))}
          </nav>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {/* Language toggle */}
          <div style={{ display: 'flex', border: `1px solid ${dark ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.10)'}`, borderRadius: 4, overflow: 'hidden' }}>
            {LANG_OPTS.map((o) => (
              <button
                key={o.c}
                onClick={() => setLang(o.c)}
                className="t-mono-sm"
                style={{
                  padding: '8px 10px',
                  background: lang === o.c ? (dark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.06)') : 'transparent',
                  color: fg,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                {o.l}
              </button>
            ))}
          </div>
          <button
            onClick={() => setDark(!dark)}
            aria-label="theme"
            style={{
              width: 36,
              height: 36,
              border: `1px solid ${dark ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.10)'}`,
              borderRadius: 4,
              background: 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: fg,
              fontSize: 14,
            }}
          >
            {dark ? '☾' : '☀'}
          </button>
          <Link
            href="/reviews"
            className="btn btn-dark"
            style={{
              padding: '10px 16px',
              fontSize: 14,
              marginLeft: 6,
              background: dark ? '#fff' : '#010120',
              color: dark ? '#010120' : '#fff',
            }}
          >
            {lang === 'ko' ? '구독하기' : 'Subscribe'}
          </Link>
        </div>
      </div>
    </header>
  );
}
