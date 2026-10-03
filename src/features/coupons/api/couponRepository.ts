import { getSupabaseClient } from '@/services/supabase';
import { ensureAppUser, getCurrentUserId } from '@/features/auth/api/session';
import { getSpots } from '@/features/spots/api/getSpots';
import { mapCouponRow, mapUserCouponHistory } from '@/features/spots/api/mappers';
import { uniqueCatalogCoupons } from '../utils/uniqueCoupons';
import type { Coupon, RelationshipStatus, UserCouponHistory } from '@/types';

export type RedeemCouponResult = {
  ok: boolean;
  history: UserCouponHistory | null;
  persisted: boolean;
  message: string;
};

export function getMockCoupons(): Coupon[] {
  return uniqueCatalogCoupons(
    getSpots().flatMap((spot) => {
      if (spot.couponDescription === null) {
        return [];
      }

      return [
        {
          id: `mock-coupon-${spot.id}`,
          spotId: spot.id,
          description: spot.couponDescription,
          validUntil: '2099-12-31T23:59:59.000Z',
        },
      ];
    }),
  );
}

export async function fetchCoupons(): Promise<Coupon[]> {
  const client = getSupabaseClient();
  if (client === null) {
    console.log('[DateSpot] coupons はモックから生成します');
    return getMockCoupons();
  }

  const { data, error } = await client.from('coupons').select('*');
  if (error !== null) {
    console.error('[DateSpot] coupons 取得エラー', error.message);
    throw new Error(`coupons の取得に失敗しました: ${error.message}`);
  }

  const coupons = uniqueCatalogCoupons((data ?? []).map(mapCouponRow));
  console.log('[DateSpot] coupons 取得結果', {
    source: 'supabase',
    count: coupons.length,
    descriptions: coupons.map((coupon) => coupon.description),
  });
  return coupons;
}

export async function fetchCouponsBySpotId(spotId: string): Promise<Coupon[]> {
  const client = getSupabaseClient();
  if (client === null) {
    return getMockCoupons().filter((coupon) => coupon.spotId === spotId);
  }

  const { data, error } = await client
    .from('coupons')
    .select('*')
    .eq('spot_id', spotId);

  if (error !== null) {
    throw new Error(`coupons の取得に失敗しました: ${error.message}`);
  }

  return uniqueCatalogCoupons((data ?? []).map(mapCouponRow));
}

export async function fetchUserCouponHistory(): Promise<UserCouponHistory[]> {
  const client = getSupabaseClient();
  if (client === null) {
    return [];
  }

  const userId = await getCurrentUserId();
  if (userId === null) {
    return [];
  }

  const { data, error } = await client
    .from('user_coupons_history')
    .select('*')
    .eq('user_id', userId)
    .order('used_at', { ascending: false });

  if (error !== null) {
    throw new Error(`利用履歴の取得に失敗しました: ${error.message}`);
  }

  return (data ?? []).map(mapUserCouponHistory);
}

export async function redeemCoupon(
  couponId: string,
  relationshipStatus: RelationshipStatus,
): Promise<RedeemCouponResult> {
  const client = getSupabaseClient();
  const usedAt = new Date().toISOString();

  if (client === null) {
    return {
      ok: true,
      persisted: false,
      history: {
        userId: 'local-user',
        couponId,
        usedAt,
      },
      message: 'Supabase 未接続のため、この端末に利用済みとして保存しました。',
    };
  }

  const userId = await ensureAppUser(relationshipStatus);
  if (userId === null) {
    return {
      ok: false,
      persisted: false,
      history: null,
      message: 'クーポンの利用記録にはログインが必要です。',
    };
  }

  const { data, error } = await client
    .from('user_coupons_history')
    .insert({
      user_id: userId,
      coupon_id: couponId,
      used_at: usedAt,
    })
    .select()
    .single();

  if (error !== null || data === null) {
    return {
      ok: false,
      persisted: false,
      history: null,
      message: `クーポンの利用記録に失敗しました: ${error?.message ?? 'data が null です'}`,
    };
  }

  return {
    ok: true,
    persisted: true,
    history: mapUserCouponHistory(data),
    message: 'クーポンを利用しました。',
  };
}
