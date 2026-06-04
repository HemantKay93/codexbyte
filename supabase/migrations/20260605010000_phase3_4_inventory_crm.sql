-- Phase 3 (Inventory Management) & Phase 4 (CRM) Migration

-- ============================================================================
-- 1. ENTERPRISE INVENTORY (PHASE 3)
-- ============================================================================

-- Warehouses
CREATE TABLE IF NOT EXISTS public.inventory_warehouses (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    location TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Zones
CREATE TABLE IF NOT EXISTS public.inventory_zones (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    warehouse_id UUID REFERENCES public.inventory_warehouses(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Racks
CREATE TABLE IF NOT EXISTS public.inventory_racks (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    zone_id UUID REFERENCES public.inventory_zones(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shelves
CREATE TABLE IF NOT EXISTS public.inventory_shelves (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    rack_id UUID REFERENCES public.inventory_racks(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bins
CREATE TABLE IF NOT EXISTS public.inventory_bins (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    shelf_id UUID REFERENCES public.inventory_shelves(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Batches
CREATE TABLE IF NOT EXISTS public.inventory_batches (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    batch_number VARCHAR(100) NOT NULL,
    expiry_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, product_id, batch_number)
);

-- Stock Ledger (Bin-Level Tracking)
CREATE TABLE IF NOT EXISTS public.inventory_stock (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    bin_id UUID REFERENCES public.inventory_bins(id),
    batch_id UUID REFERENCES public.inventory_batches(id),
    quantity DECIMAL(15,4) DEFAULT 0.0000,
    reserved_quantity DECIMAL(15,4) DEFAULT 0.0000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stock Movements
CREATE TABLE IF NOT EXISTS public.inventory_stock_movements (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    stock_id UUID REFERENCES public.inventory_stock(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('in', 'out', 'transfer', 'adjustment', 'return')),
    quantity DECIMAL(15,4) NOT NULL,
    reference_type VARCHAR(100),
    reference_id UUID,
    notes TEXT,
    performed_by UUID REFERENCES public.user_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Apply RLS for Inventory
ALTER TABLE public.inventory_warehouses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant Isolation Warehouses" ON public.inventory_warehouses FOR ALL USING (tenant_id = public.auth_tenant_id());

ALTER TABLE public.inventory_stock ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant Isolation Stock" ON public.inventory_stock FOR ALL USING (tenant_id = public.auth_tenant_id());

ALTER TABLE public.inventory_stock_movements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant Isolation Stock Movements" ON public.inventory_stock_movements FOR ALL USING (tenant_id = public.auth_tenant_id());


-- ============================================================================
-- 2. ENTERPRISE CRM (PHASE 4)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.crm_leads (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(50),
    company VARCHAR(255),
    status VARCHAR(50) DEFAULT 'lead' CHECK (status IN ('lead', 'qualified', 'proposal', 'negotiation', 'won', 'lost')),
    score INTEGER DEFAULT 0,
    assigned_to UUID REFERENCES public.user_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.crm_opportunities (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES public.crm_leads(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    expected_value DECIMAL(15,2) DEFAULT 0.00,
    probability_percentage INTEGER DEFAULT 0 CHECK (probability_percentage >= 0 AND probability_percentage <= 100),
    expected_close_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.crm_activities (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES public.crm_leads(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('email', 'call', 'whatsapp', 'meeting', 'note')),
    notes TEXT,
    performed_by UUID REFERENCES public.user_profiles(id),
    performed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Apply RLS for CRM
ALTER TABLE public.crm_leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant Isolation CRM Leads" ON public.crm_leads FOR ALL USING (tenant_id = public.auth_tenant_id());

ALTER TABLE public.crm_opportunities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant Isolation CRM Opportunities" ON public.crm_opportunities FOR ALL USING (tenant_id = public.auth_tenant_id());

ALTER TABLE public.crm_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant Isolation CRM Activities" ON public.crm_activities FOR ALL USING (tenant_id = public.auth_tenant_id());
