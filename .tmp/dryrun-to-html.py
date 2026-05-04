#!/usr/bin/env python3
"""JAC-1988 — One-shot converter: dryrun JSON drafts → interim HTML pages.

Reads a list of dryrun JSON files (each containing draft.ko and draft.en) and
emits two HTML pages per JSON into content/foods/ (k-food) or content/beauties/
(k-beauty), using the EN slug as the filename stem.

The output is interim only: every page carries
  <meta name="robots" content="noindex,nofollow">
  <meta name="hexagon-pending" content="true">
so AdSense / search indexers stay away until the matching hexagon article ships.
"""
from __future__ import annotations

import argparse
import html
import json
import re
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent

CATEGORY_DIR = {
    "k-food": "foods",
    "k-beauty": "beauties",
}

KO_SECTION_TITLES = {
    "intro": "도입",
    "what_it_is": "무엇인가",
    "trend_snapshot": "트렌드 스냅샷",
    "cultural_context": "문화적 맥락",
    "how_to_enjoy": "즐기는 법",
    "how_to_use": "사용법",
    "editor_picks": "에디터 픽",
    "closing": "마무리",
    "source": "출처",
}

EN_SECTION_TITLES = {
    "intro": "Intro",
    "what_it_is": "What It Is",
    "trend_snapshot": "Trend Snapshot",
    "cultural_context": "Cultural Context",
    "how_to_enjoy": "How To Enjoy",
    "how_to_use": "How To Use",
    "editor_picks": "Editor Picks",
    "closing": "Closing",
    "source": "Source",
}

LANG_META = {
    "ko": {
        "html_lang": "ko",
        "language_label": "한국어",
        "section_titles": KO_SECTION_TITLES,
        "interim_notice": (
            "헥사곤 본편 발행 전 임시 페이지입니다. "
            "검색 색인은 비활성화되어 있으며 (noindex), "
            "본편이 게재되면 이 페이지는 정식 글로 대체됩니다."
        ),
    },
    "en": {
        "html_lang": "en",
        "language_label": "English",
        "section_titles": EN_SECTION_TITLES,
        "interim_notice": (
            "Interim placeholder ahead of the full hexagon article. "
            "Search indexing is disabled (noindex); this page will be "
            "replaced once the full edition ships."
        ),
    },
}

CATEGORY_LABEL = {
    ("k-food", "ko"): "K-Food",
    ("k-food", "en"): "K-Food",
    ("k-beauty", "ko"): "K-Beauty",
    ("k-beauty", "en"): "K-Beauty",
}

URL_RE = re.compile(r"https?://[^\s<>\"']+")


def linkify(text: str) -> str:
    """Convert plain http(s) URLs in already-escaped text into <a> tags."""
    def _sub(match: re.Match[str]) -> str:
        url = match.group(0)
        return f'<a href="{url}" rel="nofollow noopener" target="_blank">{url}</a>'
    return URL_RE.sub(_sub, text)


def render_paragraph(raw: str) -> str:
    escaped = html.escape(raw, quote=False)
    return f"<p>{linkify(escaped)}</p>"


STYLE_BLOCK = """    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.8; color: #333; }
        img { max-width: 100%; height: auto; border-radius: 8px; }
        h1 { color: #1a1a1a; border-bottom: 2px solid #e0e0e0; padding-bottom: 10px; }
        h2 { color: #2c3e50; margin-top: 30px; }
        h3 { color: #34495e; margin-top: 25px; }
        a { color: #3498db; text-decoration: none; }
        a:hover { text-decoration: underline; }
        .meta { color: #666; font-size: 0.9em; margin-bottom: 20px; }
        .interim-notice { background: #fff8e1; border-left: 4px solid #f0b400; padding: 12px 16px; margin: 16px 0 28px; font-size: 0.95em; color: #5c4400; border-radius: 4px; }
    </style>"""


def build_html(category: str, lang: str, draft_lang: dict, tags: list[str]) -> str:
    meta = LANG_META[lang]
    section_titles = meta["section_titles"]

    title = draft_lang.get("title", "").strip()
    meta_description = draft_lang.get("meta_description", "").strip()
    sections = draft_lang.get("sections", {}) or {}

    title_html = html.escape(title)
    description_html = html.escape(meta_description, quote=True)
    tags_attr = html.escape(", ".join(tags), quote=True)
    category_label = CATEGORY_LABEL.get((category, lang), category)
    language_label = meta["language_label"]

    section_html_parts: list[str] = []
    for key, body in sections.items():
        if not body:
            continue
        heading = section_titles.get(key, key.replace("_", " ").title())
        section_html_parts.append(f"    <h3>{html.escape(heading)}</h3>")
        section_html_parts.append("    " + render_paragraph(body))

    section_html = "\n".join(section_html_parts)
    interim_notice = html.escape(meta["interim_notice"])

    return f"""<!DOCTYPE html>
<html lang="{meta['html_lang']}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="robots" content="noindex,nofollow">
    <meta name="hexagon-pending" content="true">
    <meta name="description" content="{description_html}">
    <meta name="category" content="{html.escape(category)}">
    <meta name="tags" content="{tags_attr}">
    <title>{title_html}</title>
{STYLE_BLOCK}
</head>
<body>
    <h1>{title_html}</h1>
    <div class="meta">Language: {language_label} · Editor's Curation · {category_label}</div>
    <div class="interim-notice">{interim_notice}</div>

{section_html}
</body>
</html>
"""


def convert_one(json_path: Path, repo_root: Path) -> list[Path]:
    data = json.loads(json_path.read_text(encoding="utf-8"))
    draft = data.get("draft") or {}
    category = draft.get("category")
    tags = draft.get("tags") or []
    if category not in CATEGORY_DIR:
        raise SystemExit(f"unsupported category {category!r} in {json_path}")
    out_dir = repo_root / "content" / CATEGORY_DIR[category]
    out_dir.mkdir(parents=True, exist_ok=True)

    en_slug = (draft.get("en") or {}).get("slug")
    if not en_slug:
        raise SystemExit(f"missing en.slug in {json_path}")

    written: list[Path] = []
    for lang in ("ko", "en"):
        draft_lang = draft.get(lang)
        if not draft_lang:
            raise SystemExit(f"missing {lang} draft in {json_path}")
        out_path = out_dir / f"{en_slug}-{lang}.html"
        out_path.write_text(
            build_html(category, lang, draft_lang, tags),
            encoding="utf-8",
        )
        written.append(out_path)
    return written


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("json_files", nargs="+", type=Path)
    parser.add_argument("--repo-root", type=Path, default=REPO_ROOT)
    args = parser.parse_args()

    all_written: list[Path] = []
    for jf in args.json_files:
        all_written.extend(convert_one(jf, args.repo_root))

    print(f"wrote {len(all_written)} files:")
    for p in all_written:
        print(f"  - {p.relative_to(args.repo_root)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
