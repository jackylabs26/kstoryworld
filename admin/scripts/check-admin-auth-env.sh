#!/usr/bin/env bash
set -euo pipefail

required=(
  NEXT_PUBLIC_SUPABASE_URL
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
)

optional=(
  NEXT_PUBLIC_ADMIN_SITE_URL
  ADMIN_ALLOWED_EMAILS
)

missing=0
for key in "${required[@]}"; do
  if [[ -z "${!key:-}" ]]; then
    echo "[missing] $key"
    missing=1
  else
    echo "[ok] $key"
  fi
done

for key in "${optional[@]}"; do
  if [[ -z "${!key:-}" ]]; then
    if [[ "$key" == "ADMIN_ALLOWED_EMAILS" ]]; then
      echo "[warn] $key is empty (default allowlist: jackylabs26@gmail.com)"
    else
      echo "[warn] $key is empty"
    fi
  else
    echo "[ok] $key"
  fi
done

if [[ $missing -eq 1 ]]; then
  echo "Required env is missing"
  exit 1
fi

echo "Admin auth env check passed"
