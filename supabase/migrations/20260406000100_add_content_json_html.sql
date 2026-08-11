ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS content_json JSONB;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS content_html TEXT;
