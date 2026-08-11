#!/usr/bin/env python3
"""Prerender static HTML snapshots of dkochnev.com for crawlers.

Why this exists
---------------
The site is a client-rendered SPA: the HTML served by nginx is a ~190-byte
shell and every word appears only after JavaScript runs. Google handles that,
but late (rendering happens in a second pass). AI answer engines — GPTBot,
PerplexityBot, ClaudeBot — generally do not execute JavaScript at all, so to
them the blog looks empty. That silently defeats the TL;DR / FAQ / schema work,
since none of it is reachable.

So we build real HTML from the same database the app reads, and let nginx serve
it to bots while humans keep the SPA. The content is identical, which is what
separates dynamic rendering (allowed) from cloaking (not).

Output: <out>/prerender/{index,blog,about,projects}.html,
        <out>/prerender/post/<slug>.html, <out>/prerender/tag/<slug>.html

Usage:  prerender.py [--out DIR] [--dry-run]
"""

import argparse
import html
import json
import re
import sys
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Optional

SUPABASE_URL = "https://mxttoiqtviaobotoekxw.supabase.co"
# Anon key: public by design, protected by row-level security.
ANON_KEY = (
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9."
    "eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14dHRvaXF0dmlhb2JvdG9la3h3Iiwicm9sZSI6"
    "ImFub24iLCJpYXQiOjE3NzUzNDQ0MjIsImV4cCI6MjA5MDkyMDQyMn0."
    "bOmVtAGkUR6wY1ADfR3FtgP0f3CiFjcQs5WIp1LrKeI"
)
BASE = "https://dkochnev.com"
AUTHOR = "Данил Кочнев"
SITE_NAME = "Данил Кочнев"
DEFAULT_OUT = Path("/opt/dkochnev/site")

TITLE_TAIL = "серийный IT-предприниматель"
DEFAULT_DESC = (
    "Серийный IT-предприниматель. Развиваю THE MONO (B2B-маркетплейс), "
    "MakeMeLook (AI-примерка), NEURIN AI. Пишу о том, как строить продукты."
)


def fetch(path: str) -> list:
    req = urllib.request.Request(
        f"{SUPABASE_URL}/rest/v1/{path}",
        headers={"apikey": ANON_KEY, "Authorization": f"Bearer {ANON_KEY}"},
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode("utf-8"))


def setting(rows: list, key: str) -> dict:
    for r in rows:
        if r.get("key") == key:
            return r.get("value") or {}
    return {}


def esc(text: Optional[str]) -> str:
    return html.escape(text or "", quote=True)


def strip_tags(markup: Optional[str]) -> str:
    """Plain text from stored HTML, for descriptions and previews."""
    if not markup:
        return ""
    text = re.sub(r"<[^>]+>", " ", markup)
    return re.sub(r"\s+", " ", html.unescape(text)).strip()


def rewrite_media(markup: str) -> str:
    """Point legacy asset hosts at the current proxy so images resolve."""
    if not markup:
        return ""
    return markup.replace(
        "https://mxttoiqtviaobotoekxw.supabase.co", f"{BASE}/supabase"
    )


def page(
    *,
    title: str,
    description: str,
    path: str,
    body: str,
    jsonld: Optional[List[dict]] = None,
    og_type: str = "website",
    image: Optional[str] = None,
    published: Optional[str] = None,
    modified: Optional[str] = None,
) -> str:
    """Assemble a complete, self-contained HTML document.

    Kept deliberately plain: crawlers want text and structure, not styling.
    The canonical points at the real URL so the snapshot never competes with
    the app version in the index.
    """
    url = f"{BASE}{path}"
    img = image or f"{BASE}/og-image.jpg"
    blocks = "\n".join(
        f'<script type="application/ld+json">{json.dumps(b, ensure_ascii=False)}</script>'
        for b in (jsonld or [])
    )
    article_meta = ""
    if published:
        article_meta += f'\n<meta property="article:published_time" content="{esc(published)}">'
    if modified:
        article_meta += f'\n<meta property="article:modified_time" content="{esc(modified)}">'

    return f"""<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{esc(title)}</title>
<meta name="description" content="{esc(description)}">
<meta name="author" content="{esc(AUTHOR)}">
<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1">
<link rel="canonical" href="{esc(url)}">
<link rel="alternate" hreflang="ru" href="{esc(url)}">
<link rel="alternate" hreflang="x-default" href="{esc(url)}">
<meta property="og:type" content="{esc(og_type)}">
<meta property="og:title" content="{esc(title)}">
<meta property="og:description" content="{esc(description)}">
<meta property="og:url" content="{esc(url)}">
<meta property="og:site_name" content="{esc(SITE_NAME)}">
<meta property="og:locale" content="ru_RU">
<meta property="og:image" content="{esc(img)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{esc(title)}">
<meta name="twitter:description" content="{esc(description)}">
<meta name="twitter:image" content="{esc(img)}">{article_meta}
{blocks}
</head>
<body>
<header>
<a href="{BASE}/">{esc(SITE_NAME)}</a> ·
<a href="{BASE}/blog">Блог</a> ·
<a href="{BASE}/projects">Проекты</a> ·
<a href="{BASE}/about">Обо мне</a>
</header>
<main>
{body}
</main>
<footer>
<p>{esc(SITE_NAME)} — {esc(TITLE_TAIL)}. <a href="{BASE}/blog">Все статьи</a></p>
</footer>
</body>
</html>
"""


def markdown_to_html(text: str) -> str:
    """Minimal markdown -> HTML for posts saved before the rich editor.

    Deliberately small: headings, lists, bold/italic, links. Anything else is
    treated as a paragraph, which is fine — crawlers care about the words.
    """
    out: List[str] = []
    in_list = False

    def inline(s: str) -> str:
        s = esc(s)
        s = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", s)
        s = re.sub(r"(?<!\*)\*([^*]+)\*(?!\*)", r"<em>\1</em>", s)
        s = re.sub(r"\[(.+?)\]\((https?://[^)]+)\)", r'<a href="\2">\1</a>', s)
        return s

    for raw in (text or "").split("\n"):
        line = raw.strip()
        if not line:
            if in_list:
                out.append("</ul>")
                in_list = False
            continue
        heading = re.match(r"^(#{1,4})\s+(.*)$", line)
        bullet = re.match(r"^[-*+]\s+(.*)$", line)
        if heading:
            if in_list:
                out.append("</ul>")
                in_list = False
            level = min(len(heading.group(1)) + 1, 4)  # never a second <h1>
            out.append(f"<h{level}>{inline(heading.group(2))}</h{level}>")
        elif bullet:
            if not in_list:
                out.append("<ul>")
                in_list = True
            out.append(f"<li>{inline(bullet.group(1))}</li>")
        else:
            if in_list:
                out.append("</ul>")
                in_list = False
            out.append(f"<p>{inline(line)}</p>")
    if in_list:
        out.append("</ul>")
    return "".join(out)


def person_schema() -> dict:
    return {
        "@context": "https://schema.org",
        "@type": "Person",
        "name": AUTHOR,
        "url": f"{BASE}/about",
        "jobTitle": "Серийный IT-предприниматель",
        "sameAs": [
            "https://t.me/kochnev_blog",
            "https://linkedin.com/in/kochnefff",
            "https://instagram.com/kochnefff",
        ],
    }


def render_post(post: dict, categories: dict, others: list) -> str:
    slug = post["slug"]
    title = post.get("seo_title") or post.get("title") or ""
    heading = post.get("title") or title
    tldr = post.get("tldr") or ""
    description = post.get("seo_description") or tldr or strip_tags(post.get("excerpt"))[:160]
    cat_slug = post.get("category") or ""
    cat_name = categories.get(cat_slug, cat_slug)
    image = post.get("og_image") or post.get("cover_image_url")
    if image:
        image = image.replace("https://mxttoiqtviaobotoekxw.supabase.co", f"{BASE}/supabase")

    faq = [f for f in (post.get("faq") or []) if f.get("question") and f.get("answer")]

    parts = [f"<article>", f"<h1>{esc(heading)}</h1>"]
    meta_bits = []
    if cat_name:
        meta_bits.append(f'<a href="{BASE}/tag/{esc(cat_slug)}">{esc(cat_name)}</a>')
    if post.get("published_at"):
        meta_bits.append(
            f'<time datetime="{esc(post["published_at"])}">{post["published_at"][:10]}</time>'
        )
    if post.get("reading_time"):
        meta_bits.append(f'{post["reading_time"]} мин чтения')
    if meta_bits:
        parts.append("<p>" + " · ".join(meta_bits) + "</p>")

    if tldr:
        parts.append(f"<section><h2>Коротко</h2><p>{esc(tldr)}</p></section>")

    content = rewrite_media(post.get("content_html") or "")
    if not content and post.get("content"):
        # Older posts were stored as markdown text, so emit real headings and
        # lists instead of leaking "## " into the page.
        content = markdown_to_html(post["content"])
    parts.append(content)

    if faq:
        parts.append("<section><h2>Частые вопросы</h2>")
        for f in faq:
            parts.append(f"<h3>{esc(f['question'])}</h3><p>{esc(f['answer'])}</p>")
        parts.append("</section>")

    # Internal links: crawlers follow these, and they spread authority between
    # articles instead of leaving each one orphaned.
    related = [p for p in others if p["slug"] != slug][:5]
    if related:
        parts.append("<section><h2>Другие статьи</h2><ul>")
        for r in related:
            parts.append(f'<li><a href="{BASE}/post/{esc(r["slug"])}">{esc(r.get("title"))}</a></li>')
        parts.append("</ul></section>")

    parts.append("</article>")

    article = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": title,
        "description": description,
        "datePublished": post.get("published_at"),
        "dateModified": post.get("updated_at"),
        "author": {"@type": "Person", "name": AUTHOR, "url": f"{BASE}/about"},
        "publisher": {"@type": "Person", "name": AUTHOR},
        "mainEntityOfPage": f"{BASE}/post/{slug}",
        "inLanguage": "ru",
    }
    if image:
        article["image"] = image
    if post.get("keywords"):
        article["keywords"] = ", ".join(post["keywords"])
    if post.get("reading_time"):
        article["timeRequired"] = f"PT{post['reading_time']}M"

    schemas = [
        article,
        {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
                {"@type": "ListItem", "position": 1, "name": "Блог", "item": f"{BASE}/blog"},
                {"@type": "ListItem", "position": 2, "name": cat_name, "item": f"{BASE}/tag/{cat_slug}"},
                {"@type": "ListItem", "position": 3, "name": heading, "item": f"{BASE}/post/{slug}"},
            ],
        },
    ]
    if faq:
        schemas.append({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
                {
                    "@type": "Question",
                    "name": f["question"],
                    "acceptedAnswer": {"@type": "Answer", "text": f["answer"]},
                }
                for f in faq
            ],
        })

    return page(
        title=f"{title} — {SITE_NAME}" if SITE_NAME not in title else title,
        description=description,
        path=f"/post/{slug}",
        body="\n".join(parts),
        jsonld=schemas,
        og_type="article",
        image=image,
        published=post.get("published_at"),
        modified=post.get("updated_at"),
    )


def render_list(posts: list, *, title: str, description: str, path: str, heading: str) -> str:
    items = ["<h1>" + esc(heading) + "</h1>"]
    if not posts:
        items.append("<p>Пока нет статей.</p>")
    items.append("<ul>")
    for p in posts:
        summary = strip_tags(p.get("excerpt")) or (p.get("tldr") or "")
        items.append(
            f'<li><h2><a href="{BASE}/post/{esc(p["slug"])}">{esc(p.get("title"))}</a></h2>'
            + (f"<p>{esc(summary[:200])}</p>" if summary else "")
            + "</li>"
        )
    items.append("</ul>")

    schema = {
        "@context": "https://schema.org",
        "@type": "Blog",
        "name": title,
        "description": description,
        "url": f"{BASE}{path}",
        "author": {"@type": "Person", "name": AUTHOR},
        "blogPost": [
            {
                "@type": "BlogPosting",
                "headline": p.get("title"),
                "url": f"{BASE}/post/{p['slug']}",
                "datePublished": p.get("published_at"),
            }
            for p in posts[:30]
        ],
    }
    return page(
        title=title,
        description=description,
        path=path,
        body="\n".join(items),
        jsonld=[schema, person_schema()],
    )


def render_about(about: dict) -> str:
    heading = about.get("heading") or "Обо мне"
    bio_html = rewrite_media(about.get("mainBio") or "")
    if "<" not in bio_html:
        bio_html = "".join(f"<p>{esc(p)}</p>" for p in bio_html.split("\n\n") if p.strip())
    parts = [f"<h1>{esc(heading)}</h1>", bio_html]

    for extra in ("secondaryBio", "blogDescription"):
        val = about.get(extra)
        if val:
            parts.append(rewrite_media(val) if "<" in val else f"<p>{esc(val)}</p>")

    if about.get("stats"):
        parts.append("<ul>")
        for s in about["stats"]:
            parts.append(f'<li>{esc(str(s.get("value")))} — {esc(s.get("label"))}</li>')
        parts.append("</ul>")

    if about.get("timeline"):
        parts.append(f'<h2>{esc(about.get("timelineHeading") or "Путь")}</h2><ul>')
        for t in about["timeline"]:
            parts.append(
                f'<li><strong>{esc(t.get("year"))} — {esc(t.get("title"))}</strong>: '
                f'{esc(t.get("description"))}</li>'
            )
        parts.append("</ul>")

    desc = strip_tags(about.get("secondaryBio")) or strip_tags(bio_html)[:160]
    return page(
        title=f"Обо мне — {SITE_NAME}",
        description=desc or DEFAULT_DESC,
        path="/about",
        body="\n".join(parts),
        jsonld=[person_schema()],
        og_type="profile",
    )


def render_projects(projects: dict) -> str:
    heading = projects.get("heading") or "Проекты"
    parts = [f"<h1>{esc(heading)}</h1>"]
    if projects.get("description"):
        parts.append(f'<p>{esc(projects["description"])}</p>')

    items = projects.get("projects") or []
    for p in items:
        parts.append("<article>")
        name = p.get("name") or ""
        if p.get("url"):
            parts.append(f'<h2><a href="{esc(p["url"])}">{esc(name)}</a></h2>')
        else:
            parts.append(f"<h2>{esc(name)}</h2>")
        for field in ("tagline", "description"):
            if p.get(field):
                parts.append(f'<p>{esc(p[field])}</p>')
        bits = [b for b in (p.get("year"), p.get("statusLabel"), p.get("metrics")) if b]
        if bits:
            parts.append("<p>" + " · ".join(esc(str(b)) for b in bits) + "</p>")
        parts.append("</article>")

    schema = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": f"{heading} — {AUTHOR}",
        "description": projects.get("description") or "",
        "url": f"{BASE}/projects",
        "author": {"@type": "Person", "name": AUTHOR},
    }
    return page(
        title=f"{heading} — {SITE_NAME}",
        description=(projects.get("description") or DEFAULT_DESC)[:160],
        path="/projects",
        body="\n".join(parts),
        jsonld=[schema, person_schema()],
    )


def render_home(linkhub: dict, posts: list) -> str:
    title = (linkhub.get("heroTitle") or SITE_NAME).replace("\n", " ")
    subtitle = linkhub.get("heroSubtitle") or DEFAULT_DESC
    parts = [f"<h1>{esc(title)}</h1>", f"<p>{esc(subtitle)}</p>"]

    for section in linkhub.get("sections") or []:
        if not section.get("visible"):
            continue
        if section.get("heading"):
            parts.append(f'<h2>{esc(section["heading"])}</h2>')
        parts.append("<ul>")
        for tile in section.get("tiles") or []:
            if not tile.get("visible"):
                continue
            parts.append(
                f'<li><a href="{esc(tile.get("url"))}">{esc(tile.get("title"))}</a>'
                + (f' — {esc(tile.get("description"))}' if tile.get("description") else "")
                + "</li>"
            )
        parts.append("</ul>")

    if posts:
        parts.append("<h2>Последние статьи</h2><ul>")
        for p in posts[:10]:
            parts.append(f'<li><a href="{BASE}/post/{esc(p["slug"])}">{esc(p.get("title"))}</a></li>')
        parts.append("</ul>")

    return page(
        title=f"{SITE_NAME} — {TITLE_TAIL}",
        description=strip_tags(subtitle)[:160] or DEFAULT_DESC,
        path="/",
        body="\n".join(parts),
        jsonld=[
            person_schema(),
            {
                "@context": "https://schema.org",
                "@type": "WebSite",
                "name": SITE_NAME,
                "url": BASE,
                "inLanguage": "ru",
            },
        ],
    )


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", type=Path, default=DEFAULT_OUT)
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    try:
        posts = fetch(
            "posts?select=slug,title,excerpt,content,content_html,category,published_at,"
            "updated_at,reading_time,cover_image_url,seo_title,seo_description,tldr,faq,"
            "keywords,og_image&is_published=eq.true&order=published_at.desc.nullslast"
        )
        cats = fetch("categories?select=slug,name,sort_order&order=sort_order.asc")
        settings = fetch("site_settings?select=key,value")
    except Exception as exc:
        print(f"ERROR: fetch failed, keeping existing snapshots: {exc}", file=sys.stderr)
        return 1

    if not posts:
        print("ERROR: no published posts returned, refusing to write", file=sys.stderr)
        return 1

    cat_names = {c["slug"]: c["name"] for c in cats}
    files: dict = {
        "prerender/index.html": render_home(setting(settings, "linkhub"), posts),
        "prerender/blog.html": render_list(
            posts,
            title=f"Блог о продуктах, стартапах и AI — {SITE_NAME}",
            description="Заметки серийного IT-предпринимателя: как строить продукты, "
            "находить product-market fit и использовать AI.",
            path="/blog",
            heading="Блог",
        ),
        "prerender/about.html": render_about(setting(settings, "about")),
        "prerender/projects.html": render_projects(setting(settings, "projects")),
    }

    for p in posts:
        files[f"prerender/post/{p['slug']}.html"] = render_post(p, cat_names, posts)

    for c in cats:
        in_cat = [p for p in posts if p.get("category") == c["slug"]]
        files[f"prerender/tag/{c['slug']}.html"] = render_list(
            in_cat,
            title=f'{c["name"]} — {SITE_NAME}',
            description=f'Статьи в рубрике «{c["name"]}» — {AUTHOR}.',
            path=f'/tag/{c["slug"]}',
            heading=c["name"],
        )

    total = 0
    for rel, content in files.items():
        target = args.out / rel
        if args.dry_run:
            print(f"[dry-run] {target} ({len(content)} bytes)")
        else:
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_text(content, encoding="utf-8")
        total += len(content)

    print(f"prerendered {len(files)} pages, {total // 1024} KB "
          f"(posts={len(posts)}, tags={len(cats)}) at "
          f"{datetime.now(timezone.utc).isoformat(timespec='seconds')}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
