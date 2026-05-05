// Helpers shared by the admin article preview. Mirror the production data flow
// in app/[category]/[slug]/page.tsx so the admin shell renders identically:
// extract <body> from HTML, hash-pick a season from the slug, normalise lang.

export type PreviewLang = 'ko' | 'en';
export type PreviewSeason = 'spring' | 'summer' | 'autumn' | 'winter';

const SEASON_CYCLE: PreviewSeason[] = ['spring', 'summer', 'autumn', 'winter'];

export function seasonForSlug(slug: string): PreviewSeason {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) | 0;
  const idx = Math.abs(h) % SEASON_CYCLE.length;
  return SEASON_CYCLE[idx];
}

export function baseSlugOf(slug: string): string {
  if (slug.endsWith('-en') || slug.endsWith('-ko')) return slug.slice(0, -3);
  return slug;
}

export function inferLangFromSlug(slug: string): PreviewLang {
  return slug.endsWith('-en') ? 'en' : 'ko';
}

export function extractHtmlBody(html: string): string {
  const m = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  return m ? m[1] : html;
}

export function slugFromFilename(filename: string): string {
  const stem = filename.split('/').pop() ?? filename;
  return stem.replace(/\.(md|mdx|html)$/, '');
}

export function markdownToHtml(src: string): string {
  const lines = src.split(/\r?\n/);
  const out: string[] = [];
  let para: string[] = [];
  let listItems: string[] = [];
  let inCode = false;
  let codeLang = '';
  let codeBuf: string[] = [];

  const flushPara = () => {
    if (para.length) {
      out.push(`<p>${renderInline(para.join(' '))}</p>`);
      para = [];
    }
  };
  const flushList = () => {
    if (listItems.length) {
      const items = listItems.map((s) => `<li>${renderInline(s)}</li>`).join('');
      out.push(`<ul>${items}</ul>`);
      listItems = [];
    }
  };

  for (const line of lines) {
    if (/^```/.test(line)) {
      if (inCode) {
        out.push(
          `<pre><code${codeLang ? ` class="language-${escapeAttr(codeLang)}"` : ''}>${escapeText(codeBuf.join('\n'))}</code></pre>`
        );
        inCode = false;
        codeLang = '';
        codeBuf = [];
      } else {
        flushPara();
        flushList();
        inCode = true;
        codeLang = line.replace(/^```/, '').trim();
      }
      continue;
    }
    if (inCode) {
      codeBuf.push(line);
      continue;
    }
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
    if (/^###### /.test(line)) {
      flushPara();
      out.push(`<h6>${renderInline(line.slice(7))}</h6>`);
    } else if (/^##### /.test(line)) {
      flushPara();
      out.push(`<h5>${renderInline(line.slice(6))}</h5>`);
    } else if (/^#### /.test(line)) {
      flushPara();
      out.push(`<h4>${renderInline(line.slice(5))}</h4>`);
    } else if (/^### /.test(line)) {
      flushPara();
      out.push(`<h3>${renderInline(line.slice(4))}</h3>`);
    } else if (/^## /.test(line)) {
      flushPara();
      out.push(`<h2>${renderInline(line.slice(3))}</h2>`);
    } else if (/^# /.test(line)) {
      flushPara();
      out.push(`<h1>${renderInline(line.slice(2))}</h1>`);
    } else if (/^---\s*$/.test(line)) {
      flushPara();
      out.push('<hr />');
    } else if (/^>\s?/.test(line)) {
      flushPara();
      out.push(`<blockquote>${renderInline(line.replace(/^>\s?/, ''))}</blockquote>`);
    } else {
      para.push(line);
    }
  }
  if (inCode) {
    out.push(`<pre><code>${escapeText(codeBuf.join('\n'))}</code></pre>`);
  }
  flushPara();
  flushList();
  return out.join('\n');
}

function renderInline(text: string): string {
  let s = escapeText(text);
  s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (_m, alt, url) =>
    `<img src="${escapeAttr(url)}" alt="${escapeAttr(alt)}" />`
  );
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, txt, url) =>
    `<a href="${escapeAttr(url)}" target="_blank" rel="noreferrer">${txt}</a>`
  );
  s = s.replace(/`([^`]+)`/g, (_m, code) => `<code>${code}</code>`);
  return s;
}

function escapeText(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeAttr(s: string): string {
  return escapeText(s).replace(/"/g, '&quot;');
}
