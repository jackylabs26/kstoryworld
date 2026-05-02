// KStoryWorld Self-Checks — Universal (#12a · #16 · #17 · #18) + Hexagon (#14 · #15 · #15a)
//
// Source of truth: edit here, then re-run the patcher to update each
// workflow JSON:
//
//     python3 n8n-workflows/_lib/apply-hexagon-self-check-node.py
//
// Behavior:
//   1. Universal checks run for EVERY workflow output (hexagon or not):
//        #12a images_present_min_1     (JAC-1952) — at least one image with required meta
//        #16  no_bold_emphasis_pattern (JAC-1952) — no markdown `**bold**` in body
//        #17  youtube_url_present      (JAC-1952) — ≥1 youtube.com / youtu.be URL
//        #18  narrator_persona_resolved (JAC-1952) — narrator_persona_slug non-empty
//   2. If body.hexagon_id IS present, the additional hexagon checks run:
//        #14  anchor_backlink_present       (JAC-1895)
//        #15  images_present_with_license   (JAC-1896)
//        #15a seasonal_tone_quarter_policy  (JAC-1896 spec C)
//   3. Final ok / failures / summary are recomputed from the full check set,
//      and on failure a Telegram QC alert is best-effort dispatched if the
//      webhook body supplied bot credentials.

const IMAGE_SOURCE_WHITELIST = ['unsplash','pexels','pixabay','wikimedia','cc0','cc-by'];
const REQUIRED_IMAGE_FIELDS = ['source','asset_id','license','credit','seasonal_tone'];
const REQUIRED_ALT_FIELDS = ['alt_text_ko','alt_text_en'];
const VALID_TONES = ['spring','summer','fall','winter'];
const HERO_ROLE = 'hero';
const INLINE_ROLE_PATTERN = /^inline(_\d+)?$/;

// Universal patterns (JAC-1952)
const YOUTUBE_URL_RE = /https?:\/\/(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)[\w-]{11}/g;
const BOLD_EMPHASIS_RE = /\*\*[^*\n]+\*\*/g;
const CODE_FENCE_RE = /```[\s\S]*?```/g;
const INLINE_CODE_RE = /`[^`\n]+`/g;

function defaultSeasonalTone(publishMonthStr) {
  const m = parseInt(String(publishMonthStr || '').slice(5, 7), 10);
  if (m >= 4 && m <= 6) return 'spring';
  if (m >= 7 && m <= 9) return 'summer';
  if (m >= 10 && m <= 12) return 'fall';
  if (m >= 1 && m <= 3) return 'winter';
  return null;
}

function nonEmpty(v) {
  return v !== undefined && v !== null && String(v).trim() !== '';
}

function stripCodeRegions(s) {
  return String(s || '')
    .replace(CODE_FENCE_RE, ' ')
    .replace(INLINE_CODE_RE, ' ');
}

const upstream = $input.first().json;
const trigger = $('Webhook Trigger').first().json.body || {};
const hexagonId = trigger.hexagon_id || null;

// Pass-through if upstream already failed for an unrelated reason
if (upstream.ok === false && (upstream.reason || !upstream.self_check)) {
  return [{ json: upstream }];
}

const checks = Object.assign({}, upstream.self_check || {});
const draft = upstream.draft || {};
const ko = draft.ko || {};
const en = draft.en || {};
const koSec = ko.sections || {};
const enSec = en.sections || {};

// Body text aggregation works for both hexagon and non-hexagon section schemas:
//   K-Drama / K-Pop / K-Food: intro · plot_teaser · cultural_context · why_watch · closing
//   K-Beauty: intro · trend_snapshot · how_to_use · cultural_context · editor_picks · closing · source
const SECTION_KEYS = [
  'intro','plot_teaser','cultural_context','why_watch','closing',
  'trend_snapshot','how_to_use','editor_picks','source',
];
function joinSections(sec) {
  return SECTION_KEYS.map((k) => sec[k]).filter(Boolean).join(' ');
}
const koBody = joinSections(koSec);
const enBody = joinSections(enSec);
const allText = [
  ko.meta_description, en.meta_description,
  koBody, enBody,
  (draft.tags || []).join(' '),
].filter(Boolean).join(' ');

// =====================================================================
// UNIVERSAL CHECKS (run for every workflow output, hexagon or not)
// =====================================================================

// ---- 12a. images_present_min_1 (JAC-1952) ----
//   Single-category daily glance must carry at least one image with the
//   five core meta fields populated. Hexagon mode's #15 below is stricter
//   (≥ 2 images, hero+inline, alt_text). Both checks coexist.
const images = Array.isArray(draft.images) ? draft.images : [];
const imageMin1Failures = [];
if (images.length < 1) {
  imageMin1Failures.push(`images_length_below_1_actual=${images.length}`);
} else {
  const im0 = images[0] || {};
  for (const f of REQUIRED_IMAGE_FIELDS) {
    if (!nonEmpty(im0[f])) imageMin1Failures.push(`image_0_missing_${f}`);
  }
  const src0 = String(im0.source || '').toLowerCase();
  if (src0 && !IMAGE_SOURCE_WHITELIST.includes(src0)) {
    imageMin1Failures.push(`image_0_source_not_whitelisted_value=${src0}`);
  }
}
checks['12a_images_present_min_1'] = imageMin1Failures.length === 0;

// ---- 16. no_bold_emphasis_pattern (JAC-1952) ----
//   Markdown `**bold**` is banned in body text and meta descriptions because
//   it reads as AI/template output. Code regions (`` ` `` and ```` ``` ````)
//   are exempt. HTML <strong>...</strong> is allowed.
const boldHits = [];
for (const [label, raw] of [
  ['ko.meta_description', ko.meta_description],
  ['en.meta_description', en.meta_description],
  ['ko.body', koBody],
  ['en.body', enBody],
]) {
  const cleaned = stripCodeRegions(raw);
  const m = cleaned.match(BOLD_EMPHASIS_RE) || [];
  if (m.length) boldHits.push(`${label}=${m.length}`);
}
checks['16_no_bold_emphasis_pattern'] = boldHits.length === 0;

// ---- 17. youtube_url_present (JAC-1952) ----
//   At least one youtube.com/watch · youtu.be · youtube.com/embed · shorts
//   URL must appear in body or meta. Eleven-char video ids are required.
const youtubeHits = (allText.match(YOUTUBE_URL_RE) || []).length;
checks['17_youtube_url_present'] = youtubeHits >= 1;

// ---- 18. narrator_persona_resolved (JAC-1952) ----
//   Workflow output must carry a non-empty narrator_persona_slug so the
//   review board / reader-app can render the byline. Webhook body may have
//   supplied it explicitly (override) or the workflow's prompt-builder may
//   have selected a persona by deterministic rotation.
const narratorPersonaSlug = String(
  draft.narrator_persona_slug ||
  upstream.narrator_persona_slug ||
  trigger.narrator_persona_slug ||
  ''
).trim();
checks['18_narrator_persona_resolved'] = narratorPersonaSlug !== '';

// =====================================================================
// HEXAGON-SPECIFIC CHECKS (only when hexagon_id is supplied)
// =====================================================================

let imageFailures = [];
let toneFailures = [];
let expectedTone = null;
let manifestHeroTone = null;
let heroTone = null;
let hero = null;

if (hexagonId) {
  // ---- 14. anchor_backlink_present ----
  const anchorUrlKo = trigger.anchor_url_ko || '';
  const anchorUrlEn = trigger.anchor_url_en || '';
  const anchorDrama = trigger.anchor_drama || '';
  const anchorSlug = (anchorUrlKo.match(/\/([^/]+)-(?:ko|en)\.(?:html|md)$/) || [])[1] || '';
  const anchorBacklinkPresent = !!(
    (anchorUrlKo && allText.includes(anchorUrlKo)) ||
    (anchorUrlEn && allText.includes(anchorUrlEn)) ||
    (anchorSlug && allText.includes(anchorSlug)) ||
    (anchorDrama && allText.includes(anchorDrama))
  );
  checks['14_anchor_backlink_present'] = anchorBacklinkPresent;

  // ---- 15. images_present_with_license ----
  if (images.length < 2) imageFailures.push(`images_length_below_2_actual=${images.length}`);

  const heroes = images.filter((im) => im && String(im.role || '').toLowerCase() === HERO_ROLE);
  const inlines = images.filter((im) => im && INLINE_ROLE_PATTERN.test(String(im.role || '').toLowerCase()));

  if (heroes.length !== 1) imageFailures.push(`hero_role_count_must_be_1_actual=${heroes.length}`);
  if (inlines.length < 1) imageFailures.push(`inline_role_count_must_be_ge_1_actual=${inlines.length}`);

  for (let idx = 0; idx < images.length; idx++) {
    const im = images[idx] || {};
    for (const f of REQUIRED_IMAGE_FIELDS) {
      if (!nonEmpty(im[f])) imageFailures.push(`image_${idx}_missing_${f}`);
    }
    for (const f of REQUIRED_ALT_FIELDS) {
      if (!nonEmpty(im[f])) imageFailures.push(`image_${idx}_missing_${f}`);
    }
    const src = String(im.source || '').toLowerCase();
    if (src && !IMAGE_SOURCE_WHITELIST.includes(src)) {
      imageFailures.push(`image_${idx}_source_not_whitelisted_value=${src}`);
    }
    const tone = String(im.seasonal_tone || '').toLowerCase();
    if (tone && !VALID_TONES.includes(tone)) {
      imageFailures.push(`image_${idx}_seasonal_tone_invalid_value=${tone}`);
    }
  }

  checks['15_images_present_with_license'] = imageFailures.length === 0;

  // ---- 15a. seasonal_tone_quarter_policy ----
  expectedTone = defaultSeasonalTone(trigger.publish_month);
  manifestHeroTone = String(trigger.manifest_hero_seasonal_tone || '').toLowerCase() || null;
  hero = heroes[0] || null;
  heroTone = hero ? String(hero.seasonal_tone || '').toLowerCase() : null;

  let seasonalToneOk;
  if (!expectedTone) {
    seasonalToneOk = true;
  } else if (heroTone === expectedTone) {
    seasonalToneOk = true;
  } else if (!hero) {
    seasonalToneOk = false;
    toneFailures.push(`no_hero_to_check_expected=${expectedTone}`);
  } else {
    const manifestDeclaresException = manifestHeroTone && manifestHeroTone !== expectedTone;
    const inlineCoversExpected = inlines.some((im) => String(im.seasonal_tone || '').toLowerCase() === expectedTone);
    if (manifestDeclaresException && inlineCoversExpected) {
      seasonalToneOk = true;
    } else {
      seasonalToneOk = false;
      if (!manifestDeclaresException) {
        toneFailures.push(
          `fidelity_exception_not_declared_in_manifest_hero=${heroTone || 'null'}_expected=${expectedTone}_manifest=${manifestHeroTone || 'null'}`
        );
      }
      if (!inlineCoversExpected) {
        toneFailures.push(`no_inline_image_with_expected_tone=${expectedTone}`);
      }
    }
  }
  checks['15a_seasonal_tone_quarter_policy'] = seasonalToneOk;
}

// =====================================================================
// Recompute ok / failures / summary
// =====================================================================
const passList = Object.values(checks);
const passCount = passList.filter(Boolean).length;
const totalCount = passList.length;
const pass = passList.every(Boolean);
const failures = Object.entries(checks).filter(([, v]) => !v).map(([k]) => k);

const result = Object.assign({}, upstream, {
  ok: pass,
  self_check: checks,
  self_check_failures: failures,
  self_check_summary: pass
    ? `${totalCount}/${totalCount} 통과`
    : `${passCount}/${totalCount} 통과 — 미통과: ${failures.join(', ')}`,
  qc_alert: !pass,
  narrator_persona_slug: narratorPersonaSlug || null,
  universal_diagnostics: {
    bold_emphasis_hits: boldHits,
    youtube_url_count: youtubeHits,
    image_min1_failures: imageMin1Failures,
  },
});

if (hexagonId) {
  result.hexagon = {
    hexagon_id: hexagonId,
    anchor_drama: trigger.anchor_drama || '',
    expected_seasonal_tone: expectedTone,
    manifest_hero_seasonal_tone: manifestHeroTone,
    hero_seasonal_tone: heroTone,
    image_failures: imageFailures,
    tone_failures: toneFailures,
  };
}

// ---- Auditor (QC) Telegram alert ----
const tgToken = trigger.telegram_bot_token || '';
const tgChatId = trigger.telegram_chat_id || '';
if (!pass && tgToken && tgChatId) {
  const lines = [
    `🚨 KStoryWorld QC alert — self-check failed`,
    hexagonId ? `hexagon: ${hexagonId}` : 'mode: single-category',
    `domain: ${trigger.category || 'unknown'}${trigger.anchor_drama ? ` / anchor: ${trigger.anchor_drama}` : ''}`,
    `failures: ${failures.join(', ') || '(none reported)'}`,
    boldHits.length ? `bold_emphasis: ${boldHits.join('; ')}` : '',
    youtubeHits === 0 ? 'youtube_url: missing' : '',
    !narratorPersonaSlug ? 'narrator_persona: unresolved' : '',
    imageFailures.length ? `images: ${imageFailures.slice(0, 6).join('; ')}` : '',
    toneFailures.length ? `tone: ${toneFailures.join('; ')}` : '',
  ].filter(Boolean);
  try {
    await this.helpers.httpRequest({
      method: 'POST',
      url: `https://api.telegram.org/bot${tgToken}/sendMessage`,
      body: {
        chat_id: tgChatId,
        text: lines.join('\n'),
        disable_web_page_preview: true,
      },
      json: true,
      timeout: 5000,
    });
    result.qc_alert_dispatched = 'telegram';
  } catch (e) {
    result.qc_alert_dispatched_error = (e && e.message) || String(e);
  }
}

return [{ json: result }];
