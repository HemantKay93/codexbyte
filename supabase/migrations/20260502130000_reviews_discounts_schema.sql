-- ============================================================
-- Reviews and Discounts Schema & Demo Data
-- ============================================================

-- 1. TYPES
DROP TYPE IF EXISTS public.review_status CASCADE;
CREATE TYPE public.review_status AS ENUM ('pending', 'approved', 'flagged');

DROP TYPE IF EXISTS public.discount_status CASCADE;
CREATE TYPE public.discount_status AS ENUM ('active', 'scheduled', 'expired');

DROP TYPE IF EXISTS public.discount_type CASCADE;
CREATE TYPE public.discount_type AS ENUM ('percentage', 'fixed_amount');

-- 2. TABLES
DROP TABLE IF EXISTS public.reviews CASCADE;
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT DEFAULT '',
  status public.review_status DEFAULT 'pending'::public.review_status,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS public.discounts CASCADE;
CREATE TABLE public.discounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  type public.discount_type NOT NULL DEFAULT 'percentage'::public.discount_type,
  value DECIMAL(10,2) NOT NULL,
  usage_limit INTEGER DEFAULT NULL,
  usage_count INTEGER DEFAULT 0,
  status public.discount_status DEFAULT 'active'::public.discount_status,
  valid_from TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  valid_until TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. RLS
ALTER TABLE public.reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.discounts DISABLE ROW LEVEL SECURITY;

-- 4. DEMO DATA
DO $$
DECLARE
  product1_id UUID;
  product2_id UUID;
  user1_id UUID;
BEGIN
  SELECT id INTO product1_id FROM public.products LIMIT 1;
  SELECT id INTO product2_id FROM public.products OFFSET 1 LIMIT 1;
  SELECT id INTO user1_id FROM auth.users LIMIT 1;

  IF product1_id IS NOT NULL THEN
    INSERT INTO public.reviews (product_id, user_id, rating, comment, status)
    VALUES
      (product1_id, user1_id, 5, 'Absolutely love these! The sound quality is amazing and battery lasts forever.', 'pending'),
      (product2_id, user1_id, 4, 'Great typing feel, but the software to customize RGB is a bit clunky.', 'approved')
    ON CONFLICT DO NOTHING;
  END IF;

  INSERT INTO public.discounts (code, type, value, usage_limit, usage_count, status, valid_until)
  VALUES
    ('SUMMER25', 'percentage', 25, NULL, 142, 'active', '2026-08-31 23:59:59+00'),
    ('WELCOME10', 'percentage', 10, NULL, 840, 'active', NULL),
    ('FREESHIP', 'fixed_amount', 15, 100, 34, 'active', '2026-06-15 23:59:59+00'),
    ('BLACKFRIDAY', 'percentage', 40, NULL, 0, 'scheduled', '2026-11-30 23:59:59+00')
  ON CONFLICT DO NOTHING;

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Demo data insertion failed: %', SQLERRM;
END $$;
