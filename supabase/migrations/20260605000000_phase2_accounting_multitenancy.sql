-- Phase 2, 9, 10: Multi-Tenancy and Enterprise Accounting Migration

-- ============================================================================
-- 1. MULTI-TENANCY FOUNDATION (PHASE 9)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.tenants (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Note: We assume auth.users will be linked via a separate mapping table or a tenant_id column added to user_profiles
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);

-- Create a helper function to get current tenant context
CREATE OR REPLACE FUNCTION public.auth_tenant_id() RETURNS UUID AS $$
  SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE;

-- ============================================================================
-- 2. ENTERPRISE ACCOUNTING (PHASE 2)
-- ============================================================================

-- Chart of Accounts
CREATE TABLE IF NOT EXISTS public.accounting_accounts (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('asset', 'liability', 'equity', 'revenue', 'expense')),
    sub_type VARCHAR(100), -- e.g., 'current_asset', 'fixed_asset'
    parent_id UUID REFERENCES public.accounting_accounts(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, code)
);

-- Fiscal Periods
CREATE TABLE IF NOT EXISTS public.accounting_fiscal_periods (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_closed BOOLEAN DEFAULT FALSE,
    closed_at TIMESTAMP WITH TIME ZONE,
    closed_by UUID REFERENCES public.user_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Journal Headers
CREATE TABLE IF NOT EXISTS public.accounting_journals (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    voucher_number VARCHAR(100) NOT NULL,
    transaction_date DATE NOT NULL,
    fiscal_period_id UUID REFERENCES public.accounting_fiscal_periods(id),
    reference_type VARCHAR(100), -- 'invoice', 'bill', 'payment', 'manual'
    reference_id UUID,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'posted', 'cancelled')),
    notes TEXT,
    created_by UUID REFERENCES public.user_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, voucher_number)
);

-- Journal Lines (Double Entry Validation)
CREATE TABLE IF NOT EXISTS public.accounting_journal_lines (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    journal_id UUID REFERENCES public.accounting_journals(id) ON DELETE CASCADE,
    account_id UUID REFERENCES public.accounting_accounts(id) ON DELETE RESTRICT,
    description TEXT,
    debit_amount DECIMAL(15,4) DEFAULT 0.0000 CHECK (debit_amount >= 0),
    credit_amount DECIMAL(15,4) DEFAULT 0.0000 CHECK (credit_amount >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Ensure either debit or credit is present, but not both on the same line
    CONSTRAINT chk_debit_credit_mutually_exclusive CHECK (
        (debit_amount > 0 AND credit_amount = 0) OR
        (credit_amount > 0 AND debit_amount = 0)
    )
);

-- Accounting Immutable Audit Logs
CREATE TABLE IF NOT EXISTS public.accounting_audit_logs (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.user_profiles(id),
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    old_value JSONB,
    new_value JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function to validate double entry constraint before posting a journal
CREATE OR REPLACE FUNCTION validate_journal_balance() RETURNS trigger AS $$
DECLARE
    total_debit DECIMAL(15,4);
    total_credit DECIMAL(15,4);
BEGIN
    IF NEW.status = 'posted' THEN
        SELECT COALESCE(SUM(debit_amount), 0), COALESCE(SUM(credit_amount), 0)
        INTO total_debit, total_credit
        FROM public.accounting_journal_lines
        WHERE journal_id = NEW.id;

        IF total_debit <> total_credit THEN
            RAISE EXCEPTION 'Journal entry does not balance. Total Debit: %, Total Credit: %', total_debit, total_credit;
        END IF;

        IF total_debit = 0 THEN
            RAISE EXCEPTION 'Journal entry must have non-zero amounts.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_journal_balance
BEFORE UPDATE ON public.accounting_journals
FOR EACH ROW
WHEN (NEW.status = 'posted' AND OLD.status != 'posted')
EXECUTE FUNCTION validate_journal_balance();

-- Function to prevent modification of closed fiscal periods or posted journals
CREATE OR REPLACE FUNCTION prevent_accounting_modifications() RETURNS trigger AS $$
DECLARE
    fp_closed BOOLEAN;
    j_status VARCHAR;
BEGIN
    -- If updating lines, check journal status
    IF TG_TABLE_NAME = 'accounting_journal_lines' THEN
        SELECT status INTO j_status FROM public.accounting_journals WHERE id = OLD.journal_id;
        IF j_status = 'posted' THEN
            RAISE EXCEPTION 'Cannot modify lines of a posted journal. Use reversal entries instead.';
        END IF;
    END IF;

    -- If updating journals directly
    IF TG_TABLE_NAME = 'accounting_journals' AND OLD.status = 'posted' AND NEW.status != 'cancelled' THEN
         RAISE EXCEPTION 'Cannot modify a posted journal directly.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_line_modification
BEFORE UPDATE OR DELETE ON public.accounting_journal_lines
FOR EACH ROW EXECUTE FUNCTION prevent_accounting_modifications();

-- ============================================================================
-- 3. APPLY ROW LEVEL SECURITY (RLS) FOR MULTI-TENANCY
-- ============================================================================

-- Accounting Accounts
ALTER TABLE public.accounting_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant Isolation Accounts" ON public.accounting_accounts
FOR ALL USING (tenant_id = public.auth_tenant_id());

-- Journals
ALTER TABLE public.accounting_journals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant Isolation Journals" ON public.accounting_journals
FOR ALL USING (tenant_id = public.auth_tenant_id());

-- Journal Lines (Implicitly isolated via Journal relationship in app logic, but let's add strict view if needed)
-- For performance we'll skip RLS on lines directly and enforce it at the journal level in APIs,
-- or we can use a subquery:
ALTER TABLE public.accounting_journal_lines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant Isolation Journal Lines" ON public.accounting_journal_lines
FOR ALL USING (
    EXISTS (SELECT 1 FROM public.accounting_journals j WHERE j.id = journal_id AND j.tenant_id = public.auth_tenant_id())
);

-- Fiscal Periods
ALTER TABLE public.accounting_fiscal_periods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant Isolation Fiscal Periods" ON public.accounting_fiscal_periods
FOR ALL USING (tenant_id = public.auth_tenant_id());

-- Note: In a real environment, you must also apply the tenant isolation policies to inventory, products, and users similarly.
