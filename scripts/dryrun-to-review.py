#!/usr/bin/env python3
"""Convert n8n dryrun JSON drafts into final-publish review pages.

Reads dryrun JSON files (each containing draft.ko and draft.en with sections)
and emits two HTML pages per JSON into content/reviews/ using the EN slug as
the filename stem.

Output is full-publish, NOT interim:
  - No noindex / nofollow / hexagon-pending meta
  - File goes directly into content/reviews/ where lib/reviews.ts scans
  - Apostrophes and quotes in text-content positions are NOT entity-escaped
    (only attribute values are, where the encoding is required)

Categories supported: every value in lib/categories.ts REVIEW_CATEGORIES
(k-pop, k-drama, k-food, k-beauty, k-literature, k-travel).

Usage:
    python3 scripts/dryrun-to-review.py n8n-workflows/_dryrun-samples/<file>.json [...]
    python3 scripts/dryrun-to-review.py --dry-run <file>.json    # print to stdout

Exit codes:
    0  success
    1  validation failure (missing draft, empty sections, unknown category, etc.)
    2  output file already exists (use --force to overwrite)
"""
from __future__ import annotations

import argparse
import html
import json
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent

REVIEW_CATEGORIES = {
    "k-pop", "k-drama", "k-food", "k-beauty", "k-literature", "k-travel",
}

CATEGORY_LABEL = {
    "k-pop": "K-Pop",
    "k-drama": "K-Drama",
    "k-food": "K-Food",
    "k-beauty": "K-Beauty",
    "k-literature": "K-Literature",
    "k-travel": "K-Travel",
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
    "ko": {"html_lang": "ko", "label": "한국어", "titles": KO_SECTION_TITLES},
    "en": {"html_lang": "en", "label": "English", "titles": EN_SECTION_TITLES},
}

STYLE_BLOCK = """    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.8; color: #333; }
        img { max-width: 100%; height: auto; border-radius: 8px; }
        h1 { color: #1a1a1a; border-bottom: 2px solid #e0e0e0; padding-bottom: 10px; }
        h2 { color: #2c3e50; margin-top: 30px; }
        h3 { color: #34495e; margin-top: 25px; }
        a { color: #3498db; text-decoration: none; }
        a:hover { text-decoration: underline; }
        .meta { color: #666; font-size: 0.9em; margin-bottom: 20px; }
    </style>"""


def escape_text(s: str) -> str:
    """Escape for HTML text content (between tags). Apostrophes/quotes are safe."""
    return html.escape(s, quote=False)


def escape_attr(s: str) -> str:
    """Escape for a double-quoted HTML attribute value.

    Escapes &, <, >, and " (the attribute boundary). Leaves ' as raw — valid
    inside double-quoted attributes and consistent with the rest of the
    codebase's plain-text style (see PR #33).
    """
    return (
        s.replace("&", "&amp;")
         .replace("<", "&lt;")
         .replace(">", "&gt;")
         .replace('"', "&quot;")
    )


def build_html(category: str, lang: str, draft_lang: dict, tags: list) -> str:
    meta = LANG_META[lang]
    section_titles = meta["titles"]

    title = (draft_lang.get("title") or "").strip()
    description = (draft_lang.get("meta_description") or "").strip()
    sections = draft_lang.get("sections") or {}
    cat_label = CATEGORY_LABEL[category]

    parts = []
    for key, body in sections.items():
        body = (body or "").strip()
        if not body:
            continue
        heading = section_titles.get(key, key.replace("_", " ").title())
        parts.append(f"    <h3>{escape_text(heading)}</h3>")
        parts.append(f"    <p>{escape_text(body)}</p>")
    sections_html = "\n".join(parts)

    return (
        f"""<!DOCTYPE html>
<html lang="{meta['html_lang']}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="{escape_attr(description)}">
    <meta name="category" content="{escape_attr(category)}">
    <meta name="tags" content="{escape_attr(', '.join(tags))}">
    <title>{escape_text(title)}</title>
{STYLE_BLOCK}
</head>
<body>
    <h1>{escape_text(title)}</h1>
    <div class="meta">Language: {meta['label']} · Editor's Curation · {cat_label}</div>

{sections_html}
</body>
</html>
"""
    )


def validate_draft(json_path: Path, draft: dict) -> tuple[str, str, list]:
    """Return (category, en_slug, tags). Raises SystemExit on validation failure."""
    category = draft.get("category")
    if category not in REVIEW_CATEGORIES:
        sys.exit(
            f"[{json_path}] unsupported category {category!r} "
            f"(allowed: {sorted(REVIEW_CATEGORIES)})"
        )

    ko = draft.get("ko") or {}
    en = draft.get("en") or {}
    if not ko or not en:
        sys.exit(f"[{json_path}] missing ko or en draft")

    en_slug = en.get("slug")
    ko_slug = ko.get("slug")
    if not en_slug:
        sys.exit(f"[{json_path}] missing en.slug")
    if ko_slug and ko_slug != en_slug:
        sys.exit(
            f"[{json_path}] ko.slug ({ko_slug!r}) and en.slug ({en_slug!r}) differ"
        )

    for lang_key, lang_draft in (("ko", ko), ("en", en)):
        if not (lang_draft.get("title") or "").strip():
            sys.exit(f"[{json_path}] missing {lang_key}.title")
        sections = lang_draft.get("sections") or {}
        non_empty = [k for k, v in sections.items() if (v or "").strip()]
        if not non_empty:
            sys.exit(f"[{json_path}] {lang_key} has no non-empty sections")

    tags = draft.get("tags") or []
    return category, en_slug, tags


def convert_one(json_path: Path, repo_root: Path, force: bool, dry_run: bool) -> list:
    data = json.loads(json_path.read_text(encoding="utf-8"))
    draft = data.get("draft") or {}
    category, en_slug, tags = validate_draft(json_path, draft)

    out_dir = repo_root / "content" / "reviews"
    written = []
    for lang in ("ko", "en"):
        rendered = build_html(category, lang, draft[lang], tags)
        out_path = out_dir / f"{en_slug}-{lang}.html"

        if dry_run:
            print(f"--- {out_path.relative_to(repo_root)} ---")
            print(rendered)
            continue

        if out_path.exists() and not force:
            sys.exit(
                f"[{out_path}] already exists. Use --force to overwrite, "
                f"or remove the file first."
            )
        out_dir.mkdir(parents=True, exist_ok=True)
        out_path.write_text(rendered, encoding="utf-8")
        written.append(out_path)
    return written


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("json_files", nargs="+", type=Path)
    parser.add_argument("--repo-root", type=Path, default=REPO_ROOT)
    parser.add_argument(
        "--force", action="store_true",
        help="Overwrite existing files in content/reviews/.",
    )
    parser.add_argument(
        "--dry-run", action="store_true",
        help="Print rendered HTML to stdout without writing files.",
    )
    args = parser.parse_args()

    all_written = []
    for jf in args.json_files:
        all_written.extend(convert_one(jf, args.repo_root, args.force, args.dry_run))

    if not args.dry_run:
        print(f"wrote {len(all_written)} files:")
        for p in all_written:
            print(f"  - {p.relative_to(args.repo_root)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
