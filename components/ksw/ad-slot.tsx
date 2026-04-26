'use client';

import { useKSWTheme } from './theme-provider';

type AdSlotVariant = 'banner' | 'in-article' | 'sidebar';

const SLOT_LABELS: Record<AdSlotVariant, { ko: string; en: string }> = {
  banner: { ko: '광고', en: 'ADVERTISEMENT' },
  'in-article': { ko: '광고', en: 'ADVERTISEMENT' },
  sidebar: { ko: '광고', en: 'AD' },
};

interface AdSlotProps {
  variant?: AdSlotVariant;
  className?: string;
}

/**
 * Placeholder ad slot component.
 * Replace the inner div with real AdSense <ins> tag once pub ID is approved.
 *
 * Recommended positions (per design audit):
 * 1. banner    — between CollectionGrid and StatsBand on home page
 * 2. in-article — after 2nd <h2> or halfway through review body
 * 3. banner    — above Footer (site-wide)
 * 4. in-article — after review article, before related reviews
 */
export function AdSlot({ variant = 'banner', className }: AdSlotProps) {
  const { lang, dark } = useKSWTheme();
  const label = SLOT_LABELS[variant][lang];

  const heights: Record<AdSlotVariant, number> = {
    banner: 90,
    'in-article': 250,
    sidebar: 600,
  };

  return (
    <aside
      aria-label={label}
      className={className}
      style={{
        width: '100%',
        maxWidth: variant === 'sidebar' ? 300 : undefined,
      }}
    >
      <div className="t-mono-xs" style={{ textAlign: 'center', marginBottom: 6, color: dark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)' }}>
        {label}
      </div>
      {/* Replace this placeholder with: <ins class="adsbygoogle" data-ad-client="ca-pub-XXXX" data-ad-slot="XXXX" ... /> */}
      <div
        style={{
          height: heights[variant],
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 'var(--radius-card)',
          border: `1px dashed ${dark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)'}`,
          background: dark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
        }}
      >
        <span className="t-mono-xs" style={{ color: dark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)' }}>
          ADSENSE · {variant.toUpperCase()} · {heights[variant]}px
        </span>
      </div>
    </aside>
  );
}
