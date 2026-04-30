# Hexagon Webhook Input Contract (JAC-1893 / JAC-1895 / JAC-1896)

When a hexagon-mode kickoff calls a content-generator workflow (`/webhook/generate-{kdrama,kfood,kpop,kbeauty,ktravel,kliterature}-content`), the body MUST include the fields below in addition to the existing `keyword/category/tone/...` shape. When `hexagon_id` is absent the workflow is in legacy single-article mode and self-checks #14·#15·#15a are skipped.

| Field | Required | Type | Description |
|---|---|---|---|
| `hexagon_id` | hexagon mode | string slug | Matches `content/hexagons/<slug>.yaml` |
| `anchor_drama` | hexagon mode | string | Anchor drama title (KR or EN). Used for #14 fallback match. |
| `anchor_url_ko` | hexagon mode | path | KR anchor article URL (`/content/dramas/<slug>-ko.html`) — primary #14 target. |
| `anchor_url_en` | hexagon mode | path | EN anchor article URL. |
| `anchor_seed` | hexagon sister | object | `{ person, year, platform, key_motif }`. Anchor's K-Drama workflow extracts and forwards. |
| `publish_month` | hexagon mode | `YYYY-MM` | Used for `expected_seasonal_tone` resolution: 04-06 spring · 07-09 summer · 10-12 fall · 01-03 winter. |
| `manifest_hero_seasonal_tone` | optional | enum `spring\|summer\|fall\|winter` | Pre-declared off-tone hero from the hexagon manifest (`anchor.hero_image.seasonal_tone` for k-drama, `sisters[*].hero_image.seasonal_tone` for sisters). Required for the #15a fidelity exception when the hero scene is intentionally off-quarter (e.g. winter snow scene published during a spring quarter). |
| `cross_links` | optional | string[] | Sister cross-link slugs. |
| `telegram_bot_token` | optional | string | When supplied with `telegram_chat_id`, the Hexagon Self-Checks node fires a best-effort QC alert message on failure. |
| `telegram_chat_id` | optional | string | Auditor chat (group or DM) for QC alerts. |

## Example body — sister (k-food)

```json
{
  "keyword": "치맥 한강 별에서 온 그대",
  "category": "k-food",
  "tone": "editorial",
  "language_pair": ["ko","en"],
  "hexagon_id": "my-love-from-the-star",
  "anchor_drama": "별에서 온 그대",
  "anchor_url_ko": "/content/dramas/my-love-from-the-star-ko.html",
  "anchor_url_en": "/content/dramas/my-love-from-the-star-en.html",
  "anchor_seed": { "person": "천송이", "year": 2013, "platform": "SBS", "key_motif": "첫눈 치맥" },
  "publish_month": "2026-04",
  "manifest_hero_seasonal_tone": "spring",
  "cross_links": ["k-travel/petite-france-namsan-tower"],
  "telegram_bot_token": "...",
  "telegram_chat_id": "..."
}
```

## Claude draft output contract (extension)

The `Fetch Source + Claude Draft` node already emits `parsed.{ko,en,tags}`. For hexagon mode it MUST additionally emit `parsed.images` with the array shape below; the Claude prompt is responsible for enforcing it (separate ticket — image curation prompt change is out of scope here).

```jsonc
"images": [
  {
    "role": "hero",
    "source": "unsplash",                 // unsplash | pexels | pixabay | wikimedia | cc0 | cc-by
    "asset_id": "photo-XXXXXXXXX",
    "asset_url": "https://...",
    "license": "unsplash-license",        // source-specific slug
    "credit": "Photo by [Name] on Unsplash",
    "seasonal_tone": "winter",            // spring | summer | fall | winter
    "alt_text_ko": "...",
    "alt_text_en": "..."
  },
  { "role": "inline_1", "source": "pexels", "...": "..." }
]
```

## Self-checks performed when `hexagon_id` is set

### `14_anchor_backlink_present` (JAC-1895)
At least one of `anchor_url_ko`, `anchor_url_en`, the slug stem of either, or `anchor_drama` appears in the article body / meta-description / tags.

### `15_images_present_with_license` (JAC-1896 §B)
1. `images.length >= 2` (1 hero + ≥1 inline).
2. Exactly **1** image with `role === "hero"`.
3. **≥1** image with `role` matching `^inline(_\d+)?$`.
4. Every image's `source` is in the whitelist (`unsplash | pexels | pixabay | wikimedia | cc0 | cc-by`).
5. Every image has all 5 fields non-empty: `source`, `asset_id`, `license`, `credit`, `seasonal_tone`.
6. Every image has `alt_text_ko` and `alt_text_en` non-empty.

### `15a_seasonal_tone_quarter_policy` (JAC-1896 §C)
- `expected_tone` derived from `publish_month` quarter.
- **Pass A**: `hero.seasonal_tone === expected_tone`.
- **Pass B (fidelity exception)**: `hero.seasonal_tone !== expected_tone` AND `manifest_hero_seasonal_tone !== expected_tone` (manifest pre-declares an off-tone hero) AND ≥1 inline image has `seasonal_tone === expected_tone` (so the article still grounds the reader in the publish quarter).
- Otherwise fail.

If `publish_month` is absent (legacy callers), the policy is treated as not-applicable and passes silently.

## Auditor (QC) alert (JAC-1896 §D)

When any of the hexagon checks fail (`qc_alert: true`) AND the webhook body supplied `telegram_bot_token` + `telegram_chat_id`, the node fires a best-effort `sendMessage` against `https://api.telegram.org/bot<TOKEN>/sendMessage`. Telegram errors are caught and surfaced as `qc_alert_dispatched_error` in the response, never block the workflow.

The message includes: `hexagon_id`, `domain`, `anchor_drama`, the failure list, image failure detail, and tone failure detail.

## Behavior summary

- **Non-hexagon body** (`hexagon_id` absent): Hexagon Self-Checks node passes upstream output through unchanged. Existing self-check #1–#13 (or #1–#12 for k-beauty) shape preserved.
- **Hexagon body**: Adds `14_anchor_backlink_present` + `15_images_present_with_license` + `15a_seasonal_tone_quarter_policy` to `self_check`. Recomputes `ok` and `self_check_summary`. On failure sets `qc_alert: true` and (if creds present) dispatches a Telegram alert.

Source of truth for the inserted JS: [`hexagon-self-checks.js`](./hexagon-self-checks.js). Run [`apply-hexagon-self-check-node.py`](./apply-hexagon-self-check-node.py) after editing it to refresh the embedded copy in each workflow JSON.
