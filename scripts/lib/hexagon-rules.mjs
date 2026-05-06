// Hexagon validation rules — JAC-2051 §c1.
//
// Single source of truth for the cross-domain rules `_schema.yaml` documents.
// Both the bulk validator (`scripts/validate-hexagon.mjs`) and the per-PR
// gate (`scripts/validate-hexagon-pr.mjs`) import from here so the rules
// can never drift between the two callsites.
//
// Two surfaces:
//   - validateManifest(manifest, { stem }) → string[] of error messages
//       Validates a single parsed `content/hexagons/<slug>.yaml` object.
//   - validateArticleImages(images) → string[] of error messages
//       Validates a hexagon article's `images:` frontmatter array
//       (mirrors `imagesMeetSpec` in lib/hexagonArticles.ts but returns
//       structured errors so PR comments can name the broken field).

export const SISTER_DOMAINS = ['k-food', 'k-pop', 'k-beauty', 'k-travel', 'k-literature'];
export const ALL_DOMAINS = new Set(['k-drama', ...SISTER_DOMAINS]);
export const SEASON_RE = /^[0-9]{4}-(spring|summer|fall|winter)$/;
export const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export const IMAGE_SOURCE_WHITELIST = new Set([
  'unsplash',
  'pexels',
  'pixabay',
  'wikimedia',
  'cc0',
  'cc-by',
]);
export const VALID_TONES = new Set(['spring', 'summer', 'fall', 'winter']);
export const IMAGE_REQUIRED_FIELDS = ['source', 'asset_id', 'license', 'credit', 'seasonal_tone'];

function pushIf(errors, cond, msg) {
  if (cond) errors.push(msg);
}

function validateAnchor(manifest, errors) {
  const a = manifest.anchor;
  if (!a || typeof a !== 'object') {
    errors.push('missing anchor block');
    return;
  }
  if (a.domain !== 'k-drama') {
    errors.push(`anchor.domain must be "k-drama" (got ${JSON.stringify(a.domain)})`);
  }
  for (const f of ['title_ko', 'title_en', 'year', 'network']) {
    if (a[f] === undefined || a[f] === null || String(a[f]).trim() === '') {
      errors.push(`anchor.${f} is required`);
    }
  }
  if (a.year !== undefined && (typeof a.year !== 'number' || a.year < 1900 || a.year > 2100)) {
    errors.push(`anchor.year must be an integer 1900–2100 (got ${a.year})`);
  }
}

function validateSisters(manifest, errors) {
  const sisters = manifest.sisters;
  if (!Array.isArray(sisters)) {
    errors.push('sisters must be an array');
    return;
  }
  const seen = new Set();
  for (const s of sisters) {
    if (!s || !s.domain) {
      errors.push('sister entry missing domain');
      continue;
    }
    if (seen.has(s.domain)) {
      errors.push(
        `duplicate sister domain "${s.domain}" — each of ${SISTER_DOMAINS.join(', ')} must appear exactly once`,
      );
    }
    if (!SISTER_DOMAINS.includes(s.domain)) {
      errors.push(`sister domain "${s.domain}" is not one of ${SISTER_DOMAINS.join(', ')}`);
    }
    seen.add(s.domain);
  }
  for (const required of SISTER_DOMAINS) {
    if (!seen.has(required)) {
      errors.push(`missing sister domain "${required}" — manifests must include all 5 sister domains`);
    }
  }
}

function validateCrossLinks(manifest, errors) {
  const sisters = manifest.sisters || [];
  for (const s of sisters) {
    const links = (s && s.cross_links) || [];
    if (!Array.isArray(links)) {
      errors.push(`cross_links in ${s.domain} must be an array`);
      continue;
    }
    for (const link of links) {
      if (typeof link !== 'string') {
        errors.push(`cross_link in ${s.domain} must be a string (got ${typeof link})`);
        continue;
      }
      const [domainPart, slugPart] = link.split('/');
      if (!domainPart || !slugPart) {
        errors.push(`cross_link "${link}" in ${s.domain} is not domain/slug shaped`);
        continue;
      }
      if (!ALL_DOMAINS.has(domainPart)) {
        errors.push(`cross_link "${link}" in ${s.domain} points to unknown domain "${domainPart}"`);
        continue;
      }
      if (domainPart === 'k-drama' && slugPart !== 'anchor') {
        errors.push(`cross_link to k-drama must use slug "anchor" (got "${slugPart}")`);
      }
    }
  }
}

/**
 * Validate a single parsed hexagon manifest object.
 * Returns a list of human-readable error messages (empty array = ok).
 */
export function validateManifest(manifest, { stem } = {}) {
  const errors = [];
  if (!manifest || typeof manifest !== 'object') {
    errors.push('manifest is not a YAML object');
    return errors;
  }
  if (!manifest.hexagon_id) {
    errors.push('missing hexagon_id');
  } else if (!SLUG_RE.test(manifest.hexagon_id)) {
    errors.push(`hexagon_id "${manifest.hexagon_id}" must be lowercase kebab-case`);
  } else if (stem !== undefined && manifest.hexagon_id !== stem) {
    errors.push(`hexagon_id "${manifest.hexagon_id}" does not match filename stem "${stem}"`);
  }
  if (!manifest.season_window) {
    errors.push('missing season_window');
  } else if (!SEASON_RE.test(manifest.season_window)) {
    errors.push(`season_window "${manifest.season_window}" must match YYYY-(spring|summer|fall|winter)`);
  }
  validateAnchor(manifest, errors);
  validateSisters(manifest, errors);
  validateCrossLinks(manifest, errors);
  return errors;
}

/**
 * Validate a hexagon article's `images:` frontmatter array against
 * JAC-1896 §B. Mirrors lib/hexagonArticles.ts `imagesMeetSpec()` but
 * returns structured error messages instead of a boolean so PR comments
 * can name the offending image.
 */
export function validateArticleImages(images) {
  const errors = [];
  if (!Array.isArray(images)) {
    errors.push('images: frontmatter must be an array');
    return errors;
  }
  if (images.length < 2) {
    errors.push(`images: needs ≥2 entries (got ${images.length}) — 1 hero + ≥1 inline`);
  }
  const heroes = images.filter((im) => im && im.role === 'hero');
  const inlines = images.filter((im) => im && /^inline(_\d+)?$/.test(String(im.role)));
  if (heroes.length !== 1) {
    errors.push(`images: exactly one role=hero required (got ${heroes.length})`);
  }
  if (inlines.length < 1) {
    errors.push(`images: at least one role=inline / inline_<n> required (got ${inlines.length})`);
  }
  images.forEach((im, idx) => {
    const tag = `images[${idx}]${im && im.role ? ` (${im.role})` : ''}`;
    if (!im || typeof im !== 'object') {
      errors.push(`${tag} is not an object`);
      return;
    }
    if (im.source !== undefined && !IMAGE_SOURCE_WHITELIST.has(im.source)) {
      errors.push(`${tag} source "${im.source}" not in whitelist (${[...IMAGE_SOURCE_WHITELIST].join(', ')})`);
    }
    if (im.seasonal_tone !== undefined && !VALID_TONES.has(im.seasonal_tone)) {
      errors.push(`${tag} seasonal_tone "${im.seasonal_tone}" must be one of ${[...VALID_TONES].join(', ')}`);
    }
    for (const f of IMAGE_REQUIRED_FIELDS) {
      if (im[f] === undefined || im[f] === null || String(im[f]).trim() === '') {
        errors.push(`${tag} ${f} is required`);
      }
    }
    pushIf(errors, !im.alt_text_ko || !String(im.alt_text_ko).trim(), `${tag} alt_text_ko is required`);
    pushIf(errors, !im.alt_text_en || !String(im.alt_text_en).trim(), `${tag} alt_text_en is required`);
  });
  return errors;
}
