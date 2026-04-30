#!/usr/bin/env python3
"""Idempotently insert a 'Hexagon Self-Checks (#14·#15)' Code node into each
content-generator workflow JSON, between 'Format & Self-Check' and
'Return Generated Content'.

JAC-1893. Run: python3 n8n-workflows/_lib/apply-hexagon-self-check-node.py
"""
import json
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent  # n8n-workflows/
SNIPPET = ROOT / "_lib" / "hexagon-self-checks.js"

WORKFLOWS = [
    "kdrama-content-generator.json",
    "kfood-content-generator.json",
    "kpop-content-generator.json",
    "kbeauty-content-generator.json",
]

NODE_NAME = "Hexagon Self-Checks (#14·#15)"
NODE_ID = "hexagon-selfcheck"


def patch(wf_path: Path) -> str:
    wf = json.loads(wf_path.read_text())
    nodes = wf.setdefault("nodes", [])
    conns = wf.setdefault("connections", {})

    # already patched?
    existing = next((n for n in nodes if n.get("id") == NODE_ID or n.get("name") == NODE_NAME), None)
    js = SNIPPET.read_text()
    if existing:
        # refresh the JS in place
        existing["parameters"]["jsCode"] = js
        wf_path.write_text(json.dumps(wf, ensure_ascii=False, indent=2) + "\n")
        return f"refreshed JS in existing node ({wf_path.name})"

    # find Format & Self-Check + the node it currently feeds
    fmt = next((n for n in nodes if n.get("name") == "Format & Self-Check"), None)
    if not fmt:
        return f"SKIP {wf_path.name}: 'Format & Self-Check' node not found"
    fmt_conn = conns.get("Format & Self-Check") or {}
    ret_name = None
    try:
        ret_name = fmt_conn["main"][0][0]["node"]
    except (KeyError, IndexError, TypeError):
        ret_name = None
    if not ret_name:
        return f"SKIP {wf_path.name}: 'Format & Self-Check' has no downstream node"
    ret = next((n for n in nodes if n.get("name") == ret_name), None)
    if not ret:
        return f"SKIP {wf_path.name}: downstream node '{ret_name}' not found"

    fx, fy = fmt.get("position", [240, 300])
    rx, ry = ret.get("position", [500, 300])
    nx = (fx + rx) // 2
    ny = (fy + ry) // 2

    new_node = {
        "parameters": {"jsCode": js},
        "id": NODE_ID,
        "name": NODE_NAME,
        "type": "n8n-nodes-base.code",
        "typeVersion": 2,
        "position": [nx, ny],
    }
    nodes.append(new_node)

    # rewire: Format & Self-Check now → Hexagon Self-Checks → <existing terminal node>
    conns[NODE_NAME] = {"main": [[{"node": ret_name, "type": "main", "index": 0}]]}
    conns["Format & Self-Check"] = {
        "main": [[{"node": NODE_NAME, "type": "main", "index": 0}]]
    }

    wf_path.write_text(json.dumps(wf, ensure_ascii=False, indent=2) + "\n")
    return f"patched {wf_path.name}"


def main() -> int:
    if not SNIPPET.exists():
        print(f"snippet missing: {SNIPPET}", file=sys.stderr)
        return 2
    rc = 0
    for wf in WORKFLOWS:
        p = ROOT / wf
        if not p.exists():
            print(f"SKIP missing: {wf}")
            rc = 1
            continue
        print(patch(p))
    return rc


if __name__ == "__main__":
    sys.exit(main())
