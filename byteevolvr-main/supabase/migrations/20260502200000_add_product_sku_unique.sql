-- Add unique constraint to SKU for products
-- This is necessary for bulk upsert operations

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'products_sku_key'
    ) THEN
        -- First, ensure no null or empty SKUs exist by assigning temporary ones based on ID
        UPDATE public.products 
        SET sku = 'TEMP-SKU-' || id::text 
        WHERE sku IS NULL OR sku = '';

        -- Clean up any remaining duplicate SKUs if they exist
        -- We'll keep the one with the latest updated_at or highest ID
        DELETE FROM public.products p1
        USING public.products p2
        WHERE p1.sku = p2.sku 
        AND p1.id < p2.id;

        -- Now add the unique constraint
        ALTER TABLE public.products ADD CONSTRAINT products_sku_key UNIQUE (sku);
    END IF;
END $$;
