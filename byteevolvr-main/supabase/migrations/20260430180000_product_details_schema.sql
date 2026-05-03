-- supabase/migrations/20260430180000_product_details_schema.sql

-- 1. Add JSONB columns for Specifications, Q&A, and Reviews
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS specifications JSONB DEFAULT '[]'::JSONB,
ADD COLUMN IF NOT EXISTS qna JSONB DEFAULT '[]'::JSONB,
ADD COLUMN IF NOT EXISTS reviews JSONB DEFAULT '[]'::JSONB;

-- 2. Re-enable Row Level Security (RLS) on the products table
-- This fulfills the requirement to "secure fetch data as per the rls enables service"
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Note: The policies "public_read_active_products" and "admin_manage_products" 
-- already exist from the previous CMS schema migration.
