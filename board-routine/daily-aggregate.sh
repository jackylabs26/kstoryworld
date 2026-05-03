#!/usr/bin/env bash
# board-routine/daily-aggregate.sh
#
# Daily Publish Aggregate — fired by the Paperclip "Daily Publish Aggregate"
# routine (cron `0 9 * * *` Asia/Seoul). Counts yesterday's KST dry-run
# samples per category and either alerts on a 0-publish day or summarises
# the counts into the routine's own execution issue.
#
# Pipeline:
#   1. resolve yesterday in KST.
#   2. count `n8n-workflows/_dryrun-samples/{kpop|kdrama|kfood|kbeauty}-YYYY-MM-DD-*.json`.
#   3. if total == 0 → PATCH ALERT_ISSUE_ID (default JAC-1737) to priority=critical
#      and POST a comment naming the affected date.
#      else        → POST a counts summary comment on the current task.
#   4. PATCH the current task to status=done with a short summary.
#
# Inputs:
#   $1 / PAPERCLIP_TASK_ID — the routine's own issue identifier (UUID or JAC-…).
#   ALERT_ISSUE_ID         — override the 0-publish alert target (default JAC-1737).
#   DAILY_AGGREGATE_DRYRUN=1 — print intended HTTP calls, don't touch the API.
#   DAILY_AGGREGATE_DATE   — override "yesterday" (YYYY-MM-DD, KST). Default = today_KST - 1 day.
#
# Exit codes:
#   0  success or dry-run
#   1  Paperclip API call failed
#   2  required env missing in non-dryrun mode

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
# shellcheck source=lib.sh
source "$SCRIPT_DIR/lib.sh"

TASK_ID="${1:-${PAPERCLIP_TASK_ID:-}}"
ALERT_ISSUE_ID="${ALERT_ISSUE_ID:-JAC-1737}"
DRYRUN="${DAILY_AGGREGATE_DRYRUN:-0}"

if [[ -n "${DAILY_AGGREGATE_DATE:-}" ]]; then
  TARGET_DATE="$DAILY_AGGREGATE_DATE"
else
  TARGET_DATE="$(TZ=Asia/Seoul date -v-1d +%Y-%m-%d 2>/dev/null \
                 || TZ=Asia/Seoul date -d 'yesterday' +%Y-%m-%d)"
fi

SAMPLES_DIR="$REPO_ROOT/n8n-workflows/_dryrun-samples"

count_category() {
  local category="$1"
  local n=0
  if [[ -d "$SAMPLES_DIR" ]]; then
    shopt -s nullglob
    local files=( "$SAMPLES_DIR/${category}-${TARGET_DATE}-"*.json )
    n=${#files[@]}
    shopt -u nullglob
  fi
  printf '%s' "$n"
}

KPOP_COUNT="$(count_category kpop)"
KDRAMA_COUNT="$(count_category kdrama)"
KFOOD_COUNT="$(count_category kfood)"
KBEAUTY_COUNT="$(count_category kbeauty)"
TOTAL=$(( KPOP_COUNT + KDRAMA_COUNT + KFOOD_COUNT + KBEAUTY_COUNT ))

echo "[daily-aggregate] date=$TARGET_DATE kpop=$KPOP_COUNT kdrama=$KDRAMA_COUNT kfood=$KFOOD_COUNT kbeauty=$KBEAUTY_COUNT total=$TOTAL"

paperclip_required() {
  if [[ -z "${PAPERCLIP_API_URL:-}" || -z "${PAPERCLIP_API_KEY:-}" ]]; then
    br_load_secrets
  fi
  if [[ -z "${PAPERCLIP_API_URL:-}" || -z "${PAPERCLIP_API_KEY:-}" ]]; then
    echo "[daily-aggregate] PAPERCLIP_API_URL and PAPERCLIP_API_KEY required (or set DAILY_AGGREGATE_DRYRUN=1)" >&2
    exit 2
  fi
}

paperclip_curl() {
  local method="$1" path="$2" payload="$3"
  local hdr=(-H "Authorization: Bearer $PAPERCLIP_API_KEY" -H "Content-Type: application/json")
  if [[ -n "${PAPERCLIP_RUN_ID:-}" ]]; then
    hdr+=(-H "X-Paperclip-Run-Id: $PAPERCLIP_RUN_ID")
  fi
  curl -sS --fail-with-body -X "$method" "${hdr[@]}" --data "$payload" "${PAPERCLIP_API_URL%/}$path"
}

post_comment() {
  local issue="$1" body="$2"
  local payload
  payload="$(python3 -c 'import json,sys; print(json.dumps({"body": sys.argv[1]}, ensure_ascii=False))' "$body")"
  if [[ "$DRYRUN" == "1" ]]; then
    echo "[daily-aggregate] DRYRUN POST /api/issues/$issue/comments"
    printf '%s\n' "$payload"
    return 0
  fi
  paperclip_required
  paperclip_curl POST "/api/issues/$issue/comments" "$payload" >/dev/null
}

patch_issue() {
  local issue="$1" payload="$2"
  if [[ "$DRYRUN" == "1" ]]; then
    echo "[daily-aggregate] DRYRUN PATCH /api/issues/$issue"
    printf '%s\n' "$payload"
    return 0
  fi
  paperclip_required
  paperclip_curl PATCH "/api/issues/$issue" "$payload" >/dev/null
}

build_summary() {
  python3 - "$TARGET_DATE" "$KPOP_COUNT" "$KDRAMA_COUNT" "$KFOOD_COUNT" "$KBEAUTY_COUNT" "$TOTAL" <<'PY'
import sys
date, kpop, kdrama, kfood, kbeauty, total = sys.argv[1:7]
print(
    f"## Daily Publish Aggregate — {date} (KST)\n\n"
    f"- K-Pop: {kpop}\n"
    f"- K-Drama: {kdrama}\n"
    f"- K-Food: {kfood}\n"
    f"- K-Beauty: {kbeauty}\n"
    f"- Total: {total}\n\n"
    f"Source: `n8n-workflows/_dryrun-samples/{{category}}-{date}-*.json`."
)
PY
}

build_alert_body() {
  python3 - "$TARGET_DATE" <<'PY'
import sys
date = sys.argv[1]
print(
    f"## ALERT — Daily Publish Aggregate (0편 / {date} KST)\n\n"
    f"4개 카테고리(kpop/kdrama/kfood/kbeauty) 모두 {date} dry-run 산출물이 없습니다. "
    f"`n8n-workflows/_dryrun-samples/` 확인 후 routine kickoff 실패 원인을 진단해 주세요.\n\n"
    f"- 점검 항목: cron 실행 로그, n8n webhook 응답, board-routine kickoff 스크립트 종료코드.\n"
    f"- 후속: 원인 식별되면 본 알림에 회신하고 priority 원복 가능."
)
PY
}

if [[ -z "$TASK_ID" ]]; then
  echo "[daily-aggregate] PAPERCLIP_TASK_ID (or first arg) is required" >&2
  exit 2
fi

if (( TOTAL == 0 )); then
  ALERT_BODY="$(build_alert_body)"
  echo "[daily-aggregate] 0-publish day → alerting $ALERT_ISSUE_ID"
  ALERT_PATCH="$(python3 -c 'import json; print(json.dumps({"priority":"critical"}))')"
  patch_issue "$ALERT_ISSUE_ID" "$ALERT_PATCH"
  post_comment "$ALERT_ISSUE_ID" "$ALERT_BODY"
  TASK_BODY="$(printf '## Daily Publish Aggregate — %s (KST)\n\n0편 감지. priority=critical 알림을 %s에 게시했습니다.' "$TARGET_DATE" "$ALERT_ISSUE_ID")"
  post_comment "$TASK_ID" "$TASK_BODY"
else
  TASK_BODY="$(build_summary)"
  post_comment "$TASK_ID" "$TASK_BODY"
fi

DONE_PATCH="$(python3 -c 'import json,sys; print(json.dumps({"status":"done","comment":sys.argv[1]}, ensure_ascii=False))' \
  "Daily Publish Aggregate complete — $TARGET_DATE total=$TOTAL (kpop=$KPOP_COUNT kdrama=$KDRAMA_COUNT kfood=$KFOOD_COUNT kbeauty=$KBEAUTY_COUNT)")"
patch_issue "$TASK_ID" "$DONE_PATCH"

echo "[daily-aggregate] done"
