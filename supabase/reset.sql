-- DateSpot やり直し用（途中失敗したあと、schema / seed の前に実行する）
-- 既存のテーブルと ENUM を削除する。データは消える。

drop table if exists public.user_coupons_history cascade;
drop table if exists public.coupons cascade;
drop table if exists public.spots cascade;
drop table if exists public.users cascade;

drop type if exists public.spot_category;
drop type if exists public.time_recommended;
drop type if exists public.relationship_status;
drop type if exists public.user_role;
