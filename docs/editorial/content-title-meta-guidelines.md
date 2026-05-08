# KStoryWorld Content — Title & Meta Diversity Guidelines

> 모(母) SoT: [`docs/editorial/guideline.md`](./guideline.md) §1 (Tone) · §2 (금지표현) · §3 (번역규칙)
> 본 문서는 **모든 카테고리 리뷰** (`k-drama` / `k-pop` / `k-food` / `k-beauty` / `k-travel` / `k-literature`) + **Hexagons** 의 **제목·메타 다양성 운용 룰** SoT.
> 작성: Echo (CMO) · 2026-05-08 — 초판 (K-Drama A 트랙) · 2026-05-08 scope 확장 (B 부수 패턴 + D 신규 카테고리 사전 룰 + Hexagons)
> 부모 이슈: [JAC-2127](/JAC/issues/JAC-2127) — 자식 [JAC-2128](/JAC/issues/JAC-2128) F1
> 검수 요청: Story (Content Specialist), Auditor (QC)
>
> **파일명 변경 이력**: `kdrama-content-review-guidelines.md` → `content-title-meta-guidelines.md` (2026-05-08, scope 확장으로 일반화).

---

## 0. 왜 이 문서가 필요한가 (배경)

[JAC-2127](/JAC/issues/JAC-2127) AdSense 신뢰 신호 회복 트랙에서 K-Drama 리뷰 61건 단조성이 발견되었다:

- KO 31/31 (100%) `<title>` 어미가 `완벽 가이드`로 동일.
- EN 30/31 (97%) `<title>` 어미가 `Complete Guide and Review`로 동일.
- meta description 첫 어구도 약 40~60% 패턴화.

전수 진단은 [`docs/content/JAC-2127-title-audit.md`](../content/JAC-2127-title-audit.md) 참조.

이 단조성은 두 방향에서 문제가 된다:

1. **AdSense / SEO 측면** — crawler가 동일 어미 31건/30건을 templated/thin content로 분류할 위험. SERP에서 동일 어구가 반복되면 CTR 하락.
2. **에디토리얼 보이스 측면** — `완벽 가이드` / `Complete Guide and Review` 자체가 [`guideline.md`](./guideline.md) §2.5 "클릭베이트 동사" / "리스트 부풀리기" 카테고리에 가깝다. 큐레이션 시점·관찰형 톤(§1.2)과 충돌.

따라서 본 문서는:
- 신규 K-Drama 리뷰 작성 시 강제 참조해야 할 **제목 다양성 룰** (§1).
- 기존 61건 재작성 시 적용할 **5패턴 균등 분배 가이드** (§2).
- **재사용률 < 20% 자체 검수 룰** (§3).
- **n8n / hexagon publish 큐 자동 점검 훅** (§4 — 향후 Auditor 위임).

운영 위치: 본 문서는 `docs/editorial/`에 배치되어 [`guideline.md`](./guideline.md) §1.3 (K-Drama 도메인 톤 변형) 의 **운용 부속서** 역할을 한다.

---

## 1. 제목 다양성 룰 (5 + 1 패턴)

### 1.1 핵심 원칙

- **금지 어구**: K-Drama 리뷰 `<title>` / `<meta description>` / `<h1>`에서 다음 패턴은 사용하지 않는다.
  - KO: `완벽 가이드` (이 어구 자체) · `… 드라마 완벽 가이드` 류 어미
  - EN: `Complete Guide and Review` · `Complete review and guide to ...` 류 시작 / 끝 어구
  - 공통: §2.5 클릭베이트 동사 ("정복하세요", "마스터하세요", "비법 공개", "Ultimate Guide", "Must-Watch") 와 결합 금지
- **필수 요소** (`<title>` 한정):
  1. 작품명 (KO 한글 / EN 공식 영문 — `guideline.md` §3.2)
  2. 작품 고유 식별자 1개 이상 (장르 / 인물 / 핵심 후크 / 소재 / 평가 / 기록 중 1개)
  3. 길이 32~62자 (KO) / 50~70자 (EN) — Google SERP 기준
- **필수 요소** (`<meta description>` 한정):
  1. 작품명 + 1줄 후크 (큐레이션 시점)
  2. 인물·소재·맥락 중 최소 1개 사실 정보
  3. 길이 90~155자 (KO) / 110~160자 (EN) — SERP 잘림 방지
  4. **금지**: `… 드라마입니다` / `is a Korean drama` 류 평서문 단독 종결 (큐레이터 결 부재)

### 1.2 5 + 1 다양화 패턴

다음 5개 주력 패턴을 균등 분배한다 (31건 ÷ 5 ≈ 약 6건씩 + 잔여 1건은 P6 보조 또는 P1~5 자유 선택). 각 작품마다 1패턴 선택 — 동일 작품 KO/EN은 **같은 패턴을 적용**한다 (헥사곤 자매성 유지).

#### P1. 장르·후크형 (Genre · Hook)

장르명 + 작품 고유 후크. 가장 안전·중립. 장르 명확하고 후크가 한 줄로 잡히는 작품에 적용.

- **적용 조건**: 장르가 분명한 작품 (좀비/판타지/오피스 로맨스/범죄/시간여행 등). 후크 어구가 1구절로 압축 가능.
- **KO 예시**: `지금 우리 학교는 — 한 고등학교에 갇힌 좀비 바이러스 12화` *(장르: 좀비 + 후크: 한 고등학교 + 사실: 12화)*
- **EN 예시**: `All of Us Are Dead — Zombie Apocalypse Inside One High School` *(장르 + 후크 + 공간 한정)*
- **금지**: `… 좀비 드라마 완벽 가이드` 류 일반화.

#### P2. 인물·감정형 (Character · Emotion)

주연 배우/캐릭터 + 감정·관계 축. 인물 중심 작품 (로맨스·휴먼드라마·캐릭터 스터디).

- **적용 조건**: 주연 1~2인의 캐릭터·관계가 작품의 중심. 시청 동기가 "배우 보러 들어왔다"인 경우 다수.
- **KO 예시**: `사랑의 불시착 — 현빈과 손예진, 분단을 넘은 사랑의 결` *(배우 + 관계 + 큐레이션 어휘)*
- **EN 예시**: `Crash Landing on You — Hyun Bin and Son Ye-jin, A Romance Across the Border` *(배우 + 정서 축)*
- **금지**: `…주연의 로맨스 드라마` 류 일반화. `완벽한 케미`, `필수 시청` 등 §2.5 클리셰.

#### P3. 시청 후기·평가형 (Verdict · Curator Note)

큐레이터 1.5인칭 시점 + 평가/추천 결. `guideline.md` §1.2 "Curated · Human" 가장 직접 구현.

- **적용 조건**: 명작·재발견 가치가 있는 작품. 시청자에게 "왜 지금 이 작품을 다시 보는가"를 답할 수 있는 경우. 페르소나 echo/sabina/jacky의 톤.
- **KO 예시**: `더 글로리 — 에디터스 데스크가 다시 짚는 복수극의 결` *(에디터 시점 + 작품 위치)*
- **EN 예시**: `The Glory — Why the Editor's Desk Returns to This Revenge Saga` *(왜 다시 보는가 + 큐레이터 시점)*
- **금지**: `필수 시청`, `must-watch`, `you must see`, `정복하세요` 등 §2.5 클릭베이트 동사. 평가는 큐레이터의 **관찰**로 표현 — 명령 금지.

#### P4. 소재·세계관형 (Premise · Worldbuilding)

핵심 설정·세계관 한 줄. 판타지·SF·시대극·하이콘셉트 작품.

- **적용 조건**: 한 줄 logline이 강한 작품 (외계인 로맨스, 영혼 교환, 12번의 환생, 차원 이동 등).
- **KO 예시**: `별에서 온 그대 — 400년 머문 외계인이 내려다본 한 한류스타` *(설정 한 줄)*
- **EN 예시**: `My Love from the Star — A 400-Year-Old Alien and the Hallyu Star He Watches` *(설정 logline)*
- **금지**: 설정만 나열하고 작품 보이스는 사라지는 경우. 큐레이션 결을 1단어라도 끼워 넣을 것.

#### P5. 비교·맥락형 (Context · Cultural Lens)

한국 사회·한류 계보·장르 비교 등 **맥락**을 제목 안에 1줄로 노출. `guideline.md` §1.2 "Context-rich" 직접 구현.

- **적용 조건**: 시대적·사회적 맥락이 작품 해석의 결정적 변수인 작품 (학교폭력, 분단, IMF 트라우마, K-팝 산업 등). 페르소나 hiroshi/alejandra/sabina의 시점.
- **KO 예시**: `오징어 게임 — IMF 세대의 트라우마가 글로벌 MZ에 닿은 순간` *(한국 맥락 + 글로벌 도달)*
- **EN 예시**: `Squid Game — When IMF-Era Korean Trauma Met Global Gen Z` *(맥락 비교 한 줄)*
- **금지**: 맥락이 작품을 가리는 경우 — 작품명이 부제로 밀리지 않도록.

#### P6. 시즌·기록형 (Season · Record) — 보조

회차/시즌/평점/플랫폼 기록을 후크로. 데이터 기반 신뢰 신호 (AdSense에 유리).

- **적용 조건**: P1~5에 잘 안 맞는 작품. 시즌 분할이 의미 있는 작품. 기록·수치가 강한 신뢰 신호인 작품 (Netflix 1위, 8.6/10 등).
- **KO 예시**: `킹덤 — 조선 좀비 2시즌 + 외전 1편, 평점 8.2의 사극 호러` *(기록 + 장르)*
- **EN 예시**: `Kingdom — Two Seasons of Joseon Zombies, Plus One Spin-off (8.2/10)` *(시즌 + 평점)*
- **금지**: 평점/플랫폼만 있고 작품 결이 부재한 경우. **P6는 P1~5 중 1개와 결합** 권장.

### 1.3 패턴 선택 가이드 (페르소나 fit)

[`guideline.md`](./guideline.md) §4.1 페르소나 회전과 정합:

| 패턴 | 1순위 페르소나 | 2순위 페르소나 |
|---|---|---|
| P1 장르·후크 | echo, jacky | sabina |
| P2 인물·감정 | sabina, alejandra | minji, echo |
| P3 시청 후기·평가 | echo, sabina | jacky |
| P4 소재·세계관 | hiroshi, jacky | sabina, echo |
| P5 비교·맥락 | hiroshi, alejandra, sabina | echo, jacky |
| P6 시즌·기록 (보조) | echo, jacky | hiroshi |

> 페르소나 강제(`narrator_persona_slug`)가 명시된 경우 — 패턴 선택은 페르소나 1순위 칸에서 우선 고른다.

### 1.4 카테고리 누적 임계 (B/D 사전 회피 룰)

같은 카테고리 안에서 **하나의 어구 (3음절 이상 / 3단어 이상)** 가 등장하기 시작한 시점부터 다음 임계가 적용된다:

| 카테고리 페이지 수 | 동일 어구 허용 상한 | 비고 |
|---|---|---|
| 1~5 페이지 | 1회 | 다음 발행 시 같은 어구 회피 강제 |
| 6~15 페이지 | 2회 | 카테고리 정착 단계 — 어구 풀 다양화 |
| 16~30 페이지 | 3회 | 운영 안정 — < 20% 자체 검수 |
| 31+ 페이지 | 6회 (KO) / 5회 (EN) | §3 정량 룰과 동일 |

> 적용 단위: `<title>` + `<meta description>` + `<h1>` 합산. 카테고리 = `lib/categories.ts` 의 `REVIEW_CATEGORIES` 6종 + Hexagons 그룹 1.

**현 시점(2026-05-08) 카테고리별 baseline** — [`docs/content/JAC-2127-title-audit.md`](../content/JAC-2127-title-audit.md) §4.4 참조.

---

## 2. 5패턴 균등 분배 (61건 재작성 가이드)

### 2.1 KO 31건 분배 표 (Story KO 자식 input)

| 패턴 | 권장 작품 (KO 31) | 건수 |
|---|---|---|
| P1 장르·후크 | all-of-us-are-dead, kingdom, sweet-home, my-name, extracurricular, bloodhounds | 6 |
| P2 인물·감정 | crash-landing-on-you, descendants-of-the-sun, business-proposal, weightlifting-fairy-kim-bok-joo, hometown-cha-cha-cha, true-beauty | 6 |
| P3 시청 후기·평가 | the-glory, vincenzo, extraordinary-attorney-woo, its-okay-to-not-be-okay, my-demon, whats-wrong-with-secretary-kim | 6 |
| P4 소재·세계관 | my-love-from-the-star, alchemy-of-souls, w-two-worlds, hotel-del-luna, soon-i-will-die, my-holo-love | 6 |
| P5 비교·맥락 | squid-game, goblin, marry-my-husband, king-the-land, love-alarm | 5 |
| P6 시즌·기록 (보조) | flower-of-evil, boys-over-flowers | 2 (잔여) |

> Story 재량으로 ±1~2건 재배정 가능. **단, 한 패턴이 9건을 초과하지 않도록.**

### 2.2 EN 30건 분배 — KO와 동일 패턴 적용

KO/EN은 같은 작품에 같은 패턴을 적용한다 (자매성). EN 30건 = KO 31건 - 1 (`soon-i-will-die-en` 은 이미 다양화된 별도 형식 — Story EN 자식에서 룰 적용 결정).

### 2.3 재작성 시 체크리스트 (Story가 작성 시 따라가는 순서)

각 작품 KO/EN 1쌍 작성 시:

- [ ] 1. 패턴 1개 선정 (§2.1 표 참고).
- [ ] 2. 페르소나 fit 확인 (§1.3 표). 회전 페르소나가 1·2순위에 없으면 패턴 재선정.
- [ ] 3. `<title>` 작성 — 길이 검사 (KO 32~62자 / EN 50~70자).
- [ ] 4. `<meta description>` 작성 — 길이 검사 (KO 90~155자 / EN 110~160자).
- [ ] 5. `<h1>` 작성 — `<title>` 과 동일 어구 50% 이상 중복 금지 (`<h1>` 은 본문 진입의 첫 결).
- [ ] 6. §3 재사용률 셀프 체크 (다음 절).
- [ ] 7. [`guideline.md`](./guideline.md) §2 금지 표현 모두 통과.

---

## 3. 재사용률 < 20% 자체 검수 룰

### 3.1 정량 룰

- **하나의 어구 (3음절 이상 / 3단어 이상)** 가 KO 31건 중 6건 초과로 등장하면 패턴 단조성 회귀로 본다 (≈ 19.4%).
- 동일 어구 사용 상한:
  - KO: 6건 / 31건
  - EN: 5건 / 30건
- 적용 단위: `<title>` + `<meta description>` + `<h1>` 합산.

### 3.2 검수 명령어 권장 (Auditor 위임용)

향후 Auditor(QC) 자식 fan-out 시, 재작성 결과물에 대해 다음을 점검한다:

```bash
# 예시: KO 어구 재사용률 점검
grep -ohE '"[^"]+"' content/reviews/*-ko.html \
  | sort | uniq -c | sort -rn | head -30
```

> 정확한 점검 스크립트는 Auditor 자식에서 별도 작성. 본 문서는 룰만 정의.

### 3.3 정성 룰 (Echo/Story 자체)

- 같은 작품 KO/EN 1쌍 안에서 후크 어구가 직역/대응되어야 함 (큐레이션 결의 자매성).
- 시리즈 전체 (31작품)에서 **동일 형용사 반복** 점검 (예: "감동적인" / "captivating" 이 6건 초과 시 회수).

---

## 4. 운영 정합 (Workflow / Hexagon)

### 4.1 신규 K-Drama 리뷰 작성 시

`board-routine/kdrama-kickoff.sh` (n8n 트리거) 워크플로 prompt 안에 본 문서 §1.2 5+1 패턴을 inline 인용한다.

> 현 시점 (2026-05-08) workflow JSON은 remote-only ([memory: project_n8n_workflows_remote_only](`~/.claude/projects/.../memory/project_n8n_workflows_remote_only.md`)). 변경은 caller 측 `kdrama-kickoff.sh` 에서 수행 — 본 문서 §1.2 발췌를 prompt 본문에 붙여넣기.

### 4.2 hexagon publish 큐

[`docs/editorial/k-drama-revamp-queue.md`](./k-drama-revamp-queue.md) (top-5 가필 큐) 진행 시, 본 문서 §1 룰을 가필 결과물의 `<title>`/`<meta>` 에 강제 적용한다.

### 4.3 Distribution Playbook (JAC-2043)

Threads/X/Newsletter SEO Refresh 시, K-Drama 글의 외부 발신 캡션도 동일 5패턴 풀에서 변형한다 (한 채널 안에서 같은 패턴 연속 2건 금지).

---

## 5. B. 부수 단조 패턴 처리 (K-Beauty / K-Food / K-Pop EN)

### 5.1 KO 단조 어구 (사전 회피 + 재작성)

K-Drama 트랙(A) 같은 시스템 단조(100% 점유)는 아니나, **카테고리 누적 임계 §1.4 룰을 발동**한다. [`docs/content/JAC-2127-title-audit.md`](../content/JAC-2127-title-audit.md) §4.1 표 참조.

| 어구 | 카테고리 | 점유 | 처리 |
|---|---|---|---|
| `완전 정복` (어미) | K-Beauty / K-Food | 2 페이지 | **B1·B2 재작성** + 신규 발행 시 회피 |
| `완성법` (어미) | K-Beauty | 1 페이지 | **B3 재작성** + 신규 발행 시 회피 |
| `비결` (어미) | K-Beauty | 1 occurrence (B1 중복) | B1 재작성으로 동시 해소 |

**금지 어구 (KO 신규 발행 시 차단)**: `완전 정복` · `완성법` · `완벽 정복` · `완벽 가이드` · `정복하세요` · `마스터하세요` · `비법 공개` · `비결` (어미 단독 사용) · `핵심 정리` (어미). 본 어구를 후크의 일부로 쓸 수는 있으나 **`<title>` 어미·`<h1>` 종결어** 위치 사용은 차단한다.

### 5.2 EN 모니터 어구

EN 측은 카테고리당 1회 등장 단계로, **다음 발행 시 같은 어구 회피** 강제로 충분 (재작성 즉시 발동 아님).

| 어구 | 카테고리 | 점유 | 처리 |
|---|---|---|---|
| `Decoded` (`<title>` 어미·중간) | K-Pop | 1 페이지 (B4) | 모니터 — 다음 K-Pop 발행 시 회피 |
| `Explained` (`<title>` 어미) | K-Food | 1 페이지 (B5) | 모니터 — 다음 K-Food 발행 시 회피 |
| `mastering` (meta 안) | K-Beauty | 1 occurrence (B6) | 모니터 — 다음 K-Beauty 발행 시 회피 |
| `Secret to` (`<title>` 안) | K-Beauty | 1 페이지 (B3 EN) | 모니터 — 같은 카테고리 누적 시 회수 |

**EN 권고 어구 풀** (5+1 패턴 적용 변형):
- P1 장르·후크: `… Inside [공간]`, `A [Adjective] [Genre] from Korea` (e.g. `A Quiet Beauty Routine from Seoul`)
- P3 시청 후기: `Why the Editor's Desk Returns to …` (K-Drama 외 카테고리에선 `Why We Keep Coming Back to …`)
- P4 소재·세계관: `[Premise Logline]` 형태 (e.g. `From Seoul to South Africa: The Glass Skin Routine`)
- P5 비교·맥락: `When [한국 맥락] Met [글로벌 도달]`
- P6 시즌·기록: `[Year] / [Region] / [Rating]` 데이터 후크

### 5.3 B 트랙 재작성 우선순위

1. **B1 (glass-skin-ko)** — `완전 정복` + `비결` 이중 단조 → 우선순위 1
2. **B2 (hanjeongsik-ko)** — K-Food 진입점 페이지로서 P4 소재·세계관형 적용
3. **B3 (mlbb-ko)** — sabina 페르소나 P3 시청 후기·평가형 적용

EN 3건(B4·B5·B6)은 즉시 재작성 아님 — Auditor 모니터 큐 등록.

---

## 6. D. 신규 카테고리 사전 가이드라인 (K-Travel / K-Literature / Hexagons)

신규 카테고리는 **콘텐츠가 채워지기 전에 룰을 사전 확보**한다 — K-Drama처럼 31건 풀에 같은 어미가 굳어진 뒤 회복하는 비용을 지불하지 않는다.

### 6.1 K-Travel — 여행 카테고리 사전 룰

`content/travels/` (현 시점 0건). 향후 발행 시:

- **권장 패턴 (각 카테고리 발행 시 5+1 풀에서 균등 분배)**:
  - P1 장르·후크: `[명소명] — [한 줄 후크]` (e.g. `쁘띠프랑스 — 별에서 온 그대 도민준의 책장이 다시 펼쳐지는 자리`)
  - P2 인물·감정: 큐레이션 페르소나(jacky/sabina) 1.5인칭 후기형
  - P4 소재·세계관: 촬영지·문학 레퍼런스·한국 사회 맥락 1줄
  - P5 비교·맥락: `[한국 명소] vs [글로벌 익숙한 비교지]` 비교 후크
- **금지 어구 (사전 차단)**:
  - KO: `완벽 코스`, `완벽 여행`, `완전 정복`, `필수 코스`, `머스트 비짓`, `여행 비결`, `… 여행지입니다` (평서문 단독)
  - EN: `Ultimate Travel Guide`, `Must-Visit`, `Complete Travel Guide`, `Essential [City] Guide`, `Bucket List`
- **카테고리 누적 임계**: §1.4 표 그대로 — 1~5 페이지 단계에선 동일 어구 1회만 허용.
- **헥사곤 자매 카드 (k-travel sister)**:
  - K-Drama 앵커가 있는 헥사곤 매니페스트의 `sisters[].domain == 'k-travel'` 카드 title은 **앵커 작품 촬영지·문학 레퍼런스 한 줄**로 — 일반 명소 소개 아님 (헥사곤 안에서만 가능한 큐레이션 가치).

### 6.2 K-Literature — 문학 카테고리 사전 룰

`content/literatures/` (현 시점 0건). 향후 발행 시:

- **권장 패턴**:
  - P3 시청 후기·평가 → 독서 후기형: `[작품] — 에디터스 데스크가 다시 꺼낸 [한 줄 평가]`
  - P4 소재·세계관: `[책 제목] — [작가] [년도] [한 줄 logline]`
  - P5 비교·맥락: 한국 문학사 / 작가 계보 / 세계 문학과의 비교
- **금지 어구 (사전 차단)**:
  - KO: `완벽 가이드`, `필독서`, `명작 정복`, `반드시 읽어야 할`, `… 책입니다` (평서문 단독), `독서 비결`
  - EN: `Must-Read`, `Essential Reading`, `Complete Reading Guide`, `Top X Korean Books You Must Read`, `The Best of Korean Literature`
- **번역 룰 강조** (`guideline.md` §3 본문):
  - 작품명·작가명은 **공식 번역본 표기** + 원문 한자/한글 병기. 임의 의역 금지.
  - K-Lit는 K-Drama보다 페르소나 1.5인칭 (echo/sabina) 비중을 높인다 — `guideline.md` §1.2 큐레이션 결이 강한 카테고리.
- **헥사곤 자매 카드 (k-literature sister)**:
  - 앵커 K-Drama 작품의 인물·세계관과 연결되는 책 1권을 큐레이션. 일반 추천 도서 리스트 형태 금지.

### 6.3 Hexagons — 헥사곤 매니페스트 단조 회피 룰

[`scripts/lib/hexagon-rules.mjs`](../../scripts/lib/hexagon-rules.mjs) 의 매니페스트는 K-Drama 앵커 1 + 5 sister 카드(k-food/k-pop/k-beauty/k-travel/k-literature)로 구성된다. 각 매니페스트 안의 6개 카드 + 매니페스트 자체 title이 **하나의 큐레이션 단위**.

- **매니페스트 단위 룰**:
  - 한 매니페스트 안에서 sister 6개 카드의 `<title>`/`description` 어구가 **서로 같은 어구 2회 이상 반복 금지**. (e.g. 6개 카드가 모두 `... Decoded` 어미면 차단.)
  - 앵커 K-Drama 카드의 title 어미가 sister 카드의 어미와 같으면 차단 (e.g. 앵커 `… 완벽 가이드` + sister `… 완벽 가이드` 조합).
- **카테고리 횡단 누적 룰**:
  - sister 카드 풀(k-food/k-pop/k-beauty/k-travel/k-literature) 각 도메인의 카테고리 누적 임계(§1.4)에 카운트한다 — 헥사곤 안의 sister 카드도 일반 리뷰와 동일한 카테고리 풀 멤버.
- **시각 결 일관성** (참조: [`kstoryworld-design`](#) 스킬 — 사계 컬러 시스템 봄·여름·가을·겨울):
  - 헥사곤 매니페스트의 `seasonal_tone` 이 `spring/summer/fall/winter` 중 하나로 강제 (`hexagon-rules.mjs` §VALID_TONES). title/meta의 톤도 계절 결과 일치 — 봄(밝은 후크) / 가을(중후한 큐레이션) 등.
- **헥사곤 매니페스트 발행 점검**: `scripts/validate-hexagon.mjs` 가 카테고리 누적 임계까지 자동 점검하도록 향후 확장 (Auditor 자식 fan-out 시 RFE).

### 6.4 D 적용 시점

- K-Travel / K-Literature 첫 발행 시 본 §6.1 / §6.2 룰을 **n8n workflow prompt에 inline 인용**한다 (caller 측 kickoff.sh 본문에 발췌).
- 헥사곤은 다음 매니페스트 발행 시(현재 큐: [`docs/editorial/k-drama-revamp-queue.md`](./k-drama-revamp-queue.md)) §6.3 매니페스트 단위 룰 적용.

### 6.5 카테고리별 후크 어휘 + KO/EN 1쌍 예시

§6.1 / §6.2 의 권장 패턴을 5+1 패턴 (§1.2) 위에 얹어 카테고리별 후크 어휘를 명시한다 — Story 가 첫 발행 시 즉시 끌어 쓸 수 있도록.

#### 6.5.1 K-Travel — 후크 어휘 매핑 (지역 · 계절 · 체험)

| 후크 축 | KO 어휘 풀 | EN 어휘 풀 |
|---|---|---|
| 지역 | "동네", "골목", "구(區)", "[지역명] 사람들이" | "neighborhood", "back streets of [Region]", "locals' route" |
| 계절·절기 | "단풍 절정 7일", "장마 끝자락", "한식날 전후", "이른 봄 매화" | "first week of cherry blossoms", "late-monsoon Seoul", "winter market days" |
| 체험·일정 | "1박 코스", "도보 동선", "카페 루트", "주말 당일치기" | "overnight route", "walking course", "weekend day-trip" |

> 페르소나 1순위 — **yuna · sabina · jacky · echo** ([`guideline.md`](./guideline.md) §1.3).

**KO 1쌍 (P1 장르·후크 적용)**:
- `<title>`: `쁘띠프랑스 — 별그대 도민준의 책장이 펼쳐지는 가평 1박 도보 코스` *(38자 / 명소 + 앵커 인용 + 코스)*
- `<meta description>`: `별에서 온 그대 촬영지인 가평 쁘띠프랑스에서 남산타워까지 1박 2일. 거주자 시선으로 도보 동선·카페·계절 후크를 큐레이션 노트로 정리합니다.` *(73자 / 후크 + 거주자 시점 + 큐레이션 결)*

**EN 1쌍 (P1 장르·후크 적용)**:
- `<title>`: `Petite France — The Layover Where Do Min-joon's Bookshelf Re-Opens (Gapyeong Walk)` *(80자 / 명소 + 앵커 인용 + 동선)*
- `<meta description>`: `An overnight walking route from Petite France in Gapyeong to Namsan Tower, retracing My Love from the Star locations through a local resident's eyes.` *(150자 / 후크 + 인사이더 시점)*

#### 6.5.2 K-Literature — 후크 어휘 매핑 (작가 · 시대 · 장르)

| 후크 축 | KO 어휘 풀 | EN 어휘 풀 |
|---|---|---|
| 작가·시대 | "1936년", "[작가] 의 마지막 작품", "근대 시 3편" | "1936 first edition", "the author's last book", "three modern poems" |
| 장르·형식 | "단편 5편", "고전 4선", "희곡 한 장" | "five short stories", "four classics", "one act of a play" |
| 번역·문화차 | "원문 vs 번역", "한·일 같은 모티프", "작가의 한자 사용" | "original vs translation", "the same motif in Japanese", "the author's hanja choices" |

> 페르소나 1순위 — **hiroshi · sabina · echo** ([`guideline.md`](./guideline.md) §1.3 — `category_fit[k_literature]` 0인 minji/cheolsu/yuna는 강제로도 사용 불가).

**KO 1쌍 (P5 비교·맥락 적용)**:
- `<title>`: `도민준의 책장 — 한국 고전 4선과 400년을 머문 자의 시간 감각` *(34자 / 작품 + 작품 인용 + 큐레이터 결)*
- `<meta description>`: `별에서 온 그대 도민준의 책장에 꽂힌 4편(구운몽·홍길동전·심청전·춘향전)을 원문 결로 다시 읽습니다. 작가 시대와 인물의 시간 감각을 잇는 큐레이션 노트.` *(82자 / 작품 4선 + 시대 + 큐레이터 결)*

**EN 1쌍 (P5 비교·맥락 적용)**:
- `<title>`: `Do Min-joon's Bookshelf — Four Korean Classics Through a 400-Year-Old's Eyes` *(76자 / 인물 + 작품 4선 + 비교 결)*
- `<meta description>`: `Reading the four Korean classics on Do Min-joon's shelf — Guunmong, Hong Gildong, Sim Cheong, Chunhyang — through a centuries-old narrator's frame, with translation notes.` *(159자 / 작품 4선 + 큐레이션 + 번역 결)*

> **금지 재확인**: K-Literature 본문의 학술 논문 톤("본 논문은 …를 분석한다") · 일반론("한국 문학의 정수") 은 [`guideline.md`](./guideline.md) §2.5 클리셰 + §1.2 Curated 톤 위반.

### 6.6 Hexagon — 6각형 narrative 매핑 + 헥사곤 1쌍 예시

#### 6.6.1 6각형 면(face) ↔ 5+1 패턴 권장 default

헥사곤 = 앵커 K-Drama 1 + 자매 5([`_schema.yaml`](../../content/hexagons/_schema.yaml)). 6편이 한 단위로 publish 되므로, 6편 간 패턴 분포가 **자매성 + 다양성**을 동시에 만족해야 한다 — 6편 모두 같은 패턴은 단조, 6편 모두 다른 패턴은 자매성 약화.

| 면 | 도메인 | 권장 default 패턴 | 후크 결 (헥사곤 모드) |
|---|---|---|---|
| 1 (앵커) | k-drama | P4 소재·세계관 | 작품 logline 자체 |
| 2 | k-food | P1 장르·후크 | 작품 속 음식 1개 + 한국 음식 카테고리 후크 |
| 3 | k-pop | P6 시즌·기록 | OST/삽입곡 1곡 + 차트·연도 |
| 4 | k-beauty | P2 인물·감정 | 작품 속 룩 1개 + 트렌드 어휘 |
| 5 | k-travel | P1 장르·후크 | 작품 촬영지 1곳 + 동선 어휘 (§6.5.1) |
| 6 | k-literature | P5 비교·맥락 | 작품 속 책장/대사 1편 + 문학사 어휘 (§6.5.2) |

> **자매성 룰**: 앵커 + 자매 1개 이상이 같은 패턴(여기선 P1 — k-food/k-travel) 또는 페르소나 1순위가 같으면 자매성 신호로 인정. 6편이 6개 다른 패턴이면 default 매핑 내에서 1쌍을 align (예: k-pop → P5 로 재배정해 hiroshi/alejandra 페르소나 결을 k-literature 와 align).

#### 6.6.2 헥사곤 매니페스트 단위 단조 회피 (§6.3 보강)

§6.3 의 "매니페스트 단위 룰" 을 정량화한다:

- **동일 패턴 ≥ 3편 금지** (6편 중 P1·P1·P1·P2·P3·P4 같은 분포는 차단). 이상적 분포는 **2-2-1-1** 또는 **3-1-1-1** 까지.
- **동일 어구 ≥ 2회 금지** (앵커 + 자매 어미가 같으면 자매성이 아니라 단조).
- 본 룰은 §6.7 hook 위치에서 자동 점검한다.

#### 6.6.3 헥사곤 1쌍 (`my-love-from-the-star`, KO/EN)

[`content/hexagons/my-love-from-the-star.yaml`](../../content/hexagons/my-love-from-the-star.yaml) — 첫 헥사곤 큐 ([JAC-1899](/JAC/issues/JAC-1899) drip-publish 큐 헤드).

**앵커 (k-drama, P4 소재·세계관)**:
- KO `<title>`: `별에서 온 그대 — 400년 머문 외계인이 내려다본 한 한류스타`
- EN `<title>`: `My Love from the Star — A 400-Year-Old Alien and the Hallyu Star He Watches`

**자매 1 (k-food, P1 장르·후크)**:
- KO `<title>`: `첫눈 치맥 — 별그대 천송이가 만든 한국 야식의 글로벌 전염`
- EN `<title>`: `Chimaek — How My Love from the Star Globalized a Korean Late-Night Ritual`

**자매 2 (k-pop, P6 시즌·기록)**:
- KO `<title>`: `Lyn — My Destiny, 별그대 OST가 2014 가온차트에 남긴 결`
- EN `<title>`: `Lyn — My Destiny: The OST That Anchored the 2014 Korean Chart`

**자매 3 (k-beauty, P2 인물·감정)**:
- KO `<title>`: `천송이 립 컬러 — 별그대가 중국 매장 카운터에 남긴 한 시즌`
- EN `<title>`: `Cheon Song-yi's Lip — The Hallyu Star Trend That Reshuffled Beijing Counters`

**자매 4 (k-travel, P1 장르·후크 — §6.5.1 후크 어휘)**:
- KO `<title>`: `쁘띠프랑스 & 남산타워 — 별그대 1박 도보 코스, 가평·남산·한강`
- EN `<title>`: `Petite France & Namsan Tower — A Day-and-Night Walking Route from My Love from the Star`

**자매 5 (k-literature, P5 비교·맥락 — §6.5.2 후크 어휘)**:
- KO `<title>`: `도민준의 책장 — 한국 고전 4선과 400년을 머문 자의 시간 감각`
- EN `<title>`: `Do Min-joon's Bookshelf — Four Korean Classics Through a 400-Year-Old's Eyes`

**패턴 분포 점검**: P1×2 (k-food, k-travel) · P2×1 · P4×1 · P5×1 · P6×1 = 6편 5패턴 (3-1-1-1-1 안에 들어옴). 동일 어구 분포 0건. §6.6.2 통과.

> 본 6쌍은 **참고 예시** 이며, 자매 article 의 실제 `<title>` 은 Story 자식이 작품·페르소나·계절 후크에 맞춰 다듬는다.

### 6.7 publish-time 사전 검사 hook 위치 (kdrama-kickoff 패턴 준용)

신규 카테고리 publish 시 본 §6 룰이 자동으로 걸리도록 hook 위치를 확정한다:

#### 6.7.1 K-Travel / K-Literature kickoff.sh (현재 미존재)

`board-routine/kdrama-kickoff.sh` 와 동일 패턴으로 신설 시:

```
board-routine/
├── kdrama-kickoff.sh      ✓ 존재
├── kbeauty-kickoff.sh     ✓ 존재
├── kfood-kickoff.sh       ✓ 존재
├── kpop-kickoff.sh        ✓ 존재
├── ktravel-kickoff.sh     ⨯ 신설 (§6.5.1 + §6.1 prompt inline 인용)
└── kliterature-kickoff.sh ⨯ 신설 (§6.5.2 + §6.2 prompt inline 인용)
```

> **운영 메모**: n8n workflow JSON 자체는 remote-only ([memory: project_n8n_workflows_remote_only](`~/.claude/projects/-Users-jackykim-project-JackyLabs-kstoryworld/memory/project_n8n_workflows_remote_only.md`)). 패턴 prompt 발췌는 caller 측 kickoff.sh 본문에 inline 인용 — 본 문서를 SoT 로 import 한다.

신설 시점은 본 자식 비포함 — K-Travel/K-Literature 첫 발행 결정이 보드에 올라올 때 별도 child issue (Story 위임).

#### 6.7.2 Hexagon publish — 매니페스트 단조 검사 (§6.6.2)

[`scripts/lib/hexagon-rules.mjs`](../../scripts/lib/hexagon-rules.mjs) 가 hexagon 검증 SoT (JAC-2051 §c1). [`scripts/validate-hexagon.mjs`](../../scripts/validate-hexagon.mjs) (bulk) + [`scripts/validate-hexagon-pr.mjs`](../../scripts/validate-hexagon-pr.mjs) (per-PR gate) 가 import.

§6.6.2 매니페스트 단위 패턴 단조 검사 hook 추가 위치 (RFE — Cortex 합의 후 별도 child):

```js
// scripts/lib/hexagon-rules.mjs — proposed addition
export function validateTitlePatternSpread(manifest) {
  // 6편의 title pattern (P1~P6) 분포 + 동일 어구 점검
  // 같은 패턴 ≥ 3편 또는 동일 어구 ≥ 2회 시 errors push
  // 본 문서 §6.6.2 룰 직역
}
```

> **본 자식(JAC-2133) 비포함**: 코드 추가는 JAC-1899 land 후 첫 헥사곤 (`my-love-from-the-star`) publish 시 Cortex 와 별도 child 로 합의. 룰 자체는 본 §6.6.2 에서 SoT 확보.

#### 6.7.3 Distribution Playbook (JAC-2043) §4.3 연장

§4.3 (Threads/X/Newsletter SEO Refresh) 룰을 신규 카테고리로 연장:

- K-Travel / K-Literature 외부 발신물도 본 문서 §6.5 후크 어휘 + 5+1 패턴 풀 사용. 채널당 동일 패턴 연속 2건 금지.
- 헥사곤 외부 발신물(6편 묶음 announcement) 은 §6.6.2 매니페스트 단조 회피 룰 적용 — 6편 caption 이 같은 패턴이면 자매 결이 아니라 단조 신호.

### 6.8 JAC-1899 헥사곤 publish 큐 — 의존성 정리 결과

[JAC-1899](/JAC/issues/JAC-1899) (헥사곤 drip-publish 큐 — 1일 1~2건 cadence + AdSense 대응):

- **owner**: **Cortex (AI Engineer)** (`ce395ca2-84bf-419c-9bf2-ce2770b103cc`).
- **현 상태**: `in_review` (medium priority).
- **의존 관계** (JAC-2127 / 본 자식 → JAC-1899):
  - 본 §6 (특히 §6.6 / §6.7.2) 가 JAC-1899 큐의 첫 헥사곤 publish 시 검사 룰을 정의한다.
  - JAC-1899 가 land 되면 헥사곤 큐 cadence가 가동 — 첫 publish 결과의 패턴 분포를 Echo + Cortex 가 1회 review 후 §6.6.2 임계 미세조정.

#### 6.8.1 가이드라인 적용 시점 — Echo·Cortex·Jacky 합의 (제안)

| 단계 | 시점 | 책임 | 산출물 |
|---|---|---|---|
| 1. 룰 land | 본 PR (JAC-2128 + JAC-2133 번들) | Echo | 본 문서 §6 — 즉시 효력 |
| 2. 첫 헥사곤 publish 자체 검수 | JAC-1899 land 후 즉시 | Cortex (publish 실행) + Echo (검수) | `my-love-from-the-star` 6편의 title 패턴 분포 보고 + §6.6.2 통과 여부 |
| 3. 패턴 단조 검사 코드화 | 2 단계 후 | Cortex (코드) + Echo (룰 합의) | `scripts/lib/hexagon-rules.mjs` 에 `validateTitlePatternSpread` 추가 (별도 child) |
| 4. 정기 운영 | 코드화 land 후 | Cortex (publish gate) | 모든 헥사곤 PR 에 매니페스트 단조 검사 자동 적용 |

> **Jacky 명시 요구 항목**: 본 합의 시점은 사전 룰만 land 하고, 코드 hook은 첫 헥사곤 실측 결과를 본 후 추가 — 자동화를 미리 짜지 않고 실데이터 1회 후 임계 조정. JAC-2127 코멘트로 전파.

#### 6.8.2 본 자식(JAC-2133) 비포함 항목

- `scripts/lib/hexagon-rules.mjs` 코드 변경 — JAC-1899 의 다음 child 로 위임.
- `board-routine/ktravel-kickoff.sh` / `kliterature-kickoff.sh` 신설 — K-Travel/K-Literature 첫 발행 결정 시 Story child 로 위임.
- hexagon publish 큐 cadence 변경 — JAC-1899 자체 범위.

---

## 7. DoD (본 문서 자체 — JAC-2128 F1 + JAC-2133 F6)

- [x] 5+1 다양화 패턴 정의 (§1.2)
- [x] 페르소나 fit 매트릭스 (§1.3)
- [x] 카테고리 누적 임계 (§1.4) — B/D 사전 회피 룰
- [x] 61건 5패턴 분배 표 (§2.1)
- [x] 재사용률 < 20% 정량 룰 (§3.1)
- [x] [`guideline.md`](./guideline.md) §2 금지 표현 cross-reference (§1.1, §1.2 P3, §5.1)
- [x] 운영 정합 (n8n / hexagon / distribution) (§4)
- [x] **B 부수 패턴 처리** — KO 4 occurrence (3페이지) 재작성 + EN 3 monitor (§5)
- [x] **D 신규 카테고리 사전 룰** — K-Travel / K-Literature / Hexagons (§6.1–§6.4)
- [x] **F6 KO/EN 1쌍 예시** — K-Travel · K-Literature · Hexagon 6쌍 (§6.5 / §6.6.3)
- [x] **F6 6각형 narrative 매핑** (§6.6.1–§6.6.2)
- [x] **F6 publish-time hook 위치 명시** (§6.7 — kickoff.sh 신설 위치 + `hexagon-rules.mjs` 확장 지점)
- [x] **F6 JAC-1899 의존성 정리** — Cortex owner + 4 단계 합의 제안 (§6.8)
- [ ] Story (Content Specialist) 검토 — 재작성 자식 fan-out 전 1회
- [ ] Auditor (QC) 검토 — 재사용률 검수 스크립트 정의 후
- [ ] Cortex (AI Engineer) 합의 — §6.8.1 4단계 시점·산출물 (JAC-2127 코멘트 회신)

---

## 8. 변경 이력

| 일자 | 이슈 | 변경 |
|---|---|---|
| 2026-05-08 | JAC-2128 F1 | 신규 작성. K-Drama 리뷰 61건 단조성 회복 룰 + 5+1 패턴 + 재사용률 룰 정의 (Echo, CMO). |
| 2026-05-08 | JAC-2128 F1 (scope 확장) | (1) 파일명 일반화: `kdrama-content-review-guidelines.md` → `content-title-meta-guidelines.md`. (2) §1.4 카테고리 누적 임계 추가. (3) §5 B 부수 패턴 (K-Beauty/K-Food KO 4 + EN 3 monitor) 추가. (4) §6 D 신규 카테고리 사전 룰 (K-Travel / K-Literature / Hexagons) 추가. (Echo, CMO) |
| 2026-05-08 | JAC-2133 F6 | §6 보강: §6.5 카테고리별 후크 어휘 매핑 + KO/EN 1쌍 예시 (K-Travel · K-Literature 각 1쌍). §6.6 헥사곤 6각형 narrative 매핑 + 매니페스트 단조 회피 정량화 + 헥사곤 1쌍 (`my-love-from-the-star` 앵커+자매 5편). §6.7 publish-time 사전 검사 hook 위치 (kickoff.sh 신설 위치 + `scripts/lib/hexagon-rules.mjs` `validateTitlePatternSpread` RFE). §6.8 JAC-1899 (Cortex) 의존성 정리 + 4단계 합의 제안. (Echo, CMO) |
