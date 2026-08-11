#!/usr/bin/env python3
"""Generate sitemap.xml, rss.xml and llms.txt for dkochnev.com from Supabase.

The site is a static SPA served by nginx, so nothing can build these files at
request time. Instead this script reads the live database and rewrites the
files in place. Run it from cron (hourly) so that publishing a post from the
admin propagates to search engines without a frontend rebuild.

No third-party packages — stdlib only, so it runs on the server as-is.

Usage:  generate-seo-files.py [--out DIR] [--dry-run]
"""

import argparse
import json
import sys
import urllib.request
from datetime import datetime, timezone
from email.utils import format_datetime
from pathlib import Path
from typing import List, Optional, Tuple
from xml.sax.saxutils import escape

SUPABASE_URL = "https://mxttoiqtviaobotoekxw.supabase.co"
# Anon key: public by design, protected by row-level security.
ANON_KEY = (
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9."
    "eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14dHRvaXF0dmlhb2JvdG9la3h3Iiwicm9sZSI6"
    "ImFub24iLCJpYXQiOjE3NzUzNDQ0MjIsImV4cCI6MjA5MDkyMDQyMn0."
    "bOmVtAGkUR6wY1ADfR3FtgP0f3CiFjcQs5WIp1LrKeI"
)
BASE = "https://dkochnev.com"
DEFAULT_OUT = Path("/opt/dkochnev/site")
SITE_TITLE = "Данил Кочнев — блог о продуктах, стартапах и AI"
SITE_DESC = (
    "Заметки серийного IT-предпринимателя: как строить продукты, "
    "находить product-market fit и использовать AI."
)


def fetch(path: str) -> list:
    """GET a Supabase REST collection, returning a list of rows."""
    req = urllib.request.Request(
        f"{SUPABASE_URL}/rest/v1/{path}",
        headers={"apikey": ANON_KEY, "Authorization": f"Bearer {ANON_KEY}"},
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode("utf-8"))


def iso_date(value: Optional[str]) -> str:
    """Supabase timestamp -> YYYY-MM-DD, falling back to today."""
    if not value:
        return datetime.now(timezone.utc).strftime("%Y-%m-%d")
    return value[:10]


def to_rfc822(value: Optional[str]) -> str:
    if not value:
        return format_datetime(datetime.now(timezone.utc))
    try:
        dt = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return format_datetime(datetime.now(timezone.utc))
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return format_datetime(dt)


def build_sitemap(posts: list, categories: list) -> str:
    """Sitemap with hreflang alternates, so RU and EN aren't seen as dupes."""
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    # (path, lastmod, changefreq, priority)
    entries: List[Tuple[str, str, str, str]] = [
        ("/", today, "weekly", "1.0"),
        ("/blog", today, "daily", "0.9"),
        ("/about", today, "monthly", "0.7"),
        ("/projects", today, "weekly", "0.7"),
    ]
    for c in sorted(categories, key=lambda x: x.get("sort_order") or 0):
        entries.append((f"/tag/{c['slug']}", today, "weekly", "0.6"))
    for p in posts:
        lastmod = iso_date(p.get("updated_at") or p.get("published_at"))
        entries.append((f"/post/{p['slug']}", lastmod, "monthly", "0.8"))

    lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
        '        xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ]
    for path, lastmod, freq, prio in entries:
        ru = f"{BASE}{path}"
        en = f"{BASE}/en{'' if path == '/' else path}"
        lines += [
            "  <url>",
            f"    <loc>{escape(ru)}</loc>",
            f"    <lastmod>{lastmod}</lastmod>",
            f"    <changefreq>{freq}</changefreq>",
            f"    <priority>{prio}</priority>",
            f'    <xhtml:link rel="alternate" hreflang="ru" href="{escape(ru)}"/>',
            f'    <xhtml:link rel="alternate" hreflang="en" href="{escape(en)}"/>',
            f'    <xhtml:link rel="alternate" hreflang="x-default" href="{escape(ru)}"/>',
            "  </url>",
        ]
    lines.append("</urlset>")
    return "\n".join(lines) + "\n"


def build_rss(posts: list) -> str:
    now = format_datetime(datetime.now(timezone.utc))
    lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
        "  <channel>",
        f"    <title>{escape(SITE_TITLE)}</title>",
        f"    <link>{BASE}/blog</link>",
        f"    <description>{escape(SITE_DESC)}</description>",
        "    <language>ru</language>",
        f"    <lastBuildDate>{now}</lastBuildDate>",
        f'    <atom:link href="{BASE}/rss.xml" rel="self" type="application/rss+xml"/>',
    ]
    for p in posts[:20]:
        url = f"{BASE}/post/{p['slug']}"
        lines += [
            "    <item>",
            f"      <title>{escape(p.get('title') or '')}</title>",
            f"      <link>{url}</link>",
            f"      <guid isPermaLink=\"true\">{url}</guid>",
            f"      <pubDate>{to_rfc822(p.get('published_at'))}</pubDate>",
            f"      <description>{escape(p.get('excerpt') or '')}</description>",
        ]
        if p.get("category"):
            lines.append(f"      <category>{escape(p['category'])}</category>")
        lines.append("    </item>")
    lines += ["  </channel>", "</rss>"]
    return "\n".join(lines) + "\n"


def build_llms_txt(posts: list, categories: list) -> str:
    """llms.txt — a plain-text map of the site for AI answer engines.

    Emerging convention (llmstxt.org): gives models a clean, link-rich summary
    instead of making them parse a JS-rendered SPA.
    """
    lines = [
        "# Данил Кочнев (dkochnev.com)",
        "",
        f"> {SITE_DESC}",
        "",
        "Серийный IT-предприниматель. Основатель THE MONO (B2B-маркетплейс "
        "лёгкой промышленности), NEURIN AI (AI-кофаундер для основателей), "
        "MakeMeLook (AI-стилист и виртуальная примерка).",
        "",
        "## Основные разделы",
        "",
        f"- [Блог]({BASE}/blog): статьи о создании продуктов, стартапах и AI",
        f"- [Обо мне]({BASE}/about): биография, опыт, проекты",
        f"- [Проекты]({BASE}/projects): продукты, которые я строю",
        "",
        "## Рубрики",
        "",
    ]
    for c in sorted(categories, key=lambda x: x.get("sort_order") or 0):
        lines.append(f"- [{c['name']}]({BASE}/tag/{c['slug']})")
    lines += ["", "## Статьи", ""]
    for p in posts:
        excerpt = (p.get("excerpt") or "").replace("\n", " ").strip()
        suffix = f": {excerpt}" if excerpt else ""
        lines.append(f"- [{p.get('title')}]({BASE}/post/{p['slug']}){suffix}")
    lines += [
        "",
        "## Контакты",
        "",
        "- Telegram: https://t.me/kochnev_blog",
        "- LinkedIn: https://linkedin.com/in/kochnefff",
        "- Email: ceo@themono.ru",
        "",
        f"Обновлено: {datetime.now(timezone.utc).strftime('%Y-%m-%d')}",
    ]
    return "\n".join(lines) + "\n"


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", type=Path, default=DEFAULT_OUT)
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    try:
        posts = fetch(
            "posts?select=slug,title,excerpt,category,published_at,updated_at"
            "&is_published=eq.true&order=published_at.desc.nullslast"
        )
        categories = fetch("categories?select=slug,name,sort_order&order=sort_order.asc")
    except Exception as exc:  # network/API failure must not wipe good files
        print(f"ERROR: fetch failed, keeping existing files: {exc}", file=sys.stderr)
        return 1

    if not posts:
        print("ERROR: zero published posts returned, refusing to write", file=sys.stderr)
        return 1

    files = {
        "sitemap.xml": build_sitemap(posts, categories),
        "rss.xml": build_rss(posts),
        "llms.txt": build_llms_txt(posts, categories),
    }

    for name, content in files.items():
        target = args.out / name
        if args.dry_run:
            print(f"--- {target} ({len(content)} bytes) ---")
            print(content[:400])
        else:
            target.write_text(content, encoding="utf-8")
            print(f"wrote {target} ({len(content)} bytes)")

    print(f"posts={len(posts)} categories={len(categories)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
