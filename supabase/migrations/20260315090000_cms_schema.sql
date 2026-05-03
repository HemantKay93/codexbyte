-- ============================================================
-- ByteeVolvr CMS Schema
-- Tables: user_profiles, services, about_content, products, contact_submissions
-- ============================================================

-- 1. TYPES
DROP TYPE IF EXISTS public.user_role CASCADE;
CREATE TYPE public.user_role AS ENUM ('admin', 'user');

DROP TYPE IF EXISTS public.product_status CASCADE;
CREATE TYPE public.product_status AS ENUM ('active', 'draft', 'out_of_stock');

DROP TYPE IF EXISTS public.service_status CASCADE;
CREATE TYPE public.service_status AS ENUM ('active', 'draft');

DROP TYPE IF EXISTS public.contact_status CASCADE;
CREATE TYPE public.contact_status AS ENUM ('new', 'read', 'replied', 'archived');

-- 2. CORE TABLES

-- User Profiles (intermediary for auth.users)
DROP TABLE IF EXISTS public.user_profiles CASCADE;
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL DEFAULT '',
  role public.user_role DEFAULT 'user'::public.user_role,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Services
DROP TABLE IF EXISTS public.services CASCADE;
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  icon_name TEXT NOT NULL DEFAULT 'default',
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  accent_color TEXT DEFAULT '#3B7BF8',
  sort_order INTEGER DEFAULT 0,
  status public.service_status DEFAULT 'active'::public.service_status,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- About Content (single-row CMS content)
DROP TABLE IF EXISTS public.about_content CASCADE;
CREATE TABLE public.about_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  headline TEXT NOT NULL DEFAULT '',
  subheadline TEXT NOT NULL DEFAULT '',
  body_paragraph_1 TEXT NOT NULL DEFAULT '',
  body_paragraph_2 TEXT NOT NULL DEFAULT '',
  image_url TEXT DEFAULT '',
  stats JSONB DEFAULT '[]'::JSONB,
  milestones JSONB DEFAULT '[]'::JSONB,
  certifications TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Products
DROP TABLE IF EXISTS public.products CASCADE;
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  original_price DECIMAL(10,2),
  image_url TEXT DEFAULT '',
  category TEXT NOT NULL DEFAULT 'General',
  brand TEXT DEFAULT '',
  sku TEXT DEFAULT '',
  stock_quantity INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  status public.product_status DEFAULT 'active'::public.product_status,
  featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Contact Submissions
DROP TABLE IF EXISTS public.contact_submissions CASCADE;
CREATE TABLE public.contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT DEFAULT '',
  subject TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL,
  status public.contact_status DEFAULT 'new'::public.contact_status,
  admin_notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. INDEXES
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_services_status ON public.services(status);
CREATE INDEX IF NOT EXISTS idx_services_sort_order ON public.services(sort_order);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(featured);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON public.contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON public.contact_submissions(created_at DESC);

-- 4. FUNCTIONS

-- Handle new user trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')::public.user_role
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Admin check function (uses auth metadata to avoid recursion)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users au
    WHERE au.id = auth.uid()
    AND (
      au.raw_user_meta_data->>'role' = 'admin'
      OR au.raw_app_meta_data->>'role' = 'admin'
    )
  )
$$;

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

-- 5. ENABLE RLS
-- We temporarily disable RLS so the Node backend can mutate tables using the Anon key.
-- Alternatively, configure SUPABASE_SERVICE_ROLE_KEY in the backend .env.
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.services DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.about_content DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions DISABLE ROW LEVEL SECURITY;

-- 6. RLS POLICIES

-- user_profiles
DROP POLICY IF EXISTS "users_manage_own_user_profiles" ON public.user_profiles;
CREATE POLICY "users_manage_own_user_profiles"
ON public.user_profiles FOR ALL TO authenticated
USING (id = auth.uid()) WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "admin_full_access_user_profiles" ON public.user_profiles;
CREATE POLICY "admin_full_access_user_profiles"
ON public.user_profiles FOR ALL TO authenticated
USING (public.is_admin()) WITH CHECK (public.is_admin());

-- services: public read, admin write
DROP POLICY IF EXISTS "public_read_services" ON public.services;
CREATE POLICY "public_read_services"
ON public.services FOR SELECT TO public
USING (true);

DROP POLICY IF EXISTS "admin_manage_services" ON public.services;
CREATE POLICY "admin_manage_services"
ON public.services FOR ALL TO authenticated
USING (public.is_admin()) WITH CHECK (public.is_admin());

-- about_content: public read, admin write
DROP POLICY IF EXISTS "public_read_about_content" ON public.about_content;
CREATE POLICY "public_read_about_content"
ON public.about_content FOR SELECT TO public
USING (true);

DROP POLICY IF EXISTS "admin_manage_about_content" ON public.about_content;
CREATE POLICY "admin_manage_about_content"
ON public.about_content FOR ALL TO authenticated
USING (public.is_admin()) WITH CHECK (public.is_admin());

-- products: public read active, admin write all
DROP POLICY IF EXISTS "public_read_active_products" ON public.products;
CREATE POLICY "public_read_active_products"
ON public.products FOR SELECT TO public
USING (status = 'active'::public.product_status);

DROP POLICY IF EXISTS "admin_manage_products" ON public.products;
CREATE POLICY "admin_manage_products"
ON public.products FOR ALL TO authenticated
USING (public.is_admin()) WITH CHECK (public.is_admin());

-- contact_submissions: anyone can insert, only admin can read/update
DROP POLICY IF EXISTS "public_insert_contact" ON public.contact_submissions;
CREATE POLICY "public_insert_contact"
ON public.contact_submissions FOR INSERT TO public
WITH CHECK (true);

DROP POLICY IF EXISTS "admin_manage_contact_submissions" ON public.contact_submissions;
CREATE POLICY "admin_manage_contact_submissions"
ON public.contact_submissions FOR ALL TO authenticated
USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 7. TRIGGERS

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS set_services_updated_at ON public.services;
CREATE TRIGGER set_services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_products_updated_at ON public.products;
CREATE TRIGGER set_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_contact_updated_at ON public.contact_submissions;
CREATE TRIGGER set_contact_updated_at
  BEFORE UPDATE ON public.contact_submissions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 8. MOCK DATA

DO $$
DECLARE
  admin_uuid UUID := gen_random_uuid();
BEGIN
  -- Admin user
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
    created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
    is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
    recovery_token, recovery_sent_at, email_change_token_new, email_change,
    email_change_sent_at, email_change_token_current, email_change_confirm_status,
    reauthentication_token, reauthentication_sent_at, phone, phone_change,
    phone_change_token, phone_change_sent_at
  ) VALUES (
    admin_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'admin@byteevolvr.com', crypt('Admin@123', gen_salt('bf', 10)), now(), now(), now(),
    jsonb_build_object('full_name', 'ByteeVolvr Admin', 'role', 'admin'),
    jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[], 'role', 'admin'),
    false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null
  ) ON CONFLICT (id) DO NOTHING;

  -- Services mock data
  INSERT INTO public.services (title, description, icon_name, tags, accent_color, sort_order, status) VALUES
    ('IT Consulting', 'End-to-end technology strategy, infrastructure planning, network architecture, and digital transformation roadmaps for growing businesses.', 'monitor', ARRAY['Strategy','Network','Cloud','Security'], '#3B7BF8', 1, 'active'),
    ('Repair & Maintenance', 'Expert laptop, desktop, and mobile device repair with same-day turnaround for most issues. Certified technicians on-site and in-store.', 'wrench', ARRAY['Laptops','Mobiles','Same-Day'], '#60A5FA', 2, 'active'),
    ('AMC Contracts', 'Annual Maintenance Contracts with guaranteed SLAs, priority response, and proactive monitoring. Keep your IT infrastructure at peak health year-round.', 'shield', ARRAY['SLA Guaranteed','Proactive','Priority Support'], '#1A4FD6', 3, 'active'),
    ('Parts & Accessories Trading', 'Genuine OEM and compatible computer parts, laptop components, and mobile accessories sourced directly from verified distributors.', 'briefcase', ARRAY['OEM Parts','Accessories','Wholesale'], '#93C5FD', 4, 'active'),
    ('B2B Supply', 'Bulk procurement and supply contracts for corporates, government offices, schools, and IT resellers. Volume pricing with dedicated account management.', 'users', ARRAY['Corporate','Volume Pricing','Dedicated AM'], '#3B7BF8', 5, 'active'),
    ('E-Commerce Store', 'Shop 3,000+ IT products online — from peripherals to server components. Fast delivery, genuine products, and hassle-free returns.', 'shopping-bag', ARRAY['3000+ Products','Fast Delivery','Genuine'], '#60A5FA', 6, 'active')
  ON CONFLICT (id) DO NOTHING;

  -- About content mock data
  INSERT INTO public.about_content (
    headline, subheadline, body_paragraph_1, body_paragraph_2,
    image_url, stats, milestones, certifications
  ) VALUES (
    'We don''t just fix computers — we architect the technology backbone of your business.',
    'A decade of IT excellence across India',
    'ByteeVolvr Enterprises started as a small computer repair shop in Mumbai in 2013. Over a decade, we''ve grown into a full-spectrum IT company trusted by 500+ businesses across India — from neighborhood retailers to large corporates.',
    'Our strength is versatility. We handle IT consulting for Fortune 500 vendors, supply genuine computer parts to resellers, provide AMC support with guaranteed SLAs, and run a growing e-commerce platform with 3,000+ technology products.',
    'https://img.rocket.new/generatedImages/rocket_gen_img_14598519e-1768103454712.png',
    '[{"val":"10+","label":"Years Experience","sub":"In IT consulting & trading"},{"val":"500+","label":"Business Clients","sub":"Across India"},{"val":"3000+","label":"Products Listed","sub":"In our online store"},{"val":"99.8%","label":"AMC SLA Uptime","sub":"Guaranteed response"}]'::JSONB,
    '[{"year":"2013","event":"Founded in Mumbai as an IT repair & parts shop"},{"year":"2016","event":"Launched B2B supply division for corporate clients"},{"year":"2019","event":"Expanded to full IT consulting and AMC services"},{"year":"2022","event":"Launched e-commerce store with pan-India delivery"},{"year":"2025","event":"Serving 500+ businesses with end-to-end IT solutions"}]'::JSONB,
    ARRAY['Microsoft Partner','HP Authorized','Dell Certified','Lenovo Reseller','GST Registered']
  ) ON CONFLICT (id) DO NOTHING;

  -- Products mock data
  INSERT INTO public.products (name, description, price, original_price, image_url, category, brand, sku, stock_quantity, tags, status, featured, sort_order) VALUES
    ('Dell Latitude 5540 Laptop', 'Intel Core i7-1365U, 16GB RAM, 512GB SSD, 15.6" FHD Display. Business-grade laptop with enterprise security features.', 89999.00, 99999.00, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80', 'Laptops', 'Dell', 'DELL-LAT5540-I7', 15, ARRAY['laptop','business','dell','i7'], 'active', true, 1),
    ('HP LaserJet Pro M404dn', 'Monochrome laser printer with automatic duplex printing, 38 ppm, 1200 dpi. Ideal for high-volume office printing.', 24999.00, 28999.00, 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=600&q=80', 'Printers', 'HP', 'HP-LJ-M404DN', 8, ARRAY['printer','laser','hp','office'], 'active', true, 2),
    ('Logitech MX Master 3S Mouse', 'Advanced wireless mouse with 8K DPI sensor, MagSpeed scroll wheel, and ergonomic design for all-day comfort.', 8999.00, 10999.00, 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&q=80', 'Peripherals', 'Logitech', 'LOG-MX-MASTER3S', 42, ARRAY['mouse','wireless','logitech','ergonomic'], 'active', false, 3),
    ('Samsung 27" 4K Monitor', 'IPS panel, 3840x2160 resolution, 60Hz, HDR10, USB-C 65W charging. Perfect for creative professionals.', 34999.00, 39999.00, 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&q=80', 'Monitors', 'Samsung', 'SAM-27-4K-IPS', 12, ARRAY['monitor','4k','samsung','ips'], 'active', true, 4),
    ('Kingston 16GB DDR4 RAM', 'DDR4-3200MHz, CL22, 1.2V, compatible with Intel and AMD platforms. Plug-and-play upgrade for desktops and laptops.', 2999.00, 3499.00, 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=600&q=80', 'Components', 'Kingston', 'KIN-16GB-DDR4-3200', 85, ARRAY['ram','ddr4','kingston','upgrade'], 'active', false, 5),
    ('WD Blue 1TB SSD', 'SATA III 2.5" SSD, 560MB/s read, 530MB/s write. 5-year warranty. Drop-in replacement for HDD upgrades.', 6999.00, 8499.00, 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&q=80', 'Storage', 'Western Digital', 'WD-BLUE-1TB-SSD', 30, ARRAY['ssd','storage','wd','1tb'], 'active', false, 6),
    ('Cisco RV340 Dual WAN Router', 'Gigabit dual WAN router with VPN, firewall, and advanced security for small to medium businesses.', 18999.00, 21999.00, 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&q=80', 'Networking', 'Cisco', 'CISCO-RV340-DW', 7, ARRAY['router','cisco','vpn','business'], 'active', true, 7),
    ('Lenovo ThinkPad X1 Carbon', 'Intel Core i5-1335U, 16GB LPDDR5, 512GB SSD, 14" 2.8K OLED. Ultra-light business laptop at 1.12kg.', 129999.00, 149999.00, 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&q=80', 'Laptops', 'Lenovo', 'LEN-X1C-GEN11-I5', 6, ARRAY['laptop','thinkpad','lenovo','ultralight'], 'active', true, 8)
  ON CONFLICT (id) DO NOTHING;

  -- Sample contact submissions
  INSERT INTO public.contact_submissions (name, email, phone, subject, message, status) VALUES
    ('Rajesh Kumar', 'rajesh@techcorp.in', '+91 98765 43210', 'AMC Contract Inquiry', 'We have 50 workstations and are looking for an annual maintenance contract. Please share your pricing and SLA details.', 'new'),
    ('Priya Sharma', 'priya.sharma@gmail.com', '+91 87654 32109', 'Laptop Repair', 'My Dell laptop screen is cracked and the keyboard is not working. Can you provide a repair estimate?', 'read'),
    ('Amit Patel', 'amit@retailbiz.com', '+91 76543 21098', 'B2B Supply Partnership', 'We run a chain of 10 retail stores and need a reliable IT hardware supplier. Interested in discussing bulk pricing.', 'replied')
  ON CONFLICT (id) DO NOTHING;

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Mock data insertion failed: %', SQLERRM;
END $$;
