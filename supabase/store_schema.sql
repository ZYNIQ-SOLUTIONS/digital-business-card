-- =============================================================================
-- SUPABASE POSTGRESQL SCHEMA FOR STORE & SUPER ADMIN
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- =============================================================================

-- 1. Add Role to Profiles
alter table public.profiles add column if not exists role text default 'user' not null;

-- NOTE: You will need to manually set your own user's role to 'admin' in the Supabase Table Editor!

-- 2. Create Products Table
create table if not exists public.products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text default '',
  price numeric(10, 2) not null,
  image_url text default '',
  category text default 'uncategorized',
  in_stock boolean default true not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.products enable row level security;

drop policy if exists "Public can view active products." on public.products;
create policy "Public can view active products." 
  on public.products for select 
  using (true);

drop policy if exists "Admins can insert products." on public.products;
create policy "Admins can insert products." 
  on public.products for insert 
  with check (
    exists (
      select 1 from public.profiles 
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

drop policy if exists "Admins can update products." on public.products;
create policy "Admins can update products." 
  on public.products for update 
  using (
    exists (
      select 1 from public.profiles 
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

drop policy if exists "Admins can delete products." on public.products;
create policy "Admins can delete products." 
  on public.products for delete 
  using (
    exists (
      select 1 from public.profiles 
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );


-- 3. Create Orders Table
create table if not exists public.orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete set null, -- null for guests
  status text default 'pending' not null, -- pending, shipped, delivered, cancelled
  customer_name text not null,
  customer_phone text not null,
  shipping_city text not null check (shipping_city in ('Dubai', 'Abu Dhabi')),
  shipping_area text not null,
  shipping_street text not null,
  shipping_building text not null,
  total_amount numeric(10, 2) not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.orders enable row level security;

drop policy if exists "Anyone can insert an order (Guest checkout)." on public.orders;
create policy "Anyone can insert an order (Guest checkout)." 
  on public.orders for insert 
  with check (true);

drop policy if exists "Users can view their own orders." on public.orders;
create policy "Users can view their own orders." 
  on public.orders for select 
  using (auth.uid() = user_id);

drop policy if exists "Admins can view all orders." on public.orders;
create policy "Admins can view all orders." 
  on public.orders for select 
  using (
    exists (
      select 1 from public.profiles 
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

drop policy if exists "Admins can update all orders." on public.orders;
create policy "Admins can update all orders." 
  on public.orders for update 
  using (
    exists (
      select 1 from public.profiles 
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );


-- 4. Create Order Items Table
create table if not exists public.order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references public.orders(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete set null,
  quantity int not null check (quantity > 0),
  price_at_time numeric(10, 2) not null,
  created_at timestamptz default now() not null
);

alter table public.order_items enable row level security;

drop policy if exists "Anyone can insert order items." on public.order_items;
create policy "Anyone can insert order items." 
  on public.order_items for insert 
  with check (true);

drop policy if exists "Users can view their own order items." on public.order_items;
create policy "Users can view their own order items." 
  on public.order_items for select 
  using (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id and orders.user_id = auth.uid()
    )
  );

drop policy if exists "Admins can view all order items." on public.order_items;
create policy "Admins can view all order items." 
  on public.order_items for select 
  using (
    exists (
      select 1 from public.profiles 
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- 5. Storage Bucket for Products
insert into storage.buckets (id, name, public) 
values ('products', 'products', true)
on conflict (id) do nothing;

drop policy if exists "Product images are publicly accessible." on storage.objects;
create policy "Product images are publicly accessible."
  on storage.objects for select
  using (bucket_id = 'products');

drop policy if exists "Admins can upload product images." on storage.objects;
create policy "Admins can upload product images."
  on storage.objects for insert
  with check (
    bucket_id = 'products' and 
    exists (
      select 1 from public.profiles 
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

drop policy if exists "Admins can update product images." on storage.objects;
create policy "Admins can update product images."
  on storage.objects for update
  using (
    bucket_id = 'products' and 
    exists (
      select 1 from public.profiles 
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

drop policy if exists "Admins can delete product images." on storage.objects;
create policy "Admins can delete product images."
  on storage.objects for delete
  using (
    bucket_id = 'products' and 
    exists (
      select 1 from public.profiles 
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );
