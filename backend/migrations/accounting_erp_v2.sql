-- Phase 1 & 2: Accounting ERP Schema v2

-- Drop old tables to make way for the new architecture
DROP TABLE IF EXISTS journal_entries CASCADE;
DROP TABLE IF EXISTS invoice_line_items CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS accounts CASCADE;
DROP TABLE IF EXISTS journal_headers CASCADE;
DROP TABLE IF EXISTS journal_lines CASCADE;

-- ==========================================
-- 1. Chart of Accounts
-- ==========================================
CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('Asset', 'Liability', 'Equity', 'Revenue', 'Expense')),
    subtype VARCHAR(100),
    parent_account_id UUID REFERENCES accounts(id) ON DELETE RESTRICT,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Basic Default Accounts
INSERT INTO accounts (code, name, type, subtype, description) VALUES
('1000', 'Cash', 'Asset', 'Current Asset', 'Cash on hand'),
('1100', 'Bank', 'Asset', 'Current Asset', 'Bank accounts'),
('1200', 'Accounts Receivable', 'Asset', 'Current Asset', 'Amounts owed by customers'),
('1300', 'Inventory', 'Asset', 'Current Asset', 'Goods available for sale'),
('2000', 'Accounts Payable', 'Liability', 'Current Liability', 'Amounts owed to vendors'),
('2100', 'GST Payable', 'Liability', 'Current Liability', 'GST collected, payable to government'),
('3000', 'Owner Equity', 'Equity', 'Equity', 'Owner investments and retained earnings'),
('4000', 'Sales Revenue', 'Revenue', 'Operating Revenue', 'Revenue from core business operations'),
('5000', 'Cost of Goods Sold', 'Expense', 'Cost of Sales', 'Direct costs of goods sold'),
('6000', 'Operating Expenses', 'Expense', 'Operating Expense', 'General business expenses'),
('6100', 'Bank Fees', 'Expense', 'Operating Expense', 'Fees charged by bank'),
('6200', 'Refund Expense', 'Expense', 'Operating Expense', 'Refunds issued to customers');

-- ==========================================
-- 2. Journal Engine
-- ==========================================
CREATE TABLE journal_headers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_type VARCHAR(50), -- e.g., 'invoice', 'order', 'payment', 'manual'
    reference_id UUID,
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'posted', 'void')),
    created_by UUID, -- References auth.users(id) in Supabase
    approved_by UUID, 
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE journal_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    journal_header_id UUID NOT NULL REFERENCES journal_headers(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
    debit_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    credit_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to validate journal balance before posting
CREATE OR REPLACE FUNCTION validate_journal_balance() 
RETURNS TRIGGER AS $$
DECLARE
    total_debits NUMERIC(15,2);
    total_credits NUMERIC(15,2);
BEGIN
    -- Only validate when the journal is marked as posted
    IF NEW.status = 'posted' THEN
        SELECT COALESCE(SUM(debit_amount), 0), COALESCE(SUM(credit_amount), 0)
        INTO total_debits, total_credits
        FROM journal_lines
        WHERE journal_header_id = NEW.id;

        IF total_debits <> total_credits THEN
            RAISE EXCEPTION 'Journal entry does not balance. Debits (%), Credits (%)', total_debits, total_credits;
        END IF;

        IF total_debits = 0 AND total_credits = 0 THEN
            RAISE EXCEPTION 'Journal entry has no lines or zero amounts.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_journal_balance
BEFORE INSERT OR UPDATE ON journal_headers
FOR EACH ROW
EXECUTE FUNCTION validate_journal_balance();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column() 
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_accounts_modtime 
BEFORE UPDATE ON accounts 
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_journal_headers_modtime 
BEFORE UPDATE ON journal_headers 
FOR EACH ROW EXECUTE FUNCTION update_modified_column();
