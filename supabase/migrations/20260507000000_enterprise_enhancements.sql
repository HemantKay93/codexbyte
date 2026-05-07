-- ============================================================
-- Enterprise Backend Schema Enhancements
-- ============================================================

-- 1. Roles and Permissions (Enhanced RBAC)
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    module TEXT NOT NULL, -- e.g., 'orders', 'products', 'inventory'
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.role_permissions (
    role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- 2. Multiple Warehouses
CREATE TABLE IF NOT EXISTS public.warehouses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    contact_phone TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Inventory Tracking
CREATE TABLE IF NOT EXISTS public.inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    warehouse_id UUID REFERENCES public.warehouses(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 0,
    min_stock_level INTEGER DEFAULT 10,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, warehouse_id)
);

-- 4. Stock Movements (Audit Trail for Inventory)
CREATE TABLE IF NOT EXISTS public.stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inventory_id UUID REFERENCES public.inventory(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'in', 'out', 'transfer', 'adjustment', 'return'
    quantity INTEGER NOT NULL,
    reference_type TEXT, -- 'order', 'return', 'manual'
    reference_id TEXT,
    notes TEXT,
    performed_by UUID REFERENCES public.user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. Audit Logs (System-wide tracking)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id),
    action TEXT NOT NULL, -- 'CREATE_PRODUCT', 'UPDATE_ORDER_STATUS', etc.
    module TEXT NOT NULL,
    entity_id TEXT,
    old_data JSONB,
    new_data JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. Order Activity Logs (Order-specific timeline)
CREATE TABLE IF NOT EXISTS public.order_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    notes TEXT,
    performed_by UUID REFERENCES public.user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 7. Initial Seed for Roles
INSERT INTO public.roles (name, description) VALUES 
('super-admin', 'Full system access'),
('admin', 'Administrative access to most modules'),
('staff', 'Limited access to orders and products'),
('customer', 'Standard customer access')
ON CONFLICT (name) DO NOTHING;

-- 8. Seed Default Warehouse
INSERT INTO public.warehouses (name, location) VALUES 
('Main Warehouse', 'Mumbai, India'),
('Secondary Hub', 'Bangalore, India')
ON CONFLICT DO NOTHING;

-- 9. Enable RLS on new tables
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_activity_logs ENABLE ROW LEVEL SECURITY;

-- 10. Admin Policies
CREATE POLICY "admin_all_roles" ON public.roles FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "admin_all_warehouses" ON public.warehouses FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "admin_all_inventory" ON public.inventory FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "admin_all_audit" ON public.audit_logs FOR ALL TO authenticated USING (public.is_admin());
