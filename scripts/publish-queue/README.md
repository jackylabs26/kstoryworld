# Drip Publish Queue (JAC-1899)

Daily 1~2-article publish cadence to keep AdSense review steady. One approved
hexagon (anchor + 5 sister) expands into 6 publish units that drain across
3-6 days at the queue's `daily_cap` (1 or 2 per day).

## Entry points

| Script | Purpose |
|---|---|
| `enqueue.mjs <hexagon-slug>` | Validate `content/hexagons/<slug>.yaml` (must be `review.status=approved` + `publish.policy=drip`) and append 6 publish units to `data/publish-queue.json`. Idempotent. |
| `dispatch.mjs [--apply]` | Daily cron entry. Picks queue head respecting `daily_cap`, writes `artifacts/publish-dispatch/<KST-date>.json` for the GH Actions workflow to consume. `--dry-run` (default) leaves state untouched. |

## State files

| File | Mutated by | Notes |
|---|---|---|
| `data/publish-queue.json` | `enqueue.mjs`, `dispatch.mjs --apply` | FIFO queue with priority tiebreak. Schema in `data/publish-queue.schema.json`. |
| `data/publish-queue.state.json` | `dispatch.mjs --apply`, manual board edits | `paused` flag is the board hold switch. KPI counters live here. |
| `artifacts/publish-dispatch/<date>.json` | `dispatch.mjs` (always) | Read-only audit trail. Each cron firing produces one file regardless of mode. |

## Failure model

- Per-unit `attempts` capped at 3. After the 3rd failed attempt the unit moves to `state=failed` and stops being scheduled.
- Per-day failure: state writes record `last_run_outcome=failed`. The next cron firing retries pending units only.
- Board hold: set `paused: true` + `paused_reason` in `data/publish-queue.state.json` and commit. Dispatch will short-circuit until cleared.

## Locale handling (v1)

Each publish unit covers 1 article across all locales found on disk. The dispatcher
scans `content/<domain-folder>/<slug>-<locale>.{html,md}` for the eight known
locales (`ko`, `en`, `ja`, `zh-Hans`, `zh-Hant`, `es`, `fr`, `vi`) and atomically
deploys whatever exists. Missing locales are recorded in the dispatch artifact but
do not block publish — locale parity is enforced upstream by gate-2 self-checks,
not here.

## Cron

GitHub Actions workflow `.github/workflows/drip-publish.yml` fires `0 0 * * *`
UTC (= 09:00 KST) and invokes `dispatch.mjs --apply`. The workflow consumes the
written artifact and creates a publish PR to main; Cloudflare Pages auto-deploys
on merge via `.github/workflows/deploy.yml`.

## Dry-out / AdSense alerts

`outcome=dry_out` increments `consecutive_dry_outs`. The cron workflow forwards
that signal to the board Story channel so the next hexagon seed cycle starts
before the queue empties. AdSense console alerts → board flips `paused: true`
to halt drip while cadence policy is reviewed.
