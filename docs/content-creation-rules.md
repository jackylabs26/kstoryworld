# KStoryWorld 컨텐츠 제작 규칙

> 대상 독자: 콘텐츠 에디터, n8n 워크플로 운영자, QC 감사자, 보드(Paperclip) 사용자.
> 본 문서는 코드·워크플로·게이트에 흩어져 있는 콘텐츠 생산 규칙을 한 곳으로 모은 다운로드용 SOP입니다.
> 마지막 갱신: 2026-05-04 (JAC-1952 — 페르소나 8인·`** **` ban·이미지 ≥1·유튜브 URL ≥1·검토 번들).
> 변경 시 반드시 본 문서와 원본 SoT를 함께 갱신하세요.

---

## 0. 한 장 요약

| 항목 | 규칙 |
|---|---|
| 카테고리 | K-Drama (앵커) · K-Pop · K-Food · K-Beauty · K-Travel · K-Literature |
| 언어쌍 | 한국어(ko) + 영어(en) 동시 발행 |
| 길이 (ko) | 본문 ≥ 600자 |
| 길이 (en) | 본문 ≥ 200 단어 |
| 검수 게이트 | 12-check + 12a(이미지 ≥1) · 13-check (K-Drama, 출처 본문 ⊆ 본문 ≥ 0.15) · 16(`**` ban) · 17(YouTube URL ≥ 1) · 18(narrator persona 결정) · +14·15·15a (Hexagon 모드) |
| AI 자동생성 표기 | 전면 금지 (`npm run check:no-ai-copy`) |
| 마크다운 굵게 표기 (`** **`) | 전면 금지 (`npm run check:no-bold-emphasis`) — JAC-1952 |
| 의료 단정 | 전면 금지 (`발암 / 의료사고 / 치료해 드립니다 / 완치 / 부작용 없음`) |
| 효능 단정 | 전면 금지 (`에 좋다 / 를 낫게 해 / 을 없애준다`) |
| 이미지 | 모든 콘텐츠 ≥ 1장 + Hexagon 모드 ≥ 2장(hero 1 + inline ≥ 1) — JAC-1952 / JAC-1896 |
| 이미지 출처 | `unsplash · pexels · pixabay · wikimedia · cc0 · cc-by` 화이트리스트만 |
| Hero 이미지 톤 | 발행 분기와 일치 (1Q=winter, 2Q=spring, 3Q=summer, 4Q=fall) — 매니페스트 사전 선언 시 예외 허용 |
| YouTube URL | 모든 콘텐츠 본문/메타에 `youtube.com/watch · youtu.be · youtube.com/embed · shorts` 패턴 ≥ 1개 (JAC-1952) |
| 화자 페르소나 | 모든 콘텐츠 산출 메타에 `narrator_persona_slug` 필드 (JAC-1952) — `content/personas/<slug>.yaml` 참조 |
| 발행 정책 | Hexagon 6편(앵커 1 + 자매 5)은 bundle-only — 단일 발행 금지, 게이트 2 승인 후에만 main 머지 |
| 검토 번들 | Hexagon 게이트 2 직전 `node scripts/hexagon/build-review-bundle.mjs <slug>` 실행 → `artifacts/review/<slug>/` (MD + manifest + preview HTML) 생성 (JAC-1952) |

---

## 1. 콘텐츠 구조

### 1.1 카테고리

| 카테고리 | 디렉터리 | 워크플로 webhook |
|---|---|---|
| K-Drama (앵커) | `content/dramas/` | `/webhook/generate-kdrama-content` |
| K-Pop | `content/songs/`, `content/reviews/` | `/webhook/generate-kpop-content` |
| K-Food | `content/foods/` | `/webhook/generate-kfood-content` |
| K-Beauty | `content/beauties/` | `/webhook/kbeauty-content` |
| K-Travel | `content/travels/` | (Hexagon 자매 — 별도 워크플로) |
| K-Literature | `content/literatures/` | (Hexagon 자매 — 별도 워크플로) |

### 1.2 언어 / 파일명 규칙

- 모든 글은 ko + en 동시 생성. 예: `chimaek-fried-chicken-beer-ko.html` / `chimaek-fried-chicken-beer-en.html`.
- 슬러그는 영문 소문자 + 하이픈. 한국어 형태소 그대로 슬러그에 쓰지 않음.
- 메타: `<meta name="category" content="k-beauty">` 등 카테고리 메타가 반드시 포함되어야 함.

### 1.3 K-Beauty 7개 섹션 구조 (예시)

`intro · trend_snapshot · how_to_use · cultural_context · editor_picks · closing · source` — Format & Self-Check 노드가 7개 섹션 모두 비어 있지 않은지 검증합니다. (`n8n-workflows/README.md:23`)

다른 카테고리(K-Drama·K-Pop·K-Food)는 `intro · plot_teaser · cultural_context · why_watch · closing` 5개 섹션이 기본입니다.

### 1.4 화자 페르소나 (JAC-1952)

KStoryWorld는 8인의 화자 페르소나가 콘텐츠를 큐레이션하는 컨셉입니다. 모든 콘텐츠 산출물은 메타에 `narrator_persona_slug`를 포함해야 합니다 (self-check #18).

- 레지스트리 위치: `content/personas/<slug>.yaml` (스키마는 `content/personas/_schema.yaml`).
- 필수 필드: `slug`, `display_name_{ko,en}`, `status`, `age`, `gender`, `nationality`, `home_base`, `profession_{ko,en}`, `years_experience`, `identity_keywords`, `voice_tone.{ko,en}`, `category_fit.{6개 카테고리}`, `signature_phrases_{ko,en}`, `created_at`.
- `status` 값: `confirmed` (워크플로 회전 풀 포함) / `draft` (보드 검토 대기, opt-in) / `retired` (사용 중단).
- 회전 정책: workflow는 `status === "confirmed"` + `category_fit[<category>] >= 1` 페르소나만 풀에 포함하고 `date +%j % 풀크기`로 결정성 회전. `webhook body.narrator_persona_slug`가 있으면 강제 사용.
- 보드 confirmed 8인: `sabina` (40대 여성, 외항사 23년 승무원, 한국 리터니), `jacky` (50대 남성, 제주, 호텔/카지노 IT 25년), `minji` (27세 부산, K-Beauty MUA), `hiroshi` (33세 일본인, J-K 번역가), `alejandra` (29세 멕시코, K-Pop PhD), `cheolsu` (52세 광주, 한식 셰프 미슐랭 1성), `yuna` (23세 제주, K-Travel + 지속가능성), `echo` (38세 서울, KStoryWorld 에디터스 데스크 책임자, 12년차 콘텐츠 에디터 — JAC-1952 2026-05-04 추가). 8인 전원 회전 풀 포함.
- 본문 푸터에 1줄 byline 자동 삽입(예: "by 사비나 (Seoul + Hong Kong, ex-cabin crew)").

---

## 2. 품질 게이트 (Self-Check)

게이트는 n8n 워크플로의 **Format & Self-Check** Code 노드가 자동 채점합니다. `passed === total`이어야만 응답 `ok: true`로 반환되며, 실패 시 키워드 회전을 건너뛰고 다음 cron에서 재시도합니다.

### 2.1 12-check (K-Beauty / K-Food / K-Pop 공용)

| # | 항목 | 기준 |
|---|---|---|
| 1 | category 메타 존재 | `<meta name="category" content="...">` |
| 2 | ko title 존재 | 비어 있지 않음 |
| 3 | en title 존재 | 비어 있지 않음 |
| 4 | ko slug 형식 | 영문 소문자 + 하이픈 |
| 5 | en slug 형식 | 영문 소문자 + 하이픈 |
| 6 | ko meta_description | 비어 있지 않음 |
| 7 | en meta_description | 비어 있지 않음 |
| 8 | ko 본문 길이 | ≥ 600자 |
| 9 | en 본문 길이 | ≥ 200 words |
| 10 | 섹션 구조 | 카테고리 정의 섹션 모두 채워짐 |
| 11 | 차단 키워드 hit | 의료/효능 단정 차단어 미발견 |
| 12 | no-ai-copy 정규식 hit | AI 자동생성 표기 미발견 |
| 12a | images_present_min_1 (JAC-1952) | 이미지 ≥ 1장 + 5개 메타(`source`/`asset_id`/`license`/`credit`/`seasonal_tone`) 채워짐 + 화이트리스트 출처 |
| 16 | no_bold_emphasis_pattern (JAC-1952) | 본문/메타에 `**[^*\n]+**` 패턴 0건. 코드 펜스(```` ``` ````, `` ` ``) 영역은 예외. HTML `<strong>` 허용 |
| 17 | youtube_url_present (JAC-1952) | 본문 또는 메타에 `youtube.com/(watch\|embed\|shorts)` 또는 `youtu.be/` URL ≥ 1건 |
| 18 | narrator_persona_resolved (JAC-1952) | 산출 메타 `narrator_persona_slug` 비어 있지 않음 (페르소나 레지스트리 §1.4 참조) |

### 2.2 13번째 체크 (K-Drama 전용 — JAC-1787)

**출처 본문 토큰 ⊆ 본문 토큰 비율 ≥ 0.15** (간이 fact-anchor 검증)

```js
const sourceTokens = extractTokens(sourceBodyText);
const bodyTokens = new Set(extractTokens(koBodyText + ' ' + enBodyText));
const overlap = sourceTokens.filter(t => bodyTokens.has(t));
const overlap_ratio = sourceTokens.length ? overlap.length / sourceTokens.length : 0;
checks['13_source_body_overlap_min_15pct'] = overlap_ratio >= 0.15;
```

- **임계치 0.15 근거** (JAC-1787 캘리브레이션): 무관 출처(Esquire 패션) = 0.061, 관련 출처(Tudum) = 0.550. 분리도 충분.
- 출처 페이지 fetch 실패·`source_irrelevant`·본문 200자 미만 시 다음 후보로 자동 재시도 (최대 3회).
- 3회 모두 실패 시 `ok: false, reason: 'all_candidates_failed'` → daily scheduler가 Telegram failure alert.

### 2.3 14·15·15a (Hexagon 모드 추가 게이트)

웹훅 body에 `hexagon_id`가 있으면 자동 적용. (소스: `n8n-workflows/_lib/hexagon-self-checks.js`)

#### 14. anchor_backlink_present (JAC-1895)

자매 글 본문 / meta-description / 태그 어딘가에 다음 중 **하나 이상**이 등장해야 함:

- `anchor_url_ko` (예: `/content/dramas/my-love-from-the-star-ko.html`)
- `anchor_url_en`
- 앵커 슬러그 stem
- `anchor_drama` 정식 명칭 (KR or EN)

#### 15. images_present_with_license (JAC-1896 §B)

1. 이미지 ≥ 2장 (hero 1 + inline ≥ 1).
2. 정확히 1장의 `role === "hero"`.
3. ≥ 1장의 `role`이 `^inline(_\d+)?$` 패턴 매칭.
4. 모든 `source`가 화이트리스트(`unsplash | pexels | pixabay | wikimedia | cc0 | cc-by`)에 포함.
5. 모든 이미지가 5개 필드 비어 있지 않음: `source`, `asset_id`, `license`, `credit`, `seasonal_tone`.
6. 모든 이미지가 `alt_text_ko` + `alt_text_en` 비어 있지 않음.

#### 15a. seasonal_tone_quarter_policy (JAC-1896 §C)

- `expected_tone` = 발행월 분기 (4–6 spring · 7–9 summer · 10–12 fall · 1–3 winter).
- **Pass A**: `hero.seasonal_tone === expected_tone` (정상 매칭).
- **Pass B (충실도 예외)**: hero가 분기와 다른 톤 + 매니페스트(`manifest_hero_seasonal_tone`)가 사전 선언 + 인라인 이미지 ≥ 1장이 `seasonal_tone === expected_tone` (독자가 발행 분기에 닻을 내릴 수 있도록 보완).
- 그 외 → fail.
- `publish_month`이 없으면 not-applicable로 통과.

> 예시: 봄 분기(2Q)에 발행하는 「별에서 온 그대」 자매 글이 hero에 winter 첫눈 치맥 사진을 쓰는 경우 → 매니페스트에 `manifest_hero_seasonal_tone: winter` 선언 + 인라인 1장에 `seasonal_tone: spring`이 있어야 통과.

### 2.4 QC 알림 (Telegram)

웹훅 body에 `telegram_bot_token` + `telegram_chat_id`가 같이 들어오면, hexagon 게이트 실패 시 자동으로 감사자 채팅에 `sendMessage`. Telegram 장애는 swallow 하고 워크플로 응답을 막지 않음.

---

## 3. 금지 표현 (Forbidden Patterns)

### 3.1 AI 자동생성 표기 (`npm run check:no-ai-copy`)

다음 정규식에 매칭되는 표현은 `components/`, `content/` 어디에도 들어갈 수 없습니다 (CI 차단):

```
AI(-| )(generated|curated|powered)|AI가 정리|자동 생성 콘텐츠|Generated:
```

- 검출 시 빌드 실패 + `'AI/자동생성 표현이 검출되었습니다'` 에러.
- 트렌드/리스트 글 마무리 문구를 쓸 때 자주 함정에 빠집니다 — "이 글은 AI가 정리한 트렌드입니다" 같은 표기 절대 금지.

### 3.1a 마크다운 굵게 표기 `** **` (`npm run check:no-bold-emphasis`) — JAC-1952

마크다운 `**bold**` 패턴은 AI 생성 티가 강하게 나기 때문에 모든 콘텐츠에서 금지합니다:

```
\*\*[^*]+\*\*
```

- `components/`, `content/` 의 `*.md`/`*.html`/`*.tsx`/`*.ts` 파일 전체에 정규식이 hit하면 빌드 실패.
- 강조가 필요할 때:
  - 자연어 흐름으로 풀어 쓰기 (권장).
  - 또는 HTML `<strong>...</strong>` 태그 사용.
- 코드 펜스(```` ``` ````) 또는 인라인 코드(`` ` ``) 영역의 `**` 은 예외.
- n8n 워크플로 self-check #16 에서도 동일 패턴을 차단합니다 — 워크플로 prompt에 "마크다운 `**굵게**` 표기 금지" 명시.

### 3.2 의료 단정 가드

```
발암 | 의료사고 | 치료해 드립니다 | 완치 | 부작용 없음
```

- K-Beauty / K-Food 본문 + 출처 후보 필터(Naver Search 결과)에서 모두 차단.
- 의료 안전 관련 사고를 원천 봉쇄하기 위한 운영 가드.

### 3.3 효능 단정 가드

```
에 좋다 | 를 낫게 해 | 을 없애준다
```

- 식품·화장품 효능을 단정 짓는 표현은 금지. 대신 "전통적으로 ~ 에 활용되어 왔다", "에디터들이 자주 추천하는" 등 큐레이션 톤으로 바꿔 쓸 것.

### 3.4 키워드 풀에서 의도적으로 제외한 표현 (K-Beauty)

`board-routine/lib.sh` 내 `br_pick_kbeauty_keyword`는 다음 10개만 회전 사용 (JAC-1800 가드):

```
글래스 스킨 루틴 · MLBB 립 컬러 · 쿠션 파운데이션 · 수분 토너 레이어링 · 선스크린 데일리
마스크팩 루틴 · 립 틴트 트렌드 · 클린 뷰티 성분 · 미니멀 스킨케어 · 한방 화장품
```

미백 / 주름개선 / 안티에이징 등 의료 단정 인접 키워드는 **풀 자체에 넣지 않습니다.**

---

## 4. 이미지 / 라이선스

### 4.1 화이트리스트 (소스)

```
unsplash | pexels | pixabay | wikimedia | cc0 | cc-by
```

위 외 출처(예: 셔터스톡, 게티이미지, 임의 블로그 이미지)는 게이트에서 자동 거부됩니다.

### 4.2 필수 메타데이터 (이미지마다)

| 필드 | 설명 |
|---|---|
| `role` | `hero` 1장 + `inline_1`, `inline_2`, ... ≥ 1장 |
| `source` | 화이트리스트 값 |
| `asset_id` | 소스 플랫폼 asset id (예: `photo-XXXXXXXXX`) |
| `asset_url` | 직접 링크 |
| `license` | 소스별 슬러그 (예: `unsplash-license`, `pexels-license`, `cc-by-4.0`) |
| `credit` | 표기 문자열 (예: `Photo by [Name] on Unsplash`) — 빈 문자열 금지 |
| `seasonal_tone` | `spring | summer | fall | winter` |
| `alt_text_ko` | 한국어 대체 텍스트 |
| `alt_text_en` | 영어 대체 텍스트 |

### 4.3 분기 톤 매칭

- 1Q (1–3월) → winter
- 2Q (4–6월) → spring
- 3Q (7–9월) → summer
- 4Q (10–12월) → fall
- Hero가 분기 톤과 다를 경우 매니페스트(`anchor.hero_image.seasonal_tone` / `sisters[*].hero_image.seasonal_tone`)에 사전 선언 + 인라인 1장이 분기 톤 보완.

---

## 5. Hexagon 발행 묶음

### 5.1 정의

1 헥사곤 = 앵커 K-Drama 1편 + 자매 5편 (k-food · k-pop · k-beauty · k-travel · k-literature) = **6편 1번들**.

### 5.2 매니페스트

- 위치: `content/hexagons/<slug>.yaml` (예: `content/hexagons/my-love-from-the-star.yaml`)
- 스키마: `content/hexagons/_schema.yaml` (주석에 필드 제약 명시)
- 자매 5개는 정확히 5개 도메인 (k-food, k-pop, k-beauty, k-travel, k-literature) 모두 포함.

### 5.3 게이트 흐름

| 단계 | 산출물 | 승인 |
|---|---|---|
| draft | 매니페스트 초안 | — |
| ready_for_board | 시드 검토 요청 | 게이트 1 (`gate1_approval_id`) |
| gate2_pending | 6편 모두 self-check 통과 | 자동 |
| gate2_accepted | 6편 묶음 main 머지 + Cloudflare 배포 | 게이트 2 (`gate2_approval_id`) |
| gate2_rejected | 재작업 | — |

### 5.4 발행 정책

- `publish.policy: bundle-only` — 6편을 **함께만** 발행. 단일 글 발행 금지.
- `blocked_until_gate2: true` — 게이트 2 accept 전엔 main 머지·Cloudflare 배포 차단.

### 5.5 Cross-link

- 자매들은 다른 자매 1~2개를 가리키는 cross_link을 가집니다 (publish 직전 확정).
- 모든 자매는 앵커 K-Drama 페이지로 back-link (#14 self-check).

### 5.6 검토 번들 (JAC-1952)

게이트 2 confirmation 직전, 보드가 인쇄/저장 가능한 형태로 6편 묶음을 검토할 수 있도록 review bundle을 빌드합니다:

```sh
node scripts/hexagon/build-review-bundle.mjs <hexagon-slug>
```

산출물 (`artifacts/review/<slug>/`, `.gitignore` 처리):

| 파일 | 용도 |
|---|---|
| `bundle.md` | 6편 ko+en 본문 + 메타를 1개 파일로 합친 마크다운. 인쇄/저장용. |
| `manifest.json` | 페르소나 분포·고유 YouTube URL 목록·이미지 hero/inline 카운트·게이트 결과 1페이지 요약. |
| `preview/<file>` | 6편 raw HTML/MD 사본. |
| `bundle.pdf` | (옵션) `--pdf` 플래그 시 외부 도구(Pandoc 또는 headless Chromium)로 변환 — 현재 stub. |

게이트 2 paperclip request_confirmation 코멘트에 `manifest.json` 요약과 `bundle.md` 경로를 첨부합니다. 이메일 발송은 보드가 명시 활성화 요청한 경우에만 (현재 기본 비활성, paperclip + Telegram 2채널 유지).

---

## 6. 운영 (보드 루틴)

### 6.1 일일 cron

- Paperclip routine: `K-{카테고리} Daily Content`
- 스케줄: `0 4 * * *` Asia/Seoul (현지 04:00)
- body: `bash _default/board-routine/{category}-kickoff.sh "$PAPERCLIP_TASK_ID"`

### 6.2 키워드 회전

`date +%j`(연중 일수) % pool size 인덱스로 결정성 회전. 각 카테고리 풀은 `board-routine/lib.sh`의 `br_pick_*_keyword` 함수에서 관리.

### 6.3 K-Drama 자기 점검 실패 시 (운영 결정 사항)

- self-check pass < 12/13 → **skip + Telegram 알림 + 다음 cron 재시도**. 보드 이슈는 done(skipped)으로 처리.
- 단, **webhook / gate-create 실패**는 blocked로 격상 — 인프라 문제이기 때문.

### 6.4 환경 변수

| 변수 | 필수 | 설명 |
|---|---|---|
| `N8N_BASE_URL` | 운영 시 | 예: `https://n8n.jackyailabs.com` |
| `KPOP_WEBHOOK_TOKEN` | 기본 | Phase A 공유 토큰. 카테고리별 토큰 부재 시 폴백. |
| `KFOOD_WEBHOOK_TOKEN` | 선택 | K-Food 전용 |
| `KBEAUTY_WEBHOOK_TOKEN` | 선택 | K-Beauty 전용 |
| `ANTHROPIC_API_KEY` | 운영 시 | n8n 워크플로의 Claude HTTP 노드용. payload에 자동 주입. |
| `N8N_DRYRUN` | 선택 | `1`이면 webhook 호출 건너뛰고 스텁 응답 echo. |

---

## 7. 톤 & 스타일

### 7.1 에디터 큐레이션 톤

- "이번 주 우리 에디터들이 골랐다" 같은 인격적 큐레이션 시점.
- 의료/효능 단정 대신 "전통적으로 ~ 에 활용되어 왔다", "팬들 사이에서 회자되는" 등 관찰형 표현.
- 외국 독자(en)에게는 한국 문화 맥락(왜 이게 의미 있는지)을 짧게라도 보충.

### 7.2 디자인 시스템 / 시즌 컬러

KStoryWorld는 사계절 컬러 시스템(봄·여름·가을·겨울)을 사용합니다. 마케팅 페이지·슬라이드·리더 앱에 시각 자산을 만들 때는 `kstoryworld-design` 스킬을 호출해 토큰·로고·구름 일러스트·다국어 i18n 규칙(ko · en · ja · zh-Hans · zh-Hant · es · fr · vi)을 따릅니다.

### 7.3 다국어 우선순위

현재는 ko + en 2개 언어가 발행 의무. ja / zh-Hans / zh-Hant / es / fr / vi는 디자인 시스템상 토큰만 미리 준비되어 있으며, 본문 발행은 별도 결정 시 추가됩니다.

---

## 8. 사실성 (Fact Anchoring)

### 8.1 출처 후보 필터 (Naver Search)

- K-Drama·K-Pop·K-Food는 Naver Search 결과 상위 N건을 후보군으로.
- 의료 단정/리콜/발암 키워드 도메인·제목은 자동 차단.
- K-Drama는 추가로 후보 5건을 `filtered[]`로 보존, fetch + Claude draft 반복 시 다음 후보로 폴백.

### 8.2 출처 본문 검증 (K-Drama)

- Claude가 출처 페이지 본문을 받아 사실 인용. 무관하면 `{ "error": "source_irrelevant" }` 반환 → 다음 후보로.
- self-check #13: source-body 토큰 overlap ≥ 0.15.
- HTML strip + entity 정리 + 공백 압축. JS-rendered SPA는 본문 추출이 부실할 수 있음 — `source_body_too_short` (200자 미만)이면 폴백.

### 8.3 헥사곤 앵커 시드 (anchor_seed)

- 앵커 K-Drama 워크플로가 `{ person, year, platform, key_motif }`를 추출해 자매 워크플로에 전달.
- 자매들은 이 시드를 prompt에 넣어 일관된 사실 앵커를 공유.

---

## 9. 체크리스트 (발행 전)

- [ ] 12/13/15a 자기 점검 모두 통과 (`ok: true`)
- [ ] `npm run check:no-ai-copy` 통과
- [ ] 의료/효능 단정 표현 0건
- [ ] 이미지 화이트리스트 + 9개 필드(role, source, asset_id, asset_url, license, credit, seasonal_tone, alt_text_ko, alt_text_en) 모두 채워짐
- [ ] Hero 톤이 발행 분기와 매칭 — 또는 매니페스트 사전 선언 + 인라인 보완
- [ ] (Hexagon) 자매 5편이 모두 앵커 K-Drama로 back-link
- [ ] (Hexagon) cross-link 1~2개씩 명시
- [ ] (Hexagon) 게이트 2 accept (`gate2_approval_id` 부여) 후 main 머지

---

## 10. 부록 — 원본 SoT (Source of Truth) 위치

본 문서는 다음 파일들에 흩어진 규칙을 합친 사본입니다. 의도가 충돌하면 항상 **원본**이 우선합니다.

| 영역 | 원본 파일 |
|---|---|
| 12-check 게이트 정의 | `n8n-workflows/README.md` |
| Hexagon self-check 코드 | `n8n-workflows/_lib/hexagon-self-checks.js` |
| Hexagon 입력 컨트랙트 | `n8n-workflows/_lib/hexagon-input-contract.md` |
| Hexagon 매니페스트 스키마 | `content/hexagons/_schema.yaml` |
| 키워드 풀 | `board-routine/lib.sh` |
| 일일 kickoff 사용법 | `board-routine/README.md` |
| 발행 검증기 | `scripts/hexagon/validate-article.mjs` |
| 이미지 타입 정의 | `lib/hexagonArticles.ts` |
| AI 자동생성 차단 | `package.json` (`check:no-ai-copy`) |
| 사전 배포 게이트 | `scripts/pre-deploy-check.sh` |

---

## 11. 변경 이력

| 일자 | 이슈 | 변경 |
|---|---|---|
| 2026-05-02 | JAC-1949 | 본 통합 문서 최초 작성 (Echo, CMO) |
| 2026-04-29 이전 | JAC-1750 / JAC-1764 / JAC-1787 / JAC-1800 / JAC-1836 / JAC-1893 / JAC-1895 / JAC-1896 | 12-check, K-Drama 13-check, K-Beauty 가드, Hexagon 14·15·15a 도입 |

> 이 문서는 다운로드 후에도 유효하지만, 게이트 로직이 자주 변하므로 운영 시점엔 항상 위 §10 원본 파일과 교차 확인하세요.
