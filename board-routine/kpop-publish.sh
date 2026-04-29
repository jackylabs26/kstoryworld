#!/usr/bin/env bash
# board-routine/kpop-publish.sh
#
# Repo-side K-Pop publish adapter. Reads the approved Story issue's
# `draft-content` document from Paperclip, renders a static review HTML file
# under content/reviews/, and reports the target prod URL back to the publish
# issue thread.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

PUBLISH_ISSUE_ID="${1:-${PAPERCLIP_TASK_ID:-}}"
SOURCE_ISSUE_ID="${2:-}"

if [[ -z "$PUBLISH_ISSUE_ID" || -z "$SOURCE_ISSUE_ID" ]]; then
  echo "Usage: $0 <publish-issue-id> <source-issue-id>" >&2
  exit 2
fi

cd "$ROOT_DIR"
npx tsx scripts/publish-kpop-from-paperclip.ts "$PUBLISH_ISSUE_ID" "$SOURCE_ISSUE_ID"
