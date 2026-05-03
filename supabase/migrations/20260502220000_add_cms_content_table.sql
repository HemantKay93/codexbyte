-- Create a general CMS content table for page sections
CREATE TABLE IF NOT EXISTS public.cms_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_slug TEXT NOT NULL,
  section_key TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}'::JSONB,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(page_slug, section_key)
);

-- Seed some initial data for the home page
INSERT INTO public.cms_content (page_slug, section_key, content, is_published) VALUES
('home', 'hero', '{
  "title": "Empowering Your Business with Advanced Technology",
  "subtitle": "Premium IT hardware, enterprise-grade networking, and managed services for the modern professional.",
  "buttonText": "Explore Catalog",
  "buttonLink": "/products",
  "backgroundImage": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600&q=80"
}'::JSONB, true),
('home', 'navbar', '{
  "logoText": "ByteeVolvr",
  "links": [
    {"label": "Shop", "href": "/products"},
    {"label": "Services", "href": "/services"},
    {"label": "About", "href": "/about"},
    {"label": "Contact", "href": "/contact"}
  ]
}'::JSONB, true),
('home', 'contact', '{
  "address": "123 Tech Park, Mumbai, India",
  "phone": "+91 98765 43210",
  "email": "support@byteevolvr.com",
  "workingHours": "Mon-Sat: 9 AM - 7 PM"
}'::JSONB, true)
ON CONFLICT (page_slug, section_key) DO NOTHING;
