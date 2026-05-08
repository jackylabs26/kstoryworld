#!/usr/bin/env bash
set -euo pipefail

TARGET_REF="${1:-HEAD}"
MESSAGE="$(git log -1 --format=%B "$TARGET_REF")"
SUBJECT="$(git log -1 --format=%s "$TARGET_REF")"

if [[ -z "$MESSAGE" ]]; then
  echo "FAIL commit message is empty for $TARGET_REF" >&2
  exit 1
fi

if ! printf '%s' "$MESSAGE" | iconv -f UTF-8 -t UTF-8 >/dev/null 2>&1; then
  echo "FAIL commit message is not valid UTF-8 for $TARGET_REF" >&2
  exit 1
fi

if printf '%s' "$MESSAGE" | LC_ALL=C grep -q '[^[:space:][:print:]]'; then
  echo "FAIL commit message contains non-printable bytes for $TARGET_REF" >&2
  exit 1
fi

if printf '%s' "$MESSAGE" | LC_ALL=C grep -q '[^ -~[:space:]]'; then
  echo "FAIL commit message must be ASCII-only for Cloudflare Pages deploy safety" >&2
  echo "ref: $TARGET_REF" >&2
  echo "subject: $SUBJECT" >&2
  echo "fix: rewrite the commit subject/body with ASCII-only characters before merging to main" >&2
  exit 1
fi

echo "OK   commit message is ASCII-safe for $TARGET_REF"
