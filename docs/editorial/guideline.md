# KStoryWorld Editorial Guideline

> 미션: **"한국의 모든 이야기를, 그 이야기가 마땅히 받아야 할 결로 들려준다."**
>
> 본 문서는 KStoryWorld의 Tone · 금지 표현 · 번역 규칙 · Persona 기준을 정의하는 1차 SoT입니다.
> 콘텐츠 생산 게이트(`docs/content-creation-rules.md`)는 본 가이드라인의 운영 정의를 따릅니다.
> 충돌 시 본 가이드라인이 **편집 방향성**, 콘텐츠 제작 규칙이 **검수 게이트**를 결정합니다.
>
> 작성: Echo (CMO) / 검토: Story (Content Specialist) / 최초 발행: 2026-05-06 (JAC-2040)
> 부모: [JAC-2030](../운영점검제안.md) §10-1 — 자매: Distribution Playbook (JAC-2043, 톤 정합 필수)

---

## 0. 한 장 요약 (Reference Card 자체 인용 가능)

| 영역 | 규칙 |
|---|---|
| 미션 1줄 | 한국의 모든 이야기를, 그 이야기가 마땅히 받아야 할 결로 들려준다 |
| 톤 4원칙 | (1) Curated 큐레이션 시점 · (2) Observational 관찰형 · (3) Context-rich 맥락 동반 · (4) Human 에디터 1인칭 흔적 |
| 발행 언어쌍 | ko + en 동시 발행 (의무) — ja/zh-Hans/zh-Hant/es/fr/vi 토큰만 준비, 본문 발행은 별도 결정 |
| AI 티 금지 | `AI(-\| )(generated\|curated\|powered)` · `AI가 정리` · `자동 생성 콘텐츠` · `Generated:` |
| 마크다운 굵게 금지 | `**…**` 패턴 0건 (코드 펜스 예외) — `<strong>` HTML은 허용 |
| 의료/효능 단정 금지 | `발암 / 의료사고 / 치료해 드립니다 / 완치 / 부작용 없음` · `에 좋다 / 를 낫게 해 / 을 없애준다` |
| 클리셰 금지 | "필수템" / "안 사면 후회" / "역대급" / "찐" 남발 / "K-스러운" / "정복하세요" 등 (§2.5) |
| 정치·종교·차별 | 당파성·종교 차별·민족 차별 표현 0건 (§2.6) |
| 고유명사 처리 | 인명·아이돌·작품명: 공식 영문 표기 우선 / 음식·복식·문화 어휘: 음차 + 1회 영문 설명 (§3.2) |
| 존댓말/반말 | ko 본문은 페르소나 voice_tone에 맡김 (반말은 minji/yuna만 허용) — 메타·CTA는 존댓말 (§3.3) |
| 페르소나 회전 | 8인 confirmed 풀 (sabina · jacky · minji · hiroshi · alejandra · cheolsu · yuna · echo) — `date +%j % 8` 결정성 회전 (§4.1) |
| 페르소나 강제 | webhook body `narrator_persona_slug` 명시 시 회전 무시 |
| 자체 검증 | 모든 외부 발신물은 Echo 톤 검수 → Story 번역 검수 → Auditor(QC) 게이트 |

---

## 1. Tone (브랜드 보이스)

### 1.1 미션 문장 풀이

> 한국의 **모든 이야기를** — 드라마·팝·푸드·뷰티·여행·문학을 가리지 않고
> 그 이야기가 **마땅히 받아야 할 결로** — 클릭베이트도, 학술 논문도 아닌, 큐레이터의 결로
> **들려준다** — 일방 송신이 아닌, 독자에게 직접 말 걸기

KStoryWorld는 SEO 블로그가 아니라 **큐레이션 기반 K-Culture Editorial Media**다. 모든 문장은 "이걸 읽는 외국인 독자가 한국 문화 한 겹을 더 이해하게 되는가?"라는 질문을 통과해야 한다.

### 1.2 톤 4원칙

| 원칙 | 의미 | Do | Don't |
|---|---|---|---|
| Curated | 큐레이션 시점 — "에디터들이 골랐다" | "이번 주 우리 에디터스 데스크가 고른 건…" | "오늘 가장 핫한 OOO TOP 10!" |
| Observational | 관찰형·맥락형 | "팬들 사이에서 회자되는 한 장면이 있다" | "당신이 반드시 봐야 할 명장면" |
| Context-rich | 한국 문화 맥락 동반 | "추석 연휴를 앞둔 가족 식탁의 풍경에서 시작한다" | "매우 한국적인 음식이다" |
| Human | 에디터 1인칭 흔적 | "12년 동안 카테고리를 가로질러 본 입장에서" | "본 콘텐츠는 OO를 다룬다" |

### 1.3 도메인별 톤 변형

| 도메인 | 톤 결 | 핵심 어휘 | 추천 페르소나 (1=주력) |
|---|---|---|---|
| K-Drama | 영상 비평가 + 팬덤 큐레이터의 1.5인칭 | "장면", "결", "시선", "해석" | sabina, hiroshi, echo, jacky |
| K-Pop | 댄스 플로어 + 차트 데이터의 결합 | "트랙", "퍼포먼스", "팬덤 통계" | alejandra, hiroshi, echo, minji |
| K-Food | 셰프의 craft + 가족 식탁의 정서 | "발효", "손맛", "지역성", "절기" | cheolsu, jacky, echo |
| K-Beauty | 일상 자기관리 (의료 단정 금지) | "루틴", "결", "톤", "레이어링" | minji, echo |
| K-Travel | 동네 거주자의 시선 (관광지 X) | "동네", "골목", "지속가능성" | yuna, sabina, jacky, echo |
| K-Literature | 문화 해석 + 작품 인용 | "상징", "맥락", "원문", "번역의 결" | hiroshi, sabina, echo |

### 1.4 로케일별 톤 변형

#### 발행 의무 (ko + en)

| 로케일 | 톤 | 주의 |
|---|---|---|
| ko | 페르소나 voice_tone.ko 적용 — 큐레이션 시점, 맥락 우선 | "K-스러운" 자기 지시 표현 금지 |
| en | 페르소나 voice_tone.en 적용 — 외국 독자에게 한국 맥락을 1줄로 보충 | 자기 비하("Just a small Korean blog") 금지 |

#### 향후 확장 (디자인 시스템 토큰 준비됨, 본문 발행은 보드 결정 후)

| 로케일 | 톤 방향 (계획) | Story 위임 시 |
|---|---|---|
| ja | 정중·정확, 일본 시청자 맥락 보충 (hiroshi 시점 활용 가능) | 별도 child issue 발행 시 Story가 ja 스타일 가이드 작성 |
| zh-Hans / zh-Hant | 간체·번체 분리, 대륙·홍콩·대만 팬덤 맥락 분리 | 동일 |
| es | 라틴 팬덤 시점 (alejandra 활용) | 동일 |
| fr | 유럽 K-Pop·K-Cinema 팬 시점 | 동일 |
| vi | 동남아 한류 시점 — 일상 자기관리 ↔ 가족 정서 균형 | 동일 |

> **현재 운영 결정:** ko + en 외 6개 로케일 본문 발행은 보드 결정 전. 본 가이드라인은 base rules만 정의하고, 발행 결정 시 Story가 로케일별 style addendum을 추가한다 (별도 child issue).

### 1.5 페르소나 voice_tone 우선순위

본문 톤 적용 순서는 다음과 같다:

1. **페르소나 voice_tone** (가장 강함) — 8인 중 회전·강제 선택된 1명의 ko/en 톤
2. **도메인 톤 변형** (§1.3)
3. **톤 4원칙** (§1.2)
4. **금지 표현** (§2) — 절대 우선

페르소나가 §1.3 도메인 톤과 충돌하면 **페르소나 우선**, 단 §2 금지 표현은 페르소나도 위반 불가.

---

## 2. 금지 표현 (Forbidden Patterns)

### 2.1 AI 자동생성 표기 — `npm run check:no-ai-copy`

```
AI(-| )(generated|curated|powered)|AI가 정리|자동 생성 콘텐츠|Generated:
```

- `components/`, `content/` 어디든 매칭 시 빌드 실패.
- 마무리 문구에서 자주 함정에 빠짐 — "이 글은 AI가 정리한 트렌드입니다" 절대 금지.

### 2.2 마크다운 `**bold**` — `npm run check:no-bold-emphasis` (JAC-1952)

```
\*\*[^*]+\*\*
```

- 강조가 필요할 때:
  - 자연어 흐름으로 풀어 쓴다 (권장).
  - HTML `<strong>…</strong>` 태그 사용.
- 코드 펜스(```` ``` ````) / 인라인 코드(`` ` ``) 영역은 예외.
- n8n self-check #16에서도 동일 패턴 차단 — workflow prompt에 "마크다운 `**굵게**` 표기 금지" 명시.

### 2.3 의료 단정 가드

```
발암 | 의료사고 | 치료해 드립니다 | 완치 | 부작용 없음
```

- K-Beauty / K-Food 본문 + 출처 후보 필터(Naver Search 결과)에서 모두 차단.
- 의료 안전 관련 사고 원천 봉쇄.

### 2.4 효능 단정 가드

```
에 좋다 | 를 낫게 해 | 을 없애준다
```

- 식품·화장품 효능 단정 금지.
- 대안: "전통적으로 ~에 활용되어 왔다" / "에디터들이 자주 추천하는" / "팬들 사이에서 회자되는" 같은 큐레이션·관찰형 표현으로 치환.

### 2.5 클리셰 / 과장 (NEW — JAC-2040)

다음 표현은 **AI 티가 강하거나 큐레이션 시점을 깨므로** 금지:

| 카테고리 | 금지 표현 예시 | 대체 |
|---|---|---|
| 과장 | "역대급", "찐", "끝판왕", "필수템", "안 사면 후회" | 구체적 사실/맥락으로 치환 ("3주차 멜론 차트 1위") |
| 자기 지시 | "K-스러운", "한국적인 매력", "K-감성" | 어떤 한국 문화 요소가 작동하는지 1줄 설명 |
| 클릭베이트 동사 | "정복하세요", "마스터하세요", "비법 공개", "충격" | 관찰형 동사 ("살펴봅니다", "함께 짚어봅니다") |
| 리스트 부풀리기 | "꼭 알아야 할 N가지", "TOP 10" 남발 | 헥사곤 구조로 묶거나 큐레이션 노트로 풀어쓰기 |
| 영문 직역 클리셰 | "the most Korean thing ever", "ultimate guide", "must-have" | "what fans return to", "what curators flag" |

> 본 목록은 워크플로 차단어가 아니라 **에디터 자체 검수** 기준이다. Editorial Review (`docs/운영점검제안.md` STEP 5) 단계에서 점검한다.

### 2.6 정치 · 종교 · 차별 (NEW — JAC-2040)

| 영역 | 금지 |
|---|---|
| 당파성 | 한국·해외 정당 옹호/비판, 선거 관련 의견 (사실 보도는 허용 — 예: "OST가 정치 집회에서 사용되었다는 보도" → 사실 인용 가능, 의견 금지) |
| 종교 | 특정 종교 우월/비하, 종교 비교 비판 (사실 인용은 허용) |
| 민족·인종 | 민족 우월주의, 외모 비하 ("미백" 류 의료 단정과 결합 시 특히 금지) |
| 젠더 | 성역할 고정 표현 ("여자라면 당연히…"), 외모 평가 일반화 |
| 한·일 / 한·중 | 영토·역사 정치 분쟁은 본문에서 다루지 않음 (페르소나 hiroshi의 `forbidden_topics: jk_political_disputes` 적용) |

> 단, **문화적 사실**은 다룬다 — 예: "이 곡 가사는 일본어와 한국어 라임을 의도적으로 섞었다"는 OK. "일본보다 한국 음악이 우월하다"는 금지.

### 2.7 페르소나별 forbidden_topics 자동 적용

각 페르소나 YAML의 `forbidden_topics` 배열은 본문 작성 시 자동 적용된다:

| 페르소나 | forbidden_topics |
|---|---|
| sabina, jacky, alejandra, echo | medical_assertions, partisan_politics |
| minji, cheolsu | medical_assertions, efficacy_claims |
| hiroshi | jk_political_disputes, medical_assertions |
| yuna | medical_assertions, greenwashing_claims |

- workflow prompt에 페르소나 forbidden_topics를 inline 주입한다 (n8n).
- Editorial Review에서 페르소나 톤 위반 + forbidden_topics 위반 별도 체크.

---

## 3. 번역 규칙

### 3.1 발행 의무 언어쌍

- **ko + en 동시 발행**. 한쪽만 있는 콘텐츠는 publish 차단.
- 두 본문은 **번역이 아니라 동행 작성** — en이 ko의 직역이 아니라, 외국 독자에게 한국 맥락을 한 겹 더 보충한다.

### 3.2 고유명사 처리

| 분류 | 처리 | 예시 |
|---|---|---|
| 인명·그룹명 (공식 영문 표기 보유) | 공식 영문 그대로 | BTS, BLACKPINK, IU, 봉준호 → Bong Joon-ho (한국 인명은 "이름 성"이 아닌 **성-이름** 또는 공식 표기를 따른다) |
| 작품명 | 공식 영문 제목 + 첫 등장 시 한글 병기 1회 | "별에서 온 그대 (My Love from the Star)" — 이후 영문만 |
| 음식 | 음차 + 1줄 영문 설명 (첫 등장만) | "kimchi (fermented Napa cabbage with chili)", "tteokbokki (chewy rice cakes in spicy gochujang sauce)" |
| 복식·문화 어휘 | 음차 + 1줄 설명 | "hanbok (Korean traditional dress)", "jeong (a Korean sense of attached affection)" |
| 지역명 | 정부 공식 로마자 표기 (국립국어원) | "Jeju (제주)", "Gangneung (강릉)" — 한 번 병기 후 영문만 |
| 신조어·밈 | 음차 + 맥락 | "daebak (slang for 'awesome')" — 사용은 절제, 1편당 2회 이내 |
| 존칭 | 첫 등장만 음차 후 영문 표기 | "오빠 (oppa)", "선배 (senior colleague)" |

**금지:**
- "Kim chi" 같은 분리 띄어쓰기.
- "kimchee" / "kim-chi" 같은 비공식 표기.
- 번역 누락 — en 본문에서 한글만 등장하는 어휘는 모두 음차 + 설명 1회 필수.

### 3.3 존댓말 / 반말 기준

| 영역 | ko 톤 | 근거 |
|---|---|---|
| 본문 | 페르소나 voice_tone에 맡김 — 기본 존댓말 (~합니다체) | sabina/jacky/echo/cheolsu/hiroshi/alejandra |
| 본문 (반말 허용) | minji, yuna 두 페르소나만 친근체(~해요/~야) 가능 | Gen Z 친구 톤 페르소나 |
| Meta description | 존댓말 / 객관체 (페르소나 무관) | SEO 결과 표시용 |
| CTA | 존댓말 ("함께 살펴보세요", "다음 편에서 만나요") | — |
| 댓글·소셜 답신 | 존댓말 (Threads/X 운영 — Distribution Playbook 정합) | JAC-2043 §1 |

### 3.4 다국어 SEO 키워드 매핑

| 키워드 유형 | ko | en | 매핑 규칙 |
|---|---|---|---|
| 카테고리 | "K-드라마" | "k-drama" | ko는 한글 키워드 + 영문 키워드 병행 (검색 양쪽 커버) |
| 작품명 | "별에서 온 그대" | "My Love from the Star" | 공식 영문 제목 |
| 인명 | "전지현" | "Jun Ji-hyun" | 공식 표기 |
| 음식 | "김치" | "kimchi" | 음차만 (Korean Napa cabbage 같은 영문 풀이 키워드는 본문 1회만, meta keyword는 음차 우선) |
| 트렌드 | "글래스 스킨" | "glass skin" | 음차 + 영문 표기 둘 다 noted |

**SEO 메타 작성 규칙:**
- `ko meta_description`: 한글 + 영문 키워드 1개 병기 가능 (예: "글래스 스킨(glass skin) 루틴…")
- `en meta_description`: 음차 + 영문 풀이 키워드 (예: "kimchi guide for newcomers — fermentation, regional variants…")
- `<meta name="keywords">`: ko 본문에는 한글 키워드, en 본문에는 영문 키워드만.
- 자매 글 cross-link은 **anchor text도 같은 로케일**로 (ko → ko, en → en).

### 3.5 향후 i18n 확장 (보드 결정 시 Story 위임)

ja / zh-Hans / zh-Hant / es / fr / vi 본문 발행 결정이 내려지면, Echo가 별도 child issue로 Story에 다음 산출물을 위임한다:

1. 로케일별 톤 addendum (1page) — 페르소나 voice_tone과 어떻게 결합되는지.
2. 로케일별 고유명사 처리 표 (예: zh-Hans는 "金墉(BTS 김남준)" 류 한자 표기 정책 결정 필요).
3. 로케일별 SEO 키워드 매핑.

> **현재는 ko + en만 의무 — 본 가이드라인 §3은 ko + en 기준으로만 정밀하다.**

### 3.6 페르소나 voice_tone 적용 순서 (번역 영역)

1. 페르소나 `voice_tone.ko` / `voice_tone.en` 적용.
2. §3.2 고유명사 처리 적용.
3. §3.3 존댓말 / 반말 기준 적용 (페르소나가 명시한 친근체는 유지).
4. §2 금지 표현으로 후처리.

---

## 4. Persona 기준

### 4.1 8인 confirmed 회전 풀

KStoryWorld는 8명의 화자 페르소나가 콘텐츠를 큐레이션한다. 회전은 `date +%j (연중 일수) % 8`로 결정성 적용. webhook body의 `narrator_persona_slug`가 명시되면 회전 무시. 레지스트리: `content/personas/<slug>.yaml`.

| Slug | 이름 | 나이/성별 | 거점 | 직업 | 핵심 키워드 |
|---|---|---|---|---|---|
| sabina | 사비나 | 44/F | 서울·홍콩 | 전 외항사 수석 승무원 23년차 | global, culture, jazz |
| jacky | 잭키 | 52/M | 제주·서울 | 호텔/카지노 IT 25년차 | global, ai, culture |
| minji | 민지 | 27/F | 부산·서울 | K-Beauty MUA 5년차 | beauty, gen_z |
| hiroshi | 히로시 | 33/M | 도쿄·서울 | J-K 번역가 | jk_bridge, drama |
| alejandra | 알레한드라 | 29/F | 멕시코시티·서울 | K-Pop PhD candidate | latin, k_pop, academic |
| cheolsu | 철수 | 52/M | 광주·서울 | 미슐랭 1성 한식 셰프 30년차 | hansik, craft |
| yuna | 유나 | 23/F | 제주 | 대학생, K-Travel 인스타그래머, 환경 활동가 | travel, sustainability, gen_z |
| echo | 에코 | 38/F | 서울 | KStoryWorld 에디터스 데스크 책임자(CMO), 12년차 에디터 | editorial, curation, sot |

### 4.2 카테고리 × 페르소나 적합도 매트릭스

(`category_fit`: 1=주력 / 2=보조 / 0=금지)

| | k_drama | k_pop | k_food | k_beauty | k_travel | k_literature |
|---|---|---|---|---|---|---|
| sabina | 1 | 2 | 2 | 2 | 1 | 1 |
| jacky | 1 | 2 | 1 | 0 | 1 | 2 |
| minji | 2 | 1 | 2 | 1 | 2 | 0 |
| hiroshi | 1 | 1 | 2 | 0 | 2 | 1 |
| alejandra | 2 | 1 | 2 | 2 | 1 | 2 |
| cheolsu | 2 | 0 | 1 | 0 | 2 | 0 |
| yuna | 2 | 2 | 2 | 2 | 1 | 0 |
| echo | 1 | 1 | 1 | 1 | 1 | 1 |

**회전 적용 규칙:** workflow는 `status === "confirmed"` AND `category_fit[<현재 카테고리>] >= 1`인 페르소나만 풀에 포함. 0인 페르소나는 해당 카테고리 콘텐츠에서 강제로도 사용 불가.

### 4.3 Persona × Reader Segment 매핑

| Reader Segment | 정의 | 우선 페르소나 | Hook 톤 |
|---|---|---|---|
| 글로벌 K-팬 (이미 입문) | BTS·드라마 1편 이상 본 외국인, 한국 어휘 일부 알고 있음 | sabina, alejandra, hiroshi | "you already know X, here's what fans return to" |
| 신규 K-입문자 | 트렌드 기사 따라 들어온 외국인, 한국 어휘 처음 | sabina, echo | "before we get to X, one thing to know about Korea is…" |
| 한국 거주 Locale | 한국 거주 한국어 사용자 (ko 본문 메인 독자) | jacky, echo, cheolsu, yuna | "이번 주 우리 에디터스 데스크가 고른 건…" |
| Locale별 (일본 / 중화권 / 라틴 / 동남아) | hiroshi (일본), alejandra (라틴) — 향후 확장 시 추가 | hiroshi, alejandra | 자국 시점 비교 → 한국 맥락 |
| Gen Z (모든 로케일) | minji, yuna 친근체 톤 + 트렌드 빠른 회전 | minji, yuna | "이번 주 직접 써본 결과" / "제주에 살아본 입장에서" |

### 4.4 페르소나별 Hook · CTA 가이드

| Slug | ko Hook 패턴 | en Hook 패턴 | ko CTA | en CTA |
|---|---|---|---|---|
| sabina | "그날의 환승 라운지에서…" | "On the layover that night," | "에디터의 큐레이션 노트로 다음 편에서 이어가요" | "Stay with us for next week's curation note." |
| jacky | "제주 막걸리집 카운터에서 들었던 얘기인데" | "Over a bowl of makgeolli in Jeju," | "운영자 입장에서 다음 편을 준비합니다" | "Next from the operator's seat." |
| minji | "이번 주 직접 발라본 결과" | "After actually wearing it for a week," | "다음 주 루틴 후기 또 가져올게요" | "I'll bring next week's honest take soon." |
| hiroshi | "도쿄에서 보던 시점으로 돌아가 보면" | "From a Tokyo viewer's frame," | "두 언어 사이의 다음 메모로 이어집니다" | "Next: another note from between two languages." |
| alejandra | "멕시코시티 클럽에서 처음 들었을 때" | "The first time I heard this on a Mexico City dance floor," | "다음 트랙은 또 다른 댄스 플로어에서" | "The next track lands on another dance floor." |
| cheolsu | "30년 주방에서 배운 건" | "Thirty years at the pass taught me," | "다음 편에서는 발효 두 달짜리 이야기를" | "Next: a two-month fermentation story." |
| yuna | "제주에서 살아본 입장에서" | "Speaking as someone who actually lives in Jeju," | "다음 주는 다른 동네 골목으로" | "Next week, another Jeju neighborhood." |
| echo | "이번 주 에디터스 데스크가 고른 건" | "From the editor's desk this week," | "에디터의 한 줄을 덧붙이며 다음 편으로" | "An editor's note before next week's piece." |

### 4.5 Hook → Body → Closing 흐름 템플릿

모든 본문은 다음 3단 흐름을 따른다 (헥사곤 자매 5편도 동일):

```
[Hook]   페르소나 signature_phrase 1줄 (§4.4)
         ↓ 1~2 문장 — 독자가 이 글에 머물 이유
[Body]   §1.3 도메인 톤 변형으로 사실·맥락·해석을 차곡
         (이미지 hero ≥ 1, inline ≥ 1 — 헥사곤 모드)
         (출처 ≥ 2, internal link ≥ 3, youtube ≥ 1)
[Closing] 큐레이션 노트 1~2 문장 + 페르소나 CTA (§4.4)
         (Hexagon 모드: 앵커 K-Drama back-link + 자매 cross-link 1~2개)
```

---

## 5. Reference Card (n8n / board-routine inline 인용용)

> 별도 1페이지 카드: [`reference-card.md`](./reference-card.md) — workflow prompt에 통째로 또는 발췌 인용.

---

## 6. 운영 정합

### 6.1 자매 문서

| 문서 | 관계 |
|---|---|
| `docs/content-creation-rules.md` | **검수 게이트** SoT (Self-check 12/13/14/15/15a/16/17/18) — 본 가이드라인의 운영 정의를 자동 채점 |
| `docs/distribution/playbook.md` (JAC-2043) | Threads/X/Newsletter/SEO Refresh — §1 톤 4원칙, §2 금지 표현, §4 페르소나 hooks 정합 필수 |
| `docs/운영점검제안.md` | 부모 SOP — 본 가이드라인은 §10-1 구현체 |
| `content/personas/*.yaml` | 페르소나 레지스트리 — §4 SoT |
| `n8n-workflows/_lib/hexagon-self-checks.js` | Hexagon 자기 점검 코드 SoT |

### 6.2 Editorial Review 단계 책임 (RACI 발췌)

| 단계 | 책임 | 도구·근거 |
|---|---|---|
| Tone 적합성 (§1) | Echo (CMO) | 본 가이드라인 |
| 금지 표현 게이트 (§2.1–2.4) | n8n self-check #11/12/12a/16/17 자동 | `docs/content-creation-rules.md` §2 |
| 클리셰 / 정치·종교 (§2.5–2.6) | Echo + Story (수동 검수) | 본 가이드라인 §2.5–2.6 |
| 페르소나 적용 (§4) | n8n workflow + Story | webhook body / `content/personas/*.yaml` |
| 번역 동행 작성 (§3) | Story | ko + en 동시 작성 |
| 최종 QC | Auditor | `docs/content-creation-rules.md` §9 발행 전 체크리스트 |

### 6.3 외부 발신 정합 (Distribution Playbook 호환)

Threads/X/Newsletter 게시물도 본 가이드라인을 따른다:

- **Tone**: §1.2 4원칙 (큐레이션 시점 유지 — "오늘 핫한 X" 류 금지).
- **금지 표현**: §2 전부 적용 (특히 §2.5 클리셰는 SNS에서 더 중요 — 짧은 글일수록 클리셰가 더 도드라짐).
- **고유명사**: §3.2 음차 정책 적용 — 영문 캡션도 "kimchi" 음차 우선.
- **페르소나**: 채널 페르소나는 기본 `echo` (에디터스 데스크) — 카테고리 colour 글에만 해당 페르소나로 분기.

> Distribution Playbook (JAC-2043) 발행 시 §6.3을 cross-reference로 인용한다.

---

## 7. DoD (본 가이드라인 자체 — JAC-2040)

- [x] 5개 섹션 (Tone / 금지표현 / 번역규칙 / Persona / Reference) 작성
- [x] 1페이지 reference card 분리 (`reference-card.md`)
- [x] Distribution Playbook (JAC-2043) cross-reference (§6.3)
- [x] 페르소나 8인 voice_tone / category_fit 인용 (§4)
- [ ] Story (Content Specialist) 번역 룰 검토 (§3) — close 전 1회
- [ ] Echo 자체 검증 후 close

---

## 8. 변경 이력

| 일자 | 이슈 | 변경 |
|---|---|---|
| 2026-05-06 | JAC-2040 | Editorial Guideline 최초 작성 (Echo, CMO). 5개 섹션 + reference card. ko + en base, 6개 i18n 로케일은 발행 결정 시 Story child issue로 확장. |
