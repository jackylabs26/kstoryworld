# content/hexagons

헥사곤 콘텐츠 모델의 매니페스트 파일이 사는 디렉터리. 1 헥사곤 = 앵커 K-Drama 1편 + 자매 5편 (k-food, k-pop, k-beauty, k-travel, k-literature).

- 스키마 정의: [`_schema.yaml`](./_schema.yaml)
- 기준 plan: [JAC-1836 plan rev2](/JAC/issues/JAC-1836#document-plan) §2
- 인프라 작업 ticket: [JAC-1893](/JAC/issues/JAC-1893)

## 인스턴스 명명 규칙

- 파일명: `<hexagon_id>.yaml` (예: `my-love-from-the-star.yaml`)
- `hexagon_id` 는 영문 소문자 + 하이픈, 앵커 드라마 영문 슬러그와 동일.

## 라이프사이클

1. draft — board 게이트 1 (시드+헤드라인+이미지 디렉션) 승인 시 생성.
2. ready_for_board — 6편 모두 self-check #1~#15 pass.
3. gate2_pending — `board-routine/hexagon-gate-aggregator.sh` 가 부모 헥사곤 issue 에 게이트 2 `request_confirmation` 생성.
4. gate2_accepted — main 머지 + Cloudflare 배포 → publish.
5. gate2_rejected — 지정 자매 도메인 재작성, 다시 1로.

## 자매 워크플로 입력 계약

자매 도메인 n8n 워크플로는 webhook body 에 다음을 추가로 받는다 (헥사곤 모드일 때만):

```json
{
  "hexagon_id": "my-love-from-the-star",
  "anchor_drama": "별에서 온 그대",
  "anchor_url_ko": "/content/dramas/my-love-from-the-star-ko.html",
  "anchor_url_en": "/content/dramas/my-love-from-the-star-en.html",
  "anchor_seed": { "person": "천송이", "year": 2013, "platform": "SBS", "key_motif": "첫눈 치맥" },
  "publish_month": "2026-04"
}
```

위 필드가 없으면 워크플로는 일반 (non-hexagon) 모드로 동작 — self-check #14·#15 는 skip.

자세한 계약은 [`/n8n-workflows/_lib/hexagon-input-contract.md`](../../n8n-workflows/_lib/hexagon-input-contract.md).

## Self-check #14·#15

- #14 `anchor_backlink_present` — 자매 article 본문 + 메타에 앵커 K-Drama URL 1회 이상 등장.
- #15 `images_present_with_license` — hero 1 + inline ≥1, 모든 이미지 source ∈ 화이트리스트, 5필드 + alt_text(ko/en) 충족, 분기별 default seasonal_tone 검사 (사실 충실도 예외 1장 허용).

구현: [`/scripts/hexagon/validate-article.mjs`](../../scripts/hexagon/validate-article.mjs) (publish-time) + 각 n8n 워크플로의 `Format & Self-Check` Code node.
