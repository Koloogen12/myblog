-- =====================================================================
-- Admin role protection for /admin
-- =====================================================================
-- Strategy:
-- 1. Store role in auth.users.raw_app_meta_data (service-role only;
--    the user cannot modify it themselves, unlike raw_user_meta_data).
-- 2. Expose helper public.is_admin() that reads role from the current JWT.
-- 3. Lock down RLS on every table with write access restricted to admins.
-- 4. Public read access is preserved for posts/categories/site_settings
--    so the blog keeps working for anonymous visitors.
-- =====================================================================

-- 1. Promote leomih659@gmail.com to admin.
--    (Sets role in app_metadata. Re-run is idempotent.)
update auth.users
   set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
                           || jsonb_build_object('role', 'admin')
 where email = 'leomih659@gmail.com';

-- 2. Helper function used by every RLS policy.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- =====================================================================
-- 3. RLS policies
-- =====================================================================

-- posts ---------------------------------------------------------------
alter table public.posts enable row level security;

drop policy if exists "posts_read_published" on public.posts;
drop policy if exists "posts_admin_all" on public.posts;
drop policy if exists "Posts are viewable by everyone" on public.posts;
drop policy if exists "Posts are editable by authenticated users" on public.posts;

create policy "posts_read_published"
  on public.posts for select
  using (is_published = true or public.is_admin());

create policy "posts_admin_all"
  on public.posts for all
  using (public.is_admin())
  with check (public.is_admin());

-- categories ----------------------------------------------------------
alter table public.categories enable row level security;

drop policy if exists "categories_read" on public.categories;
drop policy if exists "categories_admin_all" on public.categories;
drop policy if exists "Categories are viewable by everyone" on public.categories;
drop policy if exists "Categories are editable by authenticated users" on public.categories;

create policy "categories_read"
  on public.categories for select
  using (true);

create policy "categories_admin_all"
  on public.categories for all
  using (public.is_admin())
  with check (public.is_admin());

-- site_settings -------------------------------------------------------
alter table public.site_settings enable row level security;

drop policy if exists "site_settings_read" on public.site_settings;
drop policy if exists "site_settings_admin_all" on public.site_settings;

create policy "site_settings_read"
  on public.site_settings for select
  using (true);

create policy "site_settings_admin_all"
  on public.site_settings for all
  using (public.is_admin())
  with check (public.is_admin());

-- projects ------------------------------------------------------------
alter table public.projects enable row level security;

drop policy if exists "projects_read" on public.projects;
drop policy if exists "projects_admin_all" on public.projects;

create policy "projects_read"
  on public.projects for select
  using (true);

create policy "projects_admin_all"
  on public.projects for all
  using (public.is_admin())
  with check (public.is_admin());

-- sprints -------------------------------------------------------------
alter table public.sprints enable row level security;

drop policy if exists "sprints_read" on public.sprints;
drop policy if exists "sprints_admin_all" on public.sprints;

create policy "sprints_read"
  on public.sprints for select
  using (true);

create policy "sprints_admin_all"
  on public.sprints for all
  using (public.is_admin())
  with check (public.is_admin());

-- subscribers ---------------------------------------------------------
-- Anon can INSERT (so the form works) but only admin can SELECT.
alter table public.subscribers enable row level security;

drop policy if exists "subscribers_insert_anon" on public.subscribers;
drop policy if exists "subscribers_admin_read" on public.subscribers;
drop policy if exists "subscribers_admin_all" on public.subscribers;

create policy "subscribers_insert_anon"
  on public.subscribers for insert
  with check (true);

create policy "subscribers_admin_all"
  on public.subscribers for all
  using (public.is_admin())
  with check (public.is_admin());

-- =====================================================================
-- 4. Storage bucket "blog-images" — lock writes to admin only
-- =====================================================================
-- Public reads stay open. Uploads/updates/deletes require admin.

drop policy if exists "blog_images_read" on storage.objects;
drop policy if exists "blog_images_admin_write" on storage.objects;
drop policy if exists "blog_images_admin_update" on storage.objects;
drop policy if exists "blog_images_admin_delete" on storage.objects;

create policy "blog_images_read"
  on storage.objects for select
  using (bucket_id = 'blog-images');

create policy "blog_images_admin_write"
  on storage.objects for insert
  with check (bucket_id = 'blog-images' and public.is_admin());

create policy "blog_images_admin_update"
  on storage.objects for update
  using (bucket_id = 'blog-images' and public.is_admin())
  with check (bucket_id = 'blog-images' and public.is_admin());

create policy "blog_images_admin_delete"
  on storage.objects for delete
  using (bucket_id = 'blog-images' and public.is_admin());
