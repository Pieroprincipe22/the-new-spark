create extension if not exists "pgcrypto";

create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null default '',
  price numeric(10, 2) not null,
  duration_minutes integer not null,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null unique,
  loyalty_stamps integer not null default 0 check (loyalty_stamps >= 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id) on delete set null,
  customer_name text not null,
  customer_phone text not null,
  service_id uuid references services(id) on delete set null,
  service_name text not null,
  service_price numeric(10, 2) not null default 0,
  service_duration_minutes integer not null default 0,
  appointment_date date not null,
  appointment_time time not null,
  status text not null default 'pending' check (
    status in ('pending', 'confirmed', 'cancelled')
  ),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop index if exists appointments_unique_active_slot;

alter table appointments
  drop constraint if exists appointments_unique_slot;

create unique index appointments_unique_active_slot
  on appointments (appointment_date, appointment_time)
  where status <> 'cancelled';

create table if not exists loyalty_events (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  appointment_id uuid references appointments(id) on delete set null,
  type text not null check (
    type in ('added', 'removed', 'redeemed', 'adjustment')
  ),
  stamps integer not null,
  reason text,
  created_at timestamptz not null default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null default '',
  price numeric(10, 2),
  price_label text not null default 'Consultar',
  stock integer not null default 0 check (stock >= 0),
  active boolean not null default true,
  image_url text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists services_set_updated_at on services;

create trigger services_set_updated_at
before update on services
for each row
execute function set_updated_at();

drop trigger if exists customers_set_updated_at on customers;

create trigger customers_set_updated_at
before update on customers
for each row
execute function set_updated_at();

drop trigger if exists appointments_set_updated_at on appointments;

create trigger appointments_set_updated_at
before update on appointments
for each row
execute function set_updated_at();

drop trigger if exists products_set_updated_at on products;

create trigger products_set_updated_at
before update on products
for each row
execute function set_updated_at();

alter table services enable row level security;
alter table customers enable row level security;
alter table appointments enable row level security;
alter table loyalty_events enable row level security;
alter table products enable row level security;

drop policy if exists "Servicios activos visibles publicamente" on services;

create policy "Servicios activos visibles publicamente"
on services
for select
using (active = true);

drop policy if exists "Productos activos visibles publicamente" on products;

create policy "Productos activos visibles publicamente"
on products
for select
using (active = true);