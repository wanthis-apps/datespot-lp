-- DateSpot 基盤スキーマ（Supabase SQL Editor でそのまま実行可能）
-- types/database.ts の Spot / Coupon / Favorite と対応させる。
-- 再実行しても落ちないよう、CREATE TABLE IF NOT EXISTS と
-- DROP POLICY IF EXISTS / ON CONFLICT DO NOTHING を使う。

create table if not exists public.spots (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  category text not null check (
    category in ('cafe', 'restaurant', 'park', 'activity', 'night_view', 'other')
  ),
  address text,
  latitude double precision not null,
  longitude double precision not null,
  price_range integer check (price_range is null or price_range between 1 and 4),
  image_url text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  spot_id uuid not null references public.spots (id) on delete cascade,
  title text not null,
  discount_detail text not null,
  valid_until timestamptz not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  spot_id uuid not null references public.spots (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  unique (user_id, spot_id)
);

alter table public.spots enable row level security;
alter table public.coupons enable row level security;
alter table public.favorites enable row level security;

drop policy if exists "spots_select_public" on public.spots;
create policy "spots_select_public"
  on public.spots
  for select
  to anon, authenticated
  using (true);

drop policy if exists "coupons_select_public" on public.coupons;
create policy "coupons_select_public"
  on public.coupons
  for select
  to anon, authenticated
  using (true);

drop policy if exists "favorites_select_own" on public.favorites;
create policy "favorites_select_own"
  on public.favorites
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "favorites_insert_own" on public.favorites;
create policy "favorites_insert_own"
  on public.favorites
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "favorites_update_own" on public.favorites;
create policy "favorites_update_own"
  on public.favorites
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "favorites_delete_own" on public.favorites;
create policy "favorites_delete_own"
  on public.favorites
  for delete
  to authenticated
  using (auth.uid() = user_id);

insert into public.spots (
  id,
  name,
  description,
  category,
  address,
  latitude,
  longitude,
  price_range,
  image_url,
  created_at
) values
(
  '10000000-0000-4000-8000-000000000001',
  'Bloom Café 代官山',
  '木漏れ日のテラスで、ゆっくり話せる隠れ家カフェ。',
  'cafe',
  '東京都渋谷区代官山町',
  35.6496,
  139.7032,
  2,
  'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200&q=80',
  timezone('utc', now())
),
(
  '10000000-0000-4000-8000-000000000002',
  'オリーブの木 恵比寿',
  '会話が弾む、やさしい味のイタリアン。',
  'restaurant',
  '東京都渋谷区恵比寿',
  35.6467,
  139.7101,
  3,
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80',
  timezone('utc', now())
),
(
  '10000000-0000-4000-8000-000000000003',
  '井の頭公園',
  '湖のまわりを歩きながら、気負わず過ごせる公園。',
  'park',
  '東京都武蔵野市御殿山',
  35.6993,
  139.5704,
  1,
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&q=80',
  timezone('utc', now())
),
(
  '10000000-0000-4000-8000-000000000004',
  'チームラボプラネッツ豊洲',
  '並んで歩ける没入型のデジタルアート体験。',
  'activity',
  '東京都江東区豊洲',
  35.6495,
  139.7898,
  3,
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80',
  timezone('utc', now())
),
(
  '10000000-0000-4000-8000-000000000005',
  '東京タワー夜景テラス',
  '夜風と夜景を一緒に眺める、定番のデートスポット。',
  'night_view',
  '東京都港区芝公園',
  35.6586,
  139.7454,
  2,
  'https://images.unsplash.com/photo-1513407030348-c983a97b98d8?w=1200&q=80',
  timezone('utc', now())
),
(
  '10000000-0000-4000-8000-000000000006',
  'SUN Terrace 表参道',
  '午後の光が気持ちいい、オープンテラスのカフェ。',
  'cafe',
  '東京都港区北青山',
  35.6652,
  139.7124,
  2,
  'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1200&q=80',
  timezone('utc', now())
),
(
  '10000000-0000-4000-8000-000000000007',
  '浅草さんぽベース',
  '食べ歩きと散策を組み合わせやすい、気軽な待ち合わせ場所。',
  'other',
  '東京都台東区浅草',
  35.7148,
  139.7967,
  1,
  'https://images.unsplash.com/photo-1528164344705-47542687000d?w=1200&q=80',
  timezone('utc', now())
)
on conflict (id) do nothing;

insert into public.coupons (
  id,
  spot_id,
  title,
  discount_detail,
  valid_until,
  created_at
) values
(
  '20000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000001',
  'ペアドリンク1杯無料',
  'ランチタイムに限り、2杯目のドリンクを1杯無料。',
  '2026-12-31 14:59:59+00',
  timezone('utc', now())
),
(
  '20000000-0000-4000-8000-000000000002',
  '10000000-0000-4000-8000-000000000002',
  'ディナーデザートサービス',
  'コース注文でデザートを1品サービス。',
  '2026-12-31 14:59:59+00',
  timezone('utc', now())
),
(
  '20000000-0000-4000-8000-000000000003',
  '10000000-0000-4000-8000-000000000004',
  'チケット1000円引き',
  '公式アプリ提示で入場チケットを1000円引き。',
  '2026-11-30 14:59:59+00',
  timezone('utc', now())
),
(
  '20000000-0000-4000-8000-000000000004',
  '10000000-0000-4000-8000-000000000005',
  '展望台ペア割',
  '2名同時購入で1名分を20%オフ。',
  '2026-12-31 14:59:59+00',
  timezone('utc', now())
),
(
  '20000000-0000-4000-8000-000000000005',
  '10000000-0000-4000-8000-000000000006',
  'ケーキセット100円引き',
  'ケーキセット注文で会計から100円引き。',
  '2026-10-31 14:59:59+00',
  timezone('utc', now())
)
on conflict (id) do nothing;
