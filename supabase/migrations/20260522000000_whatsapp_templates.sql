-- Create whatsapp_templates table
CREATE TABLE IF NOT EXISTS public.whatsapp_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    content TEXT NOT NULL,
    variables JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.whatsapp_templates ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for authenticated users" 
    ON public.whatsapp_templates FOR SELECT 
    TO authenticated 
    USING (true);

CREATE POLICY "Enable all access for admin users" 
    ON public.whatsapp_templates FOR ALL 
    TO authenticated 
    USING (auth.jwt() ->> 'role' = 'admin' OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- Add updated_at trigger
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.whatsapp_templates
  FOR EACH ROW EXECUTE FUNCTION extensions.moddatetime('updated_at');

-- Insert some default templates
INSERT INTO public.whatsapp_templates (name, content, variables) VALUES
('ORDER_CREATED', 'Hi {{customerName}}, your order #{{orderId}} has been successfully placed! We will notify you once it ships. Thank you for shopping with us!', '["customerName", "orderId"]'),
('ORDER_SHIPPED', 'Great news {{customerName}}! Your order #{{orderId}} has shipped. Track it here: {{trackingUrl}}', '["customerName", "orderId", "trackingUrl"]'),
('PAYMENT_FAILED', 'Hi {{customerName}}, unfortunately the payment for order #{{orderId}} failed. Please update your payment method to complete the order.', '["customerName", "orderId"]')
ON CONFLICT (name) DO NOTHING;
