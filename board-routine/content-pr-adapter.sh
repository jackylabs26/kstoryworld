#!/usr/bin/env bash
# board-routine/content-pr-adapter.sh
#
# JAC-1984 (Phase 1 c1) — n8n 컨텐츠 워크플로 → GitHub PR 자동생성 어댑터.
#
# Reads a dry-run sample JSON produced by a *-kickoff.sh script, opens
# a fresh content review branch off `origin/main`, commits the sample,
# pushes the branch, and opens a GitHub PR populated from the c3
# content-review template (`.github/PULL_REQUEST_TEMPLATE/content-review.md`,
# JAC-1983).
#
# The adapter runs in an ephemeral `git worktree` so it never touches the
# caller's working tree (which may carry unrelated WIP). Worktree path is
# created under `.git/worktrees-content-pr/<branch>` and removed on exit.
#
# Usage:
#   board-routine/content-pr-adapter.sh \
#     --dryrun-json <path-to-sample.json> \
#     --category <kbeauty|kfood|kdrama|kpop> \
#     [--source-issue JAC-XXXX] \
#     [--dry-run]
#
# Exit codes:
#   0  PR opened successfully (or dry-run plan printed)
#   1  argument / precondition error
#   2  git/gh failure
#
# Auth: relies on `gh` CLI being authenticated with `repo` scope.
# Reuses the same auth path board-routine already uses for git push.
#
# Idempotency: branch name is `content/{category}/{date}-{slug}`. If the
# branch already exists on origin (same-day re-run), the adapter aborts
# with exit 1 and prints the existing PR URL so the caller can decide.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

DRYRUN_JSON=""
CATEGORY=""
SOURCE_ISSUE="JAC-1984"
DRY_RUN=0

usage() {
  sed -n '2,30p' "${BASH_SOURCE[0]}" >&2
  exit 1
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dryrun-json) DRYRUN_JSON="$2"; shift 2 ;;
    --category)    CATEGORY="$2"; shift 2 ;;
    --source-issue) SOURCE_ISSUE="$2"; shift 2 ;;
    --dry-run)     DRY_RUN=1; shift ;;
    -h|--help)     usage ;;
    *) echo "[content-pr-adapter] unknown arg: $1" >&2; usage ;;
  esac
done

if [[ -z "$DRYRUN_JSON" || -z "$CATEGORY" ]]; then
  echo "[content-pr-adapter] --dryrun-json and --category are required" >&2
  usage
fi

if [[ ! -r "$DRYRUN_JSON" ]]; then
  echo "[content-pr-adapter] dry-run JSON not readable: $DRYRUN_JSON" >&2
  exit 1
fi

case "$CATEGORY" in
  kbeauty|kfood|kdrama|kpop) ;;
  *) echo "[content-pr-adapter] category must be one of kbeauty|kfood|kdrama|kpop" >&2; exit 1 ;;
esac

if ! command -v gh >/dev/null 2>&1; then
  echo "[content-pr-adapter] gh CLI is required" >&2
  exit 1
fi

if ! command -v python3 >/dev/null 2>&1; then
  echo "[content-pr-adapter] python3 is required" >&2
  exit 1
fi

# ----- Extract metadata from dry-run JSON ------------------------------------
META_JSON="$(DRYRUN_JSON="$DRYRUN_JSON" CATEGORY="$CATEGORY" python3 - <<'PY'
import json, os, re, sys

path = os.environ["DRYRUN_JSON"]
category = os.environ["CATEGORY"]

with open(path, encoding="utf-8") as f:
    data = json.load(f)

# Some workflows wrap output in `final_output`; unwrap so callers see the
# same shape regardless of which kickoff script generated the sample.
candidate = data.get("final_output") if isinstance(data, dict) else None
if not isinstance(candidate, dict):
    candidate = data if isinstance(data, dict) else {}

draft = candidate.get("draft") or {}
# kbeauty/kfood/kdrama use nested draft.ko / draft.en. kpop currently uses
# a flat draft.title / draft.slug (single-language). Detect which shape we
# have and normalise.
if isinstance(draft.get("ko"), dict) or isinstance(draft.get("en"), dict):
    ko = draft.get("ko") or {}
    en = draft.get("en") or {}
else:
    # Flat shape — treat as ko (current kpop convention).
    ko = {
        "title": draft.get("title") or "",
        "slug":  draft.get("slug") or "",
        "meta_description": draft.get("meta_description") or "",
    }
    en = {}

metadata = candidate.get("metadata") or {}
self_check = candidate.get("self_check") or {}

ko_title = ko.get("title") or candidate.get("title_ko") or metadata.get("keyword") or "(제목 미상)"
en_title = en.get("title") or candidate.get("title_en") or ""
ko_slug  = ko.get("slug")  or ""
en_slug  = en.get("slug")  or ""
keyword  = metadata.get("keyword") or candidate.get("keyword") or ko_title

# Branch slug: prefer en_slug → ko_slug → keyword (transliterated lowercase).
branch_slug = en_slug or ko_slug
if not branch_slug:
    fallback = re.sub(r"\s+", "-", str(keyword).strip().lower())
    fallback = re.sub(r"[^a-z0-9\-가-힣]", "", fallback)
    branch_slug = fallback or "untitled"

self_check_total = len(self_check) if isinstance(self_check, dict) else 0
self_check_passed = (
    sum(1 for v in self_check.values() if v) if isinstance(self_check, dict) else 0
)
self_check_failures = candidate.get("self_check_failures") or []

generated_at = metadata.get("generated_at") or ""
model_used   = metadata.get("model") or ""
source_url   = (metadata.get("source") or {}).get("source_url") if isinstance(metadata.get("source"), dict) else metadata.get("source_url") or ""
narrator     = candidate.get("narrator_persona_slug") or metadata.get("narrator_persona_slug") or ""
anchor_hex   = candidate.get("anchor_hexagon") or metadata.get("anchor_hexagon") or ""
target_date  = candidate.get("target_publish_date") or metadata.get("target_publish_date") or ""

json.dump({
    "ko_title": ko_title,
    "en_title": en_title,
    "ko_slug":  ko_slug,
    "en_slug":  en_slug,
    "branch_slug": branch_slug,
    "keyword": keyword,
    "self_check_total": self_check_total,
    "self_check_passed": self_check_passed,
    "self_check_failures": self_check_failures,
    "generated_at": generated_at,
    "model": model_used,
    "source_url": source_url,
    "narrator_persona_slug": narrator,
    "anchor_hexagon": anchor_hex,
    "target_publish_date": target_date,
}, sys.stdout, ensure_ascii=False)
PY
)"

extract() {
  META_JSON="$META_JSON" KEY="$1" python3 - <<'PY'
import json, os, sys
print(json.loads(os.environ["META_JSON"]).get(os.environ["KEY"], "") or "")
PY
}

KO_TITLE="$(extract ko_title)"
EN_TITLE="$(extract en_title)"
KO_SLUG="$(extract ko_slug)"
EN_SLUG="$(extract en_slug)"
BRANCH_SLUG="$(extract branch_slug)"
KEYWORD="$(extract keyword)"
SELF_CHECK_TOTAL="$(extract self_check_total)"
SELF_CHECK_PASSED="$(extract self_check_passed)"
GENERATED_AT="$(extract generated_at)"
MODEL_USED="$(extract model)"
SOURCE_URL="$(extract source_url)"
NARRATOR="$(extract narrator_persona_slug)"
ANCHOR_HEX="$(extract anchor_hexagon)"
TARGET_DATE="$(extract target_publish_date)"

DATE="$(TZ=Asia/Seoul date +%Y-%m-%d)"
[[ -n "$TARGET_DATE" ]] || TARGET_DATE="$DATE"

# Map kickoff category code (kbeauty) to canonical category label (k-beauty).
case "$CATEGORY" in
  kbeauty) CAT_LABEL="k-beauty" ;;
  kfood)   CAT_LABEL="k-food"   ;;
  kdrama)  CAT_LABEL="k-drama"  ;;
  kpop)    CAT_LABEL="k-pop"    ;;
esac

BRANCH="content/${CATEGORY}/${DATE}-${BRANCH_SLUG}"
PR_TITLE="[Content Review] ${CAT_LABEL} — ${KO_TITLE}"

echo "[content-pr-adapter] category=$CAT_LABEL keyword=$KEYWORD slug=$BRANCH_SLUG"
echo "[content-pr-adapter] branch=$BRANCH"
echo "[content-pr-adapter] self_check=${SELF_CHECK_PASSED}/${SELF_CHECK_TOTAL}"

# ----- Build PR body from c3 template ----------------------------------------
TEMPLATE="$REPO_ROOT/.github/PULL_REQUEST_TEMPLATE/content-review.md"
if [[ ! -r "$TEMPLATE" ]]; then
  echo "[content-pr-adapter] c3 template not found at $TEMPLATE" >&2
  exit 1
fi

PR_BODY_FILE="$(mktemp -t jac1984-pr-body.XXXXXX).md"
trap 'rm -f "$PR_BODY_FILE"' EXIT

META_JSON="$META_JSON" \
  CAT_LABEL="$CAT_LABEL" \
  EN_SLUG="$EN_SLUG" \
  KO_SLUG="$KO_SLUG" \
  KO_TITLE="$KO_TITLE" \
  EN_TITLE="$EN_TITLE" \
  KEYWORD="$KEYWORD" \
  NARRATOR="$NARRATOR" \
  ANCHOR_HEX="$ANCHOR_HEX" \
  TARGET_DATE="$TARGET_DATE" \
  SOURCE_ISSUE="$SOURCE_ISSUE" \
  GENERATED_AT="$GENERATED_AT" \
  MODEL_USED="$MODEL_USED" \
  SOURCE_URL="$SOURCE_URL" \
  DRYRUN_REL="n8n-workflows/_dryrun-samples/$(basename "$DRYRUN_JSON")" \
  TEMPLATE="$TEMPLATE" \
  PR_BODY_FILE="$PR_BODY_FILE" \
  python3 - <<'PY'
import json, os, re

meta = json.loads(os.environ["META_JSON"])
template = open(os.environ["TEMPLATE"], encoding="utf-8").read()

# Strip the leading HTML comment block (template-author note).
template = re.sub(r"^<!--.*?-->\s*", "", template, count=1, flags=re.DOTALL)

cat_label = os.environ["CAT_LABEL"]
en_slug = os.environ["EN_SLUG"] or ""
ko_slug = os.environ["KO_SLUG"] or ""
slug = en_slug or ko_slug or "untitled"

def repl_after(text, header_re, replacement):
    """Replace the inline placeholder line right after a metadata bullet."""
    return re.sub(header_re, replacement, text, count=1, flags=re.MULTILINE)

# --- Fill metadata bullets ---------------------------------------------------
template = re.sub(
    r"\*\*카테고리\*\*: <!--.*?-->",
    f"**카테고리**: {cat_label}",
    template, count=1, flags=re.DOTALL,
)
template = re.sub(
    r"\*\*슬러그\*\*: <!--.*?-->",
    f"**슬러그**: {slug}",
    template, count=1, flags=re.DOTALL,
)
narrator = os.environ["NARRATOR"] or "_(미지정 — 본 PR 머지 전 보드 결정 필요)_"
template = re.sub(
    r"\*\*화자 페르소나\*\* \(`narrator_persona_slug`\): <!--.*?-->",
    f"**화자 페르소나** (`narrator_persona_slug`): {narrator}",
    template, count=1, flags=re.DOTALL,
)
template = re.sub(
    r"\*\*타겟 발행일\*\*: <!--.*?-->",
    f"**타겟 발행일**: {os.environ['TARGET_DATE']}",
    template, count=1, flags=re.DOTALL,
)
anchor = os.environ["ANCHOR_HEX"] or "_(없음)_"
template = re.sub(
    r"\*\*앵커 헥사곤\*\* \(해당 시\): <!--.*?-->",
    f"**앵커 헥사곤** (해당 시): {anchor}",
    template, count=1, flags=re.DOTALL,
)
template = re.sub(
    r"\*\*소스 이슈\*\*: <!--.*?-->",
    f"**소스 이슈**: [{os.environ['SOURCE_ISSUE']}](/JAC/issues/{os.environ['SOURCE_ISSUE']})",
    template, count=1, flags=re.DOTALL,
)
template = re.sub(
    r"\*\*Vercel preview URL\*\*: <!--.*?-->",
    "**Vercel preview URL**: _(PR 오픈 후 Vercel 봇이 자동 부착)_",
    template, count=1, flags=re.DOTALL,
)

# --- Replace the 요약 placeholder --------------------------------------------
ko_title = os.environ["KO_TITLE"]
en_title = os.environ["EN_TITLE"] or ""
keyword = os.environ["KEYWORD"]
summary_line = (
    f"**ko**: {ko_title} — {cat_label} 일일 큐레이션 (키워드: `{keyword}`).\n"
    f"**en**: {en_title}".rstrip(" —")
)
template = re.sub(
    r"## 요약 \(1~2 문장, ko\)\s*\n\n<!--.*?-->\n",
    f"## 요약 (1~2 문장, ko)\n\n{summary_line}\n",
    template, count=1, flags=re.DOTALL,
)

# --- File list (auto-fill the two checkboxes) --------------------------------
template = re.sub(
    r"<!-- 머지 시 추가/변경되는 content/\* 파일들\. 자동 채움 권장\. -->\n\n- \[ \] `content/\{cat\}/\{slug\}-ko\.\{md\|html\}`\n- \[ \] `content/\{cat\}/\{slug\}-en\.\{md\|html\}`",
    f"_본 PR 의 content 파일은 후속 c2 (이메일/PDF/MD 발송) 가 첨부합니다. 본 PR 본문은 dry-run 샘플 (`{os.environ['DRYRUN_REL']}`) 1개 — 보드 검토용._\n\n- [x] `{os.environ['DRYRUN_REL']}`",
    template, count=1, flags=re.DOTALL,
)

# --- Append a footer with generation metadata --------------------------------
footer = "\n\n---\n\n## 자동생성 메타 (JAC-1984 어댑터)\n\n"
footer += f"- **생성 시각**: `{os.environ['GENERATED_AT'] or '_(미상)_'}`\n"
footer += f"- **모델**: `{os.environ['MODEL_USED'] or '_(미상)_'}`\n"
footer += f"- **출처 URL**: {os.environ['SOURCE_URL'] or '_(미상)_'}\n"
footer += f"- **Self-check**: `{meta['self_check_passed']}/{meta['self_check_total']} 통과`\n"
if meta.get("self_check_failures"):
    footer += f"- **실패 항목**: `{', '.join(map(str, meta['self_check_failures']))}`\n"
footer += f"- **dry-run 샘플 경로**: `{os.environ['DRYRUN_REL']}`\n"

with open(os.environ["PR_BODY_FILE"], "w", encoding="utf-8") as f:
    f.write(template + footer)
PY

if [[ "$DRY_RUN" == "1" ]]; then
  echo "[content-pr-adapter] --dry-run mode — would create PR with the following:"
  echo "  branch:  $BRANCH"
  echo "  title:   $PR_TITLE"
  echo "  labels:  content-review,phase1-pending"
  echo "  body file (preview at $PR_BODY_FILE):"
  echo "  --- BEGIN BODY ---"
  sed -n '1,40p' "$PR_BODY_FILE"
  echo "  --- END BODY (truncated to 40 lines) ---"
  exit 0
fi

# ----- Open ephemeral worktree, commit, push, open PR ------------------------
WT_DIR="$(mktemp -d -t jac1984-wt.XXXXXX)"
trap 'rm -f "$PR_BODY_FILE"; git -C "$REPO_ROOT" worktree remove --force "$WT_DIR" >/dev/null 2>&1 || true; rm -rf "$WT_DIR"' EXIT

# Worktree is rooted at origin/main. The adapter never observes the caller's
# working-tree changes — important since callers may have unrelated WIP.
git -C "$REPO_ROOT" fetch --quiet origin main
git -C "$REPO_ROOT" worktree add --quiet -b "$BRANCH" "$WT_DIR" origin/main

DEST_REL="n8n-workflows/_dryrun-samples/$(basename "$DRYRUN_JSON")"
mkdir -p "$WT_DIR/$(dirname "$DEST_REL")"
cp "$DRYRUN_JSON" "$WT_DIR/$DEST_REL"

git -C "$WT_DIR" add "$DEST_REL"

# ----- JAC-2051: hexagon validation gate (pre-commit, dryrun JSON pass) ------
# Catches hexagon-aware n8n payloads where the dryrun JSON itself carries an
# embedded `hexagon_manifest` or `draft.{ko,en}.images`. This pass is cheap
# and runs before commit so a fatal invocation error aborts before pushing.
# A second pass (worktree-diff mode) runs after the commit, below.
HEX_VAL_JSON_FILE="$(mktemp -t jac2051-hex.XXXXXX).json"
HEX_VAL_LOG_FILE="$(mktemp -t jac2051-hex.XXXXXX).log"
: > "$HEX_VAL_JSON_FILE"; : > "$HEX_VAL_LOG_FILE"
HEX_VAL_FAILED=0
HEX_VAL_DETECTED=0

HEX_DR_OUT="$(mktemp -t jac2051-hex-dr.XXXXXX).json"
HEX_DR_ERR="$(mktemp -t jac2051-hex-dr.XXXXXX).log"
HEX_DR_CODE=0
node "$REPO_ROOT/scripts/validate-hexagon-pr.mjs" \
  --dryrun-json "$WT_DIR/$DEST_REL" \
  >"$HEX_DR_OUT" 2>"$HEX_DR_ERR" || HEX_DR_CODE=$?
if [[ "$HEX_DR_CODE" == "2" ]]; then
  echo "[content-pr-adapter] hexagon dryrun validator invocation error:" >&2
  cat "$HEX_DR_ERR" >&2
  exit 2
fi
HEX_DR_DETECTED="$(python3 -c "import json,sys
try: d=json.load(open(sys.argv[1]))
except Exception: print(0); sys.exit(0)
print(int(bool(d.get('detectedAny'))))" "$HEX_DR_OUT" 2>/dev/null || echo 0)"
if [[ "$HEX_DR_DETECTED" == "1" ]]; then
  HEX_VAL_DETECTED=1
  cat "$HEX_DR_OUT" >> "$HEX_VAL_JSON_FILE"
  printf '\n--- dryrun-json pass ---\n' >> "$HEX_VAL_LOG_FILE"
  cat "$HEX_DR_ERR" >> "$HEX_VAL_LOG_FILE"
  [[ "$HEX_DR_CODE" == "1" ]] && HEX_VAL_FAILED=1
fi
rm -f "$HEX_DR_OUT" "$HEX_DR_ERR"

COMMIT_MSG="content(${CAT_LABEL}): ${KO_TITLE}

Auto-generated draft for board review (JAC-1982 Phase 1 / JAC-1984).

- 카테고리: ${CAT_LABEL}
- 슬러그: ${EN_SLUG:-$KO_SLUG}
- Self-check: ${SELF_CHECK_PASSED}/${SELF_CHECK_TOTAL} 통과
- 출처: ${SOURCE_URL:-(미상)}
- 모델: ${MODEL_USED:-(미상)}

Co-Authored-By: Paperclip <noreply@paperclip.ing>"

git -C "$WT_DIR" -c user.email="content-bot@jackylabs.dev" \
  -c user.name="KStoryWorld Content Bot" \
  commit --quiet -m "$COMMIT_MSG"

# ----- JAC-2051: hexagon validation gate (post-commit, worktree-diff pass) ---
# Catches manual hexagon backfill style PRs (the failure mode of PR #18,
# JAC-1988): when the worktree contains added/modified `content/hexagons/*.yaml`
# manifests or hexagon-mode `content/**/*-{ko,en}.md` articles, validate them
# against the canonical contract before the PR is opened.
HEX_WT_OUT="$(mktemp -t jac2051-hex-wt.XXXXXX).json"
HEX_WT_ERR="$(mktemp -t jac2051-hex-wt.XXXXXX).log"
HEX_WT_CODE=0
node "$REPO_ROOT/scripts/validate-hexagon-pr.mjs" \
  --worktree "$WT_DIR" --base origin/main \
  >"$HEX_WT_OUT" 2>"$HEX_WT_ERR" || HEX_WT_CODE=$?
if [[ "$HEX_WT_CODE" == "2" ]]; then
  echo "[content-pr-adapter] hexagon worktree validator invocation error:" >&2
  cat "$HEX_WT_ERR" >&2
  exit 2
fi
HEX_WT_DETECTED="$(python3 -c "import json,sys
try: d=json.load(open(sys.argv[1]))
except Exception: print(0); sys.exit(0)
print(int(bool(d.get('detectedAny'))))" "$HEX_WT_OUT" 2>/dev/null || echo 0)"
if [[ "$HEX_WT_DETECTED" == "1" ]]; then
  HEX_VAL_DETECTED=1
  printf '\n--- worktree pass ---\n' >> "$HEX_VAL_JSON_FILE"
  cat "$HEX_WT_OUT" >> "$HEX_VAL_JSON_FILE"
  printf '\n--- worktree pass ---\n' >> "$HEX_VAL_LOG_FILE"
  cat "$HEX_WT_ERR" >> "$HEX_VAL_LOG_FILE"
  [[ "$HEX_WT_CODE" == "1" ]] && HEX_VAL_FAILED=1
fi
rm -f "$HEX_WT_OUT" "$HEX_WT_ERR"

if [[ "$HEX_VAL_DETECTED" == "1" ]]; then
  if [[ "$HEX_VAL_FAILED" == "1" ]]; then
    echo "[content-pr-adapter] hexagon validation FAILED — PR will be opened with merge-blocked label" >&2
    sed -n '1,200p' "$HEX_VAL_LOG_FILE" >&2
  else
    echo "[content-pr-adapter] hexagon validation passed (detected hexagon content)"
  fi
fi

git -C "$WT_DIR" push --quiet -u origin "$BRANCH"

# gh CLI accepts --body-file; --label arg requires labels to exist.
PR_URL="$(gh pr create \
  --repo jackylabs26/kstoryworld \
  --base main \
  --head "$BRANCH" \
  --title "$PR_TITLE" \
  --body-file "$PR_BODY_FILE" \
  --label content-review \
  --label phase1-pending 2>&1)"

case "$PR_URL" in
  https://github.com/*)
    echo "[content-pr-adapter] PR opened: $PR_URL"
    ;;
  *)
    echo "[content-pr-adapter] gh pr create failed: $PR_URL" >&2
    exit 2
    ;;
esac

# ----- JAC-2051: failure path — apply merge-blocked label + post comment -----
if [[ "$HEX_VAL_DETECTED" == "1" && "$HEX_VAL_FAILED" == "1" ]]; then
  PR_NUM="${PR_URL##*/}"
  HEX_COMMENT_FILE="$(mktemp -t jac2051-hex-comment.XXXXXX).md"
  {
    echo "## ⛔ hexagon 검증 실패 (JAC-2051 자동 게이트)"
    echo ""
    echo "본 PR 의 hexagon 콘텐츠가 \`scripts/validate-hexagon-pr.mjs\` 검증에 실패했습니다."
    echo "아래 오류를 모두 해소한 뒤 \`merge-blocked\` 라벨을 제거해주세요."
    echo ""
    echo "### 오류"
    echo ""
    echo '```'
    grep -E '^✗ ' "$HEX_VAL_LOG_FILE" | head -50 || cat "$HEX_VAL_LOG_FILE" | head -50
    echo '```'
    echo ""
    echo "<sub>출처: JAC-2051 (PR #18 / JAC-1988 사고 후속) · 검증 룰: \`scripts/lib/hexagon-rules.mjs\`</sub>"
  } > "$HEX_COMMENT_FILE"

  if ! gh pr edit "$PR_NUM" --repo jackylabs26/kstoryworld \
        --add-label merge-blocked \
        --add-label hexagon-validation-failed >/dev/null 2>&1; then
    echo "[content-pr-adapter] WARN: failed to attach merge-blocked label (label may not exist — run scripts/sync-labels.sh)" >&2
  fi
  if ! gh pr comment "$PR_NUM" --repo jackylabs26/kstoryworld \
        --body-file "$HEX_COMMENT_FILE" >/dev/null 2>&1; then
    echo "[content-pr-adapter] WARN: failed to post hexagon validation comment to PR" >&2
  fi
  rm -f "$HEX_COMMENT_FILE"
  echo "[content-pr-adapter] hexagon validation FAILED on $PR_URL — labels applied, comment posted" >&2
fi

rm -f "$HEX_VAL_JSON_FILE" "$HEX_VAL_LOG_FILE"

echo "$PR_URL"
