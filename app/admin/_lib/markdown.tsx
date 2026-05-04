import type { ReactNode } from 'react';

export type Frontmatter = Record<string, string | string[]>;

export function parseFrontmatter(src: string): { fm: Frontmatter; body: string } {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(src);
  if (!m) return { fm: {}, body: src };
  const fm: Frontmatter = {};
  let currentList: { key: string; items: string[] } | null = null;
  for (const rawLine of m[1].split(/\r?\n/)) {
    if (currentList && /^\s+-\s/.test(rawLine)) {
      currentList.items.push(stripQuotes(rawLine.replace(/^\s+-\s+/, '')));
      continue;
    }
    if (currentList) {
      fm[currentList.key] = currentList.items;
      currentList = null;
    }
    const km = /^([\w-]+)\s*:\s*(.*)$/.exec(rawLine);
    if (!km) continue;
    const key = km[1];
    const val = km[2].trim();
    if (val === '') {
      currentList = { key, items: [] };
    } else {
      fm[key] = stripQuotes(val);
    }
  }
  if (currentList) fm[currentList.key] = currentList.items;
  return { fm, body: m[2] };
}

function stripQuotes(s: string): string {
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    return s.slice(1, -1);
  }
  return s;
}

function renderInline(text: string, prefix: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const linkRe = /\[([^\]]+)\]\(([^)]+)\)/g;
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = linkRe.exec(text))) {
    if (m.index > lastIndex) parts.push(text.slice(lastIndex, m.index));
    parts.push(
      <a
        key={`${prefix}-l-${i++}`}
        href={m[2]}
        target="_blank"
        rel="noreferrer"
        className="text-blue-700 underline decoration-blue-300 hover:decoration-blue-700"
      >
        {m[1]}
      </a>
    );
    lastIndex = m.index + m[0].length;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
}

export function renderMarkdownBody(src: string, keyPrefix = 'md'): ReactNode[] {
  const lines = src.split(/\r?\n/);
  const blocks: ReactNode[] = [];
  let para: string[] = [];
  let listItems: string[] = [];
  let i = 0;

  const flushPara = () => {
    if (para.length) {
      blocks.push(
        <p key={`${keyPrefix}-p-${i++}`} className="my-3 leading-7 text-stone-800">
          {renderInline(para.join(' '), `${keyPrefix}-p-${i}`)}
        </p>
      );
      para = [];
    }
  };
  const flushList = () => {
    if (listItems.length) {
      blocks.push(
        <ul key={`${keyPrefix}-ul-${i++}`} className="my-3 list-disc space-y-1 pl-6 text-stone-800">
          {listItems.map((item, idx) => (
            <li key={idx} className="leading-7">
              {renderInline(item, `${keyPrefix}-li-${i}-${idx}`)}
            </li>
          ))}
        </ul>
      );
      listItems = [];
    }
  };

  for (const line of lines) {
    if (/^\s*$/.test(line)) {
      flushPara();
      flushList();
      continue;
    }
    if (/^- /.test(line)) {
      flushPara();
      listItems.push(line.slice(2));
      continue;
    }
    flushList();
    if (/^### /.test(line)) {
      flushPara();
      blocks.push(
        <h3 key={`${keyPrefix}-h3-${i++}`} className="mt-5 text-base font-semibold text-stone-900">
          {renderInline(line.slice(4), `${keyPrefix}-h3-${i}`)}
        </h3>
      );
    } else if (/^## /.test(line)) {
      flushPara();
      blocks.push(
        <h2 key={`${keyPrefix}-h2-${i++}`} className="mt-6 border-b border-stone-200 pb-1 text-lg font-semibold text-stone-900">
          {renderInline(line.slice(3), `${keyPrefix}-h2-${i}`)}
        </h2>
      );
    } else if (/^# /.test(line)) {
      flushPara();
      blocks.push(
        <h1 key={`${keyPrefix}-h1-${i++}`} className="mt-6 text-xl font-semibold text-stone-900">
          {renderInline(line.slice(2), `${keyPrefix}-h1-${i}`)}
        </h1>
      );
    } else if (/^---\s*$/.test(line)) {
      flushPara();
      blocks.push(<hr key={`${keyPrefix}-hr-${i++}`} className="my-5 border-stone-200" />);
    } else if (/^>\s?/.test(line)) {
      flushPara();
      blocks.push(
        <blockquote
          key={`${keyPrefix}-bq-${i++}`}
          className="my-3 border-l-4 border-stone-300 pl-3 italic text-stone-600"
        >
          {renderInline(line.replace(/^>\s?/, ''), `${keyPrefix}-bq-${i}`)}
        </blockquote>
      );
    } else {
      para.push(line);
    }
  }
  flushPara();
  flushList();
  return blocks;
}
