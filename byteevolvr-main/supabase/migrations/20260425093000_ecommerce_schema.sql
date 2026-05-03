-- ============================================================
-- ByteeVolvr Ecommerce Expansion Schema
-- ============================================================

DROP TYPE IF EXISTS public.order_status CASCADE;
create type public.order_status as enum (
  'pending',
  'paid',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded'
);

DROP TYPE IF EXISTS public.payment_status CASCADE;
create type public.payment_status as enum (
  'pending',
  'authorized',
  'captured',
  'failed',
  'refunded'
);

DROP TYPE IF EXISTS public.shipment_status CASCADE;
create type public.shipment_status as enum (
  'pending',
  'created',
  'pickup_scheduled',
  'in_transit',
  'out_for_delivery',
  'delivered',
  'failed',
  'returned'
);

DROP TABLE IF EXISTS public.addresses CASCADE;
create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  full_name text not null,
  phone text not null,
  line_1 text not null,
  line_2 text default '',
  landmark text default '',
  city text not null,
  state text not null,
  postal_code text not null,
  country text not null default 'India',
  address_type text not null default 'home',
  is_default boolean not null default false,
  created_at timestamptz default current_timestamp
);

DROP TABLE IF EXISTS public.orders CASCADE;
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  order_number text not null unique,
  status public.order_status not null default 'pending',
  payment_status public.payment_status not null default 'pending',
  shipping_address_id uuid references public.addresses(id),
  subtotal numeric(12,2) not null default 0,
  tax_amount numeric(12,2) not null default 0,
  shipping_amount numeric(12,2) not null default 0,
  discount_amount numeric(12,2) not null default 0,
  total_amount numeric(12,2) not null default 0,
  payment_method text not null,
  notes text default '',
  created_at timestamptz default current_timestamp,
  updated_at timestamptz default current_timestamp
);

DROP TABLE IF EXISTS public.order_items CASCADE;
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id),
  product_name text not null,
  sku text not null,
  quantity integer not null,
  unit_price numeric(12,2) not null,
  total_price numeric(12,2) not null,
  created_at timestamptz default current_timestamp
);

DROP TABLE IF EXISTS public.payments CASCADE;
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  provider text not null,
  provider_order_id text,
  provider_payment_id text,
  provider_signature text,
  status public.payment_status not null default 'pending',
  amount numeric(12,2) not null,
  raw_response jsonb default '{}'::jsonb,
  created_at timestamptz default current_timestamp,
  updated_at timestamptz default current_timestamp
);

DROP TABLE IF EXISTS public.shipments CASCADE;
create table public.shipments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders(id) on delete cascade,
  provider text not null default 'shiprocket',
  shipment_id text,
  awb_code text,
  tracking_id text unique,
  courier_name text default '',
  status public.shipment_status not null default 'pending',
  raw_response jsonb default '{}'::jsonb,
  created_at timestamptz default current_timestamp,
  updated_at timestamptz default current_timestamp
);

DROP TABLE IF EXISTS public.tracking_events CASCADE;
create table public.tracking_events (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid not null references public.shipments(id) on delete cascade,
  status text not null,
  description text not null,
  location text default '',
  event_time timestamptz not null,
  raw_payload jsonb default '{}'::jsonb
);

DROP TABLE IF EXISTS public.admin_audit_logs CASCADE;
create table public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid not null references auth.users(id),
  entity_type text not null,
  entity_id text not null,
  action text not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default current_timestamp
);

ALTER TABLE public.addresses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracking_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs DISABLE ROW LEVEL SECURITY;

create index if not exists idx_orders_user_id on public.orders(user_id);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_order_items_order_id on public.order_items(order_id);
create index if not exists idx_payments_order_id on public.payments(order_id);
create index if not exists idx_shipments_tracking_id on public.shipments(tracking_id);
create index if not exists idx_tracking_events_shipment_id on public.tracking_events(shipment_id);
