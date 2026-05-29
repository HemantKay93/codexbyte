-- =========================================================
-- Migration: Fix suppliers table RLS so backend can always read
-- Run in: Supabase SQL Editor → byteevolvr project
-- =========================================================

-- 1. Make sure the suppliers table has RLS enabled but with a permissive service-role policy
-- (Service role key always bypasses RLS, but this adds explicit authenticated access too)

-- Allow authenticated users with role='admin' or 'super-admin' to SELECT suppliers
-- (This is a belt-and-suspenders fix in case service role falls back to anon)

ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any to avoid conflicts
DROP POLICY IF EXISTS "suppliers_service_role_all" ON suppliers;
DROP POLICY IF EXISTS "suppliers_admin_select" ON suppliers;
DROP POLICY IF EXISTS "suppliers_admin_insert" ON suppliers;
DROP POLICY IF EXISTS "suppliers_admin_update" ON suppliers;
DROP POLICY IF EXISTS "suppliers_admin_delete" ON suppliers;

-- Allow service role full access (belt-and-suspenders — service role bypasses RLS anyway)
CREATE POLICY "suppliers_service_role_all" ON suppliers
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow authenticated admin users to read
CREATE POLICY "suppliers_admin_select" ON suppliers
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super-admin', 'manager')
    )
  );

-- Allow authenticated admin users to insert
CREATE POLICY "suppliers_admin_insert" ON suppliers
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super-admin')
    )
  );

-- Allow authenticated admin users to update
CREATE POLICY "suppliers_admin_update" ON suppliers
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super-admin')
    )
  )
  WITH CHECK (true);
