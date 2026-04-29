#!/usr/bin/env bash
set -euo pipefail

ALLOW_DIRTY=0
for arg in "$@"; do
  case "$arg" in
    --allow-dirty) ALLOW_DIRTY=1 ;;
    *)
      echo "Usage: $0 [--allow-dirty]" >&2
      exit 2
      ;;
  esac
done

PASS=0
FAIL=0

ok() { echo "OK   $1"; PASS=$((PASS+1)); }
ng() { echo "FAIL $1"; FAIL=$((FAIL+1)); }

must() {
  local label="$1"
  shift
  if "$@"; then ok "$label"; else ng "$label"; fi
}

check_clean_tree() {
  if [[ "$ALLOW_DIRTY" == "1" ]]; then
    return 0
  fi
  [[ -z "$(git status --porcelain)" ]]
}

show_outgoing() {
  git fetch origin
  echo "--- origin/main..HEAD ---"
  git log --oneline origin/main..HEAD || true
  echo "-------------------------"
}

must_file() { [[ -f "$1" ]]; }

check_category_routes() {
  local categories=(k-pop k-drama k-food k-beauty k-literature k-travel)
  local c
  for c in "${categories[@]}"; do
    [[ -f "out/${c}/index.html" ]] || return 1
  done
}

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "FAIL git repository not found" >&2
  exit 1
fi

must "git status clean (or --allow-dirty)" check_clean_tree
must "git fetch origin + git log origin/main..HEAD" show_outgoing
must "npm ci" npm ci
must "npm run build" npm run build
must "out/index.html exists" must_file out/index.html
must "out/sitemap.xml exists" must_file out/sitemap.xml
must "out/feed.xml exists" must_file out/feed.xml
must "out/robots.txt exists" must_file out/robots.txt
must "out/ads.txt exists" must_file out/ads.txt
must "category routes (6) exist" check_category_routes
must "npm run check:no-ai-copy" npm run check:no-ai-copy

echo "SUMMARY pre-deploy-check: pass=$PASS fail=$FAIL"
[[ "$FAIL" -eq 0 ]]
