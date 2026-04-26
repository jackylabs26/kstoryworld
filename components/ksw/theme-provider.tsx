'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type Season = 'spring' | 'summer' | 'autumn' | 'winter';
export type Lang = 'ko' | 'en';

export const SEASONS = {
  spring: {
    kor: '봄',
    en: 'Spring',
    grad: 'linear-gradient(135deg,#ffd6e0 0%,#ffb7a0 50%,#bdbbff 100%)',
    accent: '#ffb7a0',
    ink: '#c2185b',
    blooms: [
      { bg: '#ffd6e0', w: 560, h: 560, x: -120, y: -160, o: 0.85, b: 60 },
      { bg: '#bdbbff', w: 480, h: 480, x: 520, y: 40, o: 0.7, b: 70 },
      { bg: '#ffb7a0', w: 380, h: 380, x: 1100, y: -40, o: 0.8, b: 50 },
      { bg: '#cfe9ff', w: 420, h: 420, x: 1280, y: 280, o: 0.55, b: 60 },
    ],
  },
  summer: {
    kor: '여름',
    en: 'Summer',
    grad: 'linear-gradient(135deg,#cfe9ff 0%,#7fd1c7 50%,#d8f3dc 100%)',
    accent: '#7fd1c7',
    ink: '#1e6f6a',
    blooms: [
      { bg: '#cfe9ff', w: 560, h: 560, x: -100, y: -140, o: 0.8, b: 60 },
      { bg: '#7fd1c7', w: 460, h: 460, x: 520, y: 60, o: 0.55, b: 80 },
      { bg: '#d8f3dc', w: 420, h: 420, x: 1080, y: -20, o: 0.85, b: 50 },
      { bg: '#bdbbff', w: 380, h: 380, x: 1300, y: 300, o: 0.45, b: 70 },
    ],
  },
  autumn: {
    kor: '가을',
    en: 'Autumn',
    grad: 'linear-gradient(135deg,#f6e0b5 0%,#f4a261 55%,#e76f51 100%)',
    accent: '#f4a261',
    ink: '#8a3a1a',
    blooms: [
      { bg: '#f6e0b5', w: 560, h: 560, x: -100, y: -140, o: 0.85, b: 60 },
      { bg: '#f4a261', w: 460, h: 460, x: 520, y: 40, o: 0.55, b: 80 },
      { bg: '#e76f51', w: 380, h: 380, x: 1100, y: -40, o: 0.45, b: 60 },
      { bg: '#ffb7a0', w: 380, h: 380, x: 1280, y: 280, o: 0.5, b: 60 },
    ],
  },
  winter: {
    kor: '겨울',
    en: 'Winter',
    grad: 'linear-gradient(135deg,#f4f4f7 0%,#dbe7ff 60%,#3a4a7d 100%)',
    accent: '#3a4a7d',
    ink: '#1c2750',
    blooms: [
      { bg: '#dbe7ff', w: 560, h: 560, x: -120, y: -160, o: 0.8, b: 70 },
      { bg: '#bdbbff', w: 460, h: 460, x: 520, y: 60, o: 0.45, b: 80 },
      { bg: '#f4f4f7', w: 420, h: 420, x: 1080, y: -20, o: 0.95, b: 50 },
      { bg: '#3a4a7d', w: 340, h: 340, x: 1320, y: 320, o: 0.18, b: 80 },
    ],
  },
} as const;

interface ThemeContextValue {
  season: Season;
  setSeason: (s: Season) => void;
  lang: Lang;
  setLang: (l: Lang) => void;
  dark: boolean;
  setDark: (d: boolean) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useKSWTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useKSWTheme must be used inside KSWThemeProvider');
  return ctx;
}

export function KSWThemeProvider({ children }: { children: ReactNode }) {
  const [season, setSeasonState] = useState<Season>('winter');
  const [lang, setLangState] = useState<Lang>('ko');
  const [dark, setDarkState] = useState(false);

  // load persisted prefs
  useEffect(() => {
    try {
      const s = (localStorage.getItem('ksw-season') as Season) || 'winter';
      const l = (localStorage.getItem('ksw-lang') as Lang) || 'ko';
      const d = localStorage.getItem('ksw-dark') === 'true';
      setSeasonState(s);
      setLangState(l);
      setDarkState(d);
    } catch {}
  }, []);

  // sync DOM attrs
  useEffect(() => {
    document.documentElement.setAttribute('data-season', season);
    document.documentElement.lang = lang;
    document.body.setAttribute('data-dark', dark ? 'true' : 'false');
  }, [season, lang, dark]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      season,
      lang,
      dark,
      setSeason: (s) => {
        setSeasonState(s);
        try { localStorage.setItem('ksw-season', s); } catch {}
      },
      setLang: (l) => {
        setLangState(l);
        try { localStorage.setItem('ksw-lang', l); } catch {}
      },
      setDark: (d) => {
        setDarkState(d);
        try { localStorage.setItem('ksw-dark', String(d)); } catch {}
      },
    }),
    [season, lang, dark]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
