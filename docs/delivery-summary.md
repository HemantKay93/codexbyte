# ByteeVolvr React/Vite Migration Deliverable

## 1. Step-by-step migration plan

1. Audit the current Next.js App Router code and classify each file as business website, shop, admin, or backend concern.
2. Preserve the current visual identity and reusable sections by moving them into a Vite-powered `apps/website`.
3. Split catalog and transaction concerns into a dedicated `apps/shop` React app.
4. Replace Next routing and metadata with React Router and `react-helmet-async`.
5. Move direct server-component and route-handler responsibilities into an API layer and Supabase.
6. Expand the schema for users, addresses, orders, payments, shipments, and tracking events.
7. Introduce Redux Toolkit for cart, orders, and session state.
8. Add Razorpay order creation and payment verification endpoints.
9. Add Shiprocket shipment creation and tracking endpoints.
10. Replace the current CMS-style admin with a commerce operations dashboard.

## 2. Final folder structure

```text
byteevolvr-main/
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
    delivery-summary.md
  supabase/
    migrations/
      20260315090000_cms_schema.sql
      20260425093000_ecommerce_schema.sql
```

## 3. Converted sample code from the repo

### Next.js source example

- `src/app/homepage/page.tsx` used `Header`, `Footer`, and homepage sections inside a Next page.

### React Vite target

- `apps/website/src/pages/HomePage.tsx` now composes the same shell using React Router and Helmet.
- `apps/website/src/components/layout/Header.tsx` replaces `next/link` with `react-router-dom`.
- `apps/website/src/components/ui/AppLogo.tsx` replaces `next/image` with standard `img`.

## 4. Routing setup

### Business website

- `/home`
- `/services`
- `/about`
- `/contact`

Code: `apps/website/src/app/App.tsx`

### Shop

- `/`
- `/product/:slug`
- `/cart`
- `/checkout`
- `/orders`
- `/track`

Code: `apps/shop/src/main.tsx`

### Admin

- `/`
- `/products`
- `/orders`
- `/reports`

Code: `apps/admin/src/main.tsx`

## 5. Redux cart implementation

- `packages/store/src/features/cartSlice.ts`
- `packages/store/src/features/ordersSlice.ts`
- `packages/store/src/features/sessionSlice.ts`

The cart slice currently supports:

- add to cart
- remove from cart
- update quantity
- clear cart

The shop app already consumes this state in:

- `apps/shop/src/pages/ProductDetailPage.tsx`
- `apps/shop/src/pages/CartPage.tsx`
- `apps/shop/src/pages/CheckoutPage.tsx`

## 6. Order API example

Code:

- `packages/api-client/src/services/orders.ts`
- `apps/api/src/server.js`

Current example flow:

1. Shop checkout calls `createOrder(...)`
2. API returns a generated order payload
3. If payment method is Razorpay, the API also returns payment gateway data

## 7. Razorpay integration

Code:

- `packages/api-client/src/services/payments.ts`
- `apps/api/src/server.js`

Included examples:

- Razorpay order creation endpoint: `POST /api/payments/razorpay/order`
- Signature verification endpoint: `POST /api/payments/verify`

Recommended production additions:

- webhook reconciliation
- idempotency checks
- payment failure recovery
- refund flows

## 8. Shiprocket integration

Code:

- `packages/api-client/src/services/shipping.ts`
- `apps/api/src/server.js`

Included examples:

- shipment creation via Shiprocket auth + adhoc order API
- tracking lookup endpoint at `GET /api/tracking/:trackingId`

Recommended production additions:

- webhook ingestion
- periodic tracking sync job
- courier SLA breach alerts

## 9. Admin dashboard example

Code:

- `apps/admin/src/pages/DashboardPage.tsx`
- `apps/admin/src/pages/ProductManagementPage.tsx`
- `apps/admin/src/pages/OrderManagementPage.tsx`
- `apps/admin/src/pages/ReportsPage.tsx`

Included examples:

- KPI cards
- sales area chart with `recharts`
- product management form/table layout
- order management rows with courier/tracking fields
- report export cards

## 10. What cannot be migrated directly

- Next.js server components cannot be copied directly into Vite; they must become client-rendered components with fetch hooks or service calls.
- `next/image` optimization cannot be carried over one-to-one without adopting an image CDN strategy such as Cloudinary or Supabase transforms.
- `next/link`, `next/navigation`, `next/headers`, and route handlers are framework-specific and need React Router plus backend replacements.
- Next metadata, `robots.ts`, and `sitemap.ts` need replacement with Helmet, static SEO files, or build-time generators.

## 11. Performance improvements

- Separate the marketing website from the shop to reduce JS shipped to top-of-funnel visitors.
- Keep the website mostly static and content-driven.
- Lazy-load product detail and admin-heavy modules.
- Move image delivery to a CDN-backed storage/transformation layer.
- Use paginated product and order queries instead of loading everything at once.
- Add caching around catalog and tracking reads.

## 12. Suggested optimizations

- Use Supabase Auth + Postgres + Storage for fastest delivery.
- Add role-based admin authorization with stricter RLS policies.
- Add search and filter indexing for product discovery.
- Introduce webhook-driven status sync for Razorpay and Shiprocket.
- Add audit logs for admin product and order changes.
- Add retry-safe background jobs for shipment creation and payment reconciliation.
- Add server-side rendering later only if SEO/product landing pages require it; the current split works well as a Vite-first architecture.

## Environment setup

- Copy `.env.example` to `.env`
- Fill in `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` for real payment testing
- Fill in `SHIPROCKET_EMAIL` and `SHIPROCKET_PASSWORD` for shipment creation testing
- Set `VITE_API_BASE_URL` for the shop/admin apps when the API is deployed separately
- `GET /api/health` now reports whether Razorpay and Shiprocket are configured
