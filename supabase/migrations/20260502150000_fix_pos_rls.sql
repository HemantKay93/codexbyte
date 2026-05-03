-- Ensure Admin has full access to orders and order items
DROP POLICY IF EXISTS "admin_manage_orders" ON public.orders;
CREATE POLICY "admin_manage_orders" ON public.orders 
FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_manage_order_items" ON public.order_items;
CREATE POLICY "admin_manage_order_items" ON public.order_items 
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Also ensure products are readable by everyone
DROP POLICY IF EXISTS "public_read_active_products" ON public.products;
CREATE POLICY "public_read_active_products" ON public.products 
FOR SELECT TO public USING (true);
