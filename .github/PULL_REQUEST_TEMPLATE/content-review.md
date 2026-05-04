<!--
보드 검토용 컨텐츠 PR 템플릿 (JAC-1982 Phase 1 / JAC-1983).
신규 컨텐츠 PR 또는 기존 컨텐츠 backfill PR 시 사용.
n8n 자동생성기는 본 템플릿 섹션을 자동으로 채워서 PR을 엽니다.
-->

## 메타

- **카테고리**: <!-- k-drama / k-pop / k-food / k-beauty / k-travel / k-literature / hexagon-bundle / review -->
- **슬러그**: <!-- 영문 소문자 + 하이픈, 예: chimaek-fried-chicken-beer -->
- **언어쌍**: ko + en (둘 다 첨부)
- **화자 페르소나** (`narrator_persona_slug`): <!-- sabina / jacky / minji / hiroshi / alejandra / cheolsu / yuna / echo -->
- **타겟 발행일**: <!-- YYYY-MM-DD -->
- **앵커 헥사곤** (해당 시): <!-- hexagon slug, 예: my-love-from-the-star -->
- **소스 이슈**: <!-- JAC-XXXX -->
- **Vercel preview URL**: <!-- main 머지 전 자동 생성된 preview link -->

## 요약 (1~2 문장, ko)

<!-- 보드가 한눈에 톤/주제를 파악할 수 있도록. 본문 인트로 발췌가 아닌 에디터 노트. -->

## 파일 목록

<!-- 머지 시 추가/변경되는 content/* 파일들. 자동 채움 권장. -->

- [ ] `content/{cat}/{slug}-ko.{md|html}`
- [ ] `content/{cat}/{slug}-en.{md|html}`

## Self-Check 결과 (JAC-1952 표준)

> 자동 생성기가 채움. 수기 PR은 직접 체크.
> 모든 항목 통과(✅)여야 보드 검토 진입.

### 12 universal check

- [ ] #1 category 메타 존재
- [ ] #2 ko title 비어 있지 않음
- [ ] #3 en title 비어 있지 않음
- [ ] #4 ko slug 형식 (영문 소문자 + 하이픈)
- [ ] #5 en slug 형식 (영문 소문자 + 하이픈)
- [ ] #6 ko meta_description 비어 있지 않음
- [ ] #7 en meta_description 비어 있지 않음
- [ ] #8 ko 본문 ≥ 600자
- [ ] #9 en 본문 ≥ 200 단어
- [ ] #10 카테고리 정의 섹션 모두 채움
- [ ] #11 의료/효능 단정 차단어 미발견
- [ ] #12 AI 자동생성 표기 미발견 (`npm run check:no-ai-copy`)

### Universal extension (JAC-1952)

- [ ] #12a 이미지 ≥ 1장 + 5개 메타(`source` / `asset_id` / `license` / `credit` / `seasonal_tone`) + 화이트리스트 출처 (`unsplash` / `pexels` / `pixabay` / `wikimedia` / `cc0` / `cc-by`)
- [ ] #16 마크다운 굵게 ban — 본문/메타에 `**...**` 0건 (`npm run check:no-bold-emphasis`)
- [ ] #17 YouTube URL ≥ 1건 (`youtube.com/(watch|embed|shorts)` 또는 `youtu.be/`)
- [ ] #18 `narrator_persona_slug` 메타 채움

### 13-check (K-Drama 전용)

- [ ] #13 출처 본문 토큰 ⊆ 본문 토큰 비율 ≥ 0.15

### Hexagon 모드 (해당 시)

- [ ] #14 헥사곤 자매 5편 모두 동일 앵커 드라마 참조
- [ ] #15 hero 이미지 1장 + inline 이미지 ≥ 1장
- [ ] #15a 헥사곤 매니페스트 (`content/hexagons/<slug>.yaml`) 동봉 + 6편 슬러그 매핑

## Echo 검토 (CMO / editor's-desk 1차)

> Echo 페르소나(`content/personas/echo.yaml`) 톤으로 1차 큐레이션 노트.
> 큐레이션이라는 건 결국 무엇을 빼는가의 문제.

<!-- Echo 의견 채움 — 자동/수기 -->

- 큐레이션 근거:
- 빼야 할 것 / 보강할 것:
- 카테고리 fit 점수 (1~5):

## 보드 결정

해당 항목에 ✅ 표시:

- [ ] **승인** → `approved` 라벨 부착 + 머지
- [ ] **편집 후 승인** → `approved-after-edit` 라벨 + 본 PR 에 편집 코멘트 → 머지
- [ ] **거절** → `rejected` + 아래 사유 라벨 1개 이상 부착 후 close

### 거절 사유 라벨 (rejected 시 1개 이상 선택)

- `reject-fact` — 사실관계 오류
- `reject-style` — 톤/문체 부적합
- `reject-source` — 출처/이미지 라이선스 문제
- `reject-tone` — 페르소나/카테고리 톤 미스매치
- `reject-other` — 기타 (본문 코멘트로 사유 명시)

> 라벨 정의 단일 SoT: `scripts/sync-labels.sh`. 라벨 추가/변경 시 스크립트와 본 섹션을 함께 갱신.

## 후속 자동화 (참고)

- PR opened/synchronize → GitHub Actions (JAC-1985) 가 보드 이메일(`sskim7415@gmail.com`) + PDF + MD 번들 자동 발송.
- PR closed (merged=true) → "게재 승인 완료" 알림.
- PR closed (merged=false) → 라벨/마지막 코멘트에서 거절 사유 추출 → "거절: <사유>" 알림.
