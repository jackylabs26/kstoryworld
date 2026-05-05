'use client';

import { useMemo, useState } from 'react';
import { ReviewArticle } from '@main/components/ksw/review-article';
import { useKSWTheme } from '@main/components/ksw/theme-provider';
import { renderCreditFooterHtml, type CreditableImage } from '@main/lib/hexagonCredits';
import type { Frontmatter, FrontmatterImage } from '../_lib/markdown';
import {
  baseSlugOf,
  extractHtmlBody,
  inferLangFromSlug,
  markdownToHtml,
  seasonForSlug,
  slugFromFilename,
  type PreviewSeason,
} from '../_lib/preview';

type Viewport = 'desktop' | 'mobile';

const SEASON_OPTIONS: { value: PreviewSeason; label: string }[] = [
  { value: 'spring', label: '봄' },
  { value: 'summer', label: '여름' },
  { value: 'autumn', label: '가을' },
  { value: 'winter', label: '겨울' },
];

export function ArticlePreview({
  filename,
  fm,
  body,
  kind,
}: {
  filename: string;
  fm: Frontmatter;
  body: string;
  kind: 'html' | 'markdown';
}) {
  const slug = useMemo(() => slugFromFilename(filename), [filename]);
  const baseSlug = useMemo(() => baseSlugOf(slug), [slug]);
  const initialSeason = useMemo(() => seasonForSlug(baseSlug), [baseSlug]);

  const [viewport, setViewport] = useState<Viewport>('desktop');
  const [season, setSeason] = useState<PreviewSeason>(initialSeason);

  const { dark, setDark } = useKSWTheme();

  const title =
    typeof fm.title === 'string' && fm.title.trim() ? fm.title.trim() : slug;
  const fmLang = typeof fm.language === 'string' ? fm.language : '';
  const lang = fmLang === 'en' ? 'en' : fmLang === 'ko' ? 'ko' : inferLangFromSlug(slug);
  const category = typeof fm.category === 'string' ? fm.category : undefined;

  const images = useMemo(() => extractFrontmatterImages(fm.images), [fm.images]);

  const bodyHtml = useMemo(() => {
    const base = kind === 'html' ? extractHtmlBody(body) : markdownToHtml(body);
    return images.length > 0 ? base + renderCreditFooterHtml(images) : base;
  }, [body, kind, images]);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-3 rounded border border-stone-200 bg-white px-3 py-2 text-xs text-stone-700">
        <span className="font-medium text-stone-500">미리보기</span>
        <ViewportToggle value={viewport} onChange={setViewport} />
        <SeasonToggle value={season} onChange={setSeason} />
        <DarkToggle value={dark} onChange={setDark} />
        <span className="ml-auto text-stone-400">
          kstoryworld.com 동일 렌더 — slug: <code className="text-stone-600">{slug}</code>
        </span>
      </div>
      <div className="overflow-hidden rounded border border-stone-200 bg-white">
        <div
          style={{
            width: viewport === 'mobile' ? 375 : '100%',
            margin: '0 auto',
            transition: 'width 180ms ease',
          }}
        >
          <ReviewArticle
            bodyHtml={bodyHtml}
            slug={slug}
            season={season}
            title={title}
            lang={lang}
            category={category}
          />
        </div>
      </div>
    </div>
  );
}

function ViewportToggle({
  value,
  onChange,
}: {
  value: Viewport;
  onChange: (v: Viewport) => void;
}) {
  const opts: { v: Viewport; label: string }[] = [
    { v: 'desktop', label: '데스크톱' },
    { v: 'mobile', label: '모바일 (375px)' },
  ];
  return (
    <div className="inline-flex overflow-hidden rounded border border-stone-300">
      {opts.map((o) => (
        <button
          key={o.v}
          type="button"
          onClick={() => onChange(o.v)}
          className={`px-2.5 py-1 text-xs ${
            o.v === value
              ? 'bg-stone-900 text-white'
              : 'bg-white text-stone-700 hover:bg-stone-50'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function SeasonToggle({
  value,
  onChange,
}: {
  value: PreviewSeason;
  onChange: (v: PreviewSeason) => void;
}) {
  return (
    <label className="inline-flex items-center gap-1">
      <span className="text-stone-400">시즌</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as PreviewSeason)}
        className="rounded border border-stone-300 bg-white px-2 py-0.5 text-xs text-stone-800"
      >
        {SEASON_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function extractFrontmatterImages(value: Frontmatter[string] | undefined): CreditableImage[] {
  if (!Array.isArray(value)) return [];
  const objects = value.filter(
    (entry): entry is FrontmatterImage =>
      typeof entry === 'object' && entry !== null && !Array.isArray(entry),
  );
  return objects.map((entry) => ({
    role: entry.role,
    credit: entry.credit,
    creditUrl: entry.creditUrl ?? entry.credit_url,
    license: entry.license,
    licenseUrl: entry.licenseUrl ?? entry.license_url,
    asset_url: entry.asset_url,
  }));
}

function DarkToggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="inline-flex items-center gap-1">
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
        className="h-3 w-3"
      />
      <span className="text-stone-700">다크</span>
    </label>
  );
}
