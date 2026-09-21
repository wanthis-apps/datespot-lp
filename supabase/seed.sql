-- DateSpot 初期データ
-- 実行順: 1. reset.sql（やり直し時のみ） → 2. schema.sql → 3. このファイル
-- schema.sql のテーブル・ENUM・カラム名に完全一致させる。
-- Supabase ダッシュボードの SQL Editor に全量貼り付けて実行できる。
-- 再実行すると spots / coupons / user_coupons_history を消して入れ直す。

delete from public.user_coupons_history;
delete from public.coupons;
delete from public.spots;

-- ---------------------------------------------------------------------------
-- spots
-- カラム: id, name, lat, lng, category, time_recommended, relationship_tags,
--         is_partner_store, image_url, area, description, created_at
-- ENUM:   spot_category, time_recommended, relationship_status[]
-- ---------------------------------------------------------------------------
insert into public.spots (
  id,
  name,
  lat,
  lng,
  category,
  time_recommended,
  relationship_tags,
  is_partner_store,
  image_url,
  area,
  description,
  created_at
) values
(
  '00000000-0000-4000-8000-000000000001',
  'Bloom Café 代官山',
  35.6496,
  139.7032,
  'cafe'::public.spot_category,
  'day'::public.time_recommended,
  array['first_date', 'new_couple']::public.relationship_status[],
  true,
  'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200&q=80',
  '代官山',
  '木漏れ日のテラスで、ゆっくり話せる隠れ家カフェ。',
  timezone('utc', now())
),
(
  '00000000-0000-4000-8000-000000000002',
  'オリーブの木 恵比寿',
  35.6467,
  139.7101,
  'lunch'::public.spot_category,
  'day'::public.time_recommended,
  array['first_date']::public.relationship_status[],
  false,
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80',
  '恵比寿',
  '会話が弾む、やさしい味のランチコース。',
  timezone('utc', now())
),
(
  '00000000-0000-4000-8000-000000000003',
  '井の頭公園ボート',
  35.6993,
  139.5704,
  'activity'::public.spot_category,
  'day'::public.time_recommended,
  array['new_couple', 'long_term']::public.relationship_status[],
  false,
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&q=80',
  '吉祥寺',
  '湖の上で並んで漕ぐ、少し特別な昼下がり。',
  timezone('utc', now())
),
(
  '00000000-0000-4000-8000-000000000004',
  'SUN Terrace 表参道',
  35.6652,
  139.7124,
  'cafe'::public.spot_category,
  'day'::public.time_recommended,
  array['first_date', 'more_than_friends']::public.relationship_status[],
  true,
  'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1200&q=80',
  '表参道',
  '開放的なテラス席で、気負わず過ごせるカフェ。',
  timezone('utc', now())
),
(
  '00000000-0000-4000-8000-000000000005',
  '中目黒リバーサイド',
  35.644,
  139.6988,
  'cafe'::public.spot_category,
  'both'::public.time_recommended,
  array['new_couple', 'long_term']::public.relationship_status[],
  false,
  'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=1200&q=80',
  '中目黒',
  '川沿いを歩いたあと、そのまま寄りたくなるカフェ。',
  timezone('utc', now())
),
(
  '00000000-0000-4000-8000-000000000006',
  '隠れイタリアン 渋谷',
  35.6595,
  139.7004,
  'dinner'::public.spot_category,
  'both'::public.time_recommended,
  array['first_date']::public.relationship_status[],
  true,
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80',
  '渋谷',
  '喧騒から一段降りた、落ち着きのあるディナー。',
  timezone('utc', now())
),
(
  '00000000-0000-4000-8000-000000000007',
  '星空ダイニング 六本木',
  35.6628,
  139.7314,
  'dinner'::public.spot_category,
  'night'::public.time_recommended,
  array['first_date', 'new_couple']::public.relationship_status[],
  true,
  'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1200&q=80',
  '六本木',
  '夜景を借景にした、少し背伸びしたい夜に。',
  timezone('utc', now())
),
(
  '00000000-0000-4000-8000-000000000008',
  'Lueur Bar 恵比寿',
  35.6469,
  139.7108,
  'bar'::public.spot_category,
  'night'::public.time_recommended,
  array['more_than_friends']::public.relationship_status[],
  true,
  'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=1200&q=80',
  '恵比寿',
  'カウンターで並んで、今夜の話を続けるバー。',
  timezone('utc', now())
),
(
  '00000000-0000-4000-8000-000000000009',
  '東京タワー 夜景デッキ',
  35.6586,
  139.7454,
  'night_view'::public.spot_category,
  'night'::public.time_recommended,
  array['new_couple', 'long_term']::public.relationship_status[],
  false,
  'https://images.unsplash.com/photo-1513407030348-c983a97b98d8?w=1200&q=80',
  '芝公園',
  '街の灯りを見下ろして、ふたりの時間を区切る夜景。',
  timezone('utc', now())
),
(
  '00000000-0000-4000-8000-00000000000a',
  'お台場レインボー夜景',
  35.6301,
  139.7794,
  'night_view'::public.spot_category,
  'night'::public.time_recommended,
  array['long_term', 'more_than_friends']::public.relationship_status[],
  true,
  'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&q=80',
  'お台場',
  '橋の光が水面に落ちる、記念日にも合う夜の散歩。',
  timezone('utc', now())
),
(
  '00000000-0000-4000-8000-00000000000b',
  '栞カフェ 清澄白河',
  35.6821,
  139.7988,
  'cafe'::public.spot_category,
  'day'::public.time_recommended,
  array['first_date', 'new_couple']::public.relationship_status[],
  false,
  'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=1200&q=80',
  '清澄白河',
  '本棚に囲まれて、コーヒーの香りと一緒に話せる静かなカフェ。',
  timezone('utc', now())
),
(
  '00000000-0000-4000-8000-00000000000c',
  '谷中ねこ道の散策',
  35.7282,
  139.7699,
  'activity'::public.spot_category,
  'day'::public.time_recommended,
  array['new_couple', 'long_term']::public.relationship_status[],
  false,
  'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=1200&q=80',
  '谷中',
  '寺町の路地をゆっくり歩いて、甘味処で一息つく半日コース。',
  timezone('utc', now())
),
(
  '00000000-0000-4000-8000-00000000000d',
  '豊洲マルシェランチ',
  35.6456,
  139.7844,
  'lunch'::public.spot_category,
  'day'::public.time_recommended,
  array['first_date']::public.relationship_status[],
  false,
  'https://images.unsplash.com/photo-1504674900803-78311d1711d3?w=1200&q=80',
  '豊洲',
  '市場の活気を横目に、海の見えるテラスで食べるランチ。',
  timezone('utc', now())
),
(
  '00000000-0000-4000-8000-00000000000e',
  '広尾ローズガーデンカフェ',
  35.6515,
  139.7222,
  'cafe'::public.spot_category,
  'day'::public.time_recommended,
  array['first_date', 'more_than_friends']::public.relationship_status[],
  true,
  'https://images.unsplash.com/photo-1466978913421-dad3888aa25e?w=1200&q=80',
  '広尾',
  '庭園のバラを眺めながら、季節のパフェを分け合うカフェ。',
  timezone('utc', now())
),
(
  '00000000-0000-4000-8000-00000000000f',
  '白金ヒルサイドフレンチ',
  35.6425,
  139.726,
  'dinner'::public.spot_category,
  'night'::public.time_recommended,
  array['new_couple', 'long_term']::public.relationship_status[],
  true,
  'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=1200&q=80',
  '白金',
  '緑に囲まれた隠れ家で、記念日にも選びやすいディナー。',
  timezone('utc', now())
),
(
  '00000000-0000-4000-8000-000000000010',
  '西麻布ムーンライトバー',
  35.66,
  139.7235,
  'bar'::public.spot_category,
  'night'::public.time_recommended,
  array['more_than_friends', 'long_term']::public.relationship_status[],
  true,
  'https://images.unsplash.com/photo-1579027989536-b7b1f875659b?w=1200&q=80',
  '西麻布',
  '低い照明のカウンターで、今夜の続きをゆっくり話すバー。',
  timezone('utc', now())
),
(
  '00000000-0000-4000-8000-000000000011',
  '恵比寿スカイデッキ',
  35.6424,
  139.7137,
  'night_view'::public.spot_category,
  'night'::public.time_recommended,
  array['first_date', 'new_couple']::public.relationship_status[],
  false,
  'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1200&q=80',
  '恵比寿',
  'ビルの谷間に沈む夕景から夜景へ、並んで見下ろす展望テラス。',
  timezone('utc', now())
),
(
  '00000000-0000-4000-8000-000000000012',
  '神楽坂 石畳ダイニング',
  35.7015,
  139.7406,
  'dinner'::public.spot_category,
  'both'::public.time_recommended,
  array['first_date', 'long_term']::public.relationship_status[],
  true,
  'https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?w=1200&q=80',
  '神楽坂',
  '石畳の路地を抜けた先で、和と洋が混ざるディナー。',
  timezone('utc', now())
);

-- ---------------------------------------------------------------------------
-- coupons
-- カラム: id, spot_id, description, valid_until
-- spot_id は提携店（is_partner_store = true）の spots.id を参照する
-- ---------------------------------------------------------------------------
insert into public.coupons (
  id,
  spot_id,
  description,
  valid_until
) values
(
  '00000000-0000-4000-8000-000000000101',
  '00000000-0000-4000-8000-000000000001',
  'ドリンク1杯無料',
  '2099-12-31 23:59:59+00'
),
(
  '00000000-0000-4000-8000-000000000104',
  '00000000-0000-4000-8000-000000000004',
  'ドリンク1杯無料',
  '2099-12-31 23:59:59+00'
),
(
  '00000000-0000-4000-8000-000000000106',
  '00000000-0000-4000-8000-000000000006',
  'ウェルカムドリンク1杯無料',
  '2099-12-31 23:59:59+00'
),
(
  '00000000-0000-4000-8000-000000000107',
  '00000000-0000-4000-8000-000000000007',
  'ドリンク1杯無料',
  '2099-12-31 23:59:59+00'
),
(
  '00000000-0000-4000-8000-000000000108',
  '00000000-0000-4000-8000-000000000008',
  'ドリンク1杯無料',
  '2099-12-31 23:59:59+00'
),
(
  '00000000-0000-4000-8000-00000000010a',
  '00000000-0000-4000-8000-00000000000a',
  'ホットドリンク1杯無料',
  '2099-12-31 23:59:59+00'
),
(
  '00000000-0000-4000-8000-00000000010e',
  '00000000-0000-4000-8000-00000000000e',
  '季節のパフェ1品サービス',
  '2099-12-31 23:59:59+00'
),
(
  '00000000-0000-4000-8000-00000000010f',
  '00000000-0000-4000-8000-00000000000f',
  'ペアデザートプレゼント',
  '2099-12-31 23:59:59+00'
),
(
  '00000000-0000-4000-8000-000000000110',
  '00000000-0000-4000-8000-000000000010',
  '1杯目ハーフプライス',
  '2099-12-31 23:59:59+00'
),
(
  '00000000-0000-4000-8000-000000000112',
  '00000000-0000-4000-8000-000000000012',
  '食後コーヒー2杯無料',
  '2099-12-31 23:59:59+00'
);

-- ---------------------------------------------------------------------------
-- user_coupons_history
-- カラム: user_id, coupon_id, used_at
-- PK: (user_id, coupon_id, used_at)
-- user_id は public.users(id) を参照し、public.users.id は auth.users(id) を参照する。
-- 既存の認証ユーザーがいればそれを使い、いなければデモユーザーを作成する。
-- ---------------------------------------------------------------------------
do $$
declare
  seed_user_id uuid;
begin
  select id
    into seed_user_id
  from public.users
  order by created_at
  limit 1;

  if seed_user_id is null then
    select id
      into seed_user_id
    from auth.users
    order by created_at
    limit 1;

    if seed_user_id is not null then
      insert into public.users (id, role, relationship_status, created_at)
      values (
        seed_user_id,
        'free'::public.user_role,
        'first_date'::public.relationship_status,
        timezone('utc', now())
      )
      on conflict (id) do nothing;
    else
      seed_user_id := '00000000-0000-4000-8000-0000000000aa';

      begin
        insert into auth.users (
          instance_id,
          id,
          aud,
          role,
          email,
          encrypted_password,
          email_confirmed_at,
          raw_app_meta_data,
          raw_user_meta_data,
          created_at,
          updated_at,
          confirmation_token,
          email_change,
          email_change_token_new,
          recovery_token
        ) values (
          '00000000-0000-0000-0000-000000000000',
          seed_user_id,
          'authenticated',
          'authenticated',
          'seed@datespot.local',
          extensions.crypt('seed-password', extensions.gen_salt('bf')),
          timezone('utc', now()),
          '{"provider":"email","providers":["email"]}'::jsonb,
          '{}'::jsonb,
          timezone('utc', now()),
          timezone('utc', now()),
          '',
          '',
          '',
          ''
        );

        insert into auth.identities (
          id,
          user_id,
          identity_data,
          provider,
          provider_id,
          last_sign_in_at,
          created_at,
          updated_at
        ) values (
          seed_user_id,
          seed_user_id,
          jsonb_build_object(
            'sub', seed_user_id::text,
            'email', 'seed@datespot.local'
          ),
          'email',
          seed_user_id::text,
          timezone('utc', now()),
          timezone('utc', now()),
          timezone('utc', now())
        );
      exception
        when others then
          raise notice 'デモユーザーの作成をスキップしました: %', sqlerrm;
          seed_user_id := null;
      end;

      if seed_user_id is not null then
        insert into public.users (id, role, relationship_status, created_at)
        values (
          seed_user_id,
          'free'::public.user_role,
          'first_date'::public.relationship_status,
          timezone('utc', now())
        )
        on conflict (id) do nothing;
      end if;
    end if;
  end if;

  if seed_user_id is not null then
    insert into public.user_coupons_history (
      user_id,
      coupon_id,
      used_at
    ) values
    (
      seed_user_id,
      '00000000-0000-4000-8000-000000000101',
      timezone('utc', now() - interval '3 days')
    ),
    (
      seed_user_id,
      '00000000-0000-4000-8000-000000000107',
      timezone('utc', now() - interval '1 day')
    );
  else
    raise notice 'public.users が 0 件のため user_coupons_history は投入しません。アプリで会員登録したあと再実行してください。';
  end if;
end $$;
