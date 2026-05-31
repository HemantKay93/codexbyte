-- Phase 7 & 8: Expense Management & Banking Schema

-- ==========================================
-- 5. Expense Management
-- ==========================================
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expense_number VARCHAR(100) NOT NULL UNIQUE,
    employee_id UUID, -- References auth.users
    employee_name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected', 'paid', 'posted')),
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(10) DEFAULT 'INR',
    category VARCHAR(100), -- e.g., 'Travel', 'Meals', 'Office Supplies'
    description TEXT,
    receipt_url TEXT,
    approved_by UUID, -- References auth.users
    approval_date TIMESTAMPTZ,
    rejection_reason TEXT,
    journal_header_id UUID REFERENCES journal_headers(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 6. Banking Module
-- ==========================================
CREATE TABLE bank_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT, -- Maps to a CoA Asset account (e.g. 1100)
    bank_name VARCHAR(255) NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    account_number VARCHAR(100) NOT NULL UNIQUE,
    account_type VARCHAR(50) CHECK (account_type IN ('Current', 'Savings', 'Wallet', 'Payment Gateway', 'Cash')),
    currency VARCHAR(10) DEFAULT 'INR',
    routing_number VARCHAR(100), -- IFSC, SWIFT, etc.
    is_active BOOLEAN DEFAULT true,
    current_balance NUMERIC(15, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE bank_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bank_account_id UUID NOT NULL REFERENCES bank_accounts(id) ON DELETE CASCADE,
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT,
    reference_number VARCHAR(255), -- UTR, Cheque No
    transaction_type VARCHAR(20) CHECK (transaction_type IN ('deposit', 'withdrawal')),
    amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'unreconciled' CHECK (status IN ('unreconciled', 'reconciled')),
    journal_header_id UUID REFERENCES journal_headers(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Timestamps
CREATE TRIGGER update_expenses_modtime BEFORE UPDATE ON expenses FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_bank_accounts_modtime BEFORE UPDATE ON bank_accounts FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_bank_transactions_modtime BEFORE UPDATE ON bank_transactions FOR EACH ROW EXECUTE FUNCTION update_modified_column();
