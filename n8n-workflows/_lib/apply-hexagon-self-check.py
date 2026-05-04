#!/usr/bin/env python3
"""Apply JAC-1895 hexagon-mode patches to every n8n content-generator workflow.

For each of `kdrama`, `kfood`, `kpop`, `kbeauty`:
  1. Inject the `14_anchor_backlink_present` self-check into the
     `Format & Self-Check` Code node, replacing any prior injection.
  2. Make the `self_check_summary` summary string dynamic so adding a 14th check
     no longer requires touching the hard-coded `12/12 통과` / `13/13 통과`.
  3. For sister workflows (k-food / k-pop / k-beauty) inject the
     `# 헥사곤 모드 (자매 콘텐츠)` block into the Claude user-prompt template,
     guarded so legacy non-hexagon calls render exactly as before.

The patcher is idempotent — re-running on already-patched JSONs replaces the
prior injection rather than stacking copies. Hand-edits to the injection block
are clobbered on the next run; edit this file instead.
"""

from __future__ import annotations

import json
import pathlib
import re
import sys

REPO = pathlib.Path(__file__).resolve().parents[2]
WORKFLOW_DIR = REPO / "n8n-workflows"

WORKFLOWS = {
    "kdrama": {
        "category": "k-drama",
        "is_anchor": True,
        "format_self_check_node": "Format & Self-Check",
        "claude_node": "Fetch Source + Claude Draft",
        "claude_node_kind": "code",
        "all_text_var": "allText",
        "summary_old_total": "13/13",
    },
    "kfood": {
        "category": "k-food",
        "is_anchor": False,
        "format_self_check_node": "Format & Self-Check",
        "claude_node": "Claude Draft K-Food Post",
        "claude_node_kind": "http",
        "all_text_var": "allText",
        "summary_old_total": "12/12",
    },
    "kpop": {
        "category": "k-pop",
        "is_anchor": False,
        "format_self_check_node": "Format & Self-Check",
        "claude_node": "Claude Draft K-Pop Post",
        "claude_node_kind": "http",
        "all_text_var": "body_text",
        "summary_old_total": "12/12",
    },
    "kbeauty": {
        "category": "k-beauty",
        "is_anchor": False,
        "format_self_check_node": "Format & Self-Check",
        "claude_node": "Claude Draft K-Beauty Post",
        "claude_node_kind": "http",
        "claude_prompt_dialect": "n8n_curly",
        "all_text_var": "(koTextOnly + ' ' + enTextOnly)",
        "summary_old_total": None,  # kbeauty already uses dynamic passed/total
    },
}

INJECTION_BEGIN = "// >>> JAC-1895 hexagon-anchor-backlink BEGIN"
INJECTION_END = "// <<< JAC-1895 hexagon-anchor-backlink END"


def render_self_check_injection(*, category: str, is_anchor: bool, all_text_var: str) -> str:
    """JS snippet inserted between `const checks = {...};` and the pass aggregator."""
    anchor_branch = (
        "true /* anchor (k-drama): self-pass per JAC-1895 spec C */"
        if is_anchor
        else f"({all_text_var} || '').includes(hxId)"
    )
    lines = [
        INJECTION_BEGIN,
        "// Hexagon mode is opt-in via `body.hexagon_id`. When absent, we auto-pass to",
        "// preserve the legacy single-article daily routine. Sister domains in hexagon",
        "// mode must include the anchor slug (the hexagon_id) somewhere in body+meta —",
        "// flexible enough to match `/dramas/<id>` or `/content/reviews/<id>-ko.html`",
        "// or any other URL the publish layer adopts. The k-drama anchor self-passes.",
        "const hxTrigger = $('Webhook Trigger').first().json.body || {};",
        "const hxId = hxTrigger.hexagon_id || null;",
        f"const hxCategory = {json.dumps(category)};",
        "let hxBacklinkOk;",
        "if (!hxId) {",
        "  hxBacklinkOk = true; // legacy mode",
        "} else {",
        f"  hxBacklinkOk = {anchor_branch};",
        "}",
        "checks['14_anchor_backlink_present'] = hxBacklinkOk;",
        INJECTION_END,
    ]
    return "\n".join(lines)


def patch_format_self_check(js_code: str, *, category: str, is_anchor: bool, all_text_var: str, summary_old_total: str | None) -> str:
    """Inject the #14 backlink check; make the X/X summary dynamic."""

    # 1. Strip any prior injection (idempotency).
    js_code = re.sub(
        re.escape(INJECTION_BEGIN) + r".*?" + re.escape(INJECTION_END) + r"\n?",
        "",
        js_code,
        flags=re.DOTALL,
    )

    injection = render_self_check_injection(
        category=category, is_anchor=is_anchor, all_text_var=all_text_var
    )

    # 2. Insert before the line that aggregates the pass result.
    #    kdrama/kfood/kpop:  `const pass = Object.values(checks).every(Boolean);`
    #    kbeauty:            `const passed = ...; const total = ...; const pass = passed === total;`
    #    Match either form by anchoring on the `const passed = ...` (kbeauty) line first
    #    and falling back to `const pass = ...checks...`.
    pass_line_re = re.compile(
        r"^(\s*)(const passed = Object\.values\(checks\)|const pass = .*checks)",
        re.MULTILINE,
    )
    match = pass_line_re.search(js_code)
    if not match:
        raise RuntimeError("could not find pass-aggregator line")
    indent = match.group(1)
    indented_injection = "\n".join(indent + ln if ln else ln for ln in injection.split("\n"))
    js_code = js_code[: match.start()] + indented_injection + "\n" + js_code[match.start():]

    # 3. Make the summary X/X dynamic so adding #14 doesn't require a literal bump.
    if summary_old_total is not None:
        passed_n, total_n = summary_old_total.split("/")
        # Replace `'X/X 통과'` (single-quoted literal) with template literal using checks size.
        js_code = js_code.replace(
            f"'{passed_n}/{total_n} 통과'",
            "`${Object.keys(checks).length}/${Object.keys(checks).length} 통과`",
        )
        # Replace `${...}/X 통과` (in the failure branch) with `${...}/${total} 통과`
        js_code = js_code.replace(
            f"/{total_n} 통과",
            "/${Object.keys(checks).length} 통과",
        )

    return js_code


# --- Sister-domain Claude prompt anchor block ---------------------------------

PROMPT_BEGIN = "/* >>> JAC-1895 hexagon-anchor-prompt BEGIN */"
PROMPT_END = "/* <<< JAC-1895 hexagon-anchor-prompt END */"


def render_anchor_prompt_block(category: str) -> str:
    """JS expression that evaluates to either '' or the hexagon-mode prompt block.

    Inserted into the Claude user-content template literal — both HTTP-body
    workflows (k-food, k-beauty) and the k-pop Code-node template share the
    same `${...}` template-literal contract.
    """
    return (
        PROMPT_BEGIN
        + "\n"
        + "${(() => {\n"
        + "  const __hxBody = $('Webhook Trigger').first().json.body || {};\n"
        + "  const __hxId = __hxBody.hexagon_id;\n"
        + "  const __ad = __hxBody.anchor_drama;\n"
        + "  if (!__hxId || !__ad || typeof __ad !== 'object') return '';\n"
        + "  const __motifs = Array.isArray(__ad.key_motifs) ? __ad.key_motifs.filter(Boolean).join(', ') : '';\n"
        + "  return [\n"
        + "    '',\n"
        + "    '# 헥사곤 모드 (자매 콘텐츠)',\n"
        + f"    '- 본 글은 K-드라마 앵커 콘텐츠의 자매 글(' + {json.dumps(category)} + ')입니다.',\n"
        + "    '- 앵커 드라마: \"' + (__ad.title_ko || '') + '\" (' + (__ad.title_en || '') + ', ' + (__ad.year || '') + ', ' + (__ad.network || '') + ').',\n"
        + "    __motifs ? '- 핵심 모티프: ' + __motifs + '. 가능한 범위에서 본문 큐레이션과 자연스럽게 연결하세요.' : '',\n"
        + "    '- **필수**: 본문 또는 메타 설명에 정확히 1회 이상 앵커 페이지로의 링크를 포함하세요. URL 패턴: /dramas/' + __hxId,\n"
        + "    '  - 한국어 본문 예: \"...자세한 작품 해설은 [별에서 온 그대 가이드](/dramas/' + __hxId + ')에서 확인...\"',\n"
        + "    '  - 영어 본문 예: \"...read the full anchor guide at /dramas/' + __hxId + '...\"',\n"
        + "    '- 강제로 끼워넣지 말고, 본문 흐름에서 자연스러운 위치에 배치하세요.',\n"
        + "    '',\n"
        + "  ].filter(Boolean).join('\\n');\n"
        + "})()}"
        + "\n"
        + PROMPT_END
    )


def render_anchor_prompt_block_n8n_curly(category: str) -> str:
    """Inline n8n `{{ ... }}` expression form, used by workflows whose Claude HTTP body
    is structured as a JS object literal with `{{ }}` template tags inside string values
    (kbeauty). Avoids IIFE/arrow-function syntax for engine compatibility — uses pure
    ternary and string concatenation."""
    # NOTE: literal `\\n` in the rendered output represents JSON-escaped newline,
    # i.e. an actual `\n` in the output string. Two backslashes here become
    # one backslash + n in the final JS source, which is the JS escape for newline.
    return (
        PROMPT_BEGIN
        + "\\n"
        + "{{ ($('Webhook Trigger').first().json.body && $('Webhook Trigger').first().json.body.hexagon_id && $('Webhook Trigger').first().json.body.anchor_drama) ? "
        + "('\\n# 헥사곤 모드 (자매 콘텐츠)\\n' + "
        + "'- 본 글은 K-드라마 앵커 콘텐츠의 자매 글(' + " + json.dumps(category) + " + ')입니다.\\n' + "
        + "'- 앵커 드라마: \"' + ($('Webhook Trigger').first().json.body.anchor_drama.title_ko || '') + '\" (' + ($('Webhook Trigger').first().json.body.anchor_drama.title_en || '') + ', ' + ($('Webhook Trigger').first().json.body.anchor_drama.year || '') + ', ' + ($('Webhook Trigger').first().json.body.anchor_drama.network || '') + ').\\n' + "
        + "((Array.isArray($('Webhook Trigger').first().json.body.anchor_drama.key_motifs) && $('Webhook Trigger').first().json.body.anchor_drama.key_motifs.length) ? ('- 핵심 모티프: ' + $('Webhook Trigger').first().json.body.anchor_drama.key_motifs.filter(Boolean).join(', ') + '. 가능한 범위에서 본문 큐레이션과 자연스럽게 연결하세요.\\n') : '') + "
        + "'- **필수**: 본문 또는 메타에 정확히 1회 이상 앵커 페이지로의 링크를 포함하세요. URL 패턴: /dramas/' + $('Webhook Trigger').first().json.body.hexagon_id + '\\n' + "
        + "'- 강제로 끼워넣지 말고, 본문 흐름에서 자연스러운 위치에 배치하세요.\\n') : '' }}"
        + "\\n"
        + PROMPT_END
    )


def patch_claude_prompt_template(template: str, category: str, dialect: str = "js_template") -> str:
    """Insert (or refresh) the anchor block.

    - js_template (kfood, kpop): backtick template literal with `${...}` interpolation —
      we drop in an IIFE that returns either '' or the prompt block. Inserted just
      before the `# 출력 형식` directive marker.
    - n8n_curly (kbeauty): JS object literal with string values containing `{{ ... }}`
      n8n template tags. We append the prompt block to the END of `messages[0].content`
      (just before the closing `"`) so it appears before the JSON-only-response trailer.
    """
    if dialect == "n8n_curly":
        # Strip prior injection.
        template = re.sub(
            re.escape(PROMPT_BEGIN) + r".*?" + re.escape(PROMPT_END) + r"\\n?",
            "",
            template,
            flags=re.DOTALL,
        )
        block = render_anchor_prompt_block_n8n_curly(category)
        # Find the literal `JSON으로만 응답:` marker — kbeauty's content string places
        # the JSON-only-response trailer right after it. Inserting the hexagon block
        # BEFORE that trailer keeps directive ordering coherent.
        marker = "JSON으로만 응답:"
        idx = template.find(marker)
        if idx == -1:
            raise RuntimeError(
                f"could not find 'JSON으로만 응답:' marker in n8n_curly prompt for {category}"
            )
        return template[:idx] + block + "\\n\\n" + template[idx:]

    # js_template dialect (kfood, kpop)
    template = re.sub(
        re.escape(PROMPT_BEGIN) + r".*?" + re.escape(PROMPT_END) + r"\n?",
        "",
        template,
        flags=re.DOTALL,
    )
    block = render_anchor_prompt_block(category)
    marker = "# 출력 형식"
    idx = template.rfind(marker)
    if idx == -1:
        raise RuntimeError(f"could not find '# 출력 형식' marker in prompt template for {category}")
    return template[:idx] + block + "\n\n" + template[idx:]


def patch_workflow(name: str, cfg: dict) -> bool:
    path = WORKFLOW_DIR / f"{name}-content-generator.json"
    wf = json.loads(path.read_text(encoding="utf-8"))
    changed = False

    for node in wf.get("nodes", []):
        if node.get("name") == cfg["format_self_check_node"]:
            old = node["parameters"]["jsCode"]
            new = patch_format_self_check(
                old,
                category=cfg["category"],
                is_anchor=cfg["is_anchor"],
                all_text_var=cfg["all_text_var"],
                summary_old_total=cfg["summary_old_total"],
            )
            if new != old:
                node["parameters"]["jsCode"] = new
                changed = True

        if not cfg["is_anchor"] and node.get("name") == cfg["claude_node"]:
            dialect = cfg.get("claude_prompt_dialect", "js_template")
            if cfg["claude_node_kind"] == "http":
                old = node["parameters"].get("jsonBody", "")
                new = patch_claude_prompt_template(old, cfg["category"], dialect)
                if new != old:
                    node["parameters"]["jsonBody"] = new
                    changed = True
            elif cfg["claude_node_kind"] == "code":
                old = node["parameters"].get("jsCode", "")
                new = patch_claude_prompt_template(old, cfg["category"], dialect)
                if new != old:
                    node["parameters"]["jsCode"] = new
                    changed = True

    if changed:
        # Preserve the source file's trailing-newline convention so the diff
        # against main only contains the actual node-code edits.
        had_trailing_newline = path.read_text(encoding="utf-8").endswith("\n")
        out = json.dumps(wf, ensure_ascii=False, indent=2)
        if had_trailing_newline:
            out += "\n"
        path.write_text(out, encoding="utf-8")
        print(f"[apply-hexagon-self-check] patched {name}")
    else:
        print(f"[apply-hexagon-self-check] {name} already up-to-date")
    return changed


def main() -> int:
    any_changed = False
    for name, cfg in WORKFLOWS.items():
        any_changed |= patch_workflow(name, cfg)
    if not any_changed:
        print("[apply-hexagon-self-check] no changes")
    return 0


if __name__ == "__main__":
    sys.exit(main())
