'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { SEASONS, useKSWTheme, type Season } from './theme-provider';
import { CATEGORY_LABELS, type ReviewCategory } from '@/lib/categories';

interface Props {
  href: string;
  title: string;
  excerpt: string;
  image?: string;
  num: string;
  season: Season;
  category: ReviewCategory;
  large?: boolean;
}

export function StoryCard({ href, title, excerpt, image, num, season, category, large }: Props) {
  const { dark, lang } = useKSWTheme();
  const [hover, setHover] = useState(false);
  const s = SEASONS[season];

  const labelKo = CATEGORY_LABELS[category].ko;
  const labelEn = CATEGORY_LABELS[category].en;

  return (
    <Link
      href={href}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="ksw-card"
      style={{
        display: 'block',
        textDecoration: 'none',
        color: dark ? '#fff' : '#000',
        background: dark ? '#0a0a2e' : '#fff',
        border: `1px solid ${dark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)'}`,
      }}
    >
      <div style={{ height: large ? 260 : 200, background: s.grad, position: 'relative', overflow: 'hidden' }}>
        {image && (
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            unoptimized
            style={{ objectFit: 'cover', transition: 'transform 500ms', transform: hover ? 'scale(1.04)' : 'scale(1)' }}
          />
        )}
        <span
          className="t-mono-sm"
          style={{
            position: 'absolute',
            top: 14,
            left: 14,
            padding: '3px 8px',
            background: 'rgba(255,255,255,0.92)',
            borderRadius: 4,
            color: '#000',
            zIndex: 2,
          }}
        >
          {num} · {labelEn.toUpperCase()}
        </span>
        <div
          style={{
            position: 'absolute',
            right: 14,
            bottom: 14,
            fontFamily: 'var(--font-display)',
            fontSize: large ? 56 : 42,
            fontWeight: 500,
            letterSpacing: '-1px',
            lineHeight: 0.95,
            color: 'rgba(255,255,255,0.85)',
            mixBlendMode: 'overlay',
            zIndex: 2,
            maxWidth: '60%',
            textAlign: 'right',
          }}
        >
          {labelKo}
        </div>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, transparent 50%, rgba(1,1,32,0.45) 100%)',
            opacity: hover ? 1 : 0.7,
            transition: 'opacity 240ms',
            zIndex: 1,
          }}
        />
      </div>
      <div style={{ padding: '22px 24px 26px' }}>
        <div className="t-mono-sm" style={{ color: dark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)' }}>
          {lang === 'ko' ? labelKo : labelEn.toUpperCase()}
        </div>
        <h3
          style={{
            margin: '10px 0 8px',
            fontFamily: 'var(--font-display)',
            fontSize: large ? 26 : 21,
            letterSpacing: '-0.3px',
            fontWeight: 500,
            lineHeight: 1.18,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {title}
        </h3>
        <p
          style={{
            margin: 0,
            fontSize: 14,
            color: dark ? 'rgba(255,255,255,0.62)' : 'rgba(0,0,0,0.62)',
            letterSpacing: '-0.07px',
            lineHeight: 1.45,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {excerpt}
        </p>
      </div>
    </Link>
  );
}
