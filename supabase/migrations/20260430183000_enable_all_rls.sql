-- supabase/migrations/20260430183000_enable_all_rls.sql

-- 1. Enable RLS on all remaining tables
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracking_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- 2. Define RLS Policies for Addresses
DROP POLICY IF EXISTS "users_manage_own_addresses" ON public.addresses;
CREATE POLICY "users_manage_own_addresses" ON public.addresses 
FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "admin_manage_addresses" ON public.addresses;
CREATE POLICY "admin_manage_addresses" ON public.addresses 
FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 3. Define RLS Policies for Orders
DROP POLICY IF EXISTS "users_manage_own_orders" ON public.orders;
CREATE POLICY "users_manage_own_orders" ON public.orders 
FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "admin_manage_orders" ON public.orders;
CREATE POLICY "admin_manage_orders" ON public.orders 
FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 4. Define RLS Policies for Order Items
DROP POLICY IF EXISTS "users_manage_own_order_items" ON public.order_items;
CREATE POLICY "users_manage_own_order_items" ON public.order_items 
FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));

DROP POLICY IF EXISTS "admin_manage_order_items" ON public.order_items;
CREATE POLICY "admin_manage_order_items" ON public.order_items 
FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 5. Define RLS Policies for Payments
DROP POLICY IF EXISTS "users_manage_own_payments" ON public.payments;
CREATE POLICY "users_manage_own_payments" ON public.payments 
FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = payments.order_id AND orders.user_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM orders WHERE orders.id = payments.order_id AND orders.user_id = auth.uid()));

DROP POLICY IF EXISTS "admin_manage_payments" ON public.payments;
CREATE POLICY "admin_manage_payments" ON public.payments 
FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 6. Define RLS Policies for Shipments
DROP POLICY IF EXISTS "users_manage_own_shipments" ON public.shipments;
CREATE POLICY "users_manage_own_shipments" ON public.shipments 
FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = shipments.order_id AND orders.user_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM orders WHERE orders.id = shipments.order_id AND orders.user_id = auth.uid()));

DROP POLICY IF EXISTS "admin_manage_shipments" ON public.shipments;
CREATE POLICY "admin_manage_shipments" ON public.shipments 
FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 7. Define RLS Policies for Tracking Events
DROP POLICY IF EXISTS "users_read_own_tracking" ON public.tracking_events;
CREATE POLICY "users_read_own_tracking" ON public.tracking_events 
FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM shipments s JOIN orders o ON s.order_id = o.id WHERE s.id = tracking_events.shipment_id AND o.user_id = auth.uid()));

DROP POLICY IF EXISTS "admin_manage_tracking" ON public.tracking_events;
CREATE POLICY "admin_manage_tracking" ON public.tracking_events 
FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 8. Define RLS Policies for Admin Audit Logs
DROP POLICY IF EXISTS "admin_manage_audit_logs" ON public.admin_audit_logs;
CREATE POLICY "admin_manage_audit_logs" ON public.admin_audit_logs 
FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
