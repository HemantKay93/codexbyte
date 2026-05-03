-- ============================================================
-- Customer Insights and Product Reviews
-- ============================================================

-- 1. Create Product Reviews Table
DROP TABLE IF EXISTS public.product_reviews CASCADE;
CREATE TABLE public.product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected, flagged
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Enable RLS
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

-- 3. Policies
DROP POLICY IF EXISTS "anyone_read_approved_reviews" ON public.product_reviews;
CREATE POLICY "anyone_read_approved_reviews" ON public.product_reviews FOR SELECT TO public USING (status = 'approved');

DROP POLICY IF EXISTS "users_create_own_reviews" ON public.product_reviews;
CREATE POLICY "users_create_own_reviews" ON public.product_reviews FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "admin_manage_all_reviews" ON public.product_reviews;
CREATE POLICY "admin_manage_all_reviews" ON public.product_reviews FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 4. Seed some reviews for demo
DO $$
DECLARE
    v_product_id UUID;
    v_user_id UUID;
BEGIN
    SELECT id INTO v_product_id FROM public.products LIMIT 1;
    SELECT id INTO v_user_id FROM public.user_profiles LIMIT 1;
    
    IF v_product_id IS NOT NULL AND v_user_id IS NOT NULL THEN
        INSERT INTO public.product_reviews (product_id, user_id, rating, comment, status)
        VALUES 
            (v_product_id, v_user_id, 5, 'Exceptional quality! Exceeded my expectations.', 'approved'),
            (v_product_id, v_user_id, 4, 'Very good, but shipping took a bit longer than expected.', 'pending');
    END IF;
END $$;
