'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { parseFrontmatter, renderMarkdownBody, type Frontmatter } from './_lib/markdown';
import {
  closePullRequest,
  fetchPullRequestFiles,
  fetchPullRequests,
  fetchRawText,
  getFileSha,
  mergePullRequest,
  saveFileContent,
  verifyToken,
  type GitHubFile,
  type PullRequest,
} from './_lib/github';

const SESSION_KEY = 'ksw-admin-auth-2026-05';
const PAT_KEY = 'ksw-admin-gh-pat-2026-05';
const PAT_LOGIN_KEY = 'ksw-admin-gh-login-2026-05';
const DEFAULT_PASS_HASH = '72d8494c5c7f65b6ac516ee99049fd5aa5b3e17c569ed4606e152d52522ae012';
const PASS_HASH = process.env.NEXT_PUBLIC_ADMIN_PASS_HASH || DEFAULT_PASS_HASH;
const RECENT_PUBLISHED_DAYS = 7;

type ContentFile = {
  file: GitHubFile;
  fm: Frontmatter;
  body: string;
  rawSha?: string;
};

type ArticleStatus = 'draft' | 'published';
type Article = { pr: PullRequest; status: ArticleStatus; date: string };
type FilterMode = 'all' | 'draft' | 'published';

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

function readPat(): { token: string | null; login: string | null } {
  if (typeof window === 'undefined') return { token: null, login: null };
  return {
    token: sessionStorage.getItem(PAT_KEY),
    login: sessionStorage.getItem(PAT_LOGIN_KEY),
  };
}

function useGitHubToken() {
  const [state, setState] = useState<{ token: string | null; login: string | null }>(() =>
    typeof window === 'undefined' ? { token: null, login: null } : readPat()
  );
  useEffect(() => {
    setState(readPat());
    const onChange = () => setState(readPat());
    window.addEventListener('storage', onChange);
    window.addEventListener('ksw-admin-pat', onChange);
    return () => {
      window.removeEventListener('storage', onChange);
      window.removeEventListener('ksw-admin-pat', onChange);
    };
  }, []);

  const setToken = useCallback(async (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return { ok: false, message: '토큰이 비어 있습니다.' };
    try {
      const user = await verifyToken(trimmed);
      sessionStorage.setItem(PAT_KEY, trimmed);
      sessionStorage.setItem(PAT_LOGIN_KEY, user.login);
      window.dispatchEvent(new Event('ksw-admin-pat'));
      return { ok: true as const, login: user.login };
    } catch (e) {
      return {
        ok: false as const,
        message: e instanceof Error ? e.message : '검증 실패',
      };
    }
  }, []);

  const clearToken = useCallback(() => {
    sessionStorage.removeItem(PAT_KEY);
    sessionStorage.removeItem(PAT_LOGIN_KEY);
    window.dispatchEvent(new Event('ksw-admin-pat'));
  }, []);

  return { ...state, setToken, clearToken };
}

function TokenBar({
  token,
  login,
  setToken,
  clearToken,
}: {
  token: string | null;
  login: string | null;
  setToken: (raw: string) => Promise<{ ok: boolean; login?: string; message?: string }>;
  clearToken: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const submit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setBusy(true);
      setMsg(null);
      const r = await setToken(value);
      setBusy(false);
      if (r.ok) {
        setMsg(null);
        setValue('');
        setOpen(false);
      } else {
        setMsg(r.message ?? '실패');
      }
    },
    [value, setToken]
  );

  if (token && login && !open) {
    return (
      <div className="mb-4 flex items-center justify-between rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
        <span>
          GitHub PAT 활성: <strong>{login}</strong> — 게재 / 반려 / 편집 1-click 가능.
        </span>
        <button
          type="button"
          onClick={clearToken}
          className="text-xs text-emerald-800 hover:underline"
        >
          PAT 제거
        </button>
      </div>
    );
  }

  return (
    <div className="mb-4 rounded border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-900">
      <div className="flex items-center justify-between">
        <span>
          GitHub PAT 미설정 — 게재 / 반려 / 편집 1-click 을 쓰려면 PAT 입력하세요. (없어도 GitHub
          새 탭으로 동작)
        </span>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded border border-amber-300 bg-white px-2 py-1 text-xs hover:bg-amber-100"
        >
          {open ? '닫기' : 'PAT 입력'}
        </button>
      </div>
      {open ? (
        <form onSubmit={submit} className="mt-3 space-y-2">
          <input
            type="password"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="ghp_… (fine-grained PAT, repo: jackylabs26/kstoryworld, Pull requests R/W + Contents R/W)"
            className="w-full rounded border border-amber-300 bg-white px-2 py-1.5 text-xs text-stone-800"
            autoComplete="off"
          />
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={busy || !value}
              className="rounded bg-amber-700 px-3 py-1 text-xs text-white disabled:opacity-50"
            >
              {busy ? '검증 중…' : '저장 (sessionStorage)'}
            </button>
            {msg ? <span className="text-xs text-red-700">{msg}</span> : null}
          </div>
          <p className="text-xs text-amber-800">
            토큰은 브라우저 sessionStorage 에만 저장됩니다 (탭 닫으면 사라짐). v0 임시 방편 —
            v1.0 Phase 3 에서 OAuth 로 대체.
          </p>
        </form>
      ) : null}
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
  return lang ?? '';
}

function previewUrlFromBranch(branch: string): string {
  const slug = branch.replace(/[/_]/g, '-').toLowerCase();
  return `https://kstoryworld-git-${slug}-jackylabs26.vercel.app`;
}

function formatDateKo(iso: string): string {
  const d = new Date(iso);
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

function cleanTitle(prTitle: string): string {
  return prTitle
    .replace(/^JAC-\d+\s*[:·]?\s*/i, '')
    .replace(/^content[:(]\s*[^)]*\)\s*/i, '');
}

function thumbnailChar(title: string): string {
  const cleaned = cleanTitle(title);
  const m = /[\p{L}]/u.exec(cleaned);
  return m ? m[0] : '?';
}

function thumbnailHue(title: string): number {
  let h = 0;
  for (let i = 0; i < title.length; i++) h = (h * 31 + title.charCodeAt(i)) % 360;
  return h;
}

function StatusPill({ status }: { status: ArticleStatus }) {
  if (status === 'draft') return <span className="font-medium text-amber-700">임시보관</span>;
  return <span className="font-medium text-emerald-700">게시됨</span>;
}

function CategoryChip({ name, hex }: { name: string; hex?: string }) {
  const style = hex
    ? { backgroundColor: `#${hex}1f`, borderColor: `#${hex}66`, color: `#${hex}` }
    : undefined;
  return (
    <span
      className="rounded-full border border-stone-300 px-2 py-0.5 text-xs text-stone-700"
      style={style}
    >
      {name}
    </span>
  );
}

function IconBtn({
  onClick,
  href,
  title,
  children,
  intent = 'neutral',
  disabled,
}: {
  onClick?: () => void;
  href?: string;
  title: string;
  children: ReactNode;
  intent?: 'neutral' | 'publish' | 'reject' | 'edit';
  disabled?: boolean;
}) {
  const intentCls =
    intent === 'publish'
      ? 'text-stone-500 hover:text-emerald-700'
      : intent === 'reject'
      ? 'text-stone-500 hover:text-red-700'
      : intent === 'edit'
      ? 'text-stone-500 hover:text-blue-700'
      : 'text-stone-500 hover:text-stone-900';
  const cls = `inline-flex h-8 w-8 items-center justify-center rounded transition disabled:opacity-30 disabled:hover:text-stone-500 ${intentCls}`;
  if (href) {
    return (
      <a href={href} target="_blank" rel="noreferrer" title={title} aria-label={title} className={cls}>
        {children}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} title={title} aria-label={title} className={cls} disabled={disabled}>
      {children}
    </button>
  );
}

function SendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 2L11 13" />
      <path d="M22 2l-7 20-4-9-9-4 20-7z" />
    </svg>
  );
}
function EditIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  );
}
function TrashIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
    </svg>
  );
}
function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
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
        <code className="rounded bg-white px-1.5 py-0.5 font-mono text-stone-700">{filename}</code>
        {lang ? (
          <span className="rounded bg-blue-100 px-1.5 py-0.5 text-blue-800">{languageLabel(lang)}</span>
        ) : null}
        {category ? (
          <span className="rounded bg-stone-200 px-1.5 py-0.5 uppercase text-stone-700">{category}</span>
        ) : null}
      </div>
      {title ? <h3 className="mb-1 text-base font-semibold text-stone-900">{title}</h3> : null}
      {description ? <p className="mb-2 text-sm leading-6 text-stone-700">{description}</p> : null}
      <dl className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs text-stone-600 md:grid-cols-4">
        {hexagonId ? (
          <div>
            <dt className="text-stone-400">Hexagon</dt>
            <dd className="truncate" title={hexagonId}>{hexagonId}</dd>
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

function ContentEditor({
  entry,
  branch,
  token,
  onSaved,
  onCancel,
}: {
  entry: ContentFile;
  branch: string;
  token: string;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const initial = useMemo(() => stitchFile(entry), [entry]);
  const [text, setText] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState(`JAC-1991 admin 편집: ${entry.file.filename}`);

  const save = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const sha = await getFileSha(token, branch, entry.file.filename);
      await saveFileContent({
        token,
        branch,
        path: entry.file.filename,
        content: text,
        sha,
        message,
      });
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : '저장 실패');
    } finally {
      setBusy(false);
    }
  }, [token, branch, entry.file.filename, text, message, onSaved]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs text-stone-500">
          편집 모드 — 전체 파일 내용 (frontmatter 포함). 저장 시 PR 브랜치{' '}
          <code className="rounded bg-stone-100 px-1 text-stone-700">{branch}</code> 에 새 커밋이
          만들어집니다.
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="rounded border border-stone-300 bg-white px-3 py-1 text-xs text-stone-700 hover:bg-stone-50 disabled:opacity-50"
          >
            취소
          </button>
          <button
            type="button"
            onClick={save}
            disabled={busy || text === initial}
            className="rounded bg-blue-700 px-3 py-1 text-xs text-white hover:bg-blue-800 disabled:opacity-50"
          >
            {busy ? '저장 중…' : '저장 (커밋)'}
          </button>
        </div>
      </div>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="w-full rounded border border-stone-300 bg-white px-2 py-1 text-xs text-stone-800"
        placeholder="커밋 메시지"
      />
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={24}
        spellCheck={false}
        className="block w-full rounded border border-stone-300 bg-white p-3 font-mono text-xs leading-relaxed text-stone-800"
      />
      {error ? <p className="text-xs text-red-700">{error}</p> : null}
    </div>
  );
}

function stitchFile(entry: ContentFile): string {
  const fmEntries = Object.entries(entry.fm);
  if (fmEntries.length === 0) return entry.body;
  const lines: string[] = ['---'];
  for (const [k, v] of fmEntries) {
    if (Array.isArray(v)) {
      lines.push(`${k}:`);
      for (const item of v) lines.push(`  - ${item}`);
    } else {
      lines.push(`${k}: ${needsQuote(v) ? JSON.stringify(v) : v}`);
    }
  }
  lines.push('---');
  return `${lines.join('\n')}\n${entry.body}`;
}

function needsQuote(s: string): boolean {
  return /[:#&*!|>%@]/.test(s) || /^\s|\s$/.test(s);
}

function ArticleBody({
  entry,
  branch,
  token,
  onSaved,
}: {
  entry: ContentFile;
  branch: string;
  token: string | null;
  onSaved: () => void;
}) {
  const [editing, setEditing] = useState(false);
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <FrontmatterTitle filename={entry.file.filename} />
        {token ? (
          editing ? null : (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="inline-flex items-center gap-1 rounded border border-stone-300 bg-white px-2.5 py-1 text-xs text-stone-700 hover:bg-stone-50"
            >
              <EditIcon /> 편집
            </button>
          )
        ) : null}
      </div>
      <FrontmatterCard fm={entry.fm} filename={entry.file.filename} />
      {editing ? (
        <ContentEditor
          entry={entry}
          branch={branch}
          token={token!}
          onSaved={() => {
            setEditing(false);
            onSaved();
          }}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <article className="max-w-none text-stone-800">
          {renderMarkdownBody(entry.body, `pr-${entry.file.filename}`)}
        </article>
      )}
    </div>
  );
}

function FrontmatterTitle({ filename }: { filename: string }) {
  return <span className="text-xs text-stone-500">{filename}</span>;
}

function ExpandedDetail({
  pr,
  token,
  reloadKey,
  onReload,
}: {
  pr: PullRequest;
  token: string | null;
  reloadKey: number;
  onReload: () => void;
}) {
  const [contents, setContents] = useState<ContentFile[] | null>(null);
  const [otherCount, setOtherCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    const run = async () => {
      try {
        const list = await fetchPullRequestFiles(token, pr.number);
        if (cancelled) return;
        const contentFiles = list.filter((f) => isContentMarkdown(f.filename));
        const loaded: ContentFile[] = await Promise.all(
          contentFiles.map(async (f) => {
            try {
              const text = await fetchRawText(f.raw_url, token);
              const parsed = parseFrontmatter(text);
              return { file: f, fm: parsed.fm, body: parsed.body };
            } catch (e) {
              return {
                file: f,
                fm: {},
                body: `(raw fetch error: ${e instanceof Error ? e.message : 'unknown'})`,
              };
            }
          })
        );
        if (cancelled) return;
        setContents(loaded);
        setOtherCount(list.length - contentFiles.length);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : '불러오기 실패');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [pr.number, token, reloadKey]);

  if (loading) return <p className="px-4 py-3 text-sm text-stone-500">콘텐츠 불러오는 중...</p>;
  if (error)
    return (
      <div className="m-4 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">
        {error}
      </div>
    );
  if (!contents || contents.length === 0)
    return (
      <p className="m-4 rounded border border-dashed border-stone-300 bg-stone-50 p-3 text-sm text-stone-500">
        이 PR 에는 게재 가능한 콘텐츠 파일(content/**/*.md)이 없습니다.
        {otherCount > 0 ? ` (기타 ${otherCount}개 파일)` : ''}
      </p>
    );

  const activeEntry = contents[Math.min(activeIdx, contents.length - 1)];
  return (
    <div className="space-y-3 px-4 py-4">
      {contents.length > 1 ? (
        <div className="flex flex-wrap gap-2 border-b border-stone-100 pb-2">
          {contents.map((c, i) => {
            const lang = fmString(c.fm, 'language');
            const stem = c.file.filename.split('/').pop() ?? c.file.filename;
            return (
              <button
                key={c.file.filename}
                type="button"
                onClick={() => setActiveIdx(i)}
                className={`rounded px-2.5 py-1 text-xs ${
                  i === activeIdx
                    ? 'bg-stone-900 text-white'
                    : 'border border-stone-300 bg-white text-stone-700 hover:bg-stone-50'
                }`}
              >
                {lang ? `${languageLabel(lang)} · ` : ''}
                {stem}
              </button>
            );
          })}
        </div>
      ) : null}
      <ArticleBody entry={activeEntry} branch={pr.head.ref} token={token} onSaved={onReload} />
      {otherCount > 0 ? (
        <p className="text-xs text-stone-500">
          기타 {otherCount}개 파일 (코드/설정 등) 은 GitHub diff 에서 확인하세요.
        </p>
      ) : null}
    </div>
  );
}

type RowAction = 'idle' | 'merging' | 'closing';

function ArticleRow({
  article,
  expanded,
  onToggle,
  token,
  onMutated,
}: {
  article: Article;
  expanded: boolean;
  onToggle: () => void;
  token: string | null;
  onMutated: () => void;
}) {
  const { pr, status, date } = article;
  const visibleLabels = pr.labels.filter(
    (l) => !['content-review', 'phase1-pending'].includes(l.name)
  );
  const initial = thumbnailChar(pr.title);
  const hue = thumbnailHue(pr.title);
  const previewUrl = previewUrlFromBranch(pr.head.ref);
  const [action, setAction] = useState<RowAction>('idle');
  const [actionError, setActionError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const onPublish = useCallback(async () => {
    if (!token) return;
    if (!window.confirm(`#${pr.number} ${cleanTitle(pr.title)} — 게재(squash merge) 진행?`)) return;
    setAction('merging');
    setActionError(null);
    try {
      await mergePullRequest(token, pr.number);
      onMutated();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'merge 실패');
    } finally {
      setAction('idle');
    }
  }, [token, pr.number, pr.title, onMutated]);

  const onReject = useCallback(async () => {
    if (!token) return;
    if (!window.confirm(`#${pr.number} ${cleanTitle(pr.title)} — 반려(PR close) 진행?`)) return;
    setAction('closing');
    setActionError(null);
    try {
      await closePullRequest(token, pr.number);
      onMutated();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'close 실패');
    } finally {
      setAction('idle');
    }
  }, [token, pr.number, pr.title, onMutated]);

  return (
    <div
      className={`rounded-lg border bg-white shadow-sm transition ${
        expanded ? 'border-stone-300' : 'border-stone-200 hover:border-stone-300'
      }`}
    >
      <div className="flex items-start gap-4 px-4 py-3">
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded text-2xl font-bold"
          style={{ background: `hsl(${hue} 70% 95%)`, color: `hsl(${hue} 60% 35%)` }}
          aria-hidden="true"
        >
          {initial}
        </div>
        <div className="min-w-0 flex-1">
          <button
            type="button"
            onClick={onToggle}
            className="block text-left text-base font-medium text-stone-900 hover:underline"
          >
            {cleanTitle(pr.title) || pr.title}
          </button>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-stone-500">
            <StatusPill status={status} />
            <span className="text-stone-300">·</span>
            <span>{formatDateKo(date)}</span>
            {visibleLabels.slice(0, 4).map((l) => (
              <CategoryChip key={l.name} name={l.name} hex={l.color} />
            ))}
            <CategoryChip name={`#${pr.number}`} />
            <span className="ml-1 text-stone-400">by {pr.user.login}</span>
          </div>
          {actionError ? (
            <p className="mt-1 text-xs text-red-700">{actionError}</p>
          ) : null}
        </div>
        <div className="hidden items-center gap-1 md:flex">
          {status === 'draft' ? (
            <>
              {token ? (
                <IconBtn
                  onClick={onPublish}
                  title={action === 'merging' ? '머지 중…' : '게재 (1-click squash merge)'}
                  intent="publish"
                  disabled={action !== 'idle'}
                >
                  <SendIcon />
                </IconBtn>
              ) : (
                <IconBtn href={pr.html_url} title="게재 (GitHub 머지)" intent="publish">
                  <SendIcon />
                </IconBtn>
              )}
              <IconBtn
                onClick={onToggle}
                title="편집 (펼쳐서 본문 편집)"
                intent="edit"
              >
                <EditIcon />
              </IconBtn>
              {token ? (
                <IconBtn
                  onClick={onReject}
                  title={action === 'closing' ? 'close 중…' : '반려 (1-click close)'}
                  intent="reject"
                  disabled={action !== 'idle'}
                >
                  <TrashIcon />
                </IconBtn>
              ) : (
                <IconBtn href={pr.html_url} title="반려 (GitHub 닫기)" intent="reject">
                  <TrashIcon />
                </IconBtn>
              )}
              <IconBtn href={previewUrl} title="Vercel 프리뷰">
                <EyeIcon />
              </IconBtn>
            </>
          ) : (
            <IconBtn href={pr.html_url} title="GitHub PR">
              <EyeIcon />
            </IconBtn>
          )}
        </div>
      </div>
      {expanded ? (
        <div className="border-t border-stone-100">
          <ExpandedDetail
            pr={pr}
            token={token}
            reloadKey={reloadKey}
            onReload={() => setReloadKey((k) => k + 1)}
          />
        </div>
      ) : null}
    </div>
  );
}

function looksLikeContentPR(pr: PullRequest): boolean {
  if (pr.labels.some((l) => l.name === 'content-review')) return true;
  return /^content[:/]/i.test(pr.title) || (/\bcontent\b/i.test(pr.title) && /^(feat|content)/i.test(pr.title));
}

function AdminDashboard() {
  const { token, login, setToken, clearToken } = useGitHubToken();
  const [openPRs, setOpenPRs] = useState<PullRequest[] | null>(null);
  const [closedPRs, setClosedPRs] = useState<PullRequest[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshAt, setRefreshAt] = useState<number>(Date.now());
  const [filter, setFilter] = useState<FilterMode>('all');
  const [expanded, setExpanded] = useState<number | null>(null);
  const fetchSeq = useRef(0);

  const fetchPRs = useCallback(async () => {
    const seq = ++fetchSeq.current;
    setError(null);
    try {
      const [open, closed] = await Promise.all([
        fetchPullRequests(token, 'open', 50),
        fetchPullRequests(token, 'closed', 30),
      ]);
      if (seq !== fetchSeq.current) return;
      setOpenPRs(open);
      setClosedPRs(closed);
    } catch (e) {
      if (seq !== fetchSeq.current) return;
      setError(e instanceof Error ? e.message : '불러오기 실패');
    }
  }, [token]);

  useEffect(() => {
    void fetchPRs();
  }, [fetchPRs, refreshAt]);

  const onMutated = useCallback(() => {
    setRefreshAt(Date.now());
    setExpanded(null);
  }, []);

  const articles = useMemo<Article[]>(() => {
    const drafts: Article[] = (openPRs ?? [])
      .filter((pr) => pr.labels.some((l) => l.name === 'content-review'))
      .map((pr) => ({ pr, status: 'draft', date: pr.created_at }));
    const cutoff = Date.now() - RECENT_PUBLISHED_DAYS * 24 * 60 * 60 * 1000;
    const published: Article[] = (closedPRs ?? [])
      .filter((pr) => pr.merged_at && new Date(pr.merged_at).getTime() >= cutoff)
      .filter(looksLikeContentPR)
      .map((pr) => ({ pr, status: 'published', date: pr.merged_at ?? pr.updated_at }));
    return [...drafts, ...published].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [openPRs, closedPRs]);

  const filtered = useMemo(
    () => (filter === 'all' ? articles : articles.filter((a) => a.status === filter)),
    [articles, filter]
  );
  const draftCount = articles.filter((a) => a.status === 'draft').length;
  const publishedCount = articles.filter((a) => a.status === 'published').length;
  const filterLabel: Record<FilterMode, string> = {
    all: `전체 (${articles.length})`,
    draft: `임시보관 (${draftCount})`,
    published: `게시됨 (${publishedCount})`,
  };

  const onToggleExpand = (n: number) => setExpanded((cur) => (cur === n ? null : n));

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <TokenBar token={token} login={login} setToken={setToken} clearToken={clearToken} />

      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as FilterMode)}
            className="rounded border border-stone-300 bg-white px-3 py-1.5 text-sm text-stone-800 hover:bg-stone-50"
          >
            <option value="all">{filterLabel.all}</option>
            <option value="draft">{filterLabel.draft}</option>
            <option value="published">{filterLabel.published}</option>
          </select>
          <button
            type="button"
            onClick={() => setRefreshAt(Date.now())}
            className="rounded border border-stone-300 bg-white px-3 py-1.5 text-sm text-stone-700 hover:bg-stone-50"
          >
            새로고침
          </button>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <a
            href="https://github.com/jackylabs26/kstoryworld/labels"
            target="_blank"
            rel="noreferrer"
            className="text-stone-500 hover:text-stone-900"
          >
            라벨
          </a>
          <a
            href="https://github.com/jackylabs26/kstoryworld/pulls"
            target="_blank"
            rel="noreferrer"
            className="text-blue-700 hover:underline"
          >
            관리
          </a>
        </div>
      </div>

      {error ? (
        <div className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          {error}{' '}
          {token ? null : '(미인증 호출 IP 당 시간 60건 제한 — PAT 입력 시 5000건/h)'}
        </div>
      ) : null}

      {openPRs === null || closedPRs === null ? (
        <p className="rounded border border-dashed border-stone-300 bg-white p-6 text-center text-sm text-stone-500">
          불러오는 중...
        </p>
      ) : filtered.length === 0 ? (
        <p className="rounded border border-dashed border-stone-300 bg-white p-6 text-center text-sm text-stone-500">
          {filter === 'draft'
            ? '검토 대기 콘텐츠가 없습니다. PR 에 content-review 라벨을 붙이면 여기에 표시됩니다.'
            : filter === 'published'
            ? `최근 ${RECENT_PUBLISHED_DAYS}일 게재된 콘텐츠가 없습니다.`
            : '콘텐츠가 없습니다.'}
        </p>
      ) : (
        <div className="space-y-2">
          {filtered.map((a) => (
            <ArticleRow
              key={a.pr.number}
              article={a}
              expanded={expanded === a.pr.number}
              onToggle={() => onToggleExpand(a.pr.number)}
              token={token}
              onMutated={onMutated}
            />
          ))}
        </div>
      )}

      <footer className="mt-12 border-t border-stone-200 pt-4 text-xs text-stone-500">
        v0.3 — 정적 export 호환 client-side 페이지. PAT 입력 시 1-click 게재(squash merge) /
        반려(close) / 인라인 편집 (Contents API). PAT 없으면 GitHub 새 탭으로 동작. 진짜
        OAuth 인증은 Phase 3 (Supabase + 별도 Vercel) 에서 도입.
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
