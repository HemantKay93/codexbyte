-- Migration to support guest checkout and historical address data
ALTER TABLE public.orders ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.addresses ALTER COLUMN user_id DROP NOT NULL;

-- Ensure critical columns exist in orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_address JSONB;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_name TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_email TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_amount NUMERIC(12,2) DEFAULT 0;

-- Allow public (guest) to create orders
DROP POLICY IF EXISTS "allow_public_insert_orders" ON public.orders;
CREATE POLICY "allow_public_insert_orders" ON public.orders FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "allow_public_insert_order_items" ON public.order_items;
CREATE POLICY "allow_public_insert_order_items" ON public.order_items FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Allow public (guest) to update inventory stock
DROP POLICY IF EXISTS "allow_public_manage_inventory" ON public.inventory;
CREATE POLICY "allow_public_manage_inventory" ON public.inventory FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "allow_public_insert_stock_movements" ON public.stock_movements;
CREATE POLICY "allow_public_insert_stock_movements" ON public.stock_movements FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "allow_public_update_products" ON public.products;
CREATE POLICY "allow_public_update_products" ON public.products FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- Allow profile creation for new users
DROP POLICY IF EXISTS "allow_public_insert_profiles" ON public.user_profiles;
CREATE POLICY "allow_public_insert_profiles" ON public.user_profiles FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "allow_public_select_profiles" ON public.user_profiles;
CREATE POLICY "allow_public_select_profiles" ON public.user_profiles FOR SELECT TO anon, authenticated USING (true);

