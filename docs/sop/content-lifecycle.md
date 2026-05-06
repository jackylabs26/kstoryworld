# KStoryWorld Content Lifecycle SOP

> "한국의 모든 이야기를 그 이야기가 마땅히 받아야 할 결로 들려준다."
>
> 이 문서는 KStoryWorld 모든 콘텐츠가 거치는 **13단계 라이프사이클**을 공식 정의합니다.
> 단계별 소유자·진입 조건·산출물·게이트를 명시하며, 현 daily 운영 흐름과 Hexagon 플로우를 함께 매핑합니다.
>
> 최초 작성: 2026-05-06 ([JAC-2032](/JAC/issues/JAC-2032) — Nova(COO))
> 원본 참고: `docs/운영점검제안.md` 섹션 2·4

---

## 0. 한 장 요약

```text
IDEA
  → 1. Seed Planning
  → 2. Hexagon Approval          ← Board Gate 0/1 (Hexagon 모드만)
  → 3. Research
  → 4. Draft
  → 5. Editorial Review
  → 6. Fact Check
  → 7. SEO Review
  → 8. Localization
  → 9. Final QA                  ← QA Gate (12/13-check)
  → 10. Publish                  ← Board Gate 2 (Hexagon) / Auto Gate (Daily)
  → 11. Distribution
  → 12. Analytics Review
  → 13. Archive / Refresh
```

---

## 1. 게이트 종류 정의

| 게이트 | 설명 | 승인 주체 | 차단 방식 |
|--------|------|-----------|-----------|
| **Board Gate** | 사람(보드/CEO)이 명시적으로 승인해야 다음 단계 진행 가능 | 보드 / CEO | Paperclip `request_confirmation`; 미승인 시 머지 차단 |
| **QA Gate** | n8n 워크플로의 Format & Self-Check 노드가 자동 채점; `passed === total` 필요 | 자동 (n8n) | `ok: false` 반환 시 publish 중단, 다음 cron 재시도 |
| **Auto Gate** | CI 스크립트 / 빌드 파이프라인이 패턴 기반으로 차단 | 자동 (CI/npm) | 빌드 실패(`npm run check:no-ai-copy`, `check:no-bold-emphasis`, `pre-deploy-check.sh`) |

---

## 2. 13단계 상세 정의

### Stage 0 — IDEA

**정의:** 콘텐츠 소재가 처음 떠오른 단계. 아직 어떤 형태로 만들지 결정 전.

| 항목 | 내용 |
|------|------|
| 소유 부서/에이전트 | Strategy / 보드(CEO), 에디터, 자동 키워드 회전(루틴) |
| 진입 조건 | 없음 (인풋: OTT 트렌드, SNS 반응, 검색량, 팬덤 데이터, 루틴 풀) |
| 산출물 | 키워드 1개 + 카테고리 태그 (예: `냉면`, `k-food`) |
| 게이트 | 없음 (일일 루틴은 `board-routine/lib.sh`의 `br_pick_*_keyword`가 자동 결정) |

---

### Stage 1 — Seed Planning

**정의:** 소재를 구체적인 콘텐츠 계획으로 발전시키는 단계. 앵커·페르소나·목표 로케일·상업 가치를 결정.

| 항목 | 내용 |
|------|------|
| 소유 부서/에이전트 | Editorial / Editor |
| 진입 조건 | IDEA 확정 키워드 |
| 산출물 | Seed 계획서 (`hexagon_id`, `anchor`, `theme`, `target_persona`, `target_locale`, `commercial_value`, `season`, `priority`) |
| 게이트 | 없음 (Daily 모드), Board Gate 0 예비 (Hexagon 모드) |

> **Daily 모드 참고:** 일일 루틴은 Seed Planning을 명시적으로 수행하지 않음 — keyword + payload JSON이 사실상 이 단계를 대체.

---

### Stage 2 — Hexagon Approval

**정의:** Hexagon 클러스터(앵커 + 자매 5편)를 공식 승인하는 단계. **Hexagon 모드 전용**; Daily 단독 콘텐츠는 이 단계를 건너뜀.

| 항목 | 내용 |
|------|------|
| 소유 부서/에이전트 | Strategy / 보드(CEO) |
| 진입 조건 | Seed 계획서 완성 + 매니페스트 초안(`content/hexagons/<slug>.yaml`) |
| 산출물 | `gate1_approval_id` 부여 + 매니페스트 `status: ready_for_board` 전환 |
| 게이트 | **Board Gate 0/1** — Paperclip `request_confirmation`; 미승인 시 Research 진행 불가 |

---

### Stage 3 — Research

**정의:** 콘텐츠 근거(사실, 출처, 문화 맥락)를 수집하는 단계.

| 항목 | 내용 |
|------|------|
| 소유 부서/에이전트 | Production / Researcher, n8n Naver Search 노드 |
| 진입 조건 | Seed 계획서(Daily) 또는 Gate 1 승인(Hexagon) |
| 산출물 | 출처 후보 URL 목록 + 본문 발췌 (`filtered[]`), Drama의 경우 `anchor_seed { person, year, platform, key_motif }` |
| 게이트 | Auto Gate (의료·발암·리콜 도메인/제목 자동 차단) |

> K-Drama: Naver Search 상위 결과 최대 5건 → source body fetch → `source_body_too_short`(< 200자) 또는 `source_irrelevant` 시 다음 후보 폴백 (최대 3회).

---

### Stage 4 — Draft

**정의:** KO + EN 초안을 실제로 작성하는 단계. Claude AI가 보조.

| 항목 | 내용 |
|------|------|
| 소유 부서/에이전트 | Production / Story Agent (Claude), n8n Claude HTTP 노드 |
| 진입 조건 | Research 산출물 (출처 본문, anchor_seed) |
| 산출물 | KO 초안 + EN 초안 (카테고리별 섹션 구조 준수) + `narrator_persona_slug` 결정 |
| 게이트 | 없음 (자동 생성); AI 자동생성 표기 금지(`no-ai-copy`) 적용은 QA Gate에서 |

| 카테고리 | 섹션 구조 |
|----------|-----------|
| K-Drama | `intro · plot_snapshot · cultural_context · why_watch · closing · source` |
| K-POP | `intro · lyrics_quote · cultural_context · learning_points · closing · source` |
| K-Food | `intro · what_it_is · cultural_context · how_to_enjoy · closing · source` |
| K-Beauty | `intro · trend_snapshot · how_to_use · cultural_context · editor_picks · closing · source` |

---

### Stage 5 — Editorial Review

**정의:** 문장·톤·페르소나의 일관성을 사람이 검수하는 단계.

| 항목 | 내용 |
|------|------|
| 소유 부서/에이전트 | Editorial / Editor, Echo(에디터스 데스크) |
| 진입 조건 | Draft 완성본 |
| 산출물 | 교열된 KO + EN 본문 |
| 게이트 | 없음 (수동 검토; Daily 루틴은 이 단계를 사실상 n8n 워크플로 내 prompt 가이드라인으로 대체) |

> 검수 기준: 문장 자연스러움, 문화적 어색함 제거, Persona 일관성, 감성 유지, AI 느낌 제거, `** **` 마크다운 금지.

---

### Stage 6 — Fact Check

**정의:** 출처 근거와 본문 간 사실 일치를 검증하는 단계.

| 항목 | 내용 |
|------|------|
| 소유 부서/에이전트 | QA / Auditor, n8n Self-Check 노드 |
| 진입 조건 | Draft (Editorial 검토 포함 또는 생략) |
| 산출물 | self-check `#13` 결과 (K-Drama: source-body token overlap ≥ 0.15) |
| 게이트 | **QA Gate** — K-Drama 전용: `13_source_body_overlap_min_15pct`. 3회 실패 시 `ok:false` → Telegram alert + 다음 cron |

---

### Stage 7 — SEO Review

**정의:** 메타데이터·슬러그·내부링크·YouTube URL 등 SEO 요소를 검증하는 단계.

| 항목 | 내용 |
|------|------|
| 소유 부서/에이전트 | Production / SEO Agent, n8n Self-Check 노드 |
| 진입 조건 | Draft + Fact Check 통과 |
| 산출물 | SEO 메타 완성: `ko/en title`, `ko/en slug`, `ko/en meta_description`, `category`, YouTube URL |
| 게이트 | **QA Gate** — self-check #1~7 (category 메타, title/slug/meta_description ko+en), #17 (YouTube URL ≥ 1) |

---

### Stage 8 — Localization

**정의:** KO·EN 2개 언어 발행을 최종 확정하고 언어쌍 완결성을 검증하는 단계.

| 항목 | 내용 |
|------|------|
| 소유 부서/에이전트 | Production / Story Agent + 다국어 에디터 |
| 진입 조건 | SEO 메타 완성 |
| 산출물 | `ko/en` 본문 길이 기준 충족 (KO ≥ 600자, EN ≥ 200 words) + 파일명 규칙 준수 |
| 게이트 | **QA Gate** — self-check #8 (KO ≥ 600자), #9 (EN ≥ 200 words) |

> 현재 의무 발행 언어: KO + EN. JA / ZH-HANS / ZH-HANT / ES / FR / VI는 디자인 토큰 준비 완료, 본문 발행은 별도 결정 시 추가.

---

### Stage 9 — Final QA

**정의:** 모든 자동·수동 게이트를 통합 통과하는 최종 품질 검수 단계.

| 항목 | 내용 |
|------|------|
| 소유 부서/에이전트 | QA / Auditor, n8n Format & Self-Check 노드, CI |
| 진입 조건 | Stage 3~8 산출물 모두 완성 |
| 산출물 | `passed === total` self-check 리포트 (`ok: true`) |
| 게이트 | **QA Gate** (12/13-check 전 항목) + **Auto Gate** (no-ai-copy, no-bold-emphasis) |

**전체 self-check 항목 (Daily 기준):**

| # | 항목 | K-Drama | K-POP | K-Food | K-Beauty |
|---|------|---------|-------|--------|----------|
| 1–7 | category/title/slug/meta_description (ko+en) | ✓ | ✓ | ✓ | ✓ |
| 8–9 | 본문 길이 ko≥600자, en≥200w | ✓ | ✓ | ✓ | ✓ |
| 10 | 섹션 구조 완결 | ✓ | ✓ | ✓ | ✓ |
| 11 | 의료/효능 단정 차단어 0건 | ✓ | ✓ | ✓ | ✓ |
| 12 | no-ai-copy 0건 | ✓ | ✓ | ✓ | ✓ |
| 12a | 이미지 ≥ 1장 + 5개 필드 + 화이트리스트 | ✓ | ✓ | ✓ | ✓ |
| 13 | source-body overlap ≥ 0.15 | ✓ | — | — | — |
| 13 (K-POP) | source-overlap-min-7pct | — | ✓ | — | — |
| 14 | anchor_backlink (Hexagon 모드) | opt | opt | opt | opt |
| 15/15a | images ≥ 2 + seasonal_tone (Hexagon 모드) | opt | opt | opt | opt |
| 16 | no_bold_emphasis (** 금지) | ✓ | ✓ | ✓ | ✓ |
| 17 | YouTube URL ≥ 1 | ✓ | ✓ | ✓ | ✓ |
| 18 | narrator_persona_slug 결정 | ✓ | ✓ | ✓ | ✓ |

---

### Stage 10 — Publish

**정의:** 검수 완료 콘텐츠를 사이트에 배포하는 단계.

| 항목 | 내용 |
|------|------|
| 소유 부서/에이전트 | Production / Publisher, Cloudflare Pages |
| 진입 조건 | Final QA 통과 (`ok: true`) + (Hexagon) Gate 2 승인 |
| 산출물 | `content/<category>/` HTML 파일 main 머지 + Cloudflare 배포 |
| 게이트 | **Auto Gate** (`scripts/pre-deploy-check.sh`) + **Board Gate 2** (Hexagon 번들 전용) |

> **Hexagon 발행 정책:** 6편(앵커 1 + 자매 5)은 bundle-only — 단일 글 발행 금지. Gate 2 accept 전엔 main 머지·Cloudflare 배포 차단.
> **Daily 콘텐츠:** Hexagon Gate 없이 QA Pass 후 자동 배포 가능 (n8n 워크플로 출력 → content PR → CI 통과 → 머지).

---

### Stage 11 — Distribution

**정의:** 발행된 콘텐츠를 외부 채널에 배포하고 트래픽을 유입하는 단계.

| 항목 | 내용 |
|------|------|
| 소유 부서/에이전트 | Distribution / Publisher, 외부 채널 운영자 |
| 진입 조건 | Publish 완료 (URL 확정) |
| 산출물 | Threads / X 포스트, Newsletter 발행, SEO 인덱싱 요청 |
| 게이트 | 없음 (수동 실행) |

---

### Stage 12 — Analytics Review

**정의:** 발행 후 성과를 측정하고 다음 콘텐츠에 피드백을 반영하는 단계.

| 항목 | 내용 |
|------|------|
| 소유 부서/에이전트 | Analytics / Editor, CEO |
| 진입 조건 | Publish 후 ≥ 7일 경과 |
| 산출물 | KPI 리포트 (Avg Time on Page, Pages per Session, Return Visitor, RPM, CTR, Locale Growth, Backlink Count) |
| 게이트 | 없음 (수동 리뷰; 월간 Retro 시 결정) |

---

### Stage 13 — Archive / Refresh

**정의:** 콘텐츠를 보존하거나 최신화하는 단계. Analytics 결과에 따라 경로 분기.

| 항목 | 내용 |
|------|------|
| 소유 부서/에이전트 | Editorial / Editor, CEO |
| 진입 조건 | Analytics Review 완료 |
| 산출물 | Archive: 태그 `status: archived` + 검색 노출 유지 / Refresh: 업데이트 Draft 재투입(Stage 4로 귀환) |
| 게이트 | **Board Gate** (Hexagon 클러스터 전체 Archive 또는 앵커 Refresh 시) |

---

## 3. 현 운영 플로우 매핑

### 3.1 K-Drama Daily (board-routine/kdrama-kickoff.sh)

```text
IDEA (키워드 회전)
  ↓  [Stage 0]  br_pick_kdrama_keyword → KEYWORD
  ↓  [Stage 3]  n8n: Naver Search → source fetch (최대 3 후보)
  ↓  [Stage 4]  n8n: Claude draft (ko + en, 6 sections)
  ↓  [Stage 5]  n8n: prompt 가이드라인 내 편집 기준 적용 (자동)
  ↓  [Stage 6]  n8n: self-check #13 source overlap ≥ 0.15
  ↓  [Stage 7]  n8n: self-check #1~7, #17 (SEO 메타·YouTube URL)
  ↓  [Stage 8]  n8n: self-check #8~9 (ko≥600자, en≥200w)
  ↓  [Stage 9]  n8n: 13-check 전 항목 + #12/#16/#12a/#18 → ok:true
  ↓  [Stage 10] (BOARD_AUTO_PR=1 시) content-pr-adapter → PR 생성 → main 머지
  ↓  건너뛰는 단계: Stage 1 (Seed Planning 생략), Stage 2 (Hexagon Approval 없음)
```

| 게이트 | 도구 |
|--------|------|
| QA Gate (13-check) | n8n Format & Self-Check 노드 |
| Auto Gate (no-ai-copy) | `npm run check:no-ai-copy` (CI) |
| Auto Gate (no-bold) | `npm run check:no-bold-emphasis` (CI) |

---

### 3.2 K-POP Daily (board-routine/kpop-kickoff.sh)

```text
IDEA (키워드 회전)
  ↓  [Stage 0]  br_pick_kpop_keyword → KEYWORD
  ↓  [Stage 3]  n8n: 소스 수집 (lyrics-no-copy 가드)
  ↓  [Stage 4]  n8n: Claude draft (ko + en, 6 sections)
  ↓  [Stage 6]  n8n: self-check #13(K-POP) source-overlap-min-7pct
  ↓  [Stage 7]  n8n: self-check #1~7, #17 (SEO 메타·YouTube URL)
  ↓  [Stage 8]  n8n: self-check #8~9 (ko≥600자, en≥200w)
  ↓  [Stage 9]  n8n: 13-check 전 항목 → ok:true
  ↓  [Stage 10] (BOARD_AUTO_PR=1 시) PR 생성 → main 머지
  ↓  K-Drama와 차이점: source-overlap 임계치 7%(K-Drama 15%), lyrics-no-copy 가드
```

---

### 3.3 K-Beauty Daily (board-routine/kbeauty-kickoff.sh)

```text
IDEA (키워드 회전 — 10개 안전 키워드 풀)
  ↓  [Stage 0]  br_pick_kbeauty_keyword → KEYWORD
  ↓  [Stage 3]  n8n: 소스 수집 (medical-assertion 가드)
  ↓  [Stage 4]  n8n: Claude draft (ko + en, 7 sections)
  ↓  [Stage 7]  n8n: self-check #1~7, #17
  ↓  [Stage 8]  n8n: self-check #8~9
  ↓  [Stage 9]  n8n: 12-check + medical-assertion 가드 → ok:true
  ↓  [Stage 10] (BOARD_AUTO_PR=1 시) PR 생성 → main 머지
  ↓  K-Drama와 차이점: Stage 6 Fact Check(#13) 없음, medical-assertion 가드 추가
```

---

### 3.4 K-Food Daily (board-routine/kfood-kickoff.sh)

```text
IDEA (키워드 회전)
  ↓  [Stage 0]  br_pick_kfood_keyword → KEYWORD
  ↓  [Stage 3]  n8n: 소스 수집 (food-safety-negative-exclusion 가드)
  ↓  [Stage 4]  n8n: Claude draft (ko + en, 6 sections)
  ↓  [Stage 7]  n8n: self-check #1~7, #17
  ↓  [Stage 8]  n8n: self-check #8~9
  ↓  [Stage 9]  n8n: 12-check + food-safety-negative-exclusion → ok:true
  ↓  [Stage 10] (BOARD_AUTO_PR=1 시) PR 생성 → main 머지
  ↓  K-Drama와 차이점: Stage 6 Fact Check(#13) 없음, food-safety 가드 추가
```

---

## 4. Hexagon Flow와의 관계

Hexagon 클러스터(앵커 K-Drama 1편 + 자매 K-POP/K-Food/K-Beauty/K-Travel/K-Literature 5편)는 표준 13단계 라이프사이클을 따르되, **Stage 2·10에 Board Gate가 추가**됩니다.

```text
Stage 0  IDEA            → Hexagon 앵커 소재 선정
Stage 1  Seed Planning   → hexagon_id + 매니페스트 초안 작성
Stage 2  Hexagon Approval→ Board Gate 0/1 (status: ready_for_board → gate1_approval_id 부여)
Stage 3  Research        → anchor_seed 추출 → 자매 워크플로 공유
Stage 4  Draft           → 6편(앵커+자매) 동시 병렬 생성
Stage 5  Editorial Review→ 6편 일관성 검토 (cross-link 예비 확인)
Stage 6  Fact Check      → K-Drama 앵커 #13 source overlap 검증
Stage 7  SEO Review      → 6편 SEO 메타 완성
Stage 8  Localization    → KO+EN 완결
Stage 9  Final QA        → Hexagon 추가 게이트 #14 (anchor backlink) + #15/15a (이미지 2장+seasonal_tone)
                            → build-review-bundle.mjs <slug> 실행 → artifacts/review/<slug>/ 생성
Stage 10 Publish         → Board Gate 2 (gate2_approval_id 부여) → bundle-only 머지 → Cloudflare 배포
Stage 11 Distribution   → 6편 동시 배포
Stage 12 Analytics Review→ Hexagon 단위 성과 집계
Stage 13 Archive/Refresh → Board Gate 필요 시 (클러스터 전체 처리)
```

> **Hexagon 동결 중에도 이 단계 정의는 유효합니다.** Daily 4개 루틴(K-Drama/K-POP/K-Food/K-Beauty)은 Stage 2를 건너뛰고 Stage 1→3으로 바로 이행합니다.

---

## 5. 단계별 소유자 요약 (RACI)

| 단계 | R (실행) | A (책임) | C (협의) | I (통보) |
|------|---------|---------|---------|---------|
| 0. IDEA | 루틴/에디터 | CEO | — | — |
| 1. Seed Planning | Editor | CEO | Researcher | — |
| 2. Hexagon Approval | CEO (보드) | CEO | Editor | Nova(COO) |
| 3. Research | n8n/Researcher | Editor | SEO Agent | — |
| 4. Draft | Story Agent (Claude) | Editor | — | — |
| 5. Editorial Review | Editor / Echo | Editor | — | — |
| 6. Fact Check | n8n Self-Check | Auditor | — | — |
| 7. SEO Review | n8n Self-Check | SEO Agent | — | — |
| 8. Localization | Story Agent | Editor | — | — |
| 9. Final QA | n8n + CI | Auditor | Editor | CEO |
| 10. Publish | Publisher / CI | CEO (Hexagon) | — | 전 팀 |
| 11. Distribution | Publisher | CEO | Editor | — |
| 12. Analytics Review | CEO | CEO | Editor | Nova(COO) |
| 13. Archive/Refresh | Editor | CEO | — | — |

---

## 6. Definition of Done (각 단계 산출물 요약)

| 단계 | 완료 기준 |
|------|-----------|
| IDEA | 키워드 1개 + 카테고리 결정 |
| Seed Planning | Seed 계획서 필드 모두 채워짐 |
| Hexagon Approval | gate1_approval_id 부여 |
| Research | 출처 URL ≥ 1 + 본문 발췌 ≥ 200자 |
| Draft | KO + EN 초안 (카테고리 섹션 구조 완결) |
| Editorial Review | AI 느낌 제거 + Persona 일관 + `** **` 0건 |
| Fact Check | #13 source overlap pass (K-Drama) |
| SEO Review | #1~7 + #17 pass |
| Localization | #8~9 pass |
| Final QA | `passed === total` (`ok: true`) |
| Publish | main 머지 + Cloudflare 배포 완료 |
| Distribution | ≥ 1 외부 채널 발행 |
| Analytics Review | KPI 리포트 작성 |
| Archive/Refresh | 태그 `archived` 또는 Stage 4 재진입 결정 |

---

## 7. 관련 문서

| 문서 | 위치 |
|------|------|
| 운영 점검 제안 (원본 섹션 2·4) | `docs/운영점검제안.md` |
| 콘텐츠 제작 규칙 (게이트 상세) | `docs/content-creation-rules.md` |
| n8n 워크플로 README | `n8n-workflows/README.md` |
| 일일 루틴 사용법 | `board-routine/README.md` |
| Hexagon 매니페스트 스키마 | `content/hexagons/_schema.yaml` |
| 운영 6 Layer SOP (자매 child) | `docs/sop/operations-6layer.md` (예정) |

---

## 8. 변경 이력

| 일자 | 이슈 | 변경 |
|------|------|------|
| 2026-05-06 | [JAC-2032](/JAC/issues/JAC-2032) | 최초 작성 — 13단계 정의, 소유·게이트, K-Drama/K-POP/K-Food/K-Beauty 매핑 |
