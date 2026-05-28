/**
 * Centralized Type Definitions for ByteEvolvr Enterprise
 */

// 1. User & Auth
export type UserRole = 'super-admin' | 'admin' | 'staff' | 'customer';

export interface UserProfile {
  id: string;
  role: UserRole;
  full_name?: string;
  email?: string;
  created_at: string;
}

// 2. Products
export type ProductStatus = 'active' | 'draft' | 'out_of_stock';

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  original_price?: number | null;
  image_url?: string;
  category: string;
  brand?: string;
  sku: string;
  stock_quantity: number;
  status: ProductStatus;
  images: string[];
  tags: string[];
  slug: string;
  variants: any[];
  created_at: string;
  updated_at: string;
}

// 3. Inventory & Warehouse
export interface Warehouse {
  id: string;
  name: string;
  location: string;
  is_active: boolean;
  contact_phone?: string;
  created_at: string;
}

export interface InventoryItem {
  id: string;
  product_id: string;
  warehouse_id: string;
  quantity: number;
  min_stock_level: number;
  updated_at: string;
}

export type StockMovementType = 'in' | 'out' | 'transfer' | 'adjustment' | 'return';

export interface StockMovement {
  id: string;
  inventory_id: string;
  type: StockMovementType;
  quantity: number;
  reference_type?: 'order' | 'return' | 'manual';
  reference_id?: string;
  notes?: string;
  performed_by: string;
  created_at: string;
}

// 4. Orders
export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'packed'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returned'
  | 'refunded';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface Order {
  id: string;
  order_number: string;
  user_id?: string | null;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  customer_name: string;
  customer_email: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  sku: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

// 5. System
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  priority: 'low' | 'medium' | 'high';
  is_read: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  action: string;
  module: string;
  entity_id?: string;
  old_data?: any;
  new_data?: any;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}
