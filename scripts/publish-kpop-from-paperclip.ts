import fs from 'fs';
import path from 'path';

const BASE_URL = process.env.PAPERCLIP_API_URL;
const API_KEY = process.env.PAPERCLIP_API_KEY;
const RUN_ID = process.env.PAPERCLIP_RUN_ID;
const SITE_BASE = 'https://kstoryworld.com';

interface CliOptions {
  publishIssueId: string;
  sourceIssueId: string;
  dryRun: boolean;
}

interface IssueDocument {
  body: string;
}

interface ParsedDraft {
  title: string;
  slug: string;
  meta: string;
  tags: string[];
  intro: string;
  lyricsQuote?: string;
  culturalContext: string;
  learningPoints: Array<{ title: string; english: string; explanation: string }>;
  closing: string;
  source: string;
}

interface ExistingReviewMatch {
  slug: string;
  title: string;
}

function parseArgs(argv: string[]): CliOptions {
  const args = argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const positional = args.filter((arg) => arg !== '--dry-run');
  if (positional.length < 2) {
    throw new Error(
      'Usage: tsx scripts/publish-kpop-from-paperclip.ts <publish-issue-id> <source-issue-id> [--dry-run]'
    );
  }
  return {
    publishIssueId: positional[0],
    sourceIssueId: positional[1],
    dryRun,
  };
}

async function paperclipGet<T>(pathname: string): Promise<T> {
  if (!BASE_URL || !API_KEY) {
    throw new Error('PAPERCLIP_API_URL and PAPERCLIP_API_KEY are required');
  }
  const response = await fetch(`${BASE_URL}${pathname}`, {
    headers: {
      Authorization: `Bearer ${API_KEY}`,
    },
  });
  if (!response.ok) {
    throw new Error(`GET ${pathname} failed: ${response.status} ${response.statusText}`);
  }
  return (await response.json()) as T;
}

async function paperclipPatchIssue(issueId: string, status: string, comment: string) {
  if (!BASE_URL || !API_KEY || !RUN_ID) {
    throw new Error('PAPERCLIP_API_URL, PAPERCLIP_API_KEY, PAPERCLIP_RUN_ID are required');
  }
  const response = await fetch(`${BASE_URL}/api/issues/${issueId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
      'X-Paperclip-Run-Id': RUN_ID,
    },
    body: JSON.stringify({ status, comment }),
  });
  if (!response.ok) {
    throw new Error(`PATCH /api/issues/${issueId} failed: ${response.status} ${response.statusText}`);
  }
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function stripMarkdown(value: string): string {
  return normalizeWhitespace(
    value
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
  );
}

function extractSection(body: string, name: string): string {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = body.match(new RegExp(`## ${escaped}\\n\\n([\\s\\S]*?)(?=\\n## |$)`));
  if (!match) {
    throw new Error(`Missing section: ${name}`);
  }
  return match[1].trim();
}

function parseLearningPoints(section: string): Array<{ title: string; english: string; explanation: string }> {
  const blocks = section
    .split(/\n(?=### )/)
    .map((block) => block.trim())
    .filter((block) => block.startsWith('### '));

  return blocks.map((block) => {
    const titleMatch = block.match(/^###\s+\d+\.\s+(.+)$/m);
    const englishMatch = block.match(/-\s*영\s*어\s*의역:\s*(.+)$/m);
    const explanationMatch = block.match(/- 해설:\s*([\s\S]+)$/m);
    if (!titleMatch || !englishMatch || !explanationMatch) {
      throw new Error(`Failed to parse learning point block: ${block}`);
    }
    return {
      title: stripMarkdown(titleMatch[1]),
      english: stripMarkdown(englishMatch[1]),
      explanation: stripMarkdown(explanationMatch[1]),
    };
  });
}

function parseDraftDocument(body: string): ParsedDraft {
  const titleMatch = body.match(/^#\s+(.+)$/m);
  const slugMatch = body.match(/^- slug:\s*`([^`]+)`$/m);
  const metaMatch = body.match(/^- meta:\s*(.+)$/m);
  const tagsMatch = body.match(/^- tags:\s*(.+)$/m);
  if (!titleMatch || !slugMatch || !metaMatch || !tagsMatch) {
    throw new Error('Missing title/slug/meta/tags in draft-content');
  }

  const lyricsSection = extractSection(body, 'lyrics_quote')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('> **Story 작업 노트**'))
    .join('\n');

  const sourceLine = stripMarkdown(extractSection(body, 'source'));

  return {
    title: stripMarkdown(titleMatch[1]),
    slug: slugMatch[1].trim(),
    meta: stripMarkdown(metaMatch[1]),
    tags: tagsMatch[1].split(',').map((tag) => normalizeWhitespace(tag)),
    intro: stripMarkdown(extractSection(body, 'intro')),
    lyricsQuote: lyricsSection ? stripMarkdown(lyricsSection) : undefined,
    culturalContext: stripMarkdown(extractSection(body, 'cultural_context')),
    learningPoints: parseLearningPoints(extractSection(body, 'learning_points')),
    closing: stripMarkdown(extractSection(body, 'closing')),
    source: sourceLine.replace(/^출처:\s*/u, '').trim(),
  };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderHtml(draft: ParsedDraft): string {
  const lyricsBlock = draft.lyricsQuote
    ? [
        '    <h3>가사 포인트</h3>',
        `    <blockquote>${escapeHtml(draft.lyricsQuote)}</blockquote>`,
        '',
      ].join('\n')
    : '';

  const learningItems = draft.learningPoints
    .map(
      (point) => [
        '        <li>',
        `            <strong>${escapeHtml(point.title)}</strong> — ${escapeHtml(point.english)}<br>`,
        `            ${escapeHtml(point.explanation)}`,
        '        </li>',
      ].join('\n')
    )
    .join('\n');

  return `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="${escapeHtml(draft.meta)}">
    <meta name="category" content="k-pop">
    <title>${escapeHtml(draft.title)}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.8; color: #333; }
        img { max-width: 100%; height: auto; border-radius: 8px; }
        h1 { color: #1a1a1a; border-bottom: 2px solid #e0e0e0; padding-bottom: 10px; }
        h2 { color: #2c3e50; margin-top: 30px; }
        h3 { color: #34495e; margin-top: 25px; }
        h4 { color: #555; margin-top: 15px; }
        blockquote { border-left: 4px solid #3498db; margin: 20px 0; padding: 10px 20px; background: #f8f9fa; }
        a { color: #3498db; text-decoration: none; }
        a:hover { text-decoration: underline; }
        .meta { color: #666; font-size: 0.9em; margin-bottom: 20px; }
        ul { line-height: 2; }
        li { margin-bottom: 12px; }
    </style>
</head>
<body>
    <h1>${escapeHtml(draft.title)}</h1>
    <div class="meta">Language: 한국어 · Editor's Curation · K-Pop</div>

    <h3>인트로</h3>
    <p>${escapeHtml(draft.intro)}</p>

${lyricsBlock}    <h3>문화적 맥락</h3>
    <p>${escapeHtml(draft.culturalContext)}</p>

    <h3>한국어 학습 포인트</h3>
    <ul>
${learningItems}
    </ul>

    <h3>마무리</h3>
    <p>${escapeHtml(draft.closing)}</p>

    <h3>출처</h3>
    <p>출처: <a href="${escapeHtml(draft.source)}">${escapeHtml(draft.source)}</a></p>
</body>
</html>
`;
}

function findExistingKpopSlug(title: string): ExistingReviewMatch | null {
  const reviewsDir = path.join(process.cwd(), 'content/reviews');
  if (!fs.existsSync(reviewsDir)) return null;

  for (const file of fs.readdirSync(reviewsDir)) {
    if (!file.endsWith('-ko.html')) continue;
    const fullPath = path.join(reviewsDir, file);
    const html = fs.readFileSync(fullPath, 'utf8');
    const categoryMatch = html.match(/<meta\s+name=["']category["']\s+content=["']([^"']+)["']/i);
    const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
    if (!categoryMatch || !titleMatch) continue;
    if (categoryMatch[1].trim() !== 'k-pop') continue;
    if (normalizeWhitespace(titleMatch[1]) !== normalizeWhitespace(title)) continue;
    return {
      slug: file.replace(/\.html$/, ''),
      title: normalizeWhitespace(titleMatch[1]),
    };
  }

  return null;
}

async function main() {
  const options = parseArgs(process.argv);
  const draftDocument = await paperclipGet<IssueDocument>(
    `/api/issues/${options.sourceIssueId}/documents/draft-content`
  );
  const draft = parseDraftDocument(draftDocument.body);
  const existingMatch = findExistingKpopSlug(draft.title);
  const slug = existingMatch
    ? existingMatch.slug
    : draft.slug.endsWith('-ko')
      ? draft.slug
      : `${draft.slug}-ko`;
  const outputPath = path.join(process.cwd(), 'content/reviews', `${slug}.html`);
  const prodUrl = `${SITE_BASE}/k-pop/${slug}`;
  const html = renderHtml(draft);

  if (!options.dryRun) {
    fs.writeFileSync(outputPath, html, 'utf8');
    const comment = [
      'K-팝 publish adapter 실행 완료',
      '',
      `- source issue: ${options.sourceIssueId}`,
      `- output: \`content/reviews/${slug}.html\``,
      `- prod url (after deploy): ${prodUrl}`,
    ].join('\n');
    await paperclipPatchIssue(options.publishIssueId, 'done', comment);
  }

  console.log(
    JSON.stringify(
      {
        dryRun: options.dryRun,
        sourceIssueId: options.sourceIssueId,
        slug,
        outputPath,
        prodUrl,
        reusedExistingSlug: Boolean(existingMatch),
        tags: draft.tags,
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
