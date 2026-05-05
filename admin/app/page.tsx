'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { parseFrontmatter, renderMarkdownBody, type Frontmatter } from './admin/_lib/markdown';
import {
  addPRComment,
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
} from './admin/_lib/github';

/* ── Constants ─────────────────────────────────────────────── */

const SESSION_KEY = 'ksw-admin-auth-2026-05';
const PAT_KEY = 'ksw-admin-gh-pat-2026-05';
const PAT_LOGIN_KEY = 'ksw-admin-gh-login-2026-05';
const DEFAULT_PASS_HASH =
  '72d8494c5c7f65b6ac516ee99049fd5aa5b3e17c569ed4606e152d52522ae012';
const PASS_HASH = process.env.NEXT_PUBLIC_ADMIN_PASS_HASH || DEFAULT_PASS_HASH;
const RECENT_DAYS = 7;

const REJECT_LABELS = [
  '품질미달',
  '중복',
  '사실오류',
  '톤불일치',
  '길이초과',
  '이미지부적합',
  'SEO미흡',
] as const;

/* ── Types ─────────────────────────────────────────────────── */

type ContentFile = {
  file: GitHubFile;
  fm: Frontmatter;
  body: string;
  rawSha?: string;
};

type ArticleStatus = 'pending' | 'approved' | 'rejected';
type Article = { pr: PullRequest; status: ArticleStatus; date: string };
type FilterStatus = 'all' | 'pending' | 'approved' | 'rejected';

/* ── Utility ───────────────────────────────────────────────── */

async function sha256Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function isContentFile(filename: string): boolean {
  if (!filename.startsWith('content/')) return false;
  return (
    filename.endsWith('.md') ||
    filename.endsWith('.mdx') ||
    filename.endsWith('.html')
  );
}

function fileKind(filename: string): 'markdown' | 'html' {
  return filename.endsWith('.html') ? 'html' : 'markdown';
}

function parseHtmlMeta(html: string): Frontmatter {
  const fm: Frontmatter = {};
  const titleMatch = /<title[^>]*>([^<]*)<\/title>/i.exec(html);
  if (titleMatch) fm.title = titleMatch[1].trim();
  const langMatch = /<html[^>]*\blang=["']([^"']+)["']/i.exec(html);
  if (langMatch) fm.language = langMatch[1].trim();
  const metaRe =
    /<meta\s+name=["']([^"']+)["']\s+content=["']([^"']*)["'][^>]*\/?>/gi;
  let m: RegExpExecArray | null;
  while ((m = metaRe.exec(html))) {
    const name = m[1].toLowerCase();
    const content = m[2];
    if (name === 'description') fm.description = content;
    else if (name === 'category') fm.category = content;
    else if (name === 'tags') fm.tags = content;
  }
  return fm;
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
    .replace(/^feat\([^)]+\):\s*/i, '')
    .replace(/^JAC-\d+\s*:?\s*(content:\s*)?/i, '')
    .trim();
}

function thumbnailChar(title: string): string {
  const cleaned = cleanTitle(title);
  const m = /[\p{L}]/u.exec(cleaned);
  return m ? m[0] : '?';
}

function thumbnailHue(title: string): number {
  let h = 0;
  for (let i = 0; i < title.length; i++)
    h = (h * 31 + title.charCodeAt(i)) % 360;
  return h;
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

function looksLikeContentPR(pr: PullRequest): boolean {
  if (pr.labels.some((l) => l.name === 'content-review')) return true;
  return (
    /^content[:/]/i.test(pr.title) ||
    (/\bcontent\b/i.test(pr.title) && /^(feat|content)/i.test(pr.title))
  );
}

/* ── Auth Gate ─────────────────────────────────────────────── */

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
    [value, onUnlock],
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

/* ── GitHub Token ──────────────────────────────────────────── */

function readPat(): { token: string | null; login: string | null } {
  if (typeof window === 'undefined') return { token: null, login: null };
  return {
    token: sessionStorage.getItem(PAT_KEY),
    login: sessionStorage.getItem(PAT_LOGIN_KEY),
  };
}

function useGitHubToken() {
  const [state, setState] = useState<{
    token: string | null;
    login: string | null;
  }>(() =>
    typeof window === 'undefined' ? { token: null, login: null } : readPat(),
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
  setToken: (
    raw: string,
  ) => Promise<{ ok: boolean; login?: string; message?: string }>;
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
    [value, setToken],
  );

  if (token && login && !open) {
    return (
      <div className="flex items-center justify-between rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-900 sm:text-sm">
        <span>
          GitHub PAT 활성: <strong>{login}</strong>
        </span>
        <button
          type="button"
          onClick={clearToken}
          className="text-xs text-emerald-800 hover:underline"
        >
          제거
        </button>
      </div>
    );
  }

  return (
    <div className="rounded border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-900 sm:text-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="min-w-0">PAT 미설정 — 게재/반려/편집에 필요</span>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="shrink-0 rounded border border-amber-300 bg-white px-2 py-1 text-xs hover:bg-amber-100"
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
            placeholder="ghp_… (fine-grained PAT)"
            className="w-full rounded border border-amber-300 bg-white px-2 py-1.5 text-xs text-stone-800"
            autoComplete="off"
          />
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={busy || !value}
              className="rounded bg-amber-700 px-3 py-1 text-xs text-white disabled:opacity-50"
            >
              {busy ? '검증 중…' : '저장'}
            </button>
            {msg ? <span className="text-xs text-red-700">{msg}</span> : null}
          </div>
          <p className="text-xs text-amber-800">
            sessionStorage 에만 저장 (탭 닫으면 사라짐).
          </p>
        </form>
      ) : null}
    </div>
  );
}

/* ── UI Atoms ──────────────────────────────────────────────── */

function StatusPill({ status }: { status: ArticleStatus }) {
  const config = {
    pending: { label: '대기중', cls: 'bg-amber-100 text-amber-800' },
    approved: { label: '승인됨', cls: 'bg-emerald-100 text-emerald-800' },
    rejected: { label: '반려됨', cls: 'bg-red-100 text-red-800' },
  };
  const { label, cls } = config[status];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}
    >
      {label}
    </span>
  );
}

function CategoryChip({ name, hex }: { name: string; hex?: string }) {
  const style = hex
    ? {
        backgroundColor: `#${hex}1f`,
        borderColor: `#${hex}66`,
        color: `#${hex}`,
      }
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

function EditIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  );
}

function BackIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

/* ── Frontmatter Card ──────────────────────────────────────── */

function FrontmatterCard({
  fm,
  filename,
}: {
  fm: Frontmatter;
  filename: string;
}) {
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
        <h3 className="mb-1 text-base font-semibold text-stone-900">
          {title}
        </h3>
      ) : null}
      {description ? (
        <p className="mb-2 text-sm leading-6 text-stone-700">{description}</p>
      ) : null}
      <dl className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs text-stone-600">
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

/* ── Content Editor ────────────────────────────────────────── */

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
  const [message, setMessage] = useState(
    `JAC-1991 admin 편집: ${entry.file.filename}`,
  );

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
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-stone-500">
          편집 모드 — 저장 시{' '}
          <code className="rounded bg-stone-100 px-1 text-stone-700">
            {branch}
          </code>{' '}
          에 새 커밋 생성
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
        rows={20}
        spellCheck={false}
        className="block w-full rounded border border-stone-300 bg-white p-3 font-mono text-xs leading-relaxed text-stone-800"
      />
      {error ? <p className="text-xs text-red-700">{error}</p> : null}
    </div>
  );
}

/* ── Article Content ───────────────────────────────────────── */

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
        <span className="text-xs text-stone-500">{entry.file.filename}</span>
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
      ) : fileKind(entry.file.filename) === 'html' ? (
        <HtmlPreview entry={entry} />
      ) : (
        <article className="max-w-none text-stone-800">
          {renderMarkdownBody(entry.body, `pr-${entry.file.filename}`)}
        </article>
      )}
    </div>
  );
}

function HtmlPreview({ entry }: { entry: ContentFile }) {
  const fullHtml = useMemo(() => stitchFile(entry), [entry]);
  return (
    <div className="space-y-2">
      <p className="text-xs text-stone-500">
        HTML 콘텐츠 — sandboxed iframe 미리보기
      </p>
      <iframe
        title={`preview-${entry.file.filename}`}
        srcDoc={fullHtml}
        sandbox=""
        className="h-[28rem] w-full rounded border border-stone-200 bg-white"
      />
    </div>
  );
}

/* ── Content Card (Mobile-first) ───────────────────────────── */

function ContentCard({
  article,
  selected,
  onSelect,
}: {
  article: Article;
  selected: boolean;
  onSelect: () => void;
}) {
  const { pr, status, date } = article;
  const visibleLabels = pr.labels.filter(
    (l) => !['content-review', 'phase1-pending'].includes(l.name),
  );
  const hue = thumbnailHue(pr.title);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-lg border bg-white p-3 text-left transition-all ${
        selected
          ? 'border-stone-400 shadow-md ring-2 ring-stone-900/10'
          : 'border-stone-200 hover:border-stone-300 hover:shadow-sm'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded text-lg font-bold"
          style={{
            background: `hsl(${hue} 70% 95%)`,
            color: `hsl(${hue} 60% 35%)`,
          }}
          aria-hidden="true"
        >
          {thumbnailChar(pr.title)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <StatusPill status={status} />
            <span className="shrink-0 text-xs text-stone-500">
              {formatDateKo(date)}
            </span>
          </div>
          <p className="mt-1 truncate text-sm font-medium text-stone-900">
            {cleanTitle(pr.title) || pr.title}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-stone-500">
            {visibleLabels.slice(0, 2).map((l) => (
              <CategoryChip key={l.name} name={l.name} hex={l.color} />
            ))}
            <span>#{pr.number}</span>
            <span className="text-stone-300">&middot;</span>
            <span>{pr.user.login}</span>
          </div>
        </div>
      </div>
    </button>
  );
}

/* ── Reject Modal ──────────────────────────────────────────── */

function RejectModal({
  prNumber,
  prTitle,
  busy,
  onConfirm,
  onCancel,
}: {
  prNumber: number;
  prTitle: string;
  busy: boolean;
  onConfirm: (labels: string[], reason: string) => void;
  onCancel: () => void;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [reason, setReason] = useState('');

  const toggle = (label: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 lg:items-center"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-lg rounded-t-xl bg-white p-5 lg:rounded-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-stone-900">
            반려 &mdash; #{prNumber} {prTitle}
          </h3>
          <button
            type="button"
            onClick={onCancel}
            className="rounded p-1 text-stone-500 hover:bg-stone-100"
          >
            <CloseIcon />
          </button>
        </div>

        <p className="mb-3 text-sm text-stone-600">
          반려 사유를 선택하세요 (복수 선택 가능)
        </p>
        <div className="mb-4 flex flex-wrap gap-2">
          {REJECT_LABELS.map((label) => (
            <button
              key={label}
              type="button"
              onClick={() => toggle(label)}
              className={`rounded-full border px-3 py-1.5 text-sm transition ${
                selected.has(label)
                  ? 'border-red-400 bg-red-50 text-red-800'
                  : 'border-stone-300 bg-white text-stone-700 hover:bg-stone-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="추가 사유 (선택)"
          rows={3}
          className="mb-4 w-full rounded border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 placeholder:text-stone-400"
        />

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="rounded border border-stone-300 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 disabled:opacity-50"
          >
            취소
          </button>
          <button
            type="button"
            onClick={() => onConfirm(Array.from(selected), reason)}
            disabled={busy || selected.size === 0}
            className="rounded bg-red-700 px-4 py-2 text-sm text-white hover:bg-red-800 disabled:opacity-50"
          >
            {busy ? '처리 중…' : '반려 확정'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Detail Panel ──────────────────────────────────────────── */

function DetailPanel({
  article,
  token,
  onBack,
  onMutated,
}: {
  article: Article;
  token: string | null;
  onBack: () => void;
  onMutated: () => void;
}) {
  const { pr, status } = article;
  const [contents, setContents] = useState<ContentFile[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [reloadKey, setReloadKey] = useState(0);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [actionBusy, setActionBusy] = useState<
    'merging' | 'closing' | null
  >(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const previewUrl = previewUrlFromBranch(pr.head.ref);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setActiveIdx(0);
    (async () => {
      try {
        const list = await fetchPullRequestFiles(token, pr.number);
        if (cancelled) return;
        const contentFiles = list.filter((f) => isContentFile(f.filename));
        const loaded: ContentFile[] = await Promise.all(
          contentFiles.map(async (f) => {
            try {
              const text = await fetchRawText(f.raw_url, token);
              if (fileKind(f.filename) === 'html')
                return { file: f, fm: parseHtmlMeta(text), body: text };
              const parsed = parseFrontmatter(text);
              return { file: f, fm: parsed.fm, body: parsed.body };
            } catch (e) {
              return {
                file: f,
                fm: {},
                body: `(error: ${e instanceof Error ? e.message : 'unknown'})`,
              };
            }
          }),
        );
        if (!cancelled) {
          setContents(loaded);
          setLoading(false);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : '불러오기 실패');
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pr.number, token, reloadKey]);

  const onPublish = useCallback(async () => {
    if (!token || status !== 'pending') return;
    if (
      !window.confirm(
        `#${pr.number} ${cleanTitle(pr.title)} — 게재(squash merge) 진행?`,
      )
    )
      return;
    setActionBusy('merging');
    setActionError(null);
    try {
      await mergePullRequest(token, pr.number);
      onMutated();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'merge 실패');
    } finally {
      setActionBusy(null);
    }
  }, [token, status, pr.number, pr.title, onMutated]);

  const onRejectConfirm = useCallback(
    async (labels: string[], reason: string) => {
      if (!token) return;
      setActionBusy('closing');
      setActionError(null);
      try {
        const parts = [`**반려 사유:** ${labels.join(', ')}`];
        if (reason.trim()) parts.push(`\n${reason.trim()}`);
        await addPRComment(token, pr.number, parts.join(''));
        await closePullRequest(token, pr.number);
        setRejectOpen(false);
        onMutated();
      } catch (e) {
        setActionError(e instanceof Error ? e.message : '반려 실패');
      } finally {
        setActionBusy(null);
      }
    },
    [token, pr.number, onMutated],
  );

  const activeEntry =
    contents?.[Math.min(activeIdx, (contents?.length ?? 1) - 1)];

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex shrink-0 items-center gap-3 border-b border-stone-200 px-4 py-3">
        <button
          type="button"
          onClick={onBack}
          className="rounded p-1 hover:bg-stone-100 lg:hidden"
          aria-label="목록으로"
        >
          <BackIcon />
        </button>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-semibold text-stone-900 sm:text-base">
            {cleanTitle(pr.title) || pr.title}
          </h2>
          <div className="mt-0.5 flex items-center gap-2 text-xs text-stone-500">
            <StatusPill status={status} />
            <span>#{pr.number}</span>
            <span className="text-stone-300">&middot;</span>
            <span>{pr.user.login}</span>
          </div>
        </div>
        <div className="hidden items-center gap-1.5 sm:flex">
          <a
            href={previewUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded border border-stone-300 px-2 py-1 text-xs text-stone-700 hover:bg-stone-50"
          >
            프리뷰
          </a>
          <a
            href={pr.html_url}
            target="_blank"
            rel="noreferrer"
            className="rounded border border-stone-300 px-2 py-1 text-xs text-stone-700 hover:bg-stone-50"
          >
            GitHub
          </a>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {loading ? (
          <p className="text-sm text-stone-500">콘텐츠 불러오는 중...</p>
        ) : error ? (
          <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">
            {error}
          </div>
        ) : !contents || contents.length === 0 ? (
          <p className="rounded border border-dashed border-stone-300 bg-stone-50 p-3 text-sm text-stone-500">
            이 PR에 게재 가능한 콘텐츠 파일이 없습니다.
          </p>
        ) : (
          <div className="space-y-3">
            {contents.length > 1 && (
              <div className="flex flex-wrap gap-2 border-b border-stone-100 pb-2">
                {contents.map((c, i) => {
                  const lang = fmString(c.fm, 'language');
                  const stem =
                    c.file.filename.split('/').pop() ?? c.file.filename;
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
            )}
            {activeEntry && (
              <ArticleBody
                entry={activeEntry}
                branch={pr.head.ref}
                token={token}
                onSaved={() => setReloadKey((k) => k + 1)}
              />
            )}
          </div>
        )}
        {actionError && (
          <p className="mt-2 text-xs text-red-700">{actionError}</p>
        )}
      </div>

      {/* Bottom action bar */}
      {status === 'pending' && (
        <div
          className="shrink-0 border-t border-stone-200 bg-white px-4 py-3"
          style={{
            paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))',
          }}
        >
          <div className="flex items-center gap-2">
            {token ? (
              <>
                <button
                  type="button"
                  onClick={() => setRejectOpen(true)}
                  disabled={actionBusy !== null}
                  className="flex-1 rounded border border-red-300 bg-white px-3 py-2.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50 lg:flex-none lg:px-5"
                >
                  반려
                </button>
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 rounded border border-stone-300 bg-white px-3 py-2.5 text-center text-sm font-medium text-stone-700 hover:bg-stone-50 lg:flex-none lg:px-5"
                >
                  프리뷰
                </a>
                <button
                  type="button"
                  onClick={onPublish}
                  disabled={actionBusy !== null}
                  className="flex-1 rounded bg-emerald-700 px-3 py-2.5 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50 lg:flex-none lg:px-5"
                >
                  {actionBusy === 'merging' ? '게재 중…' : '게재'}
                </button>
              </>
            ) : (
              <>
                <a
                  href={pr.html_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 rounded border border-stone-300 bg-white px-3 py-2.5 text-center text-sm font-medium text-stone-700 hover:bg-stone-50"
                >
                  GitHub에서 관리
                </a>
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 rounded border border-stone-300 bg-white px-3 py-2.5 text-center text-sm font-medium text-stone-700 hover:bg-stone-50"
                >
                  프리뷰
                </a>
              </>
            )}
          </div>
        </div>
      )}

      {/* Reject modal */}
      {rejectOpen && (
        <RejectModal
          prNumber={pr.number}
          prTitle={cleanTitle(pr.title)}
          busy={actionBusy === 'closing'}
          onConfirm={onRejectConfirm}
          onCancel={() => setRejectOpen(false)}
        />
      )}
    </div>
  );
}

/* ── Dashboard ─────────────────────────────────────────────── */

function AdminDashboard() {
  const { token, login, setToken, clearToken } = useGitHubToken();
  const [openPRs, setOpenPRs] = useState<PullRequest[] | null>(null);
  const [closedPRs, setClosedPRs] = useState<PullRequest[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshAt, setRefreshAt] = useState<number>(Date.now());
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [selectedPR, setSelectedPR] = useState<number | null>(null);
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
    setSelectedPR(null);
  }, []);

  const articles = useMemo<Article[]>(() => {
    const cutoff = Date.now() - RECENT_DAYS * 24 * 60 * 60 * 1000;
    const pending: Article[] = (openPRs ?? [])
      .filter((pr) => pr.labels.some((l) => l.name === 'content-review'))
      .map((pr) => ({ pr, status: 'pending' as const, date: pr.created_at }));
    const approved: Article[] = (closedPRs ?? [])
      .filter(
        (pr) =>
          pr.merged_at && new Date(pr.merged_at).getTime() >= cutoff,
      )
      .filter(looksLikeContentPR)
      .map((pr) => ({
        pr,
        status: 'approved' as const,
        date: pr.merged_at!,
      }));
    const rejected: Article[] = (closedPRs ?? [])
      .filter(
        (pr) =>
          !pr.merged_at && new Date(pr.updated_at).getTime() >= cutoff,
      )
      .filter(looksLikeContentPR)
      .map((pr) => ({
        pr,
        status: 'rejected' as const,
        date: pr.updated_at,
      }));
    return [...pending, ...approved, ...rejected].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }, [openPRs, closedPRs]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    articles.forEach((a) =>
      a.pr.labels
        .filter((l) => !['content-review', 'phase1-pending'].includes(l.name))
        .forEach((l) => set.add(l.name)),
    );
    return Array.from(set).sort();
  }, [articles]);

  const filtered = useMemo(() => {
    let list = articles;
    if (filterStatus !== 'all')
      list = list.filter((a) => a.status === filterStatus);
    if (filterCategory !== 'all')
      list = list.filter((a) =>
        a.pr.labels.some((l) => l.name === filterCategory),
      );
    return list;
  }, [articles, filterStatus, filterCategory]);

  const counts = useMemo(
    () => ({
      all: articles.length,
      pending: articles.filter((a) => a.status === 'pending').length,
      approved: articles.filter((a) => a.status === 'approved').length,
      rejected: articles.filter((a) => a.status === 'rejected').length,
    }),
    [articles],
  );

  const selectedArticle = useMemo(
    () => articles.find((a) => a.pr.number === selectedPR) ?? null,
    [articles, selectedPR],
  );

  const statusFilters: { key: FilterStatus; label: string }[] = [
    { key: 'all', label: `전체 (${counts.all})` },
    { key: 'pending', label: `대기중 (${counts.pending})` },
    { key: 'approved', label: `승인됨 (${counts.approved})` },
    { key: 'rejected', label: `반려됨 (${counts.rejected})` },
  ];

  return (
    <div className="flex h-[calc(100dvh-2.5rem)] flex-col">
      {/* Top bar: token + filters */}
      <div className="shrink-0 space-y-3 border-b border-stone-200 px-4 py-3">
        <TokenBar
          token={token}
          login={login}
          setToken={setToken}
          clearToken={clearToken}
        />

        {error && (
          <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">
            {error}
            {token
              ? ''
              : ' (미인증: 시간당 60건 — PAT 입력 시 5000건/h)'}
          </div>
        )}

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="-mx-1 flex gap-1 overflow-x-auto px-1">
            {statusFilters.map((sf) => (
              <button
                key={sf.key}
                type="button"
                onClick={() => setFilterStatus(sf.key)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                  filterStatus === sf.key
                    ? 'bg-stone-900 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {sf.label}
              </button>
            ))}
          </div>
          {categories.length > 0 && (
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="rounded border border-stone-300 bg-white px-2 py-1.5 text-xs text-stone-700"
            >
              <option value="all">카테고리 전체</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}
          <button
            type="button"
            onClick={() => setRefreshAt(Date.now())}
            className="ml-auto rounded border border-stone-300 bg-white px-2.5 py-1.5 text-xs text-stone-700 hover:bg-stone-50"
          >
            새로고침
          </button>
        </div>
      </div>

      {/* Main area */}
      {openPRs === null || closedPRs === null ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-stone-500">불러오는 중...</p>
        </div>
      ) : (
        <div className="flex flex-1 overflow-hidden">
          {/* Left panel: card list */}
          <div
            className={`${
              selectedPR != null ? 'hidden' : ''
            } w-full overflow-y-auto lg:block lg:w-[380px] lg:shrink-0 lg:border-r lg:border-stone-200 xl:w-[420px]`}
          >
            {filtered.length === 0 ? (
              <div className="p-6 text-center text-sm text-stone-500">
                {filterStatus === 'pending'
                  ? 'content-review 라벨이 있는 PR이 없습니다.'
                  : filterStatus === 'approved'
                    ? `최근 ${RECENT_DAYS}일 게재 콘텐츠가 없습니다.`
                    : filterStatus === 'rejected'
                      ? `최근 ${RECENT_DAYS}일 반려 콘텐츠가 없습니다.`
                      : '콘텐츠가 없습니다.'}
              </div>
            ) : (
              <div className="space-y-2 p-3">
                {filtered.map((a) => (
                  <ContentCard
                    key={a.pr.number}
                    article={a}
                    selected={selectedPR === a.pr.number}
                    onSelect={() => setSelectedPR(a.pr.number)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right panel: detail */}
          {selectedArticle ? (
            <div className="w-full flex-1 overflow-hidden lg:w-auto">
              <DetailPanel
                key={selectedArticle.pr.number}
                article={selectedArticle}
                token={token}
                onBack={() => setSelectedPR(null)}
                onMutated={onMutated}
              />
            </div>
          ) : (
            <div className="hidden flex-1 items-center justify-center lg:flex">
              <p className="text-sm text-stone-400">
                콘텐츠를 선택하세요
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Auth & Export ──────────────────────────────────────────── */

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
  const authed = useSyncExternalStore(
    subscribeAuth,
    getAuthSnapshot,
    getAuthServerSnapshot,
  );

  if (!authed) {
    return (
      <PasswordGate
        onUnlock={() => {
          /* state syncs via storage event */
        }}
      />
    );
  }

  return <AdminDashboard />;
}
