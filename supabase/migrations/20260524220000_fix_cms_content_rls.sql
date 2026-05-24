-- ============================================================
-- Fix cms_content RLS: Enable public read, admin-only writes
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. Enable RLS on the table (in case it was not already enabled)
ALTER TABLE public.cms_content ENABLE ROW LEVEL SECURITY;

-- 2. Drop any old / conflicting policies
DROP POLICY IF EXISTS "public_read_cms_content" ON public.cms_content;
DROP POLICY IF EXISTS "admin_manage_cms_content" ON public.cms_content;
DROP POLICY IF EXISTS "service_role_manage_cms_content" ON public.cms_content;

-- 3. Allow ANYONE (including the anon key) to READ published content
--    This is needed so the frontend can load homepage, settings, etc.
CREATE POLICY "public_read_cms_content"
  ON public.cms_content
  FOR SELECT
  USING (true);

-- 4. Allow only admins OR service role to INSERT / UPDATE / DELETE
--    The service role key bypasses RLS entirely, but just in case
--    the fallback anon-auth path is used, we add an admin policy too.
CREATE POLICY "admin_manage_cms_content"
  ON public.cms_content
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 5. Ensure the unique constraint exists (safety net)
ALTER TABLE public.cms_content
  DROP CONSTRAINT IF EXISTS cms_content_page_slug_section_key_key;

ALTER TABLE public.cms_content
  ADD CONSTRAINT cms_content_page_slug_section_key_key
  UNIQUE (page_slug, section_key);
