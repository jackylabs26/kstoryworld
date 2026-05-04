# Hexagon webhook input contract (JAC-1895)

When a hexagon-mode kickoff calls a content-generator workflow
(`/webhook/generate-{kdrama,kfood,kpop,kbeauty}-content`) the body MUST include
the fields below in addition to the existing `keyword/category/tone/...` shape.

When `hexagon_id` is absent the workflow runs in legacy single-article mode and
self-check `14_anchor_backlink_present` auto-passes (no regression for the
existing daily 04–06 KST routines).

| Field | Required | Type | Description |
|---|---|---|---|
| `hexagon_id` | hexagon mode | string slug | Matches `content/hexagons/<slug>.yaml`. Also used to derive the anchor URL `/dramas/<slug>`. |
| `anchor_drama` | hexagon sister | object | Anchor seed forwarded to sister-domain prompts. Required keys: `title_ko`, `title_en`, `year`, `network`. Optional: `key_motifs` (string[]). The anchor (k-drama) workflow ignores this field — the anchor is itself. |

## Sister-domain anchor seed (`anchor_drama`)

```jsonc
{
  "title_ko": "별에서 온 그대",
  "title_en": "My Love from the Star",
  "year": 2013,
  "network": "SBS",
  "key_motifs": ["첫눈", "치맥", "한강 야경"]
}
```

The Claude system prompt in k-food / k-pop / k-beauty workflows reads this
object and injects a "Hexagon mode" block instructing the model to weave **at
least one** backlink to `/dramas/<hexagon_id>` into the body or meta. The
`key_motifs` array is offered as soft cues for natural integration.

## Self-check `14_anchor_backlink_present` (JAC-1895)

Added to the existing `Format & Self-Check` node in every workflow.

| Workflow | Behavior |
|---|---|
| `k-drama` (anchor) | Auto-pass — the article *is* the anchor; backlink is meaningless. |
| `k-food` / `k-pop` / `k-beauty` (sisters), `hexagon_id` set | Body or meta MUST contain the `hexagon_id` slug at least once. The slug match is URL-shape-agnostic — `/dramas/<id>`, `/content/reviews/<id>-ko.html`, or any future canonical pattern that embeds the slug all satisfy the check. Failure flips `self_check.pass = false` and blocks publish. |
| Any workflow, `hexagon_id` absent | Auto-pass (legacy single-article mode). |

## Example sister webhook body

```json
{
  "task_id": "JAC-XXXX",
  "category": "k-food",
  "keyword": "치맥 한강 별에서 온 그대",
  "tone": "에디터 큐레이션",
  "language_pair": ["ko","en"],
  "sections": ["intro","what_it_is","cultural_context","how_to_enjoy","closing","source"],
  "guards": ["12-check","no-ai-copy","food-safety-negative-exclusion"],

  "hexagon_id": "my-love-from-the-star",
  "anchor_drama": {
    "title_ko": "별에서 온 그대",
    "title_en": "My Love from the Star",
    "year": 2013,
    "network": "SBS",
    "key_motifs": ["첫눈", "치맥", "한강 야경"]
  }
}
```

## Source of truth

The patcher [`apply-hexagon-self-check.py`](./apply-hexagon-self-check.py) is
the single command that re-emits the `14_anchor_backlink_present` injection and
the sister-prompt anchor block into every workflow JSON. Edit the patcher when
the contract changes; do not hand-edit individual workflow JSONs.

```
python3 n8n-workflows/_lib/apply-hexagon-self-check.py
```
