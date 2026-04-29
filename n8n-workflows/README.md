# n8n Workflows

KStoryWorld의 카테고리별 콘텐츠 생성 워크플로 모음입니다. 각 JSON은 [n8n.jackyailabs.com](https://n8n.jackyailabs.com)에 import 후 **Activate ON** 상태로 운용됩니다. Webhook 호출은 `board-routine/`의 `*-kickoff.sh` 스크립트가 담당합니다.

## 워크플로 목록

| 카테고리 | 파일 | Webhook path | 인증 |
|----------|------|--------------|------|
| K-Beauty | [`kbeauty-content-generator.json`](./kbeauty-content-generator.json) | `/webhook/kbeauty-content` | `K-Beauty Webhook Header Auth` (`KBEAUTY_WEBHOOK_TOKEN`, 부재 시 `KPOP_WEBHOOK_TOKEN` 폴백) |

> 형제 카테고리(K-Pop/K-Drama/K-Food) 워크플로 JSON은 본 디렉터리에 아직 commit되어 있지 않습니다. Phase B 통합 머지에서 함께 추적합니다 ([JAC-1764](https://paperclip.ing/JAC/issues/JAC-1764) 코멘트 참조).

## K-Beauty 워크플로 노드 구성 (6 nodes)

1. **Webhook** — Header Auth(`X-Webhook-Token`)로 `/webhook/kbeauty-content` 수신.
2. **Naver Search** — `https://openapi.naver.com/v1/search/blog.json`에서 K-뷰티 트렌드/제품 결과 20건.
3. **Filter & Select Topic** — 의료 단정/리콜/발암 키워드 차단 → 선두 1건 선택. 모두 차단되면 `fallback:true`.
4. **Claude Draft K-Beauty Post** — `claude-sonnet-4-6`. 시스템 프롬프트는 '에디터 큐레이션' 톤 + 의료/효능 단정 금지.
5. **Format & Self-Check** — ko/en HTML 렌더 + 12-check 게이트:
   - ko/en title·slug, 7개 섹션(`intro`·`trend_snapshot`·`how_to_use`·`cultural_context`·`editor_picks`·`closing`·`source`), 길이(ko ≥600자 / en ≥200단어), no-ai-copy 정규식, 의료 단정 가드, 효능 단정 가드, `meta name="category" content="k-beauty"` 검증.
6. **Return** — JSON 응답.

## 게이트

- **12-check** — Format 노드 내부 (`passed === total`).
- **no-ai-copy** — 루트 `npm run check:no-ai-copy` 정규식과 동일 패턴(`AI(-| )(generated|curated|powered)|AI가 정리|자동 생성 콘텐츠|Generated:`).
- **의료 단정 가드** — `발암|의료사고|치료해 드립니다|완치|부작용 없음`.
- **효능 단정 가드** — `에 좋다|를 낫게 해|을 없애준다`.

## Dry-run 샘플

`_dryrun-samples/`에 카테고리×날짜×슬러그 조합으로 회전 저장합니다.

| 파일 | 결과 |
|------|------|
| [`kbeauty-2026-04-28-glass-skin-routine.json`](./_dryrun-samples/kbeauty-2026-04-28-glass-skin-routine.json) | 12/12 pass · ko 812자 · en 433단어 · ai_copy_hit=null · blocked_keyword_hit=null |

## Import 절차 (board action)

1. n8n UI → Import → 본 디렉터리의 JSON 업로드.
2. 자격 증명 매핑:
   - `Naver Open API` (K-Pop·K-Drama 워크플로와 공유).
   - `K-Beauty Webhook Header Auth` (신규 — 토큰을 `KBEAUTY_WEBHOOK_TOKEN`으로 export, 부재 시 `KPOP_WEBHOOK_TOKEN`).
3. workflow Activate ON.
4. Paperclip routine `K-Beauty Daily Content` 등록 — cron `0 4 * * *` Asia/Seoul, body=`bash _default/board-routine/kbeauty-kickoff.sh "$PAPERCLIP_TASK_ID"`.

자세한 routing/검수는 [JAC-1750](https://paperclip.ing/JAC/issues/JAC-1750)·[JAC-1764](https://paperclip.ing/JAC/issues/JAC-1764) 참조.
