import { getSupabaseClient } from '@/services/supabase';
import type { Coupon, Spot } from '@/types';
import type { SpotRowWithCoupons } from '@/types/database';
import { getSpots } from './getSpots';
import {
  logSpotCatalogResult,
  type SpotCatalogResult,
} from './logSpotCatalog';
import { mapCouponRow, mapSpotRow } from './mappers';

export type { DataSource, SpotCatalogResult } from './logSpotCatalog';

function isSpotRowWithCoupons(value: unknown): value is SpotRowWithCoupons {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  if (!('coupons' in value) || !Array.isArray(value.coupons)) {
    return false;
  }

  return 'id' in value && 'name' in value && 'lat' in value && 'lng' in value;
}

function mapSpotRows(rows: unknown[]): Spot[] {
  return rows.flatMap((row) => {
    if (!isSpotRowWithCoupons(row)) {
      return [];
    }

    const spot = mapSpotRow(row);
    return spot === null ? [] : [spot];
  });
}

export async function fetchSpotCatalog(): Promise<SpotCatalogResult> {
  const client = getSupabaseClient();
  if (client === null) {
    const result: SpotCatalogResult = {
      spots: getSpots(),
      source: 'mock',
      message: 'Supabase が未設定のためモックデータを表示しています。',
      ok: true,
    };
    logSpotCatalogResult(result);
    return result;
  }

  const { data, error } = await client.from('spots').select(`
      *,
      coupons (*)
    `);

  if (error !== null) {
    const result: SpotCatalogResult = {
      spots: [],
      source: 'supabase',
      message: `Supabase の取得に失敗しました: ${error.message}`,
      ok: false,
    };
    console.error('[DateSpot] spots 取得エラー', error.message);
    logSpotCatalogResult(result);
    return result;
  }

  const spots = mapSpotRows(data ?? []);
  const result: SpotCatalogResult = {
    spots,
    source: 'supabase',
    message:
      spots.length === 0
        ? 'Supabase の spots が 0 件です。seed.sql を実行してください。'
        : `Supabase から ${spots.length} 件のスポットを取得しました。`,
    ok: true,
  };
  logSpotCatalogResult(result);
  return result;
}

export async function fetchSpots(): Promise<Spot[]> {
  const catalog = await fetchSpotCatalog();
  return catalog.spots;
}

export type SpotDetailResult = {
  spot: Spot | null;
  coupons: Coupon[];
  ok: boolean;
  message: string;
};

export async function fetchSpotById(spotId: string): Promise<SpotDetailResult> {
  const client = getSupabaseClient();
  if (client === null) {
    const spot = getSpots().find((item) => item.id === spotId) ?? null;
    const coupons = getSpots().flatMap((item) => {
      if (item.id !== spotId || item.couponDescription === null) {
        return [];
      }

      return [
        {
          id: `mock-coupon-${item.id}`,
          spotId: item.id,
          description: item.couponDescription,
          validUntil: '2099-12-31T23:59:59.000Z',
        },
      ];
    });

    return {
      spot,
      coupons,
      ok: spot !== null,
      message:
        spot === null
          ? '指定されたスポットが見つかりませんでした。'
          : 'モックデータからスポット詳細を表示しています。',
    };
  }

  const { data, error } = await client
    .from('spots')
    .select(
      `
      *,
      coupons (*)
    `,
    )
    .eq('id', spotId)
    .maybeSingle();

  if (error !== null) {
    return {
      spot: null,
      coupons: [],
      ok: false,
      message: `スポット詳細の取得に失敗しました: ${error.message}`,
    };
  }

  if (data === null || !isSpotRowWithCoupons(data)) {
    return {
      spot: null,
      coupons: [],
      ok: false,
      message: '指定されたスポットが見つかりませんでした。',
    };
  }

  const spot = mapSpotRow(data);
  if (spot === null) {
    return {
      spot: null,
      coupons: [],
      ok: false,
      message: 'スポットデータの形式が不正です。',
    };
  }

  return {
    spot,
    coupons: data.coupons.map(mapCouponRow),
    ok: true,
    message: 'スポット詳細を取得しました。',
  };
}

