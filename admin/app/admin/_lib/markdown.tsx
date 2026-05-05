import type { ReactNode } from 'react';

/**
 * Frontmatter values come in three shapes:
 * - scalar string (e.g. `title: ...`)
 * - flat list of strings (e.g. `tags:` followed by `  - foo`)
 * - list of mappings (e.g. `images:` followed by `  - role: hero`).
 *
 * Hexagon `images:` entries land as `FrontmatterImage[]` so the article
 * preview can surface the credit/license footer. Unknown keys with that
 * shape are also preserved generically.
 */
export type FrontmatterImage = Record<string, string>;
export type FrontmatterValue = string | string[] | FrontmatterImage[];
export type Frontmatter = Record<string, FrontmatterValue>;

export function parseFrontmatter(src: string): { fm: Frontmatter; body: string } {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(src);
  if (!m) return { fm: {}, body: src };
  const fm: Frontmatter = {};
  const lines = m[1].split(/\r?\n/);
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim() || line.trim().startsWith('#')) {
      i++;
      continue;
    }
    const indent = line.match(/^ */)![0].length;
    if (indent !== 0) {
      i++;
      continue;
    }
    const km = /^([\w-]+)\s*:\s*(.*)$/.exec(line);
    if (!km) {
      i++;
      continue;
    }
    const key = km[1];
    const val = km[2].trim();
    if (val !== '') {
      fm[key] = stripQuotes(val);
      i++;
      continue;
    }
    const block: string[] = [];
    i++;
    while (i < lines.length) {
      const nl = lines[i];
      if (nl.trim() === '') {
        i++;
        continue;
      }
      if (/^\s/.test(nl)) {
        block.push(nl);
        i++;
        continue;
      }
      break;
    }
    if (block.length === 0) {
      fm[key] = [];
      continue;
    }
    if (block.some((l) => /^\s*-\s+[\w-]+\s*:/.test(l))) {
      fm[key] = parseListOfMappings(block);
    } else if (block.some((l) => /^\s*-\s/.test(l))) {
      fm[key] = block
        .filter((l) => /^\s*-\s/.test(l))
        .map((l) => stripQuotes(l.replace(/^\s*-\s+/, '')));
    } else {
      // Flat mapping under an unknown key — flatten to "k=v" strings so we
      // don't drop the data; existing string-only consumers still ignore it.
      fm[key] = block
        .map((l) => l.trim())
        .filter(Boolean)
        .map((l) => {
          const colon = l.indexOf(':');
          return colon === -1 ? l : `${l.slice(0, colon).trim()}=${stripQuotes(l.slice(colon + 1).trim())}`;
        });
    }
  }
  return { fm, body: m[2] };
}

function parseListOfMappings(lines: string[]): FrontmatterImage[] {
  const items: FrontmatterImage[] = [];
  let cur: FrontmatterImage | null = null;
  for (const l of lines) {
    if (!l.trim() || l.trim().startsWith('#')) continue;
    const trimmed = l.trim();
    if (trimmed.startsWith('- ')) {
      if (cur) items.push(cur);
      cur = {};
      const rest = trimmed.slice(2);
      const colon = rest.indexOf(':');
      if (colon !== -1) {
        cur[rest.slice(0, colon).trim()] = stripQuotes(rest.slice(colon + 1).trim());
      }
    } else if (cur) {
      const colon = trimmed.indexOf(':');
      if (colon === -1) continue;
      cur[trimmed.slice(0, colon).trim()] = stripQuotes(trimmed.slice(colon + 1).trim());
    }
  }
  if (cur) items.push(cur);
  return items;
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
