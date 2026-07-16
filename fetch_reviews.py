#!/usr/bin/env python3
"""
3839.com (好游快爆) User Review Fetcher

Fetches user game reviews from 3839.com by user UID and exports to Excel.

Usage:
    python fetch_reviews.py <UID> [--count N] [--output PATH]

Examples:
    python fetch_reviews.py 20594033
    python fetch_reviews.py 20594033 --count 100
    python fetch_reviews.py 20594033 --count 500 --output "reviews.xlsx"
"""

import argparse
import json
import os
import re
import sys
import time

import requests
import openpyxl
from openpyxl.styles import Font, Alignment, PatternFill
from openpyxl.utils import get_column_letter


# ── Constants ──────────────────────────────────────────────────────────────────

API_URL = "https://www.3839.com/app/hykb_web/api/api_user.php"

HEADERS = {
    "Content-Type": "application/x-www-form-urlencoded",
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
    "Origin": "https://www.3839.com",
    # Referer is set per-request with the UID
}

STAR_MAP = {
    "1": "很差",
    "2": "差",
    "3": "一般",
    "4": "不错",
    "5": "力荐",
}

BATCH_SIZE = 20       # items per API request
REQUEST_DELAY = 0.5   # seconds between requests (rate-limit safety)


# ── Fetching ───────────────────────────────────────────────────────────────────

def fetch_batch(uid: str, last_id: str, cursor: int) -> dict:
    """Fetch one batch of reviews from the API. Returns the parsed JSON result."""
    body = f"ac=dynamic_home&last_id={last_id}&cursor={cursor}&vuid={uid}"
    headers = {**HEADERS, "Referer": f"https://www.3839.com/zone/user/{uid}"}

    resp = requests.post(API_URL, data=body, headers=headers, timeout=15)
    result = resp.json()

    code = str(result.get("code"))
    if code != "100":
        raise RuntimeError(
            f"API error: code={code}, msg={result.get('msg', '')}\n"
            f"Response: {json.dumps(result, ensure_ascii=False)[:500]}"
        )

    return result.get("result", {})


def parse_item(item: dict) -> dict:
    """Parse a single API item into a structured review record."""
    fid = item.get("fid", "")
    cid = item.get("id", "")
    pid = item.get("pid", 1)
    star = item.get("star", "")
    content = item.get("content", "")
    addtime = item.get("addtime", "")
    dynamic_type = item.get("dynamic_type", "")
    play_time = item.get("play_time_str", "")

    # Game name from game_info
    game_name = ""
    game_info = item.get("game_info", {})
    if game_info and isinstance(game_info, dict):
        game_name = game_info.get("name", "") or game_info.get("title", "")

    # Build review URL
    review_url = f"https://m.3839.com/review/?pid={pid}&fid={fid}&cid={cid}"

    # Clean HTML tags from content
    clean_content = content.replace("<br />", " ").replace("<br>", " ").replace("<br/>", " ")
    clean_content = re.sub(r"<[^>]+>", "", clean_content).strip()
    if len(clean_content) > 200:
        clean_content = clean_content[:200] + "..."

    # Format date
    date_str = ""
    if addtime:
        try:
            ts = int(addtime)
            date_str = time.strftime("%Y-%m-%d", time.localtime(ts))
        except (ValueError, TypeError):
            pass

    # Star rating text
    star_text = STAR_MAP.get(str(star), str(star) if star else "")

    # Type text
    type_text = "评价" if dynamic_type == "comment_game" else "回复"

    return {
        "url": review_url,
        "date": date_str,
        "star_text": star_text,
        "game_name": game_name,
        "play_time": play_time,
        "type": type_text,
        "content": clean_content,
        "dynamic_type": dynamic_type,
        "fid": fid,
        "cid": cid,
        "pid": pid,
    }


def fetch_all_reviews(uid: str, target_count: int = 300, verbose: bool = True) -> list:
    """Fetch reviews for a user, up to target_count items."""
    all_reviews = []
    last_id = ""
    cursor = 0
    page = 0

    while len(all_reviews) < target_count:
        page += 1
        if verbose:
            print(f"  Fetching page {page}... (last_id={last_id}, cursor={cursor})")

        try:
            data = fetch_batch(uid, last_id, cursor)
        except Exception as e:
            if verbose:
                print(f"  Error: {e}")
            time.sleep(2)
            # Retry once
            try:
                data = fetch_batch(uid, last_id, cursor)
            except Exception as e2:
                if verbose:
                    print(f"  Retry failed: {e2}")
                break

        new_last_id = str(data.get("last_id", ""))
        new_cursor = data.get("cursor", 0)
        items = data.get("data", [])

        if verbose:
            print(f"  Got {len(items)} items, total so far: {len(all_reviews) + len(items)}")

        # Print summary stats on first page
        if page == 1 and verbose:
            num = data.get("num", {})
            if num:
                print(f"  User stats — Total: {num.get('num_total', '?')}, "
                      f"Reviews: {num.get('num_comment', '?')}, "
                      f"Replies: {num.get('num_reply', '?')}")

        for item in items:
            all_reviews.append(parse_item(item))

        # Check end conditions
        if new_last_id == "-1" or new_cursor == -1:
            if verbose:
                print("  Reached end of data.")
            break

        if len(items) == 0:
            if verbose:
                print("  No more items.")
            break

        last_id = new_last_id
        cursor = new_cursor
        time.sleep(REQUEST_DELAY)

    # Trim to target count
    return all_reviews[:target_count]


# ── Excel Export ───────────────────────────────────────────────────────────────

def export_to_excel(reviews: list, output_path: str, verbose: bool = True):
    """Export reviews to a formatted Excel file."""
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "评价链接"

    # Header styling
    header_fill = PatternFill(start_color="4472C4", end_color="4472C4", fill_type="solid")
    header_font = Font(bold=True, size=11, color="FFFFFF")

    headers = ["序号", "评价链接", "日期", "评分", "游戏名称", "游戏时长", "类型", "评价内容摘要"]
    for col_idx, header in enumerate(headers, 1):
        cell = ws.cell(row=1, column=col_idx, value=header)
        cell.font = header_font
        cell.fill = header_fill
        cell.alignment = Alignment(horizontal="center", vertical="center")

    # Data rows
    for i, review in enumerate(reviews, start=2):
        ws.cell(row=i, column=1, value=i - 1)
        ws.cell(row=i, column=2, value=review["url"])
        ws.cell(row=i, column=3, value=review["date"])
        ws.cell(row=i, column=4, value=review["star_text"])
        ws.cell(row=i, column=5, value=review["game_name"])
        ws.cell(row=i, column=6, value=review["play_time"])
        ws.cell(row=i, column=7, value=review["type"])
        ws.cell(row=i, column=8, value=review["content"])

    # Column widths
    col_widths = [6, 65, 12, 8, 25, 10, 8, 80]
    for col_idx, width in enumerate(col_widths, 1):
        ws.column_dimensions[get_column_letter(col_idx)].width = width

    # Alignment
    for row in range(2, len(reviews) + 2):
        ws.cell(row=row, column=8).alignment = Alignment(wrap_text=True, vertical="top")
        for col in [1, 3, 4, 6, 7]:
            ws.cell(row=row, column=col).alignment = Alignment(horizontal="center", vertical="top")

    # Freeze header
    ws.freeze_panes = "A2"

    wb.save(output_path)

    if verbose:
        print(f"\nExcel saved: {output_path}")
        print(f"Rows: {len(reviews) + 1} (1 header + {len(reviews)} data)")


# ── Summary ────────────────────────────────────────────────────────────────────

def print_summary(reviews: list):
    """Print summary statistics for the fetched reviews."""
    if not reviews:
        print("\nNo reviews found.")
        return

    print(f"\n{'='*50}")
    print(f"Summary: {len(reviews)} reviews fetched")
    print(f"Date range: {reviews[-1]['date']} ~ {reviews[0]['date']}")

    # By type
    comment_count = sum(1 for r in reviews if r["dynamic_type"] == "comment_game")
    reply_count = sum(1 for r in reviews if r["dynamic_type"] == "comment_game_reply")
    other_count = len(reviews) - comment_count - reply_count
    print(f"By type: {comment_count} reviews, {reply_count} replies, {other_count} other")

    # By star
    star_counts = {}
    for r in reviews:
        s = r["star_text"] or "(未评分)"
        star_counts[s] = star_counts.get(s, 0) + 1
    print(f"By rating: {star_counts}")
    print(f"{'='*50}")


# ── CLI ────────────────────────────────────────────────────────────────────────

def extract_uid(input_str: str) -> str:
    """Extract UID from a URL or raw number string."""
    # Try to extract from URL pattern
    match = re.search(r"/zone/user/(\d+)", input_str)
    if match:
        return match.group(1)
    # Try raw number
    if input_str.strip().isdigit():
        return input_str.strip()
    raise ValueError(f"Could not extract UID from: {input_str}")


def main():
    parser = argparse.ArgumentParser(
        description="Fetch user game reviews from 3839.com (好游快爆)"
    )
    parser.add_argument(
        "uid",
        help="User UID (e.g. 20594033) or full profile URL (e.g. https://www.3839.com/zone/user/20594033)",
    )
    parser.add_argument(
        "--count",
        type=int,
        default=300,
        help="Number of reviews to fetch (default: 300)",
    )
    parser.add_argument(
        "--output",
        type=str,
        default=None,
        help="Output Excel file path (default: 用户评价_<UID>.xlsx)",
    )
    args = parser.parse_args()

    # Extract UID
    uid = extract_uid(args.uid)
    print(f"Fetching reviews for UID: {uid}")
    print(f"Target count: {args.count}")

    # Determine output path
    output_path = args.output or f"用户评价_{uid}.xlsx"

    # Fetch reviews
    print(f"\nFetching from API...")
    reviews = fetch_all_reviews(uid, target_count=args.count)

    if not reviews:
        print("No reviews found. Check if the UID is correct.")
        sys.exit(1)

    # Print summary
    print_summary(reviews)

    # Export to Excel
    export_to_excel(reviews, output_path)

    print(f"\nDone! File saved to: {os.path.abspath(output_path)}")


if __name__ == "__main__":
    main()
