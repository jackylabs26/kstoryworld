#!/usr/bin/env bash
# board-routine/kpop-kickoff.sh
#
# Daily K-Pop content kickoff for KStoryWorld. Invoked by the Paperclip
# routine "K-Pop Daily Content (4-6 KST Random)" with
# `bash _default/board-routine/kpop-kickoff.sh "$PAPERCLIP_TASK_ID"`.
#
# Routine cron is `0 4 * * *` Asia/Seoul; this script applies a 0..119 minute
# random sleep so the actual fire is uniformly distributed across the
# 04:00..06:00 KST window. Set KPOP_KICKOFF_NO_SLEEP=1 to bypass for
# manual dry-runs.
#
# Responsibilities:
#   1. Sleep 0..119 minutes (skippable).
#   2. Pick the day's K-Pop keyword from the rotating pool.
#   3. Call the kpop-content-generator n8n webhook (or skip in dry-run mode).
#   4. Persist the dry-run sample artifact under
#      n8n-workflows/_dryrun-samples/ for offline inspection.
#
# Exit codes:
#   0  success (network or dry-run)
#   1  webhook call failed
#   2  self-check did not reach 13/13 (incl. JAC-1875 7% source-overlap gate)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib.sh
source "$SCRIPT_DIR/lib.sh"

TASK_ID="${1:-${PAPERCLIP_TASK_ID:-manual}}"

if [[ "${KPOP_KICKOFF_NO_SLEEP:-0}" != "1" && "${N8N_DRYRUN:-0}" != "1" ]]; then
  SLEEP_MIN=$(( RANDOM % 120 ))
  SLEEP_SEC=$(( SLEEP_MIN * 60 ))
  echo "[kpop-kickoff] task=$TASK_ID sleeping ${SLEEP_MIN}m to spread 04:00-06:00 KST window"
  sleep "$SLEEP_SEC"
fi

DATE="$(br_today_seoul)"
KEYWORD="$(br_pick_kpop_keyword)"
SLUG="$(printf '%s' "$KEYWORD" | tr ' ' '-' | tr '[:upper:]' '[:lower:]')"

PAYLOAD=$(cat <<JSON
{
  "task_id": "$TASK_ID",
  "category": "k-pop",
  "keyword": "$KEYWORD",
  "tone": "에디터 큐레이션",
  "language_pair": ["ko", "en"],
  "sections": ["intro","lyrics_quote","cultural_context","learning_points","closing","source"],
  "guards": ["13-check", "no-ai-copy", "lyrics-no-copy", "source-overlap-min-7pct"]
}
JSON
)

echo "[kpop-kickoff] task=$TASK_ID date=$DATE keyword=$KEYWORD"

RESPONSE_FILE="$(br_dryrun_path "kpop" "$DATE" "$SLUG")"
mkdir -p "$(dirname "$RESPONSE_FILE")"

if ! RESPONSE=$(n8n_call_kpop "$PAYLOAD"); then
  echo "[kpop-kickoff] webhook call failed" >&2
  exit 1
fi

printf '%s\n' "$RESPONSE" > "$RESPONSE_FILE"
echo "[kpop-kickoff] saved dry-run artifact: $RESPONSE_FILE"

if command -v python3 >/dev/null 2>&1; then
  if ! python3 - "$RESPONSE_FILE" <<'PY'
import json, sys
p = sys.argv[1]
with open(p) as f:
    data = json.load(f)
if isinstance(data, dict) and data.get('dryrun'):
    sys.exit(0)
candidate = data.get('final_output') if isinstance(data, dict) else None
if not isinstance(candidate, dict):
    candidate = data if isinstance(data, dict) else {}
self_check = candidate.get('self_check') if isinstance(candidate, dict) else None
if isinstance(self_check, dict):
    passed = sum(1 for value in self_check.values() if value)
    total = len(self_check)
    if passed == total:
        print(f'[kpop-kickoff] self-check {passed}/{total} pass')
        sys.exit(0)
    print(f'[kpop-kickoff] self-check {passed}/{total} FAIL', file=sys.stderr)
    sys.exit(2)
passed = candidate.get('passed') if isinstance(candidate, dict) else None
total = candidate.get('total') if isinstance(candidate, dict) else None
if passed is None or total is None:
    sys.exit(0)
if passed == total:
    print(f'[kpop-kickoff] self-check {passed}/{total} pass')
    sys.exit(0)
print(f'[kpop-kickoff] self-check {passed}/{total} FAIL', file=sys.stderr)
sys.exit(2)
PY
  then
    exit 2
  fi
fi
