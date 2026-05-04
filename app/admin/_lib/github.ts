export const GITHUB_REPO = 'jackylabs26/kstoryworld';

export type Label = { name: string; color: string; description: string | null };
export type GitHubUser = { login: string; avatar_url: string };

export type PullRequest = {
  number: number;
  title: string;
  body: string | null;
  state: string;
  draft: boolean;
  user: GitHubUser;
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

export type GitHubFile = {
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  raw_url: string;
  blob_url: string;
};

function authHeaders(token: string | null, extra?: Record<string, string>): HeadersInit {
  const h: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    ...extra,
  };
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

export async function fetchPullRequests(
  token: string | null,
  state: 'open' | 'closed',
  perPage = 30
): Promise<PullRequest[]> {
  const res = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO}/pulls?state=${state}&per_page=${perPage}&sort=updated&direction=desc`,
    { headers: authHeaders(token) }
  );
  if (!res.ok) throw new Error(`pulls(${state}) ${res.status}`);
  return res.json();
}

export async function fetchPullRequestFiles(
  token: string | null,
  number: number
): Promise<GitHubFile[]> {
  const res = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO}/pulls/${number}/files?per_page=100`,
    { headers: authHeaders(token) }
  );
  if (!res.ok) throw new Error(`pull files ${res.status}`);
  return res.json();
}

export async function fetchRawText(rawUrl: string, token: string | null): Promise<string> {
  const res = await fetch(rawUrl, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!res.ok) throw new Error(`raw ${res.status}`);
  return res.text();
}

export async function mergePullRequest(token: string, number: number): Promise<void> {
  const res = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO}/pulls/${number}/merge`,
    {
      method: 'PUT',
      headers: authHeaders(token, { 'Content-Type': 'application/json' }),
      body: JSON.stringify({ merge_method: 'squash' }),
    }
  );
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`merge ${res.status}: ${body.slice(0, 200)}`);
  }
}

export async function closePullRequest(token: string, number: number): Promise<void> {
  const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/pulls/${number}`, {
    method: 'PATCH',
    headers: authHeaders(token, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({ state: 'closed' }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`close ${res.status}: ${body.slice(0, 200)}`);
  }
}

function encodePath(path: string): string {
  return path
    .split('/')
    .map((seg) => encodeURIComponent(seg))
    .join('/');
}

export async function getFileSha(
  token: string,
  branch: string,
  path: string
): Promise<string> {
  const res = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO}/contents/${encodePath(path)}?ref=${encodeURIComponent(branch)}`,
    { headers: authHeaders(token) }
  );
  if (!res.ok) throw new Error(`contents GET ${res.status}`);
  const json: { sha: string } = await res.json();
  return json.sha;
}

function utf8ToBase64(s: string): string {
  const bytes = new TextEncoder().encode(s);
  let bin = '';
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    bin += String.fromCharCode.apply(
      null,
      Array.from(bytes.subarray(i, Math.min(i + CHUNK, bytes.length)))
    );
  }
  return btoa(bin);
}

export async function saveFileContent(args: {
  token: string;
  branch: string;
  path: string;
  content: string;
  sha: string;
  message: string;
}): Promise<void> {
  const { token, branch, path, content, sha, message } = args;
  const res = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO}/contents/${encodePath(path)}`,
    {
      method: 'PUT',
      headers: authHeaders(token, { 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        message,
        content: utf8ToBase64(content),
        sha,
        branch,
      }),
    }
  );
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`save ${res.status}: ${body.slice(0, 200)}`);
  }
}

export async function verifyToken(token: string): Promise<{ login: string }> {
  const res = await fetch('https://api.github.com/user', {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(`verify ${res.status}`);
  return res.json();
}
