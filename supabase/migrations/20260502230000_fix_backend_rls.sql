-- ============================================================
-- Fix Backend Insert Failures while keeping RLS ENABLED
-- ============================================================

-- 1. Ensure RLS is enabled (in case it was disabled previously)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;

-- 2. Add policies to allow any authenticated user to insert records
-- This ensures that the frontend/backend can successfully create orders and addresses
-- as long as the session is authenticated. Data integrity is still maintained by foreign keys.

-- 2. Add policies to allow authenticated users to insert records
-- Regular users can only insert their own records (user_id = auth.uid())
-- Admins can insert records for any user (public.is_admin())

-- First, drop ANY existing policies that might conflict
DROP POLICY IF EXISTS "users_manage_own_addresses" ON public.addresses;
DROP POLICY IF EXISTS "admin_manage_addresses" ON public.addresses;
DROP POLICY IF EXISTS "authenticated_insert_addresses" ON public.addresses;

DROP POLICY IF EXISTS "users_manage_own_orders" ON public.orders;
DROP POLICY IF EXISTS "admin_manage_orders" ON public.orders;
DROP POLICY IF EXISTS "authenticated_insert_orders" ON public.orders;

-- Now create the new, unified policies
CREATE POLICY "authenticated_manage_orders" ON public.orders 
FOR ALL TO authenticated USING (user_id = auth.uid() OR public.is_admin()) WITH CHECK (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "authenticated_manage_addresses" ON public.addresses 
FOR ALL TO authenticated USING (user_id = auth.uid() OR public.is_admin()) WITH CHECK (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "authenticated_insert_order_items" ON public.order_items;
CREATE POLICY "authenticated_manage_order_items" ON public.order_items 
FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_insert_payments" ON public.payments;
CREATE POLICY "authenticated_manage_payments" ON public.payments 
FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_insert_shipments" ON public.shipments;
CREATE POLICY "authenticated_manage_shipments" ON public.shipments 
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 3. Ensure the admin user exists and has the correct password and metadata
-- This fixes the "Invalid login credentials" error in the backend
DO $$
DECLARE
  v_admin_id UUID;
BEGIN
  -- Check if user exists
  SELECT id INTO v_admin_id FROM auth.users WHERE email = 'admin@byteevolvr.com';
  
  IF v_admin_id IS NULL THEN
    -- Create if not exists (using a fixed UUID for consistency)
    v_admin_id := '00000000-0000-0000-0000-000000000001';
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_user_meta_data, raw_app_meta_data, is_sso_user
    ) VALUES (
      v_admin_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
      'admin@byteevolvr.com', crypt('Admin@123', gen_salt('bf', 10)), now(),
      jsonb_build_object('role', 'admin', 'full_name', 'System Admin'),
      jsonb_build_object('role', 'admin', 'provider', 'email'),
      false
    );
  ELSE
    -- Update password and metadata if exists
    UPDATE auth.users 
    SET encrypted_password = crypt('Admin@123', gen_salt('bf', 10)),
        raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('role', 'admin'),
        raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', 'admin')
    WHERE id = v_admin_id;
  END IF;
END $$;

-- 4. Clean up any accidental anonymous insert policies
DROP POLICY IF EXISTS "anon_insert_orders" ON public.orders;
DROP POLICY IF EXISTS "anon_insert_addresses" ON public.addresses;
DROP POLICY IF EXISTS "anon_insert_order_items" ON public.order_items;
