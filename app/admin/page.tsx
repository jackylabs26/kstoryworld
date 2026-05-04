'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from 'react';
import { parseFrontmatter, renderMarkdownBody, type Frontmatter } from './_lib/markdown';

const REPO = 'jackylabs26/kstoryworld';
const SESSION_KEY = 'ksw-admin-auth-2026-05';
const DEFAULT_PASS_HASH = '72d8494c5c7f65b6ac516ee99049fd5aa5b3e17c569ed4606e152d52522ae012';
const PASS_HASH = process.env.NEXT_PUBLIC_ADMIN_PASS_HASH || DEFAULT_PASS_HASH;

type Label = { name: string; color: string; description: string | null };
type PullRequest = {
  number: number;
  title: string;
  body: string | null;
  state: string;
  draft: boolean;
  user: { login: string; avatar_url: string };
  labels: Label[];
  created_at: string;
  updated_at: string;
  merged_at: string | null;
  html_url: string;
  head: { ref: string };
  changed_files?: number;
  additions?: number;
  deletions?: number;
};

type GitHubFile = {
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  raw_url: string;
  blob_url: string;
};

type ContentFile = {
  file: GitHubFile;
  fm: Frontmatter;
  body: string;
};

async function sha256Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function PasswordGate({ onUnlock }: { onUnlock: () => void }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setBusy(true);
      try {
        const hash = await sha256Hex(value);
        if (hash === PASS_HASH) {
          sessionStorage.setItem(SESSION_KEY, '1');
          window.dispatchEvent(new Event('ksw-admin-auth'));
          onUnlock();
        } else {
          setError('비밀번호가 일치하지 않습니다.');
        }
      } catch {
        setError('인증 처리 중 오류가 발생했습니다.');
      } finally {
        setBusy(false);
      }
    },
    [value, onUnlock]
  );

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="mb-2 text-2xl font-semibold">Admin 로그인</h1>
      <p className="mb-6 text-sm text-stone-600">
        보드 검토용 페이지입니다. 비밀번호를 입력하세요.
      </p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoFocus
          autoComplete="current-password"
          className="w-full rounded border border-stone-300 px-3 py-2 text-base focus:border-stone-600 focus:outline-none"
          placeholder="비밀번호"
        />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          disabled={busy || !value}
          className="w-full rounded bg-stone-900 px-3 py-2 text-white disabled:opacity-50"
        >
          {busy ? '확인 중...' : '입장'}
        </button>
      </form>
      <p className="mt-8 text-xs text-stone-500">
        v0 임시 게이트입니다. 진짜 인증은 Phase 3 (Supabase) 에서 도입됩니다.
      </p>
    </div>
  );
}

function isContentMarkdown(filename: string): boolean {
  if (!filename.startsWith('content/')) return false;
  return filename.endsWith('.md') || filename.endsWith('.mdx');
}

function fmString(fm: Frontmatter, key: string): string | undefined {
  const v = fm[key];
  return typeof v === 'string' ? v : undefined;
}

function languageLabel(lang: string | undefined): string {
  if (lang === 'ko') return '한국어';
  if (lang === 'en') return 'English';
  if (lang === 'ja') return '日本語';
  if (lang === 'zh-Hans') return '简体中文';
  if (lang === 'zh-Hant') return '繁體中文';
  return lang ?? '?';
}

function FrontmatterCard({ fm, filename }: { fm: Frontmatter; filename: string }) {
  const title = fmString(fm, 'title');
  const description = fmString(fm, 'description');
  const lang = fmString(fm, 'language');
  const category = fmString(fm, 'category');
  const hexagonId = fmString(fm, 'hexagon_id');
  const anchorDrama = fmString(fm, 'anchor_drama');
  const persona = fmString(fm, 'persona');
  const publishDate = fmString(fm, 'publish_date');

  return (
    <div className="rounded border border-stone-200 bg-stone-50 p-3">
      <div className="mb-2 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-xs text-stone-500">
        <code className="rounded bg-white px-1.5 py-0.5 font-mono text-stone-700">
          {filename}
        </code>
        {lang ? (
          <span className="rounded bg-blue-100 px-1.5 py-0.5 text-blue-800">
            {languageLabel(lang)}
          </span>
        ) : null}
        {category ? (
          <span className="rounded bg-stone-200 px-1.5 py-0.5 uppercase text-stone-700">
            {category}
          </span>
        ) : null}
      </div>
      {title ? (
        <h3 className="mb-1 text-base font-semibold text-stone-900">{title}</h3>
      ) : null}
      {description ? (
        <p className="mb-2 text-sm leading-6 text-stone-700">{description}</p>
      ) : null}
      <dl className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs text-stone-600 md:grid-cols-4">
        {hexagonId ? (
          <div>
            <dt className="text-stone-400">Hexagon</dt>
            <dd className="truncate" title={hexagonId}>
              {hexagonId}
            </dd>
          </div>
        ) : null}
        {anchorDrama ? (
          <div>
            <dt className="text-stone-400">Anchor</dt>
            <dd className="truncate">{anchorDrama}</dd>
          </div>
        ) : null}
        {persona ? (
          <div>
            <dt className="text-stone-400">Persona</dt>
            <dd>{persona}</dd>
          </div>
        ) : null}
        {publishDate ? (
          <div>
            <dt className="text-stone-400">Publish</dt>
            <dd>{publishDate}</dd>
          </div>
        ) : null}
      </dl>
    </div>
  );
}

function ContentArticle({ entry, idx }: { entry: ContentFile; idx: number }) {
  const [open, setOpen] = useState(idx === 0);
  const titleHint = fmString(entry.fm, 'title') ?? entry.file.filename.split('/').pop();
  const lang = fmString(entry.fm, 'language');
  return (
    <div className="rounded border border-stone-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-stone-50"
      >
        <span className="text-sm font-medium text-stone-900">
          {open ? '▾' : '▸'} {titleHint}
        </span>
        {lang ? (
          <span className="rounded bg-blue-100 px-1.5 py-0.5 text-xs text-blue-800">
            {languageLabel(lang)}
          </span>
        ) : null}
        <span className="ml-auto text-xs text-stone-500">
          +{entry.file.additions} / −{entry.file.deletions}
        </span>
      </button>
      {open ? (
        <div className="space-y-3 border-t border-stone-200 px-3 py-3">
          <FrontmatterCard fm={entry.fm} filename={entry.file.filename} />
          <article className="prose-stone max-w-none text-stone-800">
            {renderMarkdownBody(entry.body, `pr-${entry.file.filename}`)}
          </article>
        </div>
      ) : null}
    </div>
  );
}

function PRReviewCard({ pr }: { pr: PullRequest }) {
  const [files, setFiles] = useState<GitHubFile[] | null>(null);
  const [contents, setContents] = useState<ContentFile[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `https://api.github.com/repos/${REPO}/pulls/${pr.number}/files?per_page=100`,
        { headers: { Accept: 'application/vnd.github+json' } }
      );
      if (!res.ok) throw new Error(`files API ${res.status}`);
      const list: GitHubFile[] = await res.json();
      setFiles(list);
      const contentFiles = list.filter((f) => isContentMarkdown(f.filename));
      const loaded: ContentFile[] = await Promise.all(
        contentFiles.map(async (f) => {
          const raw = await fetch(f.raw_url);
          if (!raw.ok) {
            return { file: f, fm: {}, body: `(raw fetch failed: ${raw.status})` };
          }
          const text = await raw.text();
          const { fm, body } = parseFrontmatter(text);
          return { file: f, fm, body };
        })
      );
      setContents(loaded);
    } catch (e) {
      setError(e instanceof Error ? e.message : '불러오기 실패');
    } finally {
      setLoading(false);
    }
  }, [pr.number]);

  const onToggle = useCallback(() => {
    setExpanded((v) => {
      const next = !v;
      if (next && files === null && !loading) {
        void load();
      }
      return next;
    });
  }, [files, loading, load]);

  const created = new Date(pr.created_at).toLocaleString('ko-KR');
  const previewSlug = pr.head.ref.replace(/[/_]/g, '-').toLowerCase();
  const previewUrl = `https://kstoryworld-git-${previewSlug}-jackylabs26.vercel.app`;
  const otherFileCount = (files ?? []).filter((f) => !isContentMarkdown(f.filename)).length;

  return (
    <article className="rounded-lg border border-stone-200 bg-white shadow-sm">
      <header className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-4 pt-4">
        <button
          type="button"
          onClick={onToggle}
          className="text-base font-medium text-stone-900 hover:underline"
        >
          {expanded ? '▾' : '▸'} #{pr.number} · {pr.title}
        </button>
        {pr.draft ? (
          <span className="rounded bg-stone-200 px-2 py-0.5 text-xs text-stone-700">
            draft
          </span>
        ) : null}
        <span className="ml-auto text-xs text-stone-500">{created}</span>
      </header>
      <div className="mt-2 flex flex-wrap gap-1.5 px-4">
        {pr.labels.map((l) => (
          <span
            key={l.name}
            className="rounded px-2 py-0.5 text-xs"
            style={{ backgroundColor: `#${l.color}33`, color: `#${l.color}` }}
            title={l.description ?? ''}
          >
            {l.name}
          </span>
        ))}
        <span className="text-xs text-stone-500">by {pr.user.login}</span>
      </div>

      {expanded ? (
        <div className="border-t border-stone-200 px-4 py-4">
          {loading ? (
            <p className="text-sm text-stone-500">콘텐츠 불러오는 중...</p>
          ) : error ? (
            <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">
              {error}
            </div>
          ) : contents === null ? (
            <p className="text-sm text-stone-500">로드 대기.</p>
          ) : contents.length === 0 ? (
            <p className="rounded border border-dashed border-stone-300 bg-stone-50 p-3 text-sm text-stone-500">
              이 PR 에는 게재 가능한 컨텐츠 파일(content/**/*.md)이 없습니다.
              {otherFileCount > 0 ? ` (기타 ${otherFileCount}개 파일)` : ''}
            </p>
          ) : (
            <div className="space-y-3">
              {contents.map((entry, i) => (
                <ContentArticle key={entry.file.filename} entry={entry} idx={i} />
              ))}
              {otherFileCount > 0 ? (
                <p className="text-xs text-stone-500">
                  기타 {otherFileCount}개 파일 (코드/설정 등) 은 GitHub diff 에서 확인하세요.
                </p>
              ) : null}
            </div>
          )}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2 border-t border-stone-100 bg-stone-50 px-4 py-3">
        <a
          href={pr.html_url}
          target="_blank"
          rel="noreferrer"
          className="rounded bg-emerald-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-800"
        >
          ✅ 게재 승인 (GitHub 머지)
        </a>
        <a
          href={pr.html_url}
          target="_blank"
          rel="noreferrer"
          className="rounded border border-red-300 bg-white px-3 py-1.5 text-sm text-red-700 hover:bg-red-50"
        >
          ❌ 반려 (GitHub 닫기)
        </a>
        <a
          href={previewUrl}
          target="_blank"
          rel="noreferrer"
          className="rounded border border-stone-300 bg-white px-3 py-1.5 text-sm text-stone-700 hover:bg-stone-100"
        >
          Vercel 프리뷰
        </a>
        <a
          href={`${pr.html_url}/files`}
          target="_blank"
          rel="noreferrer"
          className="ml-auto rounded border border-stone-300 bg-white px-3 py-1.5 text-sm text-stone-700 hover:bg-stone-100"
        >
          전체 diff
        </a>
      </div>
    </article>
  );
}

function AdminDashboard() {
  const [openPRs, setOpenPRs] = useState<PullRequest[] | null>(null);
  const [closedPRs, setClosedPRs] = useState<PullRequest[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshAt, setRefreshAt] = useState<number>(Date.now());

  const fetchPRs = useCallback(async () => {
    setError(null);
    try {
      const [openRes, closedRes] = await Promise.all([
        fetch(
          `https://api.github.com/repos/${REPO}/pulls?state=open&per_page=50&sort=updated&direction=desc`,
          { headers: { Accept: 'application/vnd.github+json' } }
        ),
        fetch(
          `https://api.github.com/repos/${REPO}/pulls?state=closed&per_page=20&sort=updated&direction=desc`,
          { headers: { Accept: 'application/vnd.github+json' } }
        ),
      ]);
      if (!openRes.ok || !closedRes.ok) {
        throw new Error(`GitHub API ${openRes.status}/${closedRes.status}`);
      }
      const open: PullRequest[] = await openRes.json();
      const closed: PullRequest[] = await closedRes.json();
      setOpenPRs(open);
      setClosedPRs(closed);
    } catch (e) {
      setError(e instanceof Error ? e.message : '불러오기 실패');
    }
  }, []);

  useEffect(() => {
    fetchPRs();
  }, [fetchPRs, refreshAt]);

  const reviewPRs = useMemo(
    () =>
      (openPRs ?? []).filter((pr) =>
        pr.labels.some((l) => l.name === 'content-review')
      ),
    [openPRs]
  );

  const recentMerged = useMemo(() => {
    const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return (closedPRs ?? [])
      .filter((pr) => pr.merged_at !== null)
      .filter((pr) => new Date(pr.merged_at!).getTime() >= cutoff)
      .filter((pr) =>
        pr.labels.some((l) => l.name === 'content-review' || l.name.startsWith('cat:'))
      );
  }, [closedPRs]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-baseline justify-between">
        <div>
          <h1 className="text-2xl font-semibold">콘텐츠 검토</h1>
          <p className="text-sm text-stone-600">
            kstoryworld.com 게재 여부를 결정합니다. 펼쳐서 본문을 읽고 게재 / 반려를 선택하세요.
          </p>
        </div>
        <button
          onClick={() => setRefreshAt(Date.now())}
          className="rounded border border-stone-300 bg-white px-3 py-1.5 text-sm hover:bg-stone-100"
        >
          새로고침
        </button>
      </div>

      {error ? (
        <div className="mb-6 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          {error} (GitHub 미인증 호출은 IP 당 시간 60건 제한 — 잠시 후 재시도)
        </div>
      ) : null}

      <section className="mb-10">
        <h2 className="mb-3 border-b border-stone-200 pb-1 text-lg font-medium">
          게재 대기 ({reviewPRs.length})
        </h2>
        {openPRs === null ? (
          <p className="text-sm text-stone-500">불러오는 중...</p>
        ) : reviewPRs.length === 0 ? (
          <p className="rounded border border-dashed border-stone-300 bg-white p-4 text-sm text-stone-500">
            검토 대기 컨텐츠가 없습니다. n8n 자동 PR 또는 수동 PR 에 <code>content-review</code> 라벨을 붙이면 여기에 표시됩니다.
          </p>
        ) : (
          <div className="space-y-4">
            {reviewPRs.map((pr) => (
              <PRReviewCard key={pr.number} pr={pr} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 border-b border-stone-200 pb-1 text-lg font-medium">
          최근 7일 게재 ({recentMerged.length})
        </h2>
        {recentMerged.length === 0 ? (
          <p className="text-sm text-stone-500">없음.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {recentMerged.map((pr) => (
              <li key={pr.number} className="flex items-baseline gap-2">
                <a
                  href={pr.html_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-stone-800 hover:underline"
                >
                  #{pr.number} {pr.title}
                </a>
                <span className="text-xs text-stone-500">
                  {pr.merged_at ? new Date(pr.merged_at).toLocaleString('ko-KR') : ''}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <footer className="mt-12 border-t border-stone-200 pt-4 text-xs text-stone-500">
        v0.1 — 정적 export 호환 client-side 페이지. 본문 미리보기는 GitHub raw 에서 client-fetch
        합니다. 게재/반려는 GitHub PR 에서 머지/닫기로 수행하세요. 진짜 인증·1-click 게재는 Phase 3
        (Supabase) 에서 도입.
      </footer>
    </div>
  );
}

function subscribeAuth(callback: () => void) {
  window.addEventListener('storage', callback);
  window.addEventListener('ksw-admin-auth', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('ksw-admin-auth', callback);
  };
}

function getAuthSnapshot() {
  return sessionStorage.getItem(SESSION_KEY) === '1';
}

function getAuthServerSnapshot() {
  return false;
}

export default function AdminPage() {
  const authed = useSyncExternalStore(subscribeAuth, getAuthSnapshot, getAuthServerSnapshot);

  if (!authed) {
    return <PasswordGate onUnlock={() => { /* state syncs via storage event */ }} />;
  }

  return <AdminDashboard />;
}
