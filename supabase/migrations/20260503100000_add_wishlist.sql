-- Wishlist Schema
CREATE TABLE IF NOT EXISTS public.wishlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id)
);

-- Enable RLS
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can manage their own wishlist" 
    ON public.wishlists 
    FOR ALL 
    TO authenticated 
    USING (user_id = auth.uid()) 
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all wishlists" 
    ON public.wishlists 
    FOR SELECT 
    TO authenticated 
    USING (public.is_admin());
