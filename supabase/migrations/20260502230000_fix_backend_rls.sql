-- ============================================================
-- Fix Backend Insert Failures while keeping RLS ENABLED
-- ============================================================

-- 1. Ensure RLS is enabled (in case it was disabled previously)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;

-- 2. Add policies to allow authenticated users to manage only their own
-- order graph. Admins can manage all rows through public.is_admin().

-- First, drop ANY existing policies that might conflict
DROP POLICY IF EXISTS "users_manage_own_addresses" ON public.addresses;
DROP POLICY IF EXISTS "admin_manage_addresses" ON public.addresses;
DROP POLICY IF EXISTS "authenticated_insert_addresses" ON public.addresses;
DROP POLICY IF EXISTS "authenticated_manage_addresses" ON public.addresses;

DROP POLICY IF EXISTS "users_manage_own_orders" ON public.orders;
DROP POLICY IF EXISTS "admin_manage_orders" ON public.orders;
DROP POLICY IF EXISTS "authenticated_insert_orders" ON public.orders;
DROP POLICY IF EXISTS "authenticated_manage_orders" ON public.orders;

-- Now create the new, unified policies
CREATE POLICY "authenticated_manage_orders" ON public.orders 
FOR ALL TO authenticated USING (user_id = auth.uid() OR public.is_admin()) WITH CHECK (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "authenticated_manage_addresses" ON public.addresses 
FOR ALL TO authenticated USING (user_id = auth.uid() OR public.is_admin()) WITH CHECK (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "authenticated_insert_order_items" ON public.order_items;
DROP POLICY IF EXISTS "authenticated_manage_order_items" ON public.order_items;
CREATE POLICY "authenticated_manage_order_items" ON public.order_items 
FOR ALL TO authenticated
USING (
  public.is_admin()
  OR EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
  )
)
WITH CHECK (
  public.is_admin()
  OR EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "authenticated_insert_payments" ON public.payments;
DROP POLICY IF EXISTS "authenticated_manage_payments" ON public.payments;
CREATE POLICY "authenticated_manage_payments" ON public.payments 
FOR ALL TO authenticated
USING (
  public.is_admin()
  OR EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = payments.order_id
      AND orders.user_id = auth.uid()
  )
)
WITH CHECK (
  public.is_admin()
  OR EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = payments.order_id
      AND orders.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "authenticated_insert_shipments" ON public.shipments;
DROP POLICY IF EXISTS "authenticated_manage_shipments" ON public.shipments;
CREATE POLICY "authenticated_manage_shipments" ON public.shipments 
FOR ALL TO authenticated
USING (
  public.is_admin()
  OR EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = shipments.order_id
      AND orders.user_id = auth.uid()
  )
)
WITH CHECK (
  public.is_admin()
  OR EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = shipments.order_id
      AND orders.user_id = auth.uid()
  )
);

-- 3. Clean up any accidental anonymous insert policies
DROP POLICY IF EXISTS "anon_insert_orders" ON public.orders;
DROP POLICY IF EXISTS "anon_insert_addresses" ON public.addresses;
DROP POLICY IF EXISTS "anon_insert_order_items" ON public.order_items;
