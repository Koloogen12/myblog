-- ============================================
-- Dynamic categories table
-- ============================================
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  group_name TEXT NOT NULL DEFAULT 'synthesize' CHECK (group_name IN ('synthesize', 'distill')),
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed with existing categories
INSERT INTO public.categories (name, slug, group_name, sort_order) VALUES
  ('Мысли', 'thoughts', 'synthesize', 0),
  ('Мета', 'meta', 'synthesize', 1),
  ('Принципы', 'principles', 'synthesize', 2),
  ('Подкаст', 'podcast', 'synthesize', 3),
  ('Книги', 'books', 'distill', 4),
  ('Ссылки', 'links', 'distill', 5);

-- Remove the hardcoded CHECK constraint on posts.category
ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_category_check;

-- RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are viewable by everyone"
  ON public.categories FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users manage categories"
  ON public.categories FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================
-- Site settings (key-value store)
-- ============================================
CREATE TABLE public.site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed defaults
INSERT INTO public.site_settings (key, value) VALUES
  ('seo', '{"siteName": "Данил Кочнев", "titleTemplate": "{заголовок} — Данил Кочнев", "description": "Serial founder из Москвы. Строю MakeMeLook, CarSwap AI, THE MONO. Пишу о продуктах, стартапах и реальности фаундера.", "ogTitle": "Данил Кочнев", "ogImageUrl": "", "gaId": ""}'::jsonb);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Settings are viewable by everyone"
  ON public.site_settings FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users manage settings"
  ON public.site_settings FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
