import AsyncStorage from '@react-native-async-storage/async-storage';
import { showToast } from '@/context/toastStore';
import type { Coupon as CatalogCoupon, Spot as CatalogSpot } from '@/types';
import type { Coupon, Spot } from '../types/database';
import { mapCouponRow, mapSpotRow } from './mapRecords';

export const CACHE_KEYS = {
  spots: '@datespot/cached-spots',
  coupons: '@datespot/cached-coupons',
  catalogSpots: '@datespot/cached-catalog-spots',
  catalogCoupons: '@datespot/cached-catalog-coupons',
} as const;

let lastOfflineToastAt = 0;

export function notifyOfflineCache(): void {
  const now = Date.now();
  if (now - lastOfflineToastAt < 4000) {
    return;
  }

  lastOfflineToastAt = now;
  showToast({ message: 'オフラインモードで表示中', type: 'info' });
}

async function writeCache(key: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn('[DateSpot] キャッシュの保存に失敗', error);
  }
}

async function readCache(key: string): Promise<unknown> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw === null) {
      return null;
    }

    return JSON.parse(raw) as unknown;
  } catch (error) {
    console.warn('[DateSpot] キャッシュの読み込みに失敗', error);
    return null;
  }
}

function isCatalogSpot(value: unknown): value is CatalogSpot {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const record = value as Record<string, unknown>;
  const location = record.location;
  if (typeof location !== 'object' || location === null) {
    return false;
  }

  const point = location as Record<string, unknown>;
  return (
    typeof record.id === 'string' &&
    typeof record.name === 'string' &&
    typeof point.lat === 'number' &&
    typeof point.lng === 'number'
  );
}

function isCatalogCoupon(value: unknown): value is CatalogCoupon {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const record = value as Record<string, unknown>;
  return (
    typeof record.id === 'string' &&
    typeof record.spotId === 'string' &&
    typeof record.description === 'string'
  );
}

export async function writeCachedSpots(spots: Spot[]): Promise<void> {
  await writeCache(CACHE_KEYS.spots, spots);
}

export async function readCachedSpots(): Promise<Spot[]> {
  const parsed = await readCache(CACHE_KEYS.spots);
  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed.flatMap((row) => {
    const spot = mapSpotRow(row);
    return spot === null ? [] : [spot];
  });
}

export async function writeCachedCoupons(coupons: Coupon[]): Promise<void> {
  await writeCache(CACHE_KEYS.coupons, coupons);
}

export async function readCachedCoupons(): Promise<Coupon[]> {
  const parsed = await readCache(CACHE_KEYS.coupons);
  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed.flatMap((row) => {
    const coupon = mapCouponRow(row);
    return coupon === null ? [] : [coupon];
  });
}

export async function writeCachedCatalog(
  spots: CatalogSpot[],
  coupons: CatalogCoupon[],
): Promise<void> {
  await Promise.all([
    writeCache(CACHE_KEYS.catalogSpots, spots),
    writeCache(CACHE_KEYS.catalogCoupons, coupons),
  ]);
}

export async function readCachedCatalogSpots(): Promise<CatalogSpot[]> {
  const parsed = await readCache(CACHE_KEYS.catalogSpots);
  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed.filter(isCatalogSpot);
}

export async function readCachedCatalogCoupons(): Promise<CatalogCoupon[]> {
  const parsed = await readCache(CACHE_KEYS.catalogCoupons);
  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed.filter(isCatalogCoupon);
}
