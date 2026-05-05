#!/usr/bin/env bash
# board-routine/kbeauty-kickoff.sh
#
# Daily K-Beauty content kickoff for KStoryWorld. Mirrors the kdrama-kickoff
# pattern (JAC-1750) and is invoked by the Paperclip "K-Beauty Daily Content"
# routine with `bash _default/board-routine/kbeauty-kickoff.sh "$PAPERCLIP_TASK_ID"`.
#
# Responsibilities:
#   1. Pick the day's K-Beauty keyword from the rotating pool.
#   2. Call the kbeauty-content-generator n8n webhook (or skip in dry-run mode).
#   3. Persist the dry-run sample artifact under
#      n8n-workflows/_dryrun-samples/ so the 12-check + no-ai-copy gates can
#      run offline against the latest payload.
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
KEYWORD="$(br_pick_kbeauty_keyword)"
SLUG="$(printf '%s' "$KEYWORD" | tr ' ' '-' | tr '[:upper:]' '[:lower:]')"

PAYLOAD=$(cat <<JSON
{
  "task_id": "$TASK_ID",
  "category": "k-beauty",
  "keyword": "$KEYWORD",
  "tone": "에디터 큐레이션",
  "language_pair": ["ko", "en"],
  "sections": ["intro","trend_snapshot","how_to_use","cultural_context","editor_picks","closing","source"],
  "guards": ["12-check", "no-ai-copy", "medical-assertion"]
}
JSON
)

echo "[kbeauty-kickoff] task=$TASK_ID date=$DATE keyword=$KEYWORD"
if [[ -n "${HEXAGON_ID:-}" ]]; then
  echo "[kbeauty-kickoff] hexagon mode: hexagon_id=$HEXAGON_ID anchor_drama=${ANCHOR_DRAMA_JSON:+set}"
fi

RESPONSE_FILE="$(br_dryrun_path "kbeauty" "$DATE" "$SLUG")"
mkdir -p "$(dirname "$RESPONSE_FILE")"

if ! RESPONSE=$(n8n_call_kbeauty "$PAYLOAD"); then
  echo "[kbeauty-kickoff] webhook call failed" >&2
  exit 1
fi

printf '%s\n' "$RESPONSE" > "$RESPONSE_FILE"
echo "[kbeauty-kickoff] saved dry-run artifact: $RESPONSE_FILE"

# Best-effort 12-check assertion — only when the response carries a parsed
# `passed`/`total` envelope (full pipeline run). Dry-run stubs are tolerated.
if command -v python3 >/dev/null 2>&1; then
  if ! python3 - "$RESPONSE_FILE" <<'PY'
import json, sys
p = sys.argv[1]
with open(p) as f:
    data = json.load(f)
if isinstance(data, dict) and data.get('dryrun'):
    sys.exit(0)
passed = data.get('passed')
total = data.get('total')
if passed is None or total is None:
    sys.exit(0)
if passed == total:
    print(f'[kbeauty-kickoff] self-check {passed}/{total} pass')
    sys.exit(0)
print(f'[kbeauty-kickoff] self-check {passed}/{total} FAIL', file=sys.stderr)
sys.exit(2)
PY
  then
    exit 2
  fi
fi

# JAC-1984: optionally open a board-review PR with the dry-run sample.
# Gated by BOARD_AUTO_PR so daily routines don't auto-fire until the board
# opts in. Skips when the response is an N8N_DRYRUN=1 stub (no real draft).
if [[ "${BOARD_AUTO_PR:-0}" == "1" ]]; then
  if command -v python3 >/dev/null 2>&1 && \
     python3 -c 'import json,sys; d=json.load(open(sys.argv[1])); sys.exit(0 if isinstance(d,dict) and d.get("dryrun") else 1)' "$RESPONSE_FILE"; then
    echo "[kbeauty-kickoff] dryrun stub — skipping content-pr-adapter"
  else
    echo "[kbeauty-kickoff] BOARD_AUTO_PR=1 — handing off to content-pr-adapter"
    "$SCRIPT_DIR/content-pr-adapter.sh" \
      --dryrun-json "$RESPONSE_FILE" \
      --category kbeauty \
      --source-issue "${PAPERCLIP_TASK_ID:-JAC-1984}" \
      || echo "[kbeauty-kickoff] content-pr-adapter failed (non-fatal)" >&2
  fi
fi
