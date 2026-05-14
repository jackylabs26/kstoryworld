'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { KSWLogoMark } from './ksw/logo-mark';
import { SEASONS, useKSWTheme, type Lang } from './ksw/theme-provider';

const NAV = [
  { href: '/', ko: '홈', en: 'Home' },
  { href: '/k-drama', ko: 'K-드라마', en: 'K-Drama' },
  { href: '/k-pop', ko: 'K-팝', en: 'K-Pop' },
  { href: '/k-beauty', ko: 'K-뷰티', en: 'K-Beauty' },
  { href: '/k-food', ko: 'K-푸드', en: 'K-Food' },
  { href: '/k-travel', ko: 'K-트래블', en: 'K-Travel' },
  { href: '/k-literature', ko: 'K-문학', en: 'K-Literature' },
];

const LANG_OPTS: { c: Lang; l: string }[] = [
  { c: 'ko', l: '한국어' },
  { c: 'en', l: 'EN' },
];

export default function Navigation() {
  const { season, lang, setLang, dark, setDark, siblingHref } = useKSWTheme();
  const router = useRouter();
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
          height: scrolled ? 52 : 64,
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
                onClick={() => {
                  if (o.c === lang) return;
                  if (siblingHref) {
                    router.push(siblingHref);
                  } else {
                    setLang(o.c);
                  }
                }}
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
            {dark ? (
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M14.3 10.5A6.5 6.5 0 015.5 1.7a7 7 0 108.8 8.8z" fill="currentColor"/></svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="3.5" fill="currentColor"/><path d="M8 0v2m0 12v2m8-8h-2M2 8H0m13.66-5.66L12.24 3.76M3.76 12.24l-1.42 1.42m11.32 0l-1.42-1.42M3.76 3.76L2.34 2.34" stroke="currentColor" strokeWidth="1.2"/></svg>
            )}
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
