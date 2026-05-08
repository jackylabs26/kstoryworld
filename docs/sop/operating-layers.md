# KStoryWorld 운영 6 Layer SOP

> 최초 작성: 2026-05-06 · 이슈: JAC-2031 · 담당: Nova (COO)  
> 갱신 시 본 문서 + `docs/content-creation-rules.md` 동시 갱신 원칙.

---

## 목적

KStoryWorld 운영 체계를 Strategy → Editorial → Production → QA → Distribution → Analytics의 6 Layer로 명문화하여,  
신규 에이전트·외주 합류 시 즉시 참조할 수 있는 단일 진실원(Single Source of Truth)을 제공한다.

---

## 1. 6 Layer 정의

| Layer | Mission (1-2줄) |
|---|---|
| **Strategy** | 무엇을 만들 것인가를 결정한다. 트렌드·검색량·팬덤 신호를 종합해 Hexagon 후보를 선정하고 우선순위를 부여한다. |
| **Editorial** | 어떤 톤과 시각으로 말할 것인가를 정의한다. 화자 페르소나, 언어쌍 기준, 금지 표현, 섹션 구조 등 콘텐츠 정체성을 보호한다. |
| **Production** | 실제 콘텐츠를 제작한다. n8n 워크플로가 Naver Search → Claude AI → Self-Check 파이프라인으로 ko/en 이중 초안을 생성한다. |
| **QA** | 품질 기준 충족 여부를 검증한다. 자동화된 Self-Check 게이트(12~18 항목)와 Auditor 인간 검수를 통해 발행 직전 최종 승인한다. |
| **Distribution** | 검수된 콘텐츠를 독자에게 전달한다. GitHub PR → Cloudflare Pages 배포, SEO 메타 확정, Hexagon 번들 동시 발행을 담당한다. |
| **Analytics** | 발행 후 성과를 측정·해석한다. KPI 모니터링, 일일 발행 집계, GSC 데이터, 콘텐츠 리프레시 여부를 결정한다. |

---

## 2. Layer별 상세

### Layer 1 — Strategy

| 항목 | 내용 |
|---|---|
| **책임 부서·에이전트** | CEO (Jacky) · CMO / 에디터스 데스크 책임자 Echo |
| **입력** | OTT 트렌드, K-Pop 이슈, Naver 검색량, SNS 반응, 글로벌 팬덤 데이터 |
| **산출물** | Hexagon 후보 목록 (`hexagon_id`, `anchor`, `theme`, `target_persona`, `target_locale`, `commercial_value`, `priority`), Paperclip 이슈 생성 |
| **인계 기준** | Hexagon 후보 Paperclip 이슈 status=backlog + `gate1_approval_id` 없이는 Editorial로 인계 불가 |
| **사용 도구** | Paperclip (이슈 트래킹), Google Trends, Naver Datalab, `content/hexagons/<slug>.yaml` |

### Layer 2 — Editorial

| 항목 | 내용 |
|---|---|
| **책임 부서·에이전트** | CMO · Echo (에디터스 데스크 책임자, 12년차 콘텐츠 에디터) |
| **입력** | Strategy 산출 Hexagon 후보 + 화자 페르소나 레지스트리 (`content/personas/<slug>.yaml`) |
| **산출물** | (1) 화자 페르소나 확정 (`narrator_persona_slug`), (2) 섹션 구조 정의, (3) 키워드 풀 승인 (`board-routine/lib.sh`의 `br_pick_*_keyword`), (4) 금지 표현 목록 갱신 |
| **인계 기준** | `narrator_persona_slug` + 섹션 템플릿 + 키워드 풀이 확정되어야 Production 시작 가능 |
| **사용 도구** | `docs/content-creation-rules.md`, `content/personas/`, `board-routine/lib.sh` |

**화자 페르소나 회전 정책 (보드 confirmed 8인)**

| slug | 특징 | 주력 카테고리 |
|---|---|---|
| `sabina` | 40대 여성, 외항사 23년 승무원, 한국 리터니 | K-Travel, K-Drama |
| `jacky` | 50대 남성, 제주, 호텔·카지노 IT 25년 | K-Travel, K-Literature |
| `minji` | 27세 부산, K-Beauty MUA | K-Beauty, K-Pop |
| `hiroshi` | 33세 일본인, J-K 번역가 | K-Drama, K-Literature |
| `alejandra` | 29세 멕시코, K-Pop PhD | K-Pop, K-Drama |
| `cheolsu` | 52세 광주, 한식 셰프 미슐랭 1성 | K-Food |
| `yuna` | 23세 제주, K-Travel + 지속가능성 | K-Travel, K-Beauty |
| `echo` | 38세 서울, KStoryWorld 에디터스 데스크 책임자 | 전 카테고리 |

### Layer 3 — Production

| 항목 | 내용 |
|---|---|
| **책임 부서·에이전트** | Nova (COO, 루틴 운영) · n8n 워크플로 자동화 · Claude claude-sonnet-4-6 (초안 생성) |
| **입력** | 일일 cron(`0 4 * * * Asia/Seoul`) + Paperclip `$PAPERCLIP_TASK_ID` + 키워드 회전값 |
| **산출물** | ko/en HTML 초안 + 이미지 메타 + Self-Check 결과 JSON (`n8n-workflows/_dryrun-samples/{category}-YYYY-MM-DD-{slug}.json`) |
| **인계 기준** | n8n 워크플로 응답 `ok: true` (self-check `passed === total`) + 아티팩트 persist 완료 |
| **사용 도구** | `board-routine/*-kickoff.sh`, n8n (kbeauty/kdrama/kpop/kfood-content-generator.json), `ANTHROPIC_API_KEY`, Naver Search API |

**카테고리별 워크플로 매핑**

| 카테고리 | Kickoff 스크립트 | n8n Webhook 경로 | 특이사항 |
|---|---|---|---|
| K-Drama | `kdrama-kickoff.sh` | `/webhook/generate-kdrama-content` | 출처 본문 overlap ≥ 0.15 (#13), 3회 재시도 |
| K-Pop | `kpop-kickoff.sh` | `/webhook/generate-kpop-content` | `KPOP_WEBHOOK_TOKEN` (기본 토큰) |
| K-Food | `kfood-kickoff.sh` | `/webhook/generate-kfood-content` | `KFOOD_KICKOFF_NO_SLEEP=1` 테스트용 |
| K-Beauty | `kbeauty-kickoff.sh` | `/webhook/kbeauty-content` | 7개 섹션 구조 강제 |

**실패 처리 경로**

| 실패 유형 | 처리 |
|---|---|
| Self-check pass < 12/13 | skip + Telegram 알림 + 다음 cron 재시도 → Paperclip done(skipped) |
| Webhook / gate-create 실패 | Paperclip blocked (인프라 문제) |
| n8n ok=false (HTTP 200 envelope) | content-sourcing 실패 → skip path (blocked 아님) |

### Layer 4 — QA

| 항목 | 내용 |
|---|---|
| **책임 부서·에이전트** | Auditor (QC) · n8n Format & Self-Check 노드 (자동) |
| **입력** | Production 산출 ko/en 초안 JSON + 이미지 메타 |
| **산출물** | (1) 자동 Self-Check 결과 (`ok: true/false`), (2) Auditor 인간 검수 코멘트, (3) Hexagon 게이트 2 confirm |
| **인계 기준** | `ok: true` (전 항목 pass) + Auditor 승인 코멘트 + Hexagon 모드면 게이트 2 accept (`gate2_approval_id` 부여) |
| **사용 도구** | n8n Self-Check Code 노드, `n8n-workflows/_lib/hexagon-self-checks.js`, `scripts/hexagon/build-review-bundle.mjs`, Telegram (QC 알림) |

**Self-Check 게이트 전체 목록**

| # | 항목 | 대상 | 기준 |
|---|---|---|---|
| 1–12 | 기본 12-check | 전 카테고리 | category 메타, ko/en 길이·제목·슬러그·메타, 섹션, no-ai-copy, 의료/효능 단정 |
| 12a | 이미지 ≥ 1장 | 전 카테고리 | 5개 필드(source/asset_id/license/credit/seasonal_tone) 충족 + 화이트리스트 |
| 13 | 출처 본문 overlap ≥ 0.15 | K-Drama 전용 | source_body ⊆ 본문 토큰 비율 |
| 14 | anchor_backlink_present | Hexagon 모드 | 자매 글에 앵커 K-Drama URL/슬러그 포함 |
| 15 | images_present_with_license | Hexagon 모드 | hero ≥ 1 + inline ≥ 1 + 전체 화이트리스트 |
| 15a | seasonal_tone_quarter_policy | Hexagon 모드 | hero 톤 = 발행 분기 (또는 매니페스트 예외 선언) |
| 16 | no_bold_emphasis | 전 카테고리 | `**bold**` 마크다운 패턴 0건 |
| 17 | youtube_url_present | 전 카테고리 | YouTube URL ≥ 1건 |
| 18 | narrator_persona_resolved | 전 카테고리 | `narrator_persona_slug` 비어 있지 않음 |

### Layer 5 — Distribution

| 항목 | 내용 |
|---|---|
| **책임 부서·에이전트** | Publisher · GitHub Actions · Cloudflare Pages |
| **입력** | QA 통과 초안 + Auditor 승인 + (Hexagon) 게이트 2 accept |
| **산출물** | (1) GitHub PR (main 머지), (2) Cloudflare Pages 배포, (3) SEO 메타 확정(canonical/hreflang/JSON-LD), (4) Telegram 발행 알림 |
| **인계 기준** | Cloudflare 배포 성공 URL + `daily-aggregate.sh` 카운트 증가 확인 |
| **사용 도구** | GitHub (PR + Actions), Cloudflare Pages, `scripts/pre-deploy-check.sh`, `scripts/validate-commit-message.sh`, Paperclip routine |

**발행 정책 핵심 제약**

- Hexagon 6편(앵커 1 + 자매 5): `bundle-only` — 단일 발행 금지, 게이트 2 accept 후에만 main 머지
- 게이트 2 전 `blocked_until_gate2: true` — main 머지·Cloudflare 배포 자동 차단

### Layer 6 — Analytics

| 항목 | 내용 |
|---|---|
| **책임 부서·에이전트** | CEO · Nova (COO) · `board-routine/daily-aggregate.sh` |
| **입력** | 발행 완료 아티팩트, GSC 데이터, Cloudflare Analytics, Telegram 알림 |
| **산출물** | (1) 일일 발행 집계 리포트 (`daily-aggregate.sh`, cron `0 9 * * *` KST), (2) KPI 대시보드, (3) 주간/월간 리뷰 이슈, (4) 콘텐츠 리프레시 결정 |
| **인계 기준** | 이상 감지(0편 발행) → JAC-1737 priority=critical 알림 → Strategy로 피드백 루프 |
| **사용 도구** | `board-routine/daily-aggregate.sh`, Google Search Console, Cloudflare Analytics, Telegram, Paperclip |

**핵심 KPI**

| KPI | 목표 |
|---|---|
| Avg Time on Page | 체류시간 (Hexagon 연결성 지표) |
| Pages per Session | Hexagon 클러스터 효과 |
| Return Visitor | 브랜드 충성도 |
| Locale Growth (ko/en) | 다국어 독자 확장 |
| GSC CTR / Impressions | SEO 효과 (7일 픽업 기준 — JAC-1962) |
| Daily Publish Count | 자동화 안정성 (0편 = critical alert) |

---

## 3. Layer 간 핸드오프 다이어그램

```
Strategy
  │
  │  산출: Hexagon 후보 이슈 (hexagon_id, priority, target_persona)
  │  인계 조건: gate1_approval_id 부여
  ▼
Editorial
  │
  │  산출: narrator_persona_slug + 섹션 구조 + 키워드 풀 확정
  │  인계 조건: 페르소나·섹션·금지 표현 모두 결정
  ▼
Production
  │
  │  산출: ko/en 초안 JSON + 이미지 메타 (_dryrun-samples/*.json)
  │  인계 조건: n8n ok=true (Self-Check passed===total)
  │  실패 경로: ok=false → skip + Telegram + 다음 cron
  ▼
QA
  │
  │  산출: Auditor 승인 코멘트 + (Hexagon) gate2_approval_id
  │  인계 조건: 전 self-check pass + Auditor sign-off
  │  실패 경로: Hexagon gate2_rejected → Production 재작업
  ▼
Distribution
  │
  │  산출: GitHub PR merge + Cloudflare 배포 URL
  │  인계 조건: 배포 성공 확인 + daily-aggregate 카운트
  ▼
Analytics
  │
  │  산출: 일일 집계 + KPI 리포트 + 리프레시 결정
  │  피드백 루프: 0편 alert → Strategy 재점검
  └──────────────────────────────────────▶ Strategy (feedback loop)
```

---

## 4. 현 워크플로 매핑

현재 실제 운영 중인 워크플로와 6 Layer 간의 대응 관계.

| 파일 / 컴포넌트 | Layer | 역할 |
|---|---|---|
| Paperclip 이슈 (JAC-XXXX) | Strategy | Hexagon/콘텐츠 후보 계획·승인 |
| `docs/content-creation-rules.md` | Editorial | 전사 콘텐츠 규칙 SoT |
| `content/personas/*.yaml` | Editorial | 화자 페르소나 레지스트리 |
| `board-routine/lib.sh` | Production | 키워드 풀 + n8n 호출 헬퍼 |
| `board-routine/kbeauty-kickoff.sh` | Production | K-Beauty 일일 kickoff |
| `board-routine/kdrama-kickoff.sh` | Production | K-Drama 일일 kickoff |
| `board-routine/kfood-kickoff.sh` | Production | K-Food 일일 kickoff |
| `board-routine/kpop-kickoff.sh` | Production | K-Pop 일일 kickoff |
| `n8n-workflows/kbeauty-content-generator.json` | Production | K-Beauty 생성 파이프라인 |
| `n8n-workflows/kdrama-content-generator.json` | Production | K-Drama 생성 파이프라인 (13-check 포함) |
| `n8n-workflows/kpop-content-generator.json` | Production | K-Pop 생성 파이프라인 |
| `n8n-workflows/kfood-content-generator.json` | Production | K-Food 생성 파이프라인 |
| n8n Format & Self-Check 노드 | QA | 자동 12~18 항목 게이트 |
| `n8n-workflows/_lib/hexagon-self-checks.js` | QA | Hexagon 추가 게이트 14·15·15a |
| `scripts/hexagon/build-review-bundle.mjs` | QA | 게이트 2 직전 검토 번들 생성 |
| `scripts/hexagon/validate-article.mjs` | QA | 단건 아티팩트 검증 |
| Telegram Bot (QC 채널) | QA | Self-check 실패 알림 |
| `scripts/pre-deploy-check.sh` | Distribution | 배포 전 최종 게이트 |
| `scripts/validate-commit-message.sh` | Distribution | Cloudflare Pages 안전용 ASCII commit message 게이트 |
| GitHub PR + Actions | Distribution | 코드 리뷰 + 자동 빌드/배포 |
| Cloudflare Pages | Distribution | 실제 독자 서빙 |
| `board-routine/kpop-publish.sh` | Distribution | K-Pop draft → repo HTML 렌더 |
| `board-routine/daily-aggregate.sh` | Analytics | 일일 발행 카운트 집계 + alert |
| Google Search Console | Analytics | SEO 성과 추적 (JAC-1962) |
| `n8n-workflows/_dryrun-samples/` | Analytics/QA | 실행 아티팩트 보관 |

---

## 5. 운영 Cadence

| 주기 | Layer | 작업 |
|---|---|---|
| Daily (04:00–06:00 KST) | Production | 카테고리별 n8n kickoff (4종) |
| Daily (09:00 KST) | Analytics | `daily-aggregate.sh` 발행 집계 |
| Biweekly | Strategy → Distribution | Hexagon 번들(6편) 발행 |
| Weekly | Strategy | Research & 다음 Hexagon 후보 선정 |
| Monthly | Analytics → Strategy | KPI 리트로 + 리프레시 결정 |
| Quarterly | Strategy | 로케일 확장 검토 |

---

## 6. 미구현 / 갭 (현재 운영 기준)

아래 항목은 SOP 상 Layer에 정의되었으나 현재 미구현 또는 부분 구현 상태입니다.

| Layer | 갭 | 현재 상태 |
|---|---|---|
| Strategy | 공식 `OPERATING_CHARTER.md` / `ORG_CHART.md` 미존재 | 본 문서로 임시 대체 |
| Strategy | Gate 1 자동 승인 플로우 | Paperclip 이슈 수동 approve |
| Editorial | `content/personas/*.yaml` 실제 파일 생성 여부 | 규칙 정의만 존재, 파일 미검증 |
| Production | K-Travel / K-Literature 워크플로 | Hexagon 자매 전용, 별도 워크플로 미구축 |
| Distribution | 뉴스레터 / SNS(Threads·X) 자동화 | Playbook 정의만, 미구현 |
| Analytics | GSC 자동 연동 | 수동 확인 (JAC-1962 7일 픽업 추적 중) |

---

## 부록 — 관련 문서

| 문서 | 경로 | Layer |
|---|---|---|
| 콘텐츠 제작 규칙 (SoT) | `docs/content-creation-rules.md` | Editorial / QA |
| 운영 점검 제안 (원본) | `docs/운영점검제안.md` | All |
| board-routine 사용법 | `board-routine/README.md` | Production |
| n8n 워크플로 목록 | `n8n-workflows/README.md` | Production / QA |
| Hexagon 매니페스트 스키마 | `content/hexagons/_schema.yaml` | Production / QA |
| Hexagon 입력 컨트랙트 | `n8n-workflows/_lib/hexagon-input-contract.md` | Production |
