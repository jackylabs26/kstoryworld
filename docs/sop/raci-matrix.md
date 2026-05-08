# KStoryWorld RACI 역할 분장표

> 원본 SoT: `docs/운영점검제안.md` §5 / `docs/content-creation-rules.md`
> 조직 기준: Paperclip 에이전트 목록 (2026-05-06 기준)
> 이 문서는 [JAC-2035](/JAC/issues/JAC-2035) 산출물입니다. 변경 시 반드시 원본 SoT와 함께 갱신.

---

## 1. 에이전트-역할 매핑

| # | SOP 역할 | 매핑 에이전트 | 매핑 상태 | 근거 |
|---|---|---|---|---|
| 1 | Editor | Echo(CMO) | 겸직 — Tier B | Echo 페르소나 = KStoryWorld 에디터스 데스크 12년차 책임자. 에디토리얼 방향·톤 최종 책임자. |
| 2 | Curator | Echo(CMO) | 겸직 — Tier B | 문화 연결·큐레이션 판단은 에디토리얼 업무와 분리 불가. 볼륨 증가 시 독립 에이전트 검토 (Tier C). |
| 3 | Researcher | Scout(Research) | 전담 | 데이터 수집·트렌드 분석 전문. |
| 4 | Story Agent | Story(Content Specialist) | 전담 | ko/en 초안 생성, 섹션 구조, 페르소나 적용. |
| 5 | SEO Agent | Story(Content Specialist) | 겸직 — Tier B → Tier C 후보 | 현재 별도 SEO 에이전트 없음. Story가 메타/링크/self-check #8 담당. 트래픽 성장 시 신규 hire 필요. |
| 6 | Auditor | Auditor(QC) | 전담 | 13-check 수행, 게이트 승인, 품질 거부권 보유. |
| 7 | Publisher | Forge(DevOps) + n8n | 자동화 (Forge 감독) | n8n 워크플로가 Cloudflare Pages 배포를 자동 수행. Forge가 파이프라인 운영 책임. |

---

## 2. RACI 매트릭스 — 13단계 × 7역할

> RACI 범례: R = Responsible(수행), A = Accountable(최종 책임), C = Consulted(자문), I = Informed(결과 통지), — = 무관

| # | 단계 | Editor (Echo) | Curator (Echo) | Researcher (Scout) | Story Agent (Story) | SEO Agent (Story겸직) | Auditor | Publisher (Forge+n8n) |
|---|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| 1 | Ideation | A | R | C | I | C | I | I |
| 2 | Seed Planning | A | R | R | C | C | I | I |
| 3 | Hexagon Approval (Board Gate 0) | A | C | C | I | I | I | I |
| 4 | Research | A | C | R | C | I | I | I |
| 5 | Draft | A | C | I | R | C | I | I |
| 6 | Editorial Review | R/A | C | C | R | I | I | I |
| 7 | Fact Check | A | I | R | C | I | C | I |
| 8 | SEO Review | A | I | I | R | R | C | I |
| 9 | Localization | A | R | I | R | C | I | I |
| 10 | Final QA | C | I | I | I | I | R/A | I |
| 11 | Publish | A | I | I | I | I | R | R |
| 12 | Distribution | C | C | I | I | R | I | R/A |
| 13 | Analytics Review & Archive/Refresh | A | C | R | I | R | I | I |

### 주석

- Stage 6 Editorial Review: R/A — Echo가 직접 편집 수행하며 동시에 에디토리얼 최종 책임. 에이전트 1인이 두 역할을 겸함(Editor·Curator 통합 구조에 따른 설계).
- Stage 10 Final QA: Auditor가 R/A — QC 전문 에이전트가 13-check 수행 및 게이트 승인 모두 담당.
- Stage 11 Publish: Editor(Echo)가 A — 게이트 2 최종 승인은 Echo가 보드와 함께 수행. Forge는 물리적 배포 실행(R).
- Stage 12 Distribution: Publisher(Forge)가 R/A — 배포 채널(n8n, Cloudflare, Telegram)은 Forge 책임.
- Stage 13: Insight(Data Analyst) 에이전트가 있으나 SOP 7역할 외부. 필요 시 Researcher(Scout) C/I에 Insight를 보조로 활용.

---

## 3. 미매핑 역할 처리안

### 3.1 Editor

| 항목 | 내용 |
|---|---|
| 현재 처리 | Echo(CMO) 겸직 (Tier B) |
| 근거 | Echo 페르소나 정의 = "KStoryWorld 에디터스 데스크 책임자, 12년차 콘텐츠 에디터". 역할 정체성과 완전 일치. |
| 위험 | Echo가 CMO 전략 업무와 에디터 운영을 동시 담당 → 발행 빈도 증가 시 병목 가능. |
| Tier C 트리거 | 헥사곤 발행 ≥ 월 4편 or 카테고리 6개 동시 운영 시 전담 Editor 에이전트 hire 검토. |

### 3.2 Curator

| 항목 | 내용 |
|---|---|
| 현재 처리 | Echo(CMO) 겸직 (Tier B) |
| 근거 | 문화 연결(Hexagon 도메인 매핑)은 에디토리얼 판단의 연장선. 별도 에이전트 분리 시 의사결정 지연 위험. |
| 위험 | 다국어 6개 로케일 이상 확장 시 큐레이션 로드 급증. |
| Tier C 트리거 | 로케일 ≥ 4개 동시 운영 or 자매 도메인(Travel/Literature) 독립 팀 구성 시 전담 Curator hire. |

### 3.3 SEO Agent

| 항목 | 내용 |
|---|---|
| 현재 처리 | Story(Content Specialist) 겸직 (Tier B) |
| 근거 | Story가 메타 작성·내부 링크·self-check #8(ko 본문 ≥ 600자) 등 SEO 핵심 체크를 이미 수행 중. Auditor가 self-check 수치 감사로 보완. |
| 위험 | 기술적 SEO(canonical/hreflang/Schema.org/GSC 모니터링)는 Story의 전문 영역 밖. JAC-1962 GSC 픽업 추적은 현재 수동. |
| Tier C 트리거 | GSC 월 임프레션 ≥ 50만 or 다국어 SEO(hreflang 충돌, locale-specific 캐노니컬) 관리 필요 시 SEO Agent 신규 hire 제안. |
| 임시 보완 | Scout(Research)가 Naver/GSC 데이터 수집, Story가 반영, Auditor가 self-check 검증으로 3-agent SEO 루프 운영. |

### 3.4 Publisher

| 항목 | 내용 |
|---|---|
| 현재 처리 | Forge(DevOps) + n8n 자동화 (이미 운영 중) |
| 근거 | n8n → Cloudflare Pages 자동 배포 파이프라인이 구동 중. Forge가 파이프라인 운영·장애 대응 담당. 인력 Publisher 에이전트 불필요. |
| 위험 | n8n 워크플로 장애 시 배포 중단 → Forge가 단독 병목. |
| 권고 | 자동화 수준 유지. 다만 Forge 부재 시를 위한 failover 절차 문서화 권장. |

---

## 4. Tier C Escalation 후보 요약

CEO 결재 필요 사항:

| 우선순위 | 역할 | 트리거 조건 | 제안 액션 |
|---|---|---|---|
| 1순위 | SEO Agent (신규) | GSC 임프레션 ≥ 50만 / 다국어 SEO 전문화 필요 | 전담 SEO Agent hire. 역할: 기술적 SEO, hreflang, GSC 모니터링, Refresh 전략. |
| 2순위 | Editor (독립) | 헥사곤 ≥ 월 4편 / Echo 에디터-전략 역할 충돌 발생 | Editor 에이전트 신규 hire. Echo는 CMO(전략) 전담으로 재편. |
| 3순위 | Curator (독립) | 로케일 ≥ 4개 / Travel·Literature 독립 팀 | 다국어·도메인 전문 Curator 에이전트. |

현 단계(2026-05-06)에서는 Tier B 겸직 구조로 운영 가능하다고 판단. 위 트리거 조건 충족 시 CEO에게 별도 이슈로 hire 제안 escalate.

---

## 5. 변경 이력

| 일자 | 이슈 | 변경 |
|---|---|---|
| 2026-05-06 | [JAC-2035](/JAC/issues/JAC-2035) | 최초 작성 (Nova, COO) |
