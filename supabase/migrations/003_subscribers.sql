-- Email subscribers table
CREATE TABLE IF NOT EXISTS public.subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Allow anonymous inserts (public subscription)
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can subscribe" ON public.subscribers
  FOR INSERT TO anon WITH CHECK (true);

-- Only authenticated users can read/manage subscribers
CREATE POLICY "Authenticated users can read subscribers" ON public.subscribers
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can update subscribers" ON public.subscribers
  FOR UPDATE TO authenticated USING (true);
