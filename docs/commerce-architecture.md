# ByteeVolvr Commerce Architecture

## Frontend apps

- `apps/website`: Business website for SEO, services, trust, and lead generation
- `apps/shop`: Customer ecommerce storefront mounted on `/shop` or deployed to `shop.byteevolvr.com`
- `apps/admin`: Operations dashboard mounted on `/admin` or deployed to `admin.byteevolvr.com`

## Shared packages

- `packages/ui`: Shared presentational components
- `packages/store`: Redux Toolkit slices for cart, orders, and session
- `packages/api-client`: Axios clients and typed service modules
- `packages/config`: Shared env parsing and route constants

## Backend

- Preferred stack: Supabase Postgres + Supabase Auth + Storage
- Custom Node/Express API for Razorpay signature verification, Shiprocket integration, exports, and admin-only operations

## External integrations

- Razorpay: order creation, payment verification, webhook reconciliation
- Shiprocket: shipment creation, courier assignment, tracking sync
- Cloudinary or Supabase Storage: product image upload and transforms

## Core tables to add

- `users`
- `addresses`
- `products`
- `product_images`
- `orders`
- `order_items`
- `payments`
- `shipments`
- `tracking_events`
- `admin_audit_logs`
