-- Accounting & Invoicing Architecture Schema
-- 1. Invoices
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    invoice_number VARCHAR(100) NOT NULL UNIQUE,
    type VARCHAR(20) NOT NULL, -- 'b2b', 'b2c'
    status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'sent', 'paid', 'overdue', 'cancelled'
    customer_id UUID, -- Optional, if linked to a registered customer
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255),
    customer_phone VARCHAR(50),
    customer_gst VARCHAR(50), -- Required for B2B
    customer_address TEXT,
    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    tax_total DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    total DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    due_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- RLS for invoices
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all admins" ON public.invoices FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Enable all access for admins" ON public.invoices FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
-- 2. Invoice Line Items
CREATE TABLE IF NOT EXISTS public.invoice_line_items (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE,
    product_id UUID, -- Optional, if linked to a specific product
    description VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(12,2) NOT NULL,
    tax_rate DECIMAL(5,2) DEFAULT 0.00, -- percentage (e.g. 18.00)
    tax_amount DECIMAL(12,2) DEFAULT 0.00,
    total_price DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- RLS for invoice_line_items
ALTER TABLE public.invoice_line_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all admins" ON public.invoice_line_items FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Enable all access for admins" ON public.invoice_line_items FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
-- 3. Journal Entries (General Ledger)
CREATE TABLE IF NOT EXISTS public.journal_entries (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    entry_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    account_type VARCHAR(50) NOT NULL, -- 'Revenue', 'Expense', 'Asset', 'Liability', 'Equity'
    account_name VARCHAR(100) NOT NULL, -- e.g. 'Sales Revenue', 'Accounts Receivable', 'Cash', 'Office Supplies'
    amount DECIMAL(12,2) NOT NULL, -- Positive for debit, Negative for credit (or separate debit/credit columns)
    is_credit BOOLEAN NOT NULL, -- True if Credit, False if Debit
    description TEXT,
    reference_type VARCHAR(50), -- 'invoice', 'order', 'manual'
    reference_id UUID, -- Links to invoice_id or order_id
    created_by UUID, -- Admin who created the manual entry (if manual)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- RLS for journal_entries
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all admins" ON public.journal_entries FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Enable all access for admins" ON public.journal_entries FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
