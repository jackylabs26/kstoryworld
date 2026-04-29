# n8n Workflows

KStoryWorld의 카테고리별 콘텐츠 생성 워크플로 모음입니다. 각 JSON은 [n8n.jackyailabs.com](https://n8n.jackyailabs.com)에 import 후 **Activate ON** 상태로 운용됩니다. Webhook 호출은 `board-routine/`의 `*-kickoff.sh` 스크립트가 담당합니다.

## 워크플로 목록

| 카테고리 | 파일 | Webhook path | 인증 |
|----------|------|--------------|------|
| K-Beauty | [`kbeauty-content-generator.json`](./kbeauty-content-generator.json) | `/webhook/kbeauty-content` | `K-Beauty Webhook Header Auth` (`KBEAUTY_WEBHOOK_TOKEN`, 부재 시 `KPOP_WEBHOOK_TOKEN` 폴백) |
| K-Drama  | [`kdrama-content-generator.json`](./kdrama-content-generator.json)   | `/webhook/generate-kdrama-content` | `K-Drama Webhook Header Auth` |

> Drive의 JSON이 n8n 인스턴스 적용용 소스 트루스입니다. 본 디렉터리는 git-tracked 사본 + dry-run 산출물 보관용. K-Pop/K-Food 워크플로 JSON은 추후 추가됩니다 ([JAC-1764](https://paperclip.ing/JAC/issues/JAC-1764) 코멘트 참조).

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
| [`JAC-1787-calibration.json`](./_dryrun-samples/JAC-1787-calibration.json) | K-Drama 13번째 self-check (출처 본문 ⊆ 본문) 임계치 0.15 캘리브레이션. 무관 출처(Esquire 패션) 0.061 / 관련 출처(Tudum·squidgame·glory) 0.350~0.550 — 0.15가 명확히 분리. |

## K-Drama 워크플로 — 출처 검증 강화 (B안, JAC-1787)

[JAC-1785](https://paperclip.ing/JAC/issues/JAC-1785) 트렁크 사고(출처 URL이 본문과 무관한 패션 기사를 가리킴)의 근본 차단을 위한 정공법. [JAC-1786](https://paperclip.ing/JAC/issues/JAC-1786) 키워드 풀 정제(A안)와 별개 안전망.

### 노드 구성 (6 nodes)

1. **Webhook Trigger** — Header Auth로 `/webhook/generate-kdrama-content` 수신.
2. **Naver Search News** — `query={{ keyword }} 드라마` (이중 안전망, JAC-1786). 상위 10건.
3. **Filter & Select Topic** — 도메인/키워드 블랙리스트로 후보군 정제 → **상위 5건을 `filtered[]` 배열로 보관** (JAC-1787 신규 — 단일 결과에서 후보 배열로 확장).
4. **Fetch Source + Claude Draft** *(JAC-1787 신규 Code 노드)* — 후보 배열을 순회 (최대 3회):
   - 출처 페이지 fetch (timeout 12초, User-Agent 명시)
   - HTML strip + 본문 5,000자 트림
   - fetch 실패 시 다음 후보로
   - Claude prompt에 `source_body_text` 주입 + 작성 규칙 8 (출처 본문 명시 사실만 인용) · 9 (무관 시 `{ "error": "source_irrelevant" }` 반환)
   - Claude가 `source_irrelevant` 반환 시 다음 후보로 자동 재시도
   - 3회 모두 실패 시 `ok: false, reason: 'all_candidates_failed'` 종료 → daily scheduler가 Telegram failure alert로 보드 통지
5. **Format & Self-Check** — **13항목 검증** (JAC-1787에서 13번째 추가):
   - 1~12 기존: category, ko/en 길이·제목·슬러그·메타·태그, blocked keyword, no-ai-copy
   - 13: **출처 본문 토큰 ⊆ 본문 토큰 비율 ≥ 0.15** (간이 fact-anchor 검증)
6. **Return Generated Content** — JSON 응답 (`source_body_overlap`, `attempts_log` 포함).

### 13번째 self-check — 출처 본문 ⊆ 본문 비율

```js
function extractTokens(text) {
  return Array.from(new Set(
    text.replace(/[^\uAC00-\uD7AFa-zA-Z0-9 ]/g, ' ').split(/\s+/).filter(t => t.length >= 2)
  ));
}
const sourceTokens = extractTokens(sourceBodyText);
const bodyTokens = new Set(extractTokens(koBodyText + ' ' + enBodyText));
const overlap = sourceTokens.filter(t => bodyTokens.has(t));
const overlap_ratio = sourceTokens.length ? overlap.length / sourceTokens.length : 0;
checks['13_source_body_overlap_min_15pct'] = overlap_ratio >= 0.15;
```

**임계치 0.15 근거** ([`JAC-1787-calibration.json`](./_dryrun-samples/JAC-1787-calibration.json)):

| 케이스 | 출처 | overlap_ratio | 결과 |
|--------|------|---------------|------|
| Trunk · Tudum (관련) | netflix.com/tudum | **0.550** | ✅ pass |
| Trunk · Esquire 패션 (무관, JAC-1785 사고 URL) | esquirekorea.co.kr | **0.061** | ❌ 차단 |
| 오징어 게임 (관련, synthetic) | — | 0.350 | ✅ pass |
| 더 글로리 (관련, synthetic) | — | 0.500 | ✅ pass |

무관/관련 케이스 사이 분리도 충분 (margin 0.09 ↓, 0.20 ↑). 운영 후 false-fail 빈도 1주 모니터링 후 0.20 상향 검토.

### 비용 영향

- 기존 prompt: ~1,500 토큰
- 변경 후: prompt + `source_body_text`(최대 5,000자) ~3,500~5,000 토큰
- 1회 실패 시 재시도 발생 — 일 1회 K-Drama 생성 기준 +0.x USD/월 수준 (무시 가능)

### 운영 시 주의

- Code 노드 안에서 `await this.helpers.httpRequest(...)`로 외부 호출. n8n 실행 timeout 무제한이지만 최악 시나리오(3회 재시도 × (12초 fetch + 90초 Claude)) ≈ 5분 소요 가능 → workflow timeout 여유 확인.
- `source_body_text`는 `<script>·<style>·<noscript>` 제거 후 HTML 태그 strip + entity 정리 + 공백 압축. JS-rendered SPA는 본문 추출이 부실할 수 있음 — `source_body_too_short` (200자 미만) 이면 다음 후보로.

## Import 절차 (board action)

1. n8n UI → Import → 본 디렉터리의 JSON 업로드.
2. 자격 증명 매핑:
   - `Naver Open API` (K-Pop·K-Drama 워크플로와 공유).
   - `K-Beauty Webhook Header Auth` (신규 — 토큰을 `KBEAUTY_WEBHOOK_TOKEN`으로 export, 부재 시 `KPOP_WEBHOOK_TOKEN`).
3. workflow Activate ON.
4. Paperclip routine `K-Beauty Daily Content` 등록 — cron `0 4 * * *` Asia/Seoul, body=`bash _default/board-routine/kbeauty-kickoff.sh "$PAPERCLIP_TASK_ID"`.

자세한 routing/검수는 [JAC-1750](https://paperclip.ing/JAC/issues/JAC-1750)·[JAC-1764](https://paperclip.ing/JAC/issues/JAC-1764) 참조.
