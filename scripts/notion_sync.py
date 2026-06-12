#!/usr/bin/env python3
"""logs/*.md を Notion「AI学習ログ（5ヶ月計画）」へ転記する。

- ローカルMarkdownが正。Notionは転記先。
- 各ログのH1（例「Day 8：テーマ」）を子ページタイトルにして親ページ直下に作成する。
- 冪等性: 同タイトルの子ページが既にあればスキップ（再転記したい場合はNotion側の該当ページを削除してから実行）。
- 依存: python3標準ライブラリのみ。
- 環境変数: NOTION_API_KEY, NOTION_PARENT_PAGE_ID
"""

import json
import os
import re
import sys
import urllib.request
from pathlib import Path

API = "https://api.notion.com/v1"
ROOT = Path(__file__).resolve().parent.parent

API_KEY = os.environ.get("NOTION_API_KEY")
PARENT_ID = os.environ.get("NOTION_PARENT_PAGE_ID")
if not API_KEY or not PARENT_ID:
    sys.exit("NOTION_API_KEY / NOTION_PARENT_PAGE_ID が未設定")


def request(method: str, path: str, payload: dict | None = None) -> dict:
    req = urllib.request.Request(
        f"{API}{path}",
        data=json.dumps(payload).encode() if payload is not None else None,
        method=method,
        headers={
            "Authorization": f"Bearer {API_KEY}",
            "Notion-Version": "2022-06-28",
            "Content-Type": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(req) as res:
            return json.load(res)
    except urllib.error.HTTPError as e:
        sys.exit(f"Notion API失敗 {method} {path}: {e.code} {e.read().decode()}")


def existing_child_titles() -> set[str]:
    titles: set[str] = set()
    cursor = None
    while True:
        path = f"/blocks/{PARENT_ID}/children?page_size=100"
        if cursor:
            path += f"&start_cursor={cursor}"
        data = request("GET", path)
        for block in data.get("results", []):
            if block.get("type") == "child_page":
                titles.add(block["child_page"]["title"].strip())
        if not data.get("has_more"):
            return titles
        cursor = data.get("next_cursor")


def rich_text(text: str) -> list[dict]:
    # Notionのrich_textは1要素2000字まで
    return [{"type": "text", "text": {"content": text[i : i + 2000]}} for i in range(0, len(text), 2000)] or [
        {"type": "text", "text": {"content": ""}}
    ]


def md_to_blocks(body: str) -> list[dict]:
    blocks: list[dict] = []
    in_code = False
    code_lines: list[str] = []
    for line in body.splitlines():
        if line.startswith("```"):
            if in_code:
                blocks.append(
                    {"type": "code", "code": {"rich_text": rich_text("\n".join(code_lines)), "language": "plain text"}}
                )
                code_lines = []
            in_code = not in_code
            continue
        if in_code:
            code_lines.append(line)
            continue
        stripped = line.strip()
        if not stripped or stripped == "---":
            continue
        if line.startswith("### "):
            blocks.append({"type": "heading_3", "heading_3": {"rich_text": rich_text(line[4:])}})
        elif line.startswith("## "):
            blocks.append({"type": "heading_2", "heading_2": {"rich_text": rich_text(line[3:])}})
        elif line.startswith("# "):
            blocks.append({"type": "heading_1", "heading_1": {"rich_text": rich_text(line[2:])}})
        elif stripped.startswith("- "):
            blocks.append({"type": "bulleted_list_item", "bulleted_list_item": {"rich_text": rich_text(stripped[2:])}})
        else:
            blocks.append({"type": "paragraph", "paragraph": {"rich_text": rich_text(stripped)}})
    return blocks


def sync_log(path: Path, existing: set[str]) -> None:
    text = path.read_text(encoding="utf-8")
    m = re.search(r"^# (.+)$", text, re.M)
    if not m:
        print(f"skip {path.name}: H1が無い")
        return
    title = m.group(1).strip()
    if title in existing:
        print(f"skip {path.name}: 「{title}」は転記済み")
        return
    body = text[m.end() :]
    blocks = md_to_blocks(body)
    page = request(
        "POST",
        "/pages",
        {
            "parent": {"page_id": PARENT_ID},
            "properties": {"title": {"title": rich_text(title)}},
            "children": blocks[:100],
        },
    )
    # 100ブロック超は追記APIで分割投入
    for i in range(100, len(blocks), 100):
        request("PATCH", f"/blocks/{page['id']}/children", {"children": blocks[i : i + 100]})
    print(f"synced {path.name} → 「{title}」")


def main() -> None:
    logs = sorted((ROOT / "logs").glob("day-*.md"))
    if not logs:
        print("転記対象のログなし")
        return
    existing = existing_child_titles()
    for path in logs:
        sync_log(path, existing)


if __name__ == "__main__":
    main()
