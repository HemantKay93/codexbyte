-- Phase 7 (RBAC) & Phase 8 (Audit System) Migration

-- ============================================================================
-- 1. ENTERPRISE RBAC (PHASE 7)
-- ============================================================================

-- Roles Table
CREATE TABLE IF NOT EXISTS public.auth_roles (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_system BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, name)
);

-- Permissions Table (Global, not tenant-specific)
CREATE TABLE IF NOT EXISTS public.auth_permissions (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    resource VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(resource, action)
);

-- Role Permissions Mapping
CREATE TABLE IF NOT EXISTS public.auth_role_permissions (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    role_id UUID REFERENCES public.auth_roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES public.auth_permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(role_id, permission_id)
);

-- User Roles Mapping
CREATE TABLE IF NOT EXISTS public.auth_user_roles (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    role_id UUID REFERENCES public.auth_roles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, user_id, role_id)
);

-- Seed Basic Permissions
INSERT INTO public.auth_permissions (resource, action) VALUES 
('inventory', 'read'), ('inventory', 'write'), ('inventory', 'delete'),
('crm', 'read'), ('crm', 'write'), ('crm', 'delete'),
('accounting', 'read'), ('accounting', 'write'), ('accounting', 'delete'),
('sales', 'read'), ('sales', 'write'), ('sales', 'delete'),
('settings', 'read'), ('settings', 'write'), ('settings', 'delete')
ON CONFLICT DO NOTHING;


-- ============================================================================
-- 2. ENTERPRISE AUDIT SYSTEM (PHASE 8)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.system_audit_logs (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(100) NOT NULL,
    resource_id UUID,
    metadata JSONB DEFAULT '{}'::jsonb,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Apply RLS
ALTER TABLE public.auth_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant Isolation Roles" ON public.auth_roles FOR ALL USING (tenant_id = public.auth_tenant_id());

ALTER TABLE public.auth_user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant Isolation User Roles" ON public.auth_user_roles FOR ALL USING (tenant_id = public.auth_tenant_id());

ALTER TABLE public.system_audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant Isolation Audit Logs" ON public.system_audit_logs FOR ALL USING (tenant_id = public.auth_tenant_id());
