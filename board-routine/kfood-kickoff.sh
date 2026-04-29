#!/usr/bin/env bash
# board-routine/kfood-kickoff.sh
#
# Daily K-Food content kickoff for KStoryWorld. Mirrors the kbeauty-kickoff
# contract and is intended to be invoked by the Paperclip routine with
# `bash _default/board-routine/kfood-kickoff.sh "$PAPERCLIP_TASK_ID"`.
#
# Responsibilities:
#   1. Pick the day's K-Food keyword from the rotating pool.
#   2. Call the kfood-content-generator n8n webhook (or skip in dry-run mode).
#   3. Persist the dry-run sample artifact under
#      n8n-workflows/_dryrun-samples/ for offline inspection.
#
# Exit codes:
#   0  success (network or dry-run)
#   1  webhook call failed
#   2  self-check did not reach 12/12

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib.sh
source "$SCRIPT_DIR/lib.sh"

TASK_ID="${1:-${PAPERCLIP_TASK_ID:-manual}}"
DATE="$(br_today_seoul)"
KEYWORD="$(br_pick_kfood_keyword)"
SLUG="$(printf '%s' "$KEYWORD" | tr ' ' '-' | tr '[:upper:]' '[:lower:]')"

PAYLOAD=$(cat <<JSON
{
  "task_id": "$TASK_ID",
  "category": "k-food",
  "keyword": "$KEYWORD",
  "tone": "에디터 큐레이션",
  "language_pair": ["ko", "en"],
  "sections": ["intro","what_it_is","cultural_context","how_to_enjoy","closing","source"],
  "guards": ["12-check", "no-ai-copy", "food-safety-negative-exclusion"]
}
JSON
)

echo "[kfood-kickoff] task=$TASK_ID date=$DATE keyword=$KEYWORD"

RESPONSE_FILE="$(br_dryrun_path "kfood" "$DATE" "$SLUG")"
mkdir -p "$(dirname "$RESPONSE_FILE")"

if ! RESPONSE=$(n8n_call_kfood "$PAYLOAD"); then
  echo "[kfood-kickoff] webhook call failed" >&2
  exit 1
fi

printf '%s\n' "$RESPONSE" > "$RESPONSE_FILE"
echo "[kfood-kickoff] saved dry-run artifact: $RESPONSE_FILE"

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
        print(f'[kfood-kickoff] self-check {passed}/{total} pass')
        sys.exit(0)
    print(f'[kfood-kickoff] self-check {passed}/{total} FAIL', file=sys.stderr)
    sys.exit(2)
passed = candidate.get('passed') if isinstance(candidate, dict) else None
total = candidate.get('total') if isinstance(candidate, dict) else None
if passed is None or total is None:
    sys.exit(0)
if passed == total:
    print(f'[kfood-kickoff] self-check {passed}/{total} pass')
    sys.exit(0)
print(f'[kfood-kickoff] self-check {passed}/{total} FAIL', file=sys.stderr)
sys.exit(2)
PY
  then
    exit 2
  fi
fi
