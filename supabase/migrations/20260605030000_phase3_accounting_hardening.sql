-- Phase 3: Accounting Hardening
-- Enforce immutable ledgers and period locking

-- Prevent updates/deletes on posted journals
CREATE OR REPLACE FUNCTION prevent_posted_journal_modification()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        -- Allow status changes (e.g. from draft to posted), but if it was already posted, don't allow modifying core fields
        IF OLD.status = 'posted' AND (OLD.transaction_date != NEW.transaction_date OR OLD.voucher_number != NEW.voucher_number OR OLD.tenant_id != NEW.tenant_id) THEN
            RAISE EXCEPTION 'Cannot modify core fields of a posted journal entry.';
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.status = 'posted' THEN
            RAISE EXCEPTION 'Cannot delete a posted journal entry. Use a reversal entry instead.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_posted_journal_modification ON accounting_journals;
CREATE TRIGGER trg_prevent_posted_journal_modification
BEFORE UPDATE OR DELETE ON accounting_journals
FOR EACH ROW
EXECUTE FUNCTION prevent_posted_journal_modification();

-- Prevent updates/deletes on journal lines if parent is posted
CREATE OR REPLACE FUNCTION prevent_posted_journal_line_modification()
RETURNS TRIGGER AS $$
DECLARE
    parent_status VARCHAR;
BEGIN
    IF TG_OP = 'UPDATE' OR TG_OP = 'DELETE' THEN
        SELECT status INTO parent_status FROM accounting_journals WHERE id = OLD.journal_id;
        IF parent_status = 'posted' THEN
            RAISE EXCEPTION 'Cannot modify or delete lines of a posted journal entry.';
        END IF;
    END IF;
    
    IF TG_OP = 'INSERT' THEN
        SELECT status INTO parent_status FROM accounting_journals WHERE id = NEW.journal_id;
        IF parent_status = 'posted' THEN
            RAISE EXCEPTION 'Cannot add lines to an already posted journal entry.';
        END IF;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_posted_journal_line_modification ON accounting_journal_lines;
CREATE TRIGGER trg_prevent_posted_journal_line_modification
BEFORE INSERT OR UPDATE OR DELETE ON accounting_journal_lines
FOR EACH ROW
EXECUTE FUNCTION prevent_posted_journal_line_modification();

-- Add financial_periods table for locking
CREATE TABLE IF NOT EXISTS accounting_periods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'closed')),
    closed_at TIMESTAMP WITH TIME ZONE,
    closed_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE accounting_periods ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view periods in their tenant" ON accounting_periods;
CREATE POLICY "Users can view periods in their tenant" ON accounting_periods
FOR SELECT USING (tenant_id = public.auth_tenant_id());
