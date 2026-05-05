// Hexagon image credit/license formatters — JAC-2014.
//
// Pure, client-safe helpers extracted from `lib/hexagonArticles.ts` so the
// admin preview (client bundle) and the production hexagon renderer share a
// single canonical credit-footer format. No `fs` import — safe in any bundle.
//
// Source-of-truth schema: n8n-workflows/_lib/hexagon-input-contract.md.

export type ImageSource = 'unsplash' | 'pexels' | 'pixabay' | 'wikimedia' | 'cc0' | 'cc-by';
export type SeasonalTone = 'spring' | 'summer' | 'fall' | 'winter';
export type HexagonImageRole = 'hero' | `inline_${number}` | 'inline';

export interface HexagonImage {
  role: HexagonImageRole;
  source: ImageSource;
  asset_id: string;
  asset_url?: string;
  license: string;
  credit: string;
  seasonal_tone: SeasonalTone;
  alt_text_ko: string;
  alt_text_en: string;
}

/**
 * Loose shape accepted by the formatters — every hexagon `images:` entry is
 * compatible, but admin frontmatter parsers may surface partial entries (e.g.
 * `src`/`alt`/`creditUrl`/`licenseUrl`) so we treat all fields as optional.
 */
export interface CreditableImage {
  role?: string;
  credit?: string;
  creditUrl?: string;
  license?: string;
  licenseUrl?: string;
  asset_url?: string;
}

/**
 * Render a single image's credit + license string for the article footer.
 * Format: `Photo by <Name> on <Source> — <license>`.
 */
export function formatImageCredit(image: CreditableImage): string {
  const parts: string[] = [];
  if (image.credit) parts.push(image.credit);
  if (image.license) parts.push(image.license);
  return parts.join(' — ');
}

/**
 * Render the full credit/license footer block as plain text. Matches the
 * canonical production format so admin preview and production stay aligned.
 */
export function formatCreditFooter(images: CreditableImage[] | undefined | null): string {
  if (!images || images.length === 0) return '';
  return images
    .map((im, idx) => `${roleLabel(im.role, idx)}: ${formatImageCredit(im)}`)
    .join('\n');
}

/**
 * Render the credit footer as an HTML fragment, escaped for direct
 * `dangerouslySetInnerHTML` use. Honors optional `creditUrl` / `licenseUrl`
 * (or falls back to `asset_url` for the credit link) so the admin preview
 * surfaces source links when frontmatter provides them.
 */
export function renderCreditFooterHtml(images: CreditableImage[] | undefined | null): string {
  if (!images || images.length === 0) return '';
  const items = images
    .map((im, idx) => {
      const label = escapeText(roleLabel(im.role, idx));
      const creditUrl = im.creditUrl ?? im.asset_url;
      const credit = im.credit
        ? creditUrl
          ? `<a href="${escapeAttr(creditUrl)}" target="_blank" rel="noreferrer">${escapeText(im.credit)}</a>`
          : escapeText(im.credit)
        : '';
      const license = im.license
        ? im.licenseUrl
          ? `<a href="${escapeAttr(im.licenseUrl)}" target="_blank" rel="noreferrer">${escapeText(im.license)}</a>`
          : escapeText(im.license)
        : '';
      const sep = credit && license ? ' — ' : '';
      return `<li><strong>${label}:</strong> ${credit}${sep}${license}</li>`;
    })
    .join('');
  return `<footer class="hexagon-credits"><h4>Image credits</h4><ul>${items}</ul></footer>`;
}

function roleLabel(role: string | undefined, idx: number): string {
  return role === 'hero' ? 'Hero' : `Inline ${idx}`;
}

function escapeText(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeAttr(s: string): string {
  return escapeText(s).replace(/"/g, '&quot;');
}
