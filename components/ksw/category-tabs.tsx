'use client';

import { useKSWTheme } from './theme-provider';

const CATEGORIES = [
  { id: 'all', kor: '전체', en: 'All' },
  { id: 'drama', kor: 'K-드라마', en: 'K-Drama' },
  { id: 'pop', kor: 'K-팝', en: 'K-Pop' },
  { id: 'food', kor: 'K-푸드', en: 'K-Food' },
  { id: 'beauty', kor: 'K-뷰티', en: 'K-Beauty' },
  { id: 'lit', kor: 'K-문학', en: 'K-Literature' },
];

interface Props {
  active: string;
  onChange: (id: string) => void;
}

export function CategoryTabs({ active, onChange }: Props) {
  const { lang, dark } = useKSWTheme();
  return (
    <div
      style={{
        borderTop: `1px solid ${dark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)'}`,
        borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)'}`,
        background: dark ? '#010120' : '#fff',
      }}
    >
      <div className="ksw-container" style={{ display: 'flex', gap: 0, overflowX: 'auto' }}>
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => onChange(c.id)}
            style={{
              padding: '18px 22px',
              background: 'transparent',
              border: 'none',
              borderBottom: `2px solid ${active === c.id ? (dark ? '#fff' : '#010120') : 'transparent'}`,
              color: active === c.id ? (dark ? '#fff' : '#000') : dark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)',
              fontFamily: 'var(--font-display)',
              fontSize: 15,
              letterSpacing: '-0.15px',
              fontWeight: 500,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 240ms cubic-bezier(0.2,0.8,0.2,1)',
            }}
          >
            {lang === 'ko' ? c.kor : c.en}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <span
          className="t-mono-sm hidden md:flex"
          style={{ alignItems: 'center', color: dark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)', whiteSpace: 'nowrap' }}
        >
          {lang === 'ko' ? '카테고리 · 6' : 'CATEGORIES · 6'}
        </span>
      </div>
    </div>
  );
}
