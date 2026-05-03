-- ============================================================
-- Returns and Warehouse Enhancements
-- ============================================================

-- 1. Create Returns Table
DROP TABLE IF EXISTS public.order_returns CASCADE;
CREATE TABLE public.order_returns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rma_number TEXT NOT NULL UNIQUE,
  reason TEXT NOT NULL,
  condition TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected, received, refunded
  refund_amount NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create Return Items (to track which items are being returned)
DROP TABLE IF EXISTS public.order_return_items CASCADE;
CREATE TABLE public.order_return_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  return_id UUID NOT NULL REFERENCES public.order_returns(id) ON DELETE CASCADE,
  order_item_id UUID NOT NULL REFERENCES public.order_items(id),
  quantity INTEGER NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Enable RLS
ALTER TABLE public.order_returns
DROP CONSTRAINT IF EXISTS order_returns_user_id_fkey,
ADD CONSTRAINT order_returns_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES public.user_profiles(id) 
ON DELETE CASCADE;

-- Also for order_return_items to orders if needed (already exists)

ALTER TABLE public.order_return_items ENABLE ROW LEVEL SECURITY;

-- 4. Policies
DROP POLICY IF EXISTS "admin_manage_returns" ON public.order_returns;
CREATE POLICY "admin_manage_returns" ON public.order_returns FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "users_view_own_returns" ON public.order_returns;
CREATE POLICY "users_view_own_returns" ON public.order_returns FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "admin_manage_return_items" ON public.order_return_items;
CREATE POLICY "admin_manage_return_items" ON public.order_return_items FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 5. Warehouse Enhancements (Add warehouse location to products if not exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='warehouse_location') THEN
        ALTER TABLE public.products ADD COLUMN warehouse_location TEXT;
    END IF;
END $$;

-- Update some products with locations for demo
UPDATE public.products SET warehouse_location = 'Aisle 4, Bin B2' WHERE name ILIKE '%Headphones%';
UPDATE public.products SET warehouse_location = 'Aisle 1, Bin A5' WHERE name ILIKE '%USB-C%';
UPDATE public.products SET warehouse_location = 'Aisle 3, Bin C1' WHERE name ILIKE '%Keyboard%';
UPDATE public.products SET warehouse_location = 'Aisle 2, Bin D4' WHERE warehouse_location IS NULL;

-- 6. Seed some returns for demo
DO $$
DECLARE
    v_order_id UUID;
    v_user_id UUID;
    v_item_id UUID;
    v_return_id UUID;
BEGIN
    SELECT id, user_id INTO v_order_id, v_user_id FROM public.orders LIMIT 1;
    SELECT id INTO v_item_id FROM public.order_items WHERE order_id = v_order_id LIMIT 1;
    
    IF v_order_id IS NOT NULL THEN
        INSERT INTO public.order_returns (order_id, user_id, rma_number, reason, status, refund_amount)
        VALUES (v_order_id, v_user_id, 'RMA-9012', 'Defective battery', 'pending', 0)
        RETURNING id INTO v_return_id;
        
        INSERT INTO public.order_return_items (return_id, order_item_id, quantity, reason)
        VALUES (v_return_id, v_item_id, 1, 'Defective');
    END IF;
END $$;
