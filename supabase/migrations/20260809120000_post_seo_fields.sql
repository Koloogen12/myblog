-- SEO/GEO fields for posts.
--
-- Until now a post carried only title + excerpt, and every meta tag was
-- derived from those. That caps what we can do: no control over the SERP
-- snippet, no keywords, and nothing structured for AI answer engines.
--
-- tldr and faq are the GEO-critical ones. AI systems extract passages, not
-- pages, so a self-contained summary and explicit Q&A pairs are what actually
-- get quoted (they also feed FAQPage schema).

alter table public.posts
  -- Overrides <title>. Falls back to title when null. Aim for <= 60 chars so
  -- Google doesn't truncate it.
  add column if not exists seo_title text,

  -- Overrides <meta name="description">. Falls back to excerpt when null.
  -- Aim for <= 160 chars.
  add column if not exists seo_description text,

  -- Target keywords. Note: keyword stuffing measurably *hurts* AI visibility
  -- (Princeton GEO study, KDD 2024), so this is for topical mapping and
  -- internal reporting, not for cramming into copy.
  add column if not exists keywords text[] default '{}'::text[],

  -- The single query this post is meant to win. Used for on-page checks.
  add column if not exists focus_keyword text,

  -- 40-60 word self-contained answer. Rendered near the top of the article
  -- and reused as the description when nothing better exists.
  add column if not exists tldr text,

  -- [{"question": "...", "answer": "..."}] — rendered as an FAQ block and
  -- emitted as FAQPage structured data.
  add column if not exists faq jsonb default '[]'::jsonb,

  -- Per-post social preview image; falls back to cover_image_url.
  add column if not exists og_image text,

  -- Set when the AI generator last filled these fields, so the editor can
  -- show staleness and we can find posts that were never processed.
  add column if not exists seo_generated_at timestamptz;

comment on column public.posts.seo_title is 'Overrides <title>; falls back to title. Target <= 60 chars.';
comment on column public.posts.seo_description is 'Overrides meta description; falls back to excerpt. Target <= 160 chars.';
comment on column public.posts.keywords is 'Target keywords for topical mapping. Do not stuff into copy.';
comment on column public.posts.focus_keyword is 'Primary query this post targets.';
comment on column public.posts.tldr is '40-60 word extractable summary for AI answer engines.';
comment on column public.posts.faq is 'Array of {question, answer}; powers the FAQ block and FAQPage schema.';
comment on column public.posts.og_image is 'Social preview image; falls back to cover_image_url.';
comment on column public.posts.seo_generated_at is 'When SEO metadata was last generated.';

-- Lets us answer "which posts target keyword X" without a full scan once the
-- blog grows past a few dozen articles.
create index if not exists posts_keywords_idx on public.posts using gin (keywords);
