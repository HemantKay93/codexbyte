-- Add explicit foreign key relationship between orders and user_profiles to enable PostgREST joins
ALTER TABLE public.orders
DROP CONSTRAINT IF EXISTS orders_user_id_fkey,
ADD CONSTRAINT orders_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES public.user_profiles(id) 
ON DELETE CASCADE;

-- Ensure order_items also has proper relationships if needed
-- (Already has FK to orders)
