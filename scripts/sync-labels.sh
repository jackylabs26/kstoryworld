#!/usr/bin/env bash
# JAC-1982 Phase 1 / JAC-1983 — GitHub 라벨 동기화 스크립트.
# 단일 SoT: 라벨 정의가 본 스크립트 내부 LABELS heredoc 에 있음.
# 의존: gh CLI 인증된 상태. PyYAML/yq 등 외부 의존 없음 (호환성 우선).
# 멱등: 존재하는 라벨은 update, 없는 라벨은 create.
# 실행: bash scripts/sync-labels.sh

set -euo pipefail

if ! command -v gh >/dev/null 2>&1; then
  echo "gh CLI not installed" >&2
  exit 1
fi

# 라벨 정의 — TSV: name<TAB>color<TAB>description
# 변경 시 .github/PULL_REQUEST_TEMPLATE/content-review.md 거절 사유 섹션과 동기화.
LABELS=$(cat <<'TSV'
content-review	0E8A16	보드 검토 대기 중인 컨텐츠 PR (Phase 1, JAC-1982)
phase1-pending	FBCA04	Phase 1 보드 첫 검토 대기 (JAC-1985 hook 발화 대상)
backfill	BFD4F2	기존 워킹트리에서 끌어올린 backfill PR (JAC-1986)
approved	1A7F37	보드 승인 — 머지 가능 (JAC-1985 머지 hook 발화)
approved-after-edit	1D76DB	보드 편집 후 승인 — PR 코멘트의 편집 사항 반영 후 머지
rejected	B60205	보드 거절 — close (반드시 reject-* 사유 라벨 1개 이상 동반)
reject-fact	D93F0B	사실관계 오류 (출처와 본문 불일치, 잘못된 정보 등)
reject-style	D93F0B	톤/문체 부적합 (KStoryWorld 브랜드 보이스 미스매치)
reject-source	D93F0B	출처/이미지 라이선스 문제 (화이트리스트 외, 크레딧 누락 등)
reject-tone	D93F0B	페르소나/카테고리 톤 미스매치 (narrator_persona_slug 부적합)
reject-other	D93F0B	기타 거절 사유 — PR 본문 코멘트에 사유 명시 필수
TSV
)

EXISTING=$(gh label list --limit 200 --json name --jq '.[].name' || true)

CREATED=0
UPDATED=0
while IFS=$'\t' read -r NAME COLOR DESC; do
  [ -z "${NAME:-}" ] && continue
  if printf '%s\n' "$EXISTING" | grep -Fxq "$NAME"; then
    gh label edit "$NAME" --color "$COLOR" --description "$DESC" >/dev/null
    UPDATED=$((UPDATED + 1))
    echo "updated: $NAME"
  else
    gh label create "$NAME" --color "$COLOR" --description "$DESC" >/dev/null
    CREATED=$((CREATED + 1))
    echo "created: $NAME"
  fi
done <<< "$LABELS"

echo "---"
echo "created: $CREATED, updated: $UPDATED, total: $((CREATED + UPDATED))"
