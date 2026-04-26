'use client';

import { SEASONS, type Season } from './theme-provider';

interface Props {
  season?: Season;
  size?: number;
}

// Friendly K mark — soft-square seasonal gradient with a smiling 'k' and tiny eyes.
export function KSWLogoMark({ season = 'winter', size = 36 }: Props) {
  const s = SEASONS[season];
  const colors = (s.grad.match(/#[0-9a-fA-F]{6}/g) || ['#ffd6e0', '#ffb7a0', '#bdbbff']);
  const ink = '#010120';
  const gradId = `ksw-mark-${season}`;
  return (
    <svg width={size} height={size} viewBox="0 0 52 52" aria-hidden="true" style={{ flexShrink: 0, display: 'block' }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={colors[0]} />
          <stop offset="55%" stopColor={colors[1] || colors[0]} />
          <stop offset="100%" stopColor={colors[2] || colors[1] || colors[0]} />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="52" height="52" rx="14" fill={`url(#${gradId})`} />
      {/* k stem */}
      <path d="M16 12 L16 40" stroke={ink} strokeWidth="5" strokeLinecap="round" />
      {/* k arms — soft curve, like a smile */}
      <path d="M36 20 Q24 26 22 28 Q24 30 36 40" stroke={ink} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* tiny eyes — friendly bit */}
      <circle cx="42" cy="14" r="1.8" fill={ink} />
      <circle cx="46" cy="18" r="1.4" fill={ink} />
    </svg>
  );
}
