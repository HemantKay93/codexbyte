# ByteeVolvr Migration Plan

## Current repo assessment

- The current codebase is a Next.js 15 App Router app with Supabase used for CMS-style content, contact submissions, catalog products, and admin authentication.
- The reusable UI we should preserve lives mainly in `src/components` and `src/app/homepage/components`.
- The current `/products` page is a catalog, not a full ecommerce implementation.
- The current `/admin` page is a content-management console, not a commerce operations panel.
- The current database schema contains `services`, `about_content`, `products`, and `contact_submissions`, but does not yet include orders, carts, payments, addresses, shipments, or tracking events.

## File-by-file conversion map

### Preserve and convert into `apps/website`

- `src/app/layout.tsx` -> `apps/website/src/app/App.tsx` and `apps/website/src/app/providers/AppProviders.tsx`
- `src/components/Header.tsx` -> `apps/website/src/components/layout/Header.tsx`
- `src/components/Footer.tsx` -> `apps/website/src/components/layout/Footer.tsx`
- `src/app/homepage/page.tsx` -> `apps/website/src/pages/HomePage.tsx`
- `src/app/homepage/components/HeroSection.tsx` -> `apps/website/src/features/home/components/HeroSection.tsx`
- `src/app/homepage/components/ServicesSection.tsx` -> `apps/website/src/features/home/components/ServicesSection.tsx`
- `src/app/homepage/components/AboutSection.tsx` -> `apps/website/src/features/home/components/AboutSection.tsx`
- `src/app/homepage/components/TestimonialsSection.tsx` -> `apps/website/src/features/home/components/TestimonialsSection.tsx`
- `src/app/homepage/components/CTASection.tsx` -> `apps/website/src/features/home/components/CTASection.tsx`
- `src/app/services/page.tsx` -> `apps/website/src/pages/ServicesPage.tsx`
- `src/app/about/page.tsx` -> `apps/website/src/pages/AboutPage.tsx`
- `src/app/contact/page.tsx` -> `apps/website/src/pages/ContactPage.tsx`
- `src/styles/tailwind.css` -> `apps/website/src/styles/index.css`
- `src/components/ui/AppLogo.tsx` -> `apps/website/src/components/ui/AppLogo.tsx`
- `src/components/ui/AppImage.tsx` -> `packages/ui/src/components/AppImage.tsx`

### Move into `apps/shop`

- `src/app/products/page.tsx` -> split into:
- `apps/shop/src/pages/ProductListingPage.tsx`
- `apps/shop/src/pages/ProductDetailPage.tsx`
- `apps/shop/src/pages/CartPage.tsx`
- `apps/shop/src/pages/CheckoutPage.tsx`
- `apps/shop/src/pages/OrdersPage.tsx`
- `apps/shop/src/pages/TrackingPage.tsx`

### Replace Next-only auth/backend behavior

- `src/lib/supabase/server.ts` -> remove from frontend apps; replace with browser-safe service clients and backend endpoints
- `src/app/auth/callback/route.ts` -> replace with frontend auth callback page and backend/session handling
- `src/contexts/AuthContext.tsx` -> split into:
- `packages/api-client/src/supabase.ts`
- `packages/store/src/features/session`
- app-specific auth hooks

### Replace current admin with operations console

- `src/app/admin/page.tsx` -> `apps/admin/src/pages/DashboardPage.tsx`
- `src/app/admin/login/page.tsx` -> `apps/admin/src/pages/LoginPage.tsx`
- current service/product/contact CRUD -> become admin modules for:
- dashboard analytics
- product CRUD
- order management
- shipment management
- reports export

### Supabase/database expansion

- `supabase/migrations/20260315090000_cms_schema.sql` -> keep as reference, but add new schema for:
- users
- addresses
- products
- product_images
- carts
- orders
- order_items
- payments
- shipments
- tracking_events
- admin_audit_logs

## Target structure

```text
apps/
  website/
  shop/
  admin/
  api/
packages/
  ui/
  store/
  api-client/
  config/
docs/
  migration-plan.md
  commerce-architecture.md
```

## What cannot be migrated directly

- Next.js metadata exports must become `react-helmet-async`
- Next server components must become client-rendered components with service hooks
- `next/link` and `next/navigation` must become `react-router-dom`
- `next/image` optimizations must become standard `img`, lazy loading, or Cloudinary/Supabase image transforms
- `next/headers` and route handlers must move to backend APIs or Supabase edge/backend functions

## Build order

1. Migrate the business website into `apps/website`
2. Scaffold shared packages for UI, store, and API access
3. Build `apps/shop` customer routes and cart/session state
4. Build `apps/admin` operations workflows
5. Add backend payment, shipment, and tracking APIs
6. Expand Supabase schema and row-level security
