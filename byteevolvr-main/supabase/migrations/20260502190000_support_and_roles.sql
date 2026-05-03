-- ============================================================
-- Support Module and Role-Based Access
-- ============================================================

-- 1. Note: 'support' role added in previous migration (20260502185500)

-- 2. Create Support Tickets Table
DROP TABLE IF EXISTS public.support_tickets CASCADE;
CREATE TABLE public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open', -- open, in_progress, resolved, closed
  priority TEXT NOT NULL DEFAULT 'medium', -- low, medium, high, urgent
  assigned_to UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Enable RLS
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- 4. Policies
DROP POLICY IF EXISTS "admin_manage_tickets" ON public.support_tickets;
CREATE POLICY "admin_manage_tickets" ON public.support_tickets FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "support_manage_tickets" ON public.support_tickets;
CREATE POLICY "support_manage_tickets" ON public.support_tickets FOR ALL TO authenticated USING (
    (SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'support'
) WITH CHECK (
    (SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'support'
);

DROP POLICY IF EXISTS "users_view_own_tickets" ON public.support_tickets;
CREATE POLICY "users_view_own_tickets" ON public.support_tickets FOR SELECT TO authenticated USING (user_id = auth.uid());

-- 5. Seed some tickets
DO $$
DECLARE
    v_user_id UUID;
    v_order_id UUID;
BEGIN
    SELECT id INTO v_user_id FROM public.user_profiles WHERE email = 'admin@byteevolvr.com' LIMIT 1;
    SELECT id INTO v_order_id FROM public.orders LIMIT 1;
    
    IF v_user_id IS NOT NULL THEN
        INSERT INTO public.support_tickets (user_id, order_id, subject, description, status, priority)
        VALUES 
            (v_user_id, v_order_id, 'Refund Request', 'I ordered the wrong item by mistake. Need a refund.', 'open', 'high'),
            (v_user_id, v_order_id, 'Shipping Delay', 'My order is stuck in transit for 5 days.', 'in_progress', 'medium');
    END IF;
END $$;
