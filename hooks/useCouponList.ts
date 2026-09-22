import { useCallback, useEffect, useState } from 'react';
import { getMockCoupons } from '@/features/coupons/api/couponRepository';
import { useSpotCatalogStore } from '@/features/spots/store/spotCatalogStore';
import { getSupabaseClient } from '@/services/supabase';
import type { Coupon } from '../types/database';
import {
  notifyOfflineCache,
  readCachedCoupons,
  writeCachedCoupons,
} from './dataCache';
import { mapCatalogCoupon, mapCouponRow, toErrorMessage } from './mapRecords';

export type UseCouponListResult = {
  coupons: Coupon[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

function attachSpotFallback(
  coupon: Coupon,
  spotNameById: Map<string, { name: string; image_url: string | null }>,
): Coupon {
  if (coupon.spot !== undefined) {
    return coupon;
  }

  const spot = spotNameById.get(coupon.spot_id);
  if (spot === undefined) {
    return coupon;
  }

  return {
    ...coupon,
    spot,
  };
}

export function useCouponList(): UseCouponListResult {
  const catalogSpots = useSpotCatalogStore((state) => state.spots);
  const catalogCoupons = useSpotCatalogStore((state) => state.coupons);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);

    const spotNameById = new Map(
      catalogSpots.map((spot) => [
        spot.id,
        { name: spot.name, image_url: spot.imageUrl },
      ]),
    );

    const fallbackCoupons = (
      catalogCoupons.length > 0 ? catalogCoupons : getMockCoupons()
    ).map((coupon) =>
      mapCatalogCoupon(
        coupon,
        catalogSpots.find((spot) => spot.id === coupon.spotId),
      ),
    );

    const applyFallback = async (reason: string | null): Promise<void> => {
      const cached = await readCachedCoupons();
      if (cached.length > 0) {
        setCoupons(
          cached.map((coupon) => attachSpotFallback(coupon, spotNameById)),
        );
        setError(null);
        notifyOfflineCache();
        return;
      }

      setCoupons(fallbackCoupons);
      setError(fallbackCoupons.length === 0 ? reason : null);
    };

    const client = getSupabaseClient();
    if (client === null) {
      await applyFallback(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error: queryError } = await client
        .from('coupons')
        .select('*, spots(name, image_url)');

      if (queryError !== null) {
        const { data: plainData, error: plainError } = await client
          .from('coupons')
          .select('*');

        if (plainError !== null) {
          await applyFallback(
            `クーポンの取得に失敗しました: ${plainError.message}`,
          );
          return;
        }

        const rows = Array.isArray(plainData) ? plainData : [];
        const mapped = rows.flatMap((row) => {
          const coupon = mapCouponRow(row);
          return coupon === null
            ? []
            : [attachSpotFallback(coupon, spotNameById)];
        });
        const next = mapped.length > 0 ? mapped : fallbackCoupons;
        setCoupons(next);
        if (mapped.length > 0) {
          await writeCachedCoupons(mapped);
        }
        return;
      }

      const rows = Array.isArray(data) ? data : [];
      const mapped = rows.flatMap((row) => {
        const coupon = mapCouponRow(row);
        return coupon === null ? [] : [attachSpotFallback(coupon, spotNameById)];
      });
      const next = mapped.length > 0 ? mapped : fallbackCoupons;
      setCoupons(next);
      if (mapped.length > 0) {
        await writeCachedCoupons(mapped);
      }
    } catch (caught) {
      await applyFallback(
        `クーポンの取得に失敗しました: ${toErrorMessage(caught)}`,
      );
    } finally {
      setLoading(false);
    }
  }, [catalogCoupons, catalogSpots]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return {
    coupons,
    loading,
    error,
    refetch,
  };
}
