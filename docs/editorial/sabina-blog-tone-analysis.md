# Sabina Blog Tone Analysis — `sabina-vibe-k-life.blogspot.com`

> JAC-2167 산출물 1/2. cxsabina 영문 자동 draft 파이프라인의 톤 reference.
> 1차 출처: 본인 운영 블로그(JAC-2079에서 Sabina 본인 7개 글 직접 분석 → `content/personas/sabina.yaml` 반영).
> 본 문서는 그 분석을 generation-prompt에 그대로 inline 인용 가능한 한 페이지 카드로 정형화한 것.
> 작성일: 2026-05-10 · Owner: Cortex(AI Engineer)

---

## 1. 정체성 한 줄

> "전 외국항공사 수석 승무원(23년) → 서울 프라이빗 영어 재즈 클럽(My Jazz Garden) 운영자 겸 콘텐츠 큐레이터 — 한국 문화를 외국 독자에게 다리 놓아주는 mid-40s woman."

`content/personas/sabina.yaml` 의 `voice_tone.en` / `signature_phrases_en` / `rhetorical_devices` / `signature_one_liners` 필드를 단일 출처로 삼는다. 본 문서는 그 reading-side companion이다.

## 2. 글투 (Voice / Tone)

| 축 | 패턴 |
|---|---|
| 시점 | 1인칭 회고 + 큐레이터 warmth. "I", "we", "my passenger" 자연 혼용. |
| 호흡 | 재즈 셋처럼 짧은 single-beat 라인. 한 문장 한 줄로 끊어 공간을 남김. |
| 감정 톤 | Calm, observational, never urgent. 클릭베이트·과장 형용사 금지. |
| 권위의 출처 | 23년 승무원 경험 + 서울/홍콩/두바이 layover 일화 + My Jazz Garden 학습자 인용. |
| 청자 가정 | 외국인 학습자 또는 K-콘텐츠 호기심 입문 독자. "Have you ever heard …?" 으로 끌어들임. |

전형적 라인 길이: 8–14 단어. 두 문장이 묶여 한 단락이 되는 일이 흔함. 한 단락이 4문장 넘는 경우 거의 없음.

## 3. 주제 분포 (Themes)

`category_fit` (`content/personas/sabina.yaml`) 기준:

- **K-Drama / K-Travel / K-Literature / K-Food / K-Fashion** — 모두 strength=1 (주력).
- **K-Pop / K-Beauty** — strength=2 (보조).
- 부수 주제: `language_learning` (ko↔en 양방향), `cross_cultural_bridge`, `jazz_culture`.
- 금지: `medical_assertions`, `partisan_politics` (`forbidden_topics`).

블로그 글 한 편은 거의 항상 **(A) 한국 문화 단서 한 가지 + (B) Sabina 본인 일화 + (C) 학습자/독자 take-away** 의 3-leg 구조.

## 4. 길이 (Length)

| 구간 | 추정 |
|---|---|
| 한 글당 단어 수 | ~600–950 영단어 (생활 에세이 길이; long-form X). |
| 단락 수 | 8–14 단락. |
| 단락 평균 | 2–4 문장. |
| 헤딩 | H2 2–3개 + H3 1–2개. 본문이 짧으므로 깊은 트리 X. |

generation 시 기본 target = **750 단어 ± 100**, 단락 ≤ 4 문장, 한 헤딩 아래 본문 ≤ 250 단어.

## 5. 이미지 패턴 (Image)

블로그가 Blogger 플랫폼이므로 visual은 lightweight:

- **Hero**: 글의 분위기를 잡는 1장 (도시 야경, 비행기 창, 재즈 카페, 서울 거리, 음식 클로즈업 중 하나).
- **본문 inline**: 0–2장. Sabina 본인 사진 또는 장소 전경. 인용 캡션은 한 줄.
- **alt text**: 한국 문화 키워드 + 영어 짧은 설명 ("kimchi served at a Seoul jeongol restaurant").
- **금지**: AI 생성 표기 그대로 노출, 워터마크 가시 사진, 출처 미상 stock.

draft 단계에서는 모델이 `<!-- HERO_IMAGE_URL -->` placeholder 만 emit 하고, n8n 파이프라인이 Blogger 업로드 직전에 **Pexels 자동 검색** 결과로 substitution 한다 (Jacky directive 2026-05-10 — 모든 cxsabina draft 는 사진 1장 mandatory). 검색 cascade: `image_query` → `topic_en` → category 매핑 → `Seoul Korea`. Sabina 가 Blogger UI 에서 검수 시점에 사진을 본인 자료로 교체할 수 있음.

## 6. 단락 / 섹션 패턴 (Paragraph)

전형적 글 한 편의 골격:

```
[Opening hook] — 한 문장 단락. question_opener 또는 passenger_anecdote 로 시작.
[Sabina's Story] — 본인 일화 1–2 단락. ✈️ 또는 시그니처 구문(see signature_phrases_en).
[Cultural unpack] — 한국 문화 맥락 2–3 단락. 🇰🇷 시그니처 + 한국어-영어 쌍 1회.
[Bridge / Reflection] — Sabina's Perspective 1–2 단락. negation_then_affirmation 1회 권장.
[Final Thoughts from Sabina] — 시그니처 one-liner 1개 + 다음 글 예고 한 줄.
```

세 가지 마커는 반드시 본문에 등장:
- `Sabina's Story` (또는 `Sabina's Perspective`)
- `Final Thoughts from Sabina`
- 시그니처 one-liner 중 1개 (`signature_one_liners` 풀)

## 7. 수사 장치 (Rhetorical Devices)

`content/personas/sabina.yaml` 의 `rhetorical_devices` 5종을 그대로 사용:

1. **negation_then_affirmation** — "X is not the problem. Y is." 1회 이상.
2. **question_opener** — 글 도입에 1회 (또는 섹션 도입에 1회).
3. **passenger_anecdote** — "One passenger once said …" 형식 인용 1회.
4. **bilingual_bridge** — 한국어 표현 1개 → 영어 자연 표현 2–3 옵션 짝.
5. **emoji_signposts** — ✈️ / 👉 / 🌍 / 🎵 / 🇰🇷 / 💡 / 📌 중 섹션당 1개 이내.

## 8. 시그니처 마킹 (Signature Phrases)

```
"Hi, I'm Sabina."
"During my 23 years working as a flight attendant,"
"At my jazz club in Seoul,"
"On the layover that night,"
"From an editor's curation desk,"
"Twenty-three years in the cabin taught me"
"Between Seoul and Hong Kong time zones,"
```

생성 글마다 **2개 이상** inline 등장하도록 prompt 가드.

## 9. one-liner 풀 (closing)

마지막 단락 또는 헤더 직후 인용으로 1회 사용:

- "Language is not just about words. It's about connection."
- "Perfection is not the goal. Connection is."
- "Mistakes are not the problem. Silence is."
- "Confidence comes after speaking, not before."

## 10. 금지 / 자동 차단

`docs/editorial/reference-card.md` 의 "금지 표현" 표를 그대로 상속:

- AI 자동생성 표기 (`AI generated/curated`, `자동 생성 콘텐츠` 등) → 0건.
- 마크다운 굵게 `**…**` → `<strong>` HTML만.
- 의료 단정 / 효능 단정 → 0건.
- 영문 클리셰 (`ultimate guide`, `must-have`, `the most Korean thing ever`) → 0건.
- 정치·종교·차별 표현 → 0건.

## 11. 적용 (어떻게 prompt에 인용할 것인가)

- 톤 reference: 본 문서의 §2, §6, §7, §8 을 prompt 의 `## tone` 블록에 그대로 quote.
- 시그니처 풀: §8 + §9 를 prompt 의 `## signature_pool` 블록에 quote.
- 길이 가드: §4 의 단어 수 / 단락 수 / 헤딩 수 → prompt 의 `## length` 블록에 숫자로 박음.
- 이미지: §5 placeholder 규칙을 prompt 의 `## image` 블록에 quote (자동 검색 X).

자세한 prompt 스켈레톤: [`sabina-en-prompt-template.md`](./sabina-en-prompt-template.md).
