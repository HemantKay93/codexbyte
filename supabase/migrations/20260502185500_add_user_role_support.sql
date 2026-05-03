-- 1. Add 'support' to user_role enum
-- Note: Altering enum is safe in PG12+ but must be committed before use in same transaction
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'support';
