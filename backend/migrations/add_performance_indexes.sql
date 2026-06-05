-- ============================================================
-- Migration: Add performance indexes for orders and products
-- Run this in your Supabase SQL editor or via migration tool
-- ============================================================

-- Orders: primary lookup patterns
CREATE INDEX IF NOT EXISTS idx_orders_user_id
  ON orders (user_id)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_orders_customer_email
  ON orders (customer_email)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_orders_status
  ON orders (status)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_orders_created_at
  ON orders (created_at DESC)
  WHERE deleted_at IS NULL;

-- Order items: FK lookup
CREATE INDEX IF NOT EXISTS idx_order_items_order_id
  ON order_items (order_id);

CREATE INDEX IF NOT EXISTS idx_order_items_product_id
  ON order_items (product_id);

-- Products: category + search patterns
CREATE INDEX IF NOT EXISTS idx_products_category
  ON products (category)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_products_created_at
  ON products (created_at DESC)
  WHERE deleted_at IS NULL;

-- Products: slug unique lookup
CREATE INDEX IF NOT EXISTS idx_products_slug
  ON products (slug)
  WHERE deleted_at IS NULL AND slug IS NOT NULL;

-- Shipments: order FK lookup
CREATE INDEX IF NOT EXISTS idx_shipments_order_id
  ON shipments (order_id);

-- User profiles: role lookup (for RBAC queries)
CREATE INDEX IF NOT EXISTS idx_user_profiles_role
  ON user_profiles (role);
