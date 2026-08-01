-- supabase/migrations/20260801120500_add_product_variants.sql

-- 1. Add variants column as JSONB array to the products table
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS variants JSONB DEFAULT '[]'::JSONB;

-- 2. Notify PostgREST to reload the schema cache so the column is immediately visible in APIs
NOTIFY pgrst, 'reload schema';
