// Hexagon Self-Checks (#14·#15·#15a) — JAC-1893 / JAC-1895 / JAC-1896
//
// This is the canonical JS source embedded into each n8n workflow's
// "Hexagon Self-Checks" Code node (inserted between "Format & Self-Check"
// and "Return Generated Content"). Source of truth lives in this file —
// when changing logic, edit here, then re-run the patcher to update each
// workflow JSON:
//
//     python3 n8n-workflows/_lib/apply-hexagon-self-check-node.py
//
// Behavior:
//   - If `body.hexagon_id` is NOT present on the Webhook Trigger, this
//     node is a pass-through (existing #1..#13 self-check shape preserved).
//   - If `body.hexagon_id` IS present, runs:
//       #14  anchor_backlink_present       (JAC-1895)
//       #15  images_present_with_license   (JAC-1896)
//       #15a seasonal_tone_quarter_policy  (JAC-1896 spec C)
//     merges results into self_check, recomputes ok/failures/summary, and
//     on failure tags `qc_alert: true` + (best-effort) POSTs a Telegram
//     QC alert if `telegram_bot_token` + `telegram_chat_id` were supplied
//     on the webhook body.
//
// Image schema (JAC-1896 §A):
//   draft.images: [{
//     role: "hero" | "inline_1" | "inline_2" | ...,
//     source: "unsplash" | "pexels" | "pixabay" | "wikimedia" | "cc0" | "cc-by",
//     asset_id, asset_url, license, credit, seasonal_tone,
//     alt_text_ko, alt_text_en
//   }, ...]

const IMAGE_SOURCE_WHITELIST = ['unsplash','pexels','pixabay','wikimedia','cc0','cc-by'];
const REQUIRED_IMAGE_FIELDS = ['source','asset_id','license','credit','seasonal_tone'];
const REQUIRED_ALT_FIELDS = ['alt_text_ko','alt_text_en'];
const VALID_TONES = ['spring','summer','fall','winter'];
const HERO_ROLE = 'hero';
const INLINE_ROLE_PATTERN = /^inline(_\d+)?$/;

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

const upstream = $input.first().json;
const trigger = $('Webhook Trigger').first().json.body || {};
const hexagonId = trigger.hexagon_id || null;

// Pass-through: no hexagon mode → unchanged
if (!hexagonId) {
  return [{ json: upstream }];
}

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
const koBody = [koSec.intro, koSec.plot_teaser, koSec.cultural_context, koSec.why_watch, koSec.closing].filter(Boolean).join(' ');
const enBody = [enSec.intro, enSec.plot_teaser, enSec.cultural_context, enSec.why_watch, enSec.closing].filter(Boolean).join(' ');
const allText = [
  ko.meta_description, en.meta_description,
  koBody, enBody,
  (draft.tags || []).join(' '),
].filter(Boolean).join(' ');

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

// ---- 15. images_present_with_license (JAC-1896 spec B) ----
//   1) length >= 2 (1 hero + ≥1 inline)
//   2) exactly 1 role==='hero', ≥1 role matching /^inline(_\d+)?$/
//   3) all sources whitelisted (case-insensitive)
//   4) every image has source/asset_id/license/credit/seasonal_tone non-empty
//   5) every image has alt_text_ko + alt_text_en non-empty
const images = Array.isArray(draft.images) ? draft.images : [];
const imageFailures = [];

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

const imagesOk = imageFailures.length === 0;
checks['15_images_present_with_license'] = imagesOk;

// ---- 15a. seasonal_tone_quarter_policy (JAC-1896 spec C) ----
//   expected_tone = quarter(publish_month)
//   pass if hero.seasonal_tone === expected_tone
//   else fidelity exception:
//     - manifest_hero_seasonal_tone declares an off-tone hero (≠ expected_tone)
//     - AND ≥1 inline image has seasonal_tone === expected_tone
//   else fail
const expectedTone = defaultSeasonalTone(trigger.publish_month);
const manifestHeroTone = String(trigger.manifest_hero_seasonal_tone || '').toLowerCase() || null;
const hero = heroes[0] || null;
const heroTone = hero ? String(hero.seasonal_tone || '').toLowerCase() : null;
const toneFailures = [];

let seasonalToneOk;
if (!expectedTone) {
  // No publish_month supplied → cannot evaluate; treat as not-applicable pass.
  seasonalToneOk = true;
} else if (heroTone === expectedTone) {
  seasonalToneOk = true;
} else if (!hero) {
  seasonalToneOk = false;
  toneFailures.push(`no_hero_to_check_expected=${expectedTone}`);
} else {
  // Fidelity exception: must be declared in manifest AND ≥1 inline matches expected.
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

// ---- recompute ok / failures / summary ----
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
  hexagon: {
    hexagon_id: hexagonId,
    anchor_drama: anchorDrama,
    expected_seasonal_tone: expectedTone,
    manifest_hero_seasonal_tone: manifestHeroTone,
    hero_seasonal_tone: heroTone,
    image_failures: imageFailures,
    tone_failures: toneFailures,
  },
});

// ---- Auditor (QC) Telegram alert (JAC-1896 spec D) ----
// Best-effort: if the webhook body supplied bot credentials, fire a single
// alert message. We swallow errors so the workflow response is never blocked
// by Telegram outages.
const tgToken = trigger.telegram_bot_token || '';
const tgChatId = trigger.telegram_chat_id || '';
if (!pass && tgToken && tgChatId) {
  const lines = [
    `🚨 KStoryWorld QC alert — hexagon self-check failed`,
    `hexagon: ${hexagonId}`,
    `domain: ${trigger.category || 'unknown'} / anchor: ${anchorDrama || 'n/a'}`,
    `failures: ${failures.join(', ') || '(none reported)'}`,
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
