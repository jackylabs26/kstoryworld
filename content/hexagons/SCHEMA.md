# Hexagon Manifest Schema

Each hexagon is a 6-article cluster centered on one anchor drama (k-drama) plus 5 sister-domain articles (k-food, k-pop, k-beauty, k-travel, k-literature).

A hexagon is described by a single YAML file at `content/hexagons/<hexagon_id>.yaml`. The manifest is the source of truth for the cluster's anchor seed, sister seeds, hero image direction, board review state, and publish policy.

Source plan: [JAC-1836 plan rev3](/JAC/issues/JAC-1836#document-plan) §2, §7, §8, §10.

## File location

```
content/hexagons/<hexagon_id>.yaml
```

`<hexagon_id>` MUST match the manifest's `hexagon_id` field and MUST be a kebab-case ASCII slug (lowercase letters, digits, hyphens). The hexagon_id is the publish-time canonical identifier referenced from sister article frontmatter and from board approval issues.

## Top-level fields

| Field | Required | Type | Notes |
|-------|----------|------|-------|
| `hexagon_id` | yes | string (kebab-case) | Matches filename. Stable across revisions. |
| `season_window` | yes | string (`YYYY-spring\|summer\|fall\|winter`) | Default seasonal tone window. Used by self-check #15. |
| `anchor` | yes | object | The 1 k-drama anchor article. See [Anchor](#anchor). |
| `sisters` | yes | array (length = 5) | Exactly 5 sister-domain seeds. See [Sisters](#sisters). |
| `review` | yes | object | Board review state. See [Review](#review). |
| `publish` | yes | object | Publish policy. See [Publish](#publish). |

## Anchor

| Field | Required | Type | Notes |
|-------|----------|------|-------|
| `domain` | yes | const `k-drama` | Anchor is always a k-drama in the v1 model. |
| `title_ko` | yes | string | Korean title. |
| `title_en` | yes | string | English title. |
| `year` | yes | integer | Original air year. |
| `network` | yes | string | Original broadcaster (e.g. SBS, tvN). |
| `hero_image` | yes | object | See [Hero image](#hero-image). |

## Sisters

`sisters` MUST contain exactly 5 entries, one per sister domain. Each entry:

| Field | Required | Type | Notes |
|-------|----------|------|-------|
| `domain` | yes | enum `k-food` \| `k-pop` \| `k-beauty` \| `k-travel` \| `k-literature` | Each domain MUST appear exactly once across the 5 sisters. |
| `seed` | yes | string (kebab-case) | Stable seed slug for the sister article. |
| `cross_links` | yes | array of strings | Each entry: `<domain>/<seed-or-anchor-key>`. ≥ 1 cross-link required (per plan §2 rule 3). |
| `hero_image` | yes | object | See [Hero image](#hero-image). |

## Hero image

The hero image direction stored in the manifest is the **curation seed**, not the published asset. The published article's frontmatter carries the final asset metadata (5 fields + alt_text per [JAC-1836 plan §7.2](/JAC/issues/JAC-1836#document-plan)). Self-check #15 validates the article-level asset; the manifest only declares the curation direction.

| Field | Required | Type | Notes |
|-------|----------|------|-------|
| `source` | yes | enum `unsplash` \| `pexels` \| `pixabay` \| `wikimedia` \| `cc0` \| `cc-by` | Whitelisted source per plan §7.1. |
| `asset_id` | no | string | Curator-resolved asset id. `TBD` until curation done. |
| `license` | yes | string | Source-specific license slug (e.g. `unsplash-license`, `pexels-license`, `cc-by-4.0`). |
| `credit` | no | string | `Photo by [Name] on [Source]` or `TBD` until curation done. |
| `seasonal_tone` | yes | enum `spring` \| `summer` \| `fall` \| `winter` | Per-image tone. MAY differ from `season_window` for fidelity exceptions (e.g. winter snow scene during a spring window). |

## Review

| Field | Required | Type | Notes |
|-------|----------|------|-------|
| `status` | yes | enum `draft` \| `seeds_approved` \| `ready_for_board` \| `approved` \| `rejected` | Review lifecycle. |
| `policy` | yes | const `bundle` | Gate-2 review policy. v1 only supports bundle (6편 묶음 검토). |
| `board_approval_issue` | no | string \| null | Paperclip issue id of the bundle approval ticket once raised. `null` until raised. |

Lifecycle:

```
draft
  → seeds_approved   (gate 1: board approves seeds + headlines + image direction)
  → ready_for_board  (all 6 articles pass self-check #1..#15)
  → approved         (gate 2: board approves bundled body + final image set)
  → rejected         (gate 2 reject; specific sister(s) re-drafted)
```

`review.policy = bundle` and `publish.policy` are orthogonal: review is always done as a 6-article bundle (gate 2), but post-approval publish cadence is governed by `publish.policy` separately (see below).

## Publish

| Field | Required | Type | Notes |
|-------|----------|------|-------|
| `policy` | yes | enum `drip` \| `bundle-only` | Post-approval publish cadence. `drip` = 1–2 articles/day drained from a queue (rev3 default, AdSense-safe). `bundle-only` = legacy rev2 (all 6 publish together). |
| `daily_cap` | conditional | integer 1..2 | Hard cap on daily publish count. **Required when `policy=drip`**, ignored when `bundle-only`. Per plan §10.1. |
| `schedule_kind` | conditional | const `queue` | Queue scheduling discipline. **Required when `policy=drip`**. v1 only supports FIFO-with-priority. |
| `recommended_order` | conditional | array (length = 6, unique) of domain enum | Publish-order priority within the hexagon. **Required when `policy=drip`**. Anchor (`k-drama`) typically first. |

`drip` cadence rationale (plan §10): KStoryWorld is 1-person-operated and AdSense review treats simultaneous large-batch uploads as content-farm signal. Spreading bundle approval over 1–2 articles/day with a daily cap of 2 keeps a steady cadence trail without flagging the site.

## Schema file

Machine-readable JSON Schema (draft-07): [`content/hexagons/schema.json`](./schema.json).

## Example

See [`content/hexagons/my-love-from-the-star.yaml`](./my-love-from-the-star.yaml) for the first instance (별에서 온 그대 hexagon).
