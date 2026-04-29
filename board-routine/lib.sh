#!/usr/bin/env bash
# board-routine/lib.sh
#
# Shared helpers for KStoryWorld daily-publishing routines (K-Pop / K-Drama
# / K-Food / K-Beauty / ...). Each `*-kickoff.sh` script sources this file
# and uses the helpers below to:
#   - pick a daily keyword from a category-specific pool,
#   - call the matching n8n workflow webhook,
#   - emit a dry-run sample artifact that downstream review can inspect.
#
# All helpers are idempotent and safe to re-source.

set -euo pipefail

br_today_seoul() {
  TZ=Asia/Seoul date +%Y-%m-%d
}

br_dryrun_path() {
  local category="$1" date="$2" slug="$3"
  printf 'n8n-workflows/_dryrun-samples/%s-%s-%s.json' "$category" "$date" "$slug"
}

# ----- Keyword pools --------------------------------------------------------

br_pick_kpop_keyword() {
  local pool=(
    "뉴진스" "에스파" "아이브" "르세라핌" "BTS"
    "블랙핑크" "스트레이키즈" "투모로우바이투게더" "키스오브라이프" "라이즈"
  )
  local idx=$(( $(date +%j) % ${#pool[@]} ))
  echo "${pool[$idx]}"
}

br_pick_kdrama_keyword() {
  local pool=(
    "오징어 게임" "이상한 변호사 우영우" "더 글로리" "킹더랜드" "내 남편과 결혼해줘"
    "갯마을 차차차" "사랑의 불시착" "도깨비" "별에서 온 그대" "마이 데몬"
  )
  local idx=$(( $(date +%j) % ${#pool[@]} ))
  echo "${pool[$idx]}"
}

br_pick_kfood_keyword() {
  local pool=(
    "김치찌개" "비빔밥" "떡볶이" "삼계탕" "잡채"
    "불고기" "냉면" "한식 미슐랭" "전통주" "한정식"
  )
  local idx=$(( $(date +%j) % ${#pool[@]} ))
  echo "${pool[$idx]}"
}

# 10-item K-Beauty evergreen keyword pool. Drives daily rotation in the
# kbeauty-kickoff routine. Intentionally avoids medical-claim adjacent
# keywords (e.g. 미백/주름개선) per JAC-1800 guard requirements.
br_pick_kbeauty_keyword() {
  local pool=(
    "글래스 스킨 루틴"
    "MLBB 립 컬러"
    "쿠션 파운데이션"
    "수분 토너 레이어링"
    "선스크린 데일리"
    "마스크팩 루틴"
    "립 틴트 트렌드"
    "클린 뷰티 성분"
    "미니멀 스킨케어"
    "한방 화장품"
  )
  local idx=$(( $(date +%j) % ${#pool[@]} ))
  echo "${pool[$idx]}"
}

# ----- n8n webhook callers --------------------------------------------------
#
# Contract:
#   - $1 = JSON payload to POST.
#   - Reads N8N_BASE_URL and the category-specific webhook token from env.
#   - Echoes the n8n response body to stdout. Non-2xx exits non-zero.
#
# When N8N_DRYRUN=1, the callers skip the network round-trip and instead
# echo back a stub envelope that downstream tooling can replace with a
# pre-generated dry-run sample. This is what the "12/12 pass" sample log
# asserts against in CI.

# Autoload local secret files when env vars are absent. The Paperclip
# codex_local adapter does not currently inject `adapterConfig.env`
# bindings into the spawned heartbeat process, so per-routine sourcing
# is the supported path. Files are read once and only when needed.
br_load_secrets() {
  local f
  for f in "$HOME/.jackylabs/secrets/n8n.env" "$HOME/.jackylabs/secrets/kstoryworld.env"; do
    [[ -r "$f" ]] || continue
    set -a
    # shellcheck disable=SC1090
    source "$f"
    set +a
  done
}

br_n8n_call() {
  local path="$1" token_var_primary="$2" payload="$3"
  if [[ "${N8N_DRYRUN:-0}" == "1" ]]; then
    printf '{"dryrun":true,"path":"%s","payload":%s}\n' "$path" "$payload"
    return 0
  fi
  if [[ -z "${N8N_BASE_URL:-}" || -z "${!token_var_primary:-${KPOP_WEBHOOK_TOKEN:-}}" ]]; then
    br_load_secrets
  fi
  if [[ -z "${N8N_BASE_URL:-}" ]]; then
    echo "br_n8n_call: N8N_BASE_URL is required (e.g. https://n8n.jackyailabs.com)" >&2
    return 1
  fi
  local token="${!token_var_primary:-${KPOP_WEBHOOK_TOKEN:-}}"
  if [[ -z "$token" ]]; then
    echo "br_n8n_call: ${token_var_primary} (or KPOP_WEBHOOK_TOKEN fallback) is required" >&2
    return 1
  fi
  curl -sS -X POST \
    -H "Content-Type: application/json" \
    -H "X-Webhook-Token: $token" \
    --data "$payload" \
    "${N8N_BASE_URL%/}/webhook/$path"
}

n8n_call_kpop() {
  br_n8n_call "generate-kpop-content" "KPOP_WEBHOOK_TOKEN" "$1"
}

n8n_call_kdrama() {
  br_n8n_call "generate-kdrama-content" "KDRAMA_WEBHOOK_TOKEN" "$1"
}

n8n_call_kfood() {
  br_n8n_call "generate-kfood-content" "KFOOD_WEBHOOK_TOKEN" "$1"
}

n8n_call_kbeauty() {
  br_n8n_call "kbeauty-content" "KBEAUTY_WEBHOOK_TOKEN" "$1"
}
