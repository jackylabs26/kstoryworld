// Shared hexagon validation rules — single source of truth for both
// `validate-hexagon.mjs` (full repo scan) and `validate-hexagon-pr.mjs`
// (per-PR / per-worktree gate, JAC-2051).
//
// Pure functions: no I/O, no process.exit. Each `validateXxx` accepts an
// `errors[]` accumulator and pushes human-readable strings prefixed with
// the caller-supplied `label` (typically a file path).

export const SISTER_DOMAINS = ['k-food', 'k-pop', 'k-beauty', 'k-travel', 'k-literature'];
export const ALL_DOMAINS = new Set(['k-drama', ...SISTER_DOMAINS]);
export const SEASON_RE = /^[0-9]{4}-(spring|summer|fall|winter)$/;
export const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

// Mirrors `lib/hexagonArticles.ts` (`imagesMeetSpec`) — JAC-1896 §B.
export const IMAGE_SOURCE_WHITELIST = new Set([
  'unsplash', 'pexels', 'pixabay', 'wikimedia', 'cc0', 'cc-by',
]);
export const VALID_TONES = new Set(['spring', 'summer', 'fall', 'winter']);
export const HERO_ROLE = 'hero';
export const INLINE_ROLE_RE = /^inline(_\d+)?$/;
export const REQUIRED_IMAGE_FIELDS = ['source', 'asset_id', 'license', 'credit', 'seasonal_tone'];

export function validateHexagonId(manifest, label, stem, errors) {
  if (!manifest.hexagon_id) {
    errors.push(`${label}: missing hexagon_id`);
    return;
  }
  if (!SLUG_RE.test(manifest.hexagon_id)) {
    errors.push(`${label}: hexagon_id "${manifest.hexagon_id}" must be lowercase kebab-case`);
    return;
  }
  if (stem != null && manifest.hexagon_id !== stem) {
    errors.push(`${label}: hexagon_id "${manifest.hexagon_id}" does not match filename stem "${stem}"`);
  }
}

export function validateSeasonWindow(manifest, label, errors) {
  if (!manifest.season_window) {
    errors.push(`${label}: missing season_window`);
    return;
  }
  if (!SEASON_RE.test(manifest.season_window)) {
    errors.push(`${label}: season_window "${manifest.season_window}" must match YYYY-(spring|summer|fall|winter)`);
  }
}

export function validateAnchor(manifest, label, errors) {
  const a = manifest.anchor;
  if (!a || typeof a !== 'object') {
    errors.push(`${label}: missing anchor block`);
    return;
  }
  if (a.domain !== 'k-drama') {
    errors.push(`${label}: anchor.domain must be "k-drama" (got ${JSON.stringify(a.domain)})`);
  }
  for (const f of ['title_ko', 'title_en', 'year', 'network']) {
    if (a[f] === undefined || a[f] === null || String(a[f]).trim() === '') {
      errors.push(`${label}: anchor.${f} is required`);
    }
  }
  if (a.year !== undefined && (typeof a.year !== 'number' || a.year < 1900 || a.year > 2100)) {
    errors.push(`${label}: anchor.year must be an integer 1900–2100 (got ${a.year})`);
  }
}

export function validateSisters(manifest, label, errors) {
  const sisters = manifest.sisters;
  if (!Array.isArray(sisters)) {
    errors.push(`${label}: sisters must be an array`);
    return;
  }
  const seen = new Set();
  for (const s of sisters) {
    if (!s || !s.domain) {
      errors.push(`${label}: sister entry missing domain`);
      continue;
    }
    if (seen.has(s.domain)) {
      errors.push(
        `${label}: duplicate sister domain "${s.domain}" — each of ${SISTER_DOMAINS.join(', ')} must appear exactly once`,
      );
    }
    if (!SISTER_DOMAINS.includes(s.domain)) {
      errors.push(`${label}: sister domain "${s.domain}" is not one of ${SISTER_DOMAINS.join(', ')}`);
    }
    seen.add(s.domain);
  }
  for (const required of SISTER_DOMAINS) {
    if (!seen.has(required)) {
      errors.push(`${label}: missing sister domain "${required}" — manifests must include all 5 sister domains`);
    }
  }
}

export function validateCrossLinks(manifest, label, errors) {
  const sisters = manifest.sisters || [];
  for (const s of sisters) {
    const links = (s && s.cross_links) || [];
    if (!Array.isArray(links)) {
      errors.push(`${label}: cross_links in ${s.domain} must be an array`);
      continue;
    }
    for (const link of links) {
      if (typeof link !== 'string') {
        errors.push(`${label}: cross_link in ${s.domain} must be a string (got ${typeof link})`);
        continue;
      }
      const [domainPart, slugPart] = link.split('/');
      if (!domainPart || !slugPart) {
        errors.push(`${label}: cross_link "${link}" in ${s.domain} is not domain/slug shaped`);
        continue;
      }
      if (!ALL_DOMAINS.has(domainPart)) {
        errors.push(`${label}: cross_link "${link}" in ${s.domain} points to unknown domain "${domainPart}"`);
        continue;
      }
      if (domainPart === 'k-drama' && slugPart !== 'anchor') {
        errors.push(`${label}: cross_link to k-drama must use slug "anchor" (got "${slugPart}")`);
      }
    }
  }
}

export function validateManifest(manifest, label, stem, errors) {
  if (!manifest || typeof manifest !== 'object') {
    errors.push(`${label}: manifest is not a YAML object`);
    return;
  }
  validateHexagonId(manifest, label, stem, errors);
  validateSeasonWindow(manifest, label, errors);
  validateAnchor(manifest, label, errors);
  validateSisters(manifest, label, errors);
  validateCrossLinks(manifest, label, errors);
}

// Mirrors `lib/hexagonArticles.ts#imagesMeetSpec` — but emits per-violation
// error messages instead of a boolean, so PR comments can pinpoint problems.
export function validateImages(images, label, errors) {
  if (!Array.isArray(images) || images.length < 2) {
    errors.push(`${label}: images must be an array with ≥2 entries (1 hero + ≥1 inline)`);
    return;
  }
  const heroes = images.filter((im) => im && im.role === HERO_ROLE);
  const inlines = images.filter((im) => im && INLINE_ROLE_RE.test(String(im.role || '')));
  if (heroes.length !== 1) {
    errors.push(`${label}: images must contain exactly 1 entry with role="hero" (got ${heroes.length})`);
  }
  if (inlines.length < 1) {
    errors.push(`${label}: images must contain ≥1 entry with role="inline" or "inline_<n>" (got ${inlines.length})`);
  }
  images.forEach((im, idx) => {
    if (!im || typeof im !== 'object') {
      errors.push(`${label}: images[${idx}] is not an object`);
      return;
    }
    if (!IMAGE_SOURCE_WHITELIST.has(im.source)) {
      errors.push(`${label}: images[${idx}].source "${im.source}" is not in whitelist (${[...IMAGE_SOURCE_WHITELIST].join('/')})`);
    }
    if (!VALID_TONES.has(im.seasonal_tone)) {
      errors.push(`${label}: images[${idx}].seasonal_tone "${im.seasonal_tone}" must be one of ${[...VALID_TONES].join('/')}`);
    }
    for (const f of REQUIRED_IMAGE_FIELDS) {
      if (im[f] === undefined || im[f] === null || String(im[f]).trim() === '') {
        errors.push(`${label}: images[${idx}].${f} is required`);
      }
    }
    const altKo = im.alt_text_ko ?? (im.alt_text && im.alt_text.ko);
    const altEn = im.alt_text_en ?? (im.alt_text && im.alt_text.en);
    if (!altKo || !String(altKo).trim()) {
      errors.push(`${label}: images[${idx}].alt_text_ko is required`);
    }
    if (!altEn || !String(altEn).trim()) {
      errors.push(`${label}: images[${idx}].alt_text_en is required`);
    }
  });
}
