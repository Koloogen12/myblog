-- ============================================
-- Schema for kochnev-blog
-- ============================================

-- 1. Posts
CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  excerpt TEXT,
  cover_image_url TEXT,
  category TEXT NOT NULL CHECK (category IN ('thoughts','meta','principles','podcast','books','links')),
  rating INT CHECK (rating BETWEEN 1 AND 10),
  reading_time INT NOT NULL DEFAULT 1,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Projects
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  icon TEXT NOT NULL DEFAULT 'sparkles',
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','pause','archive')),
  metrics JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Sprints
CREATE TABLE public.sprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'not_filled' CHECK (status IN ('draft','published','not_filled')),
  metrics JSONB DEFAULT '{}'::jsonb,
  intro TEXT DEFAULT '',
  show_intro BOOLEAN DEFAULT false,
  bullets JSONB DEFAULT '[]'::jsonb,
  sections JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Content Items (Content Studio)
CREATE TABLE public.content_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'idea' CHECK (status IN ('idea','writing','ready','queued','published')),
  content_type TEXT NOT NULL DEFAULT 'post' CHECK (content_type IN ('post','sprint','carousel','video','link')),
  platforms TEXT[] DEFAULT '{}',
  master_text TEXT DEFAULT '',
  platform_versions JSONB DEFAULT '{}'::jsonb,
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  slug TEXT,
  tags TEXT[] DEFAULT '{}',
  notes TEXT DEFAULT '',
  ai_generated BOOLEAN DEFAULT false,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Context Entries (AI Context)
CREATE TABLE public.context_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL CHECK (category IN ('bio','product','trend','goal','event')),
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Content Plan
CREATE TABLE public.content_plan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  planned_date DATE NOT NULL,
  title TEXT NOT NULL,
  content_type TEXT NOT NULL DEFAULT 'post',
  platforms TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned','in_progress','done','skipped')),
  post_slug TEXT,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- Trigger: auto-update updated_at
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER posts_updated_at BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER projects_updated_at BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER sprints_updated_at BEFORE UPDATE ON public.sprints
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER content_items_updated_at BEFORE UPDATE ON public.content_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER context_entries_updated_at BEFORE UPDATE ON public.context_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================
-- Trigger: auto-set published_at on publish
-- ============================================
CREATE OR REPLACE FUNCTION public.set_published_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_published = true AND (OLD.is_published = false OR OLD.is_published IS NULL) THEN
    NEW.published_at = COALESCE(NEW.published_at, now());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER posts_set_published_at BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.set_published_at();

CREATE TRIGGER posts_set_published_at_insert BEFORE INSERT ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.set_published_at();

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX idx_posts_slug ON public.posts(slug);
CREATE INDEX idx_posts_category ON public.posts(category);
CREATE INDEX idx_posts_published ON public.posts(is_published, published_at DESC);
CREATE INDEX idx_sprints_project ON public.sprints(project_id);
CREATE INDEX idx_sprints_week ON public.sprints(week_start);
CREATE INDEX idx_content_items_status ON public.content_items(status);
CREATE INDEX idx_content_plan_date ON public.content_plan(planned_date);

-- ============================================
-- RLS (Row Level Security)
-- ============================================
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.context_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_plan ENABLE ROW LEVEL SECURITY;

-- Public: anyone can read published posts
CREATE POLICY "Published posts are viewable by everyone"
  ON public.posts FOR SELECT
  USING (is_published = true);

-- Authenticated: full access to all tables
CREATE POLICY "Authenticated users have full access to posts"
  ON public.posts FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users have full access to projects"
  ON public.projects FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users have full access to sprints"
  ON public.sprints FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users have full access to content_items"
  ON public.content_items FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users have full access to context_entries"
  ON public.context_entries FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users have full access to content_plan"
  ON public.content_plan FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
