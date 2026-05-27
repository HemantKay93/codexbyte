-- 1. Create a Default Warehouse
-- Without a warehouse, inventory reservations fail and orders cannot be placed.
INSERT INTO warehouses (id, name, location, is_active, created_at, updated_at)
VALUES ('11111111-1111-1111-1111-111111111111', 'Primary Warehouse', 'Neo Tokyo', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 2. Insert SEO-Friendly Products
-- We include a 'slug' generated from the name, perfect for SEO URLs instead of UUIDs.
INSERT INTO products (id, name, slug, description, price, original_price, image_url, category, brand, sku, stock_quantity, tags, status, created_at, updated_at)
VALUES 
('22222222-2222-2222-2222-222222222221', 'Titan G15 Gaming Laptop', 'titan-g15-gaming-laptop', 'High-performance gaming laptop with RTX 4080.', 1999.99, 2499.99, 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5', 'laptop_mac', 'Titan', 'TITAN-G15-001', 50, '["deal of the day", "dod", "trending"]'::jsonb, 'active', NOW(), NOW()),
('22222222-2222-2222-2222-222222222222', 'Stealth Pro Keyboard', 'stealth-pro-keyboard', 'Mechanical keyboard with RGB lighting.', 129.99, 159.99, 'https://images.unsplash.com/photo-1595225476474-87563907a212', 'keyboard_mouse', 'Stealth', 'STEALTH-KB-002', 100, '["clearance", "trending"]'::jsonb, 'active', NOW(), NOW()),
('22222222-2222-2222-2222-222222222223', 'Quantum UltraWide Monitor', 'quantum-ultrawide-monitor', '34" Curved Gaming Monitor, 144Hz.', 499.99, null, 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf', 'monitor', 'Quantum', 'QUANTUM-MON-003', 25, '["new", "trending"]'::jsonb, 'active', NOW(), NOW()),
('22222222-2222-2222-2222-222222222224', 'CyberLink Pro Mouse', 'cyberlink-pro-mouse', 'Ultra-lightweight wireless gaming mouse.', 89.99, null, 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7', 'keyboard_mouse', 'CyberLink', 'CYBER-MS-004', 75, '["new", "clearance"]'::jsonb, 'active', NOW(), NOW()),
('22222222-2222-2222-2222-222222222225', 'Nexus Core Desktop PC', 'nexus-core-desktop-pc', 'Pre-built desktop with RTX 4070.', 1499.99, 1699.99, 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c', 'desktop_windows', 'Nexus', 'NEXUS-PC-005', 10, '["deal of the day", "dod", "trending"]'::jsonb, 'active', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  image_url = EXCLUDED.image_url,
  stock_quantity = EXCLUDED.stock_quantity;

-- 3. Fix Inventory Reservation Bug (Link products to warehouse)
-- This inserts actual physical stock records so the backend checkout doesn't fail during reserveStock()
INSERT INTO inventory (product_id, warehouse_id, quantity, reserved_quantity, min_stock_level, updated_at)
VALUES 
('22222222-2222-2222-2222-222222222221', '11111111-1111-1111-1111-111111111111', 50, 0, 5, NOW()),
('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 100, 0, 10, NOW()),
('22222222-2222-2222-2222-222222222223', '11111111-1111-1111-1111-111111111111', 25, 0, 2, NOW()),
('22222222-2222-2222-2222-222222222224', '11111111-1111-1111-1111-111111111111', 75, 0, 5, NOW()),
('22222222-2222-2222-2222-222222222225', '11111111-1111-1111-1111-111111111111', 10, 0, 1, NOW())
ON CONFLICT ON CONSTRAINT inventory_product_id_warehouse_id_key DO UPDATE SET 
  quantity = EXCLUDED.quantity;
