-- 1. Sync missing profiles from auth.users to public.user_profiles
-- This ensures that adding the Foreign Key constraint doesn't fail for existing registered users
INSERT INTO public.user_profiles (id, full_name, email, role)
SELECT 
    id, 
    COALESCE(raw_user_meta_data->>'full_name', email, 'User'), 
    email, 
    'user'
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.user_profiles)
ON CONFLICT (id) DO NOTHING;

-- 2. Make orders.user_id nullable to support walk-in/POS orders
ALTER TABLE public.orders ALTER COLUMN user_id DROP NOT NULL;

-- 3. Reassign orphaned orders to NULL
-- (Orders referencing users that no longer exist in auth.users)
UPDATE public.orders 
SET user_id = NULL
WHERE user_id NOT IN (SELECT id FROM public.user_profiles) 
  AND user_id IS NOT NULL;

-- 4. Fix relationship between orders and user_profiles
-- This allows PostgREST to automatically resolve the join
ALTER TABLE public.orders 
DROP CONSTRAINT IF EXISTS orders_user_id_fkey,
ADD CONSTRAINT orders_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.user_profiles(id)
ON DELETE SET NULL;

-- 5. Fix missing slug column in products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS slug TEXT;


-- Create index for slug
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);

-- Update existing products to have slugs if missing
UPDATE public.products 
SET slug = lower(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g'))
WHERE slug IS NULL OR slug = '';

