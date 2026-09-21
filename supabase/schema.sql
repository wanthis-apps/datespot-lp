-- DateSpot 初期スキーマ（Supabase / PostgreSQL）
-- 実行順: 1. reset.sql（やり直し時のみ） → 2. このファイル → 3. seed.sql
-- アプリ側の Database 型（src/types/database.ts）と対応させる。

create type public.user_role as enum ('free', 'premium');
create type public.relationship_status as enum (
  'first_date',
  'new_couple',
  'long_term',
  'more_than_friends'
);
create type public.time_recommended as enum ('day', 'night', 'both');
create type public.spot_category as enum (
  'cafe',
  'activity',
  'lunch',
  'dinner',
  'bar',
  'night_view'
);

create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.user_role not null default 'free',
  relationship_status public.relationship_status not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.spots (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  lat double precision not null,
  lng double precision not null,
  category public.spot_category not null,
  time_recommended public.time_recommended not null,
  relationship_tags public.relationship_status[] not null default '{}',
  is_partner_store boolean not null default false,
  image_url text not null,
  area text not null,
  description text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.coupons (
  id uuid primary key default gen_random_uuid(),
  spot_id uuid not null references public.spots (id) on delete cascade,
  description text not null,
  valid_until timestamptz not null
);

create table public.user_coupons_history (
  user_id uuid not null references public.users (id) on delete cascade,
  coupon_id uuid not null references public.coupons (id) on delete cascade,
  used_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, coupon_id, used_at)
);

alter table public.users enable row level security;
alter table public.spots enable row level security;
alter table public.coupons enable row level security;
alter table public.user_coupons_history enable row level security;

-- スポットとクーポンは未ログインでも参照できる（検索・提案用）
create policy "spots_select_public"
  on public.spots
  for select
  to anon, authenticated
  using (true);

create policy "coupons_select_public"
  on public.coupons
  for select
  to anon, authenticated
  using (true);

-- 会員情報とクーポン利用履歴は本人のみ
create policy "users_select_own"
  on public.users
  for select
  to authenticated
  using (auth.uid() = id);

create policy "users_insert_own"
  on public.users
  for insert
  to authenticated
  with check (auth.uid() = id);

create policy "users_update_own"
  on public.users
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "user_coupons_history_select_own"
  on public.user_coupons_history
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "user_coupons_history_insert_own"
  on public.user_coupons_history
  for insert
  to authenticated
  with check (auth.uid() = user_id);
