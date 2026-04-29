# board-routine

Paperclip "Daily Content" 루틴이 호출하는 카테고리별 kickoff 스크립트와 공용 라이브러리입니다. 모든 스크립트는 `_default/` 워크스페이스 기준으로 호출됩니다.

## 파일

| 파일 | 역할 |
|------|------|
| [`lib.sh`](./lib.sh) | 키워드 풀(`br_pick_*_keyword`) + n8n webhook 호출 헬퍼(`n8n_call_*`). 모든 kickoff 스크립트가 source. |
| [`kbeauty-kickoff.sh`](./kbeauty-kickoff.sh) | K-Beauty 일일 kickoff. K-Drama/K-Pop kickoff와 동형 (Story 자식 + 발행 게이트 자식 패턴). |
| [`kpop-publish.sh`](./kpop-publish.sh) | Paperclip `draft-content` 문서를 `content/reviews/*.html`로 렌더링하는 repo-side K-Pop publish adapter. 성공 시 대상 prod URL을 publish issue 코멘트에 남깁니다. |
| [`kfood-kickoff.sh`](./kfood-kickoff.sh) | K-Food 일일 kickoff. 에디터 큐레이션 + 12-check/no-ai-copy 가드가 걸린 dry-run 검증 진입점. |

## K-Beauty 키워드 풀 (10)

`br_pick_kbeauty_keyword`는 `date +%j`(연중 일수) 기준 회전 선정합니다.

```
글래스 스킨 루틴 · MLBB 립 컬러 · 쿠션 파운데이션 · 수분 토너 레이어링 · 선스크린 데일리
마스크팩 루틴 · 립 틴트 트렌드 · 클린 뷰티 성분 · 미니멀 스킨케어 · 한방 화장품
```

미백/주름개선 등 의료·효능 단정 인접 키워드는 의도적으로 제외했습니다(JAC-1800 가드).

## 사용 예시

```bash
# 운영(루트에서):
N8N_BASE_URL=https://n8n.jackyailabs.com \
KPOP_WEBHOOK_TOKEN=*** \
bash board-routine/kbeauty-kickoff.sh "$PAPERCLIP_TASK_ID"

# 운영(루트에서, K-Food):
N8N_BASE_URL=https://n8n.jackyailabs.com \
KFOOD_WEBHOOK_TOKEN=*** \
bash board-routine/kfood-kickoff.sh "$PAPERCLIP_TASK_ID"

# 로컬 dry-run (네트워크 X, 스텁 응답을 dry-run 샘플로 저장):
N8N_DRYRUN=1 bash board-routine/kbeauty-kickoff.sh manual-test
N8N_DRYRUN=1 bash board-routine/kfood-kickoff.sh manual-test
```

성공 시 `n8n-workflows/_dryrun-samples/{category}-YYYY-MM-DD-{slug}.json`에 응답이 persist되며, 12/12 self-check pass 여부가 stdout으로 노출됩니다.

## 환경 변수

| 변수 | 필수 | 설명 |
|------|------|------|
| `N8N_BASE_URL` | 운영 시 | n8n 인스턴스 base URL. 예: `https://n8n.jackyailabs.com` |
| `KPOP_WEBHOOK_TOKEN` | 기본 | Phase A 공유 토큰. 카테고리별 토큰이 부재하면 폴백. |
| `KFOOD_WEBHOOK_TOKEN` | 선택 | K-Food 전용 webhook header auth 토큰. |
| `KBEAUTY_WEBHOOK_TOKEN` | 선택 | K-Beauty 전용 webhook header auth 토큰. |
| `N8N_DRYRUN` | 선택 | `1`이면 webhook 호출을 건너뛰고 스텁 응답을 echo. |
| `PAPERCLIP_TASK_ID` | 자동 | Paperclip routine이 주입. 첫 인자로도 전달 가능. |
