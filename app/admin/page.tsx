'use client';

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react';

const REPO = 'jackylabs26/kstoryworld';
const SESSION_KEY = 'ksw-admin-auth-2026-05';
const DEFAULT_PASS_HASH = '72d8494c5c7f65b6ac516ee99049fd5aa5b3e17c569ed4606e152d52522ae012';
const PASS_HASH = process.env.NEXT_PUBLIC_ADMIN_PASS_HASH || DEFAULT_PASS_HASH;

type Label = { name: string; color: string; description: string | null };
type PullRequest = {
  number: number;
  title: string;
  state: string;
  draft: boolean;
  user: { login: string; avatar_url: string };
  labels: Label[];
  created_at: string;
  updated_at: string;
  html_url: string;
  head: { ref: string };
  changed_files?: number;
  additions?: number;
  deletions?: number;
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

function categoryFromPR(pr: PullRequest): string {
  const titleMatch = /content[:/](\w[\w-]*)/i.exec(pr.title);
  if (titleMatch) return titleMatch[1].toLowerCase();
  const branch = pr.head.ref || '';
  if (branch.startsWith('content/backfill/')) return 'backfill';
  if (branch.startsWith('content/')) {
    const parts = branch.split('/');
    return parts[1] || 'content';
  }
  if (branch.startsWith('feat/')) return 'feat';
  if (branch.startsWith('chore/')) return 'chore';
  return 'other';
}

function PRCard({ pr }: { pr: PullRequest }) {
  const cat = categoryFromPR(pr);
  const created = new Date(pr.created_at).toLocaleString('ko-KR');
  return (
    <article className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm transition hover:shadow">
      <header className="mb-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <a
          href={pr.html_url}
          target="_blank"
          rel="noreferrer"
          className="text-base font-medium text-stone-900 hover:underline"
        >
          #{pr.number} · {pr.title}
        </a>
        <span className="rounded bg-stone-100 px-2 py-0.5 text-xs uppercase text-stone-700">
          {cat}
        </span>
        {pr.draft ? (
          <span className="rounded bg-stone-200 px-2 py-0.5 text-xs text-stone-700">draft</span>
        ) : null}
      </header>
      <div className="mb-3 flex flex-wrap gap-1.5">
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
      </div>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-stone-600 md:grid-cols-4">
        <div>
          <dt className="text-stone-400">작성자</dt>
          <dd>{pr.user.login}</dd>
        </div>
        <div>
          <dt className="text-stone-400">브랜치</dt>
          <dd className="truncate" title={pr.head.ref}>
            {pr.head.ref}
          </dd>
        </div>
        <div>
          <dt className="text-stone-400">생성</dt>
          <dd>{created}</dd>
        </div>
        <div>
          <dt className="text-stone-400">변경</dt>
          <dd>
            {pr.changed_files ?? '?'} 파일 · +{pr.additions ?? '?'} / −{pr.deletions ?? '?'}
          </dd>
        </div>
      </dl>
      <div className="mt-3 flex flex-wrap gap-2">
        <a
          href={pr.html_url}
          target="_blank"
          rel="noreferrer"
          className="rounded bg-stone-900 px-3 py-1.5 text-sm text-white hover:bg-stone-700"
        >
          GitHub 에서 검토
        </a>
        <a
          href={`${pr.html_url}/files`}
          target="_blank"
          rel="noreferrer"
          className="rounded border border-stone-300 px-3 py-1.5 text-sm text-stone-700 hover:bg-stone-100"
        >
          파일 변경
        </a>
        <a
          href={`https://kstoryworld-git-${pr.head.ref.replace(/[/_]/g, '-')}-jackylabs26.vercel.app`}
          target="_blank"
          rel="noreferrer"
          className="rounded border border-stone-300 px-3 py-1.5 text-sm text-stone-700 hover:bg-stone-100"
        >
          Vercel preview
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
  const otherOpenPRs = useMemo(
    () =>
      (openPRs ?? []).filter(
        (pr) => !pr.labels.some((l) => l.name === 'content-review')
      ),
    [openPRs]
  );
  const recentMerged = useMemo(
    () => (closedPRs ?? []).filter((pr) => pr.state === 'closed').slice(0, 10),
    [closedPRs]
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-baseline justify-between">
        <div>
          <h1 className="text-2xl font-semibold">컨텐츠 검토 보드</h1>
          <p className="text-sm text-stone-600">
            content-review 라벨이 붙은 열린 PR 우선 표시. 액션은 GitHub 에서 라벨/머지로 수행.
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
          검토 대기 ({reviewPRs.length})
        </h2>
        {openPRs === null ? (
          <p className="text-sm text-stone-500">불러오는 중...</p>
        ) : reviewPRs.length === 0 ? (
          <p className="rounded border border-dashed border-stone-300 bg-white p-4 text-sm text-stone-500">
            검토 대기 컨텐츠가 없습니다.
          </p>
        ) : (
          <div className="space-y-3">
            {reviewPRs.map((pr) => (
              <PRCard key={pr.number} pr={pr} />
            ))}
          </div>
        )}
      </section>

      <section className="mb-10">
        <h2 className="mb-3 border-b border-stone-200 pb-1 text-lg font-medium">
          기타 열린 PR ({otherOpenPRs.length})
        </h2>
        {otherOpenPRs.length === 0 ? (
          <p className="rounded border border-dashed border-stone-300 bg-white p-4 text-sm text-stone-500">
            없음.
          </p>
        ) : (
          <div className="space-y-3">
            {otherOpenPRs.map((pr) => (
              <PRCard key={pr.number} pr={pr} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 border-b border-stone-200 pb-1 text-lg font-medium">
          최근 마감/머지 ({recentMerged.length})
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
                  {new Date(pr.updated_at).toLocaleString('ko-KR')}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <footer className="mt-12 border-t border-stone-200 pt-4 text-xs text-stone-500">
        v0 — 정적 export 호환 client-side 페이지. JAC-1991 Phase 2-v0. 진짜 admin (편집·계정·이메일)은 Phase 3 별도 Vercel 프로젝트로 이전.
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
