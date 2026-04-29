#!/usr/bin/env bash
set -euo pipefail

SITE_BASE="${SITE_BASE:-https://kstoryworld.com}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
URL_FILE="${URL_FILE:-${SCRIPT_DIR}/post-deploy-urls.txt}"

PASS=0
FAIL=0

ok() { echo "OK   $1"; PASS=$((PASS+1)); }
ng() { echo "FAIL $1"; FAIL=$((FAIL+1)); }

http_code() {
  local url="$1"
  curl -sS --max-time 20 -o /dev/null -w '%{http_code}' "$url" || echo 000
}

check_status_ok() {
  local code="$1"
  [[ "$code" == "200" || "$code" == "301" || "$code" == "308" ]]
}

check_category_routes() {
  local paths=(/k-pop /k-drama /k-food /k-beauty /k-literature /k-travel)
  local p code
  for p in "${paths[@]}"; do
    code=$(http_code "${SITE_BASE}${p}")
    if check_status_ok "$code"; then
      ok "category route ${p} => ${code}"
    else
      ng "category route ${p} => ${code}"
    fi
  done
}

check_required_files() {
  local paths=(/robots.txt /sitemap.xml /feed.xml /ads.txt)
  local p code tmp bytes
  for p in "${paths[@]}"; do
    tmp=$(mktemp)
    code=$(curl -sS --max-time 20 -o "$tmp" -w '%{http_code}' "${SITE_BASE}${p}" || echo 000)
    bytes=$(wc -c < "$tmp" 2>/dev/null || echo 0)
    rm -f "$tmp"
    if [[ "$code" == "200" && "$bytes" -gt 0 ]]; then
      ok "required file ${p} => ${code}, bytes=${bytes}"
    else
      ng "required file ${p} => ${code}, bytes=${bytes}"
    fi
  done
}

check_review_urls() {
  if [[ ! -f "$URL_FILE" ]]; then
    ng "URL file missing: $URL_FILE"
    return
  fi

  local urls=()
  while IFS= read -r line; do
    [[ -z "$line" ]] && continue
    urls+=("$line")
  done < <(rg -v '^\s*(#|$)' "$URL_FILE")

  local total="${#urls[@]}"
  local ko=0
  local en=0
  local u code
  for u in "${urls[@]}"; do
    [[ "$u" =~ -ko$ ]] && ko=$((ko+1))
    [[ "$u" =~ -en$ ]] && en=$((en+1))
  done

  if [[ "$total" -ne 24 || "$ko" -ne 12 || "$en" -ne 12 ]]; then
    ng "URL file needs 24 URLs (ko=12,en=12); got total=${total},ko=${ko},en=${en}"
    return
  fi

  for u in "${urls[@]}"; do
    code=$(http_code "$u")
    if check_status_ok "$code"; then
      ok "sample URL ${u} => ${code}"
    else
      ng "sample URL ${u} => ${code}"
    fi
  done
}

check_category_routes
check_required_files
check_review_urls

echo "SUMMARY post-deploy-validate: pass=$PASS fail=$FAIL"
[[ "$FAIL" -eq 0 ]]
