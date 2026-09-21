import { useCallback, useEffect, useState } from 'react';
import type { Coupon } from '@/types';
import { fetchCoupons } from '../api/couponRepository';
import { useSpotCatalogStore } from '@/features/spots/store/spotCatalogStore';

export type UseCouponsResult = {
  coupons: Coupon[];
  isLoading: boolean;
  error: string | null;
  reload: () => Promise<void>;
};

export function useCoupons(): UseCouponsResult {
  const catalogCoupons = useSpotCatalogStore((state) => state.coupons);
  const [coupons, setCoupons] = useState<Coupon[]>(catalogCoupons);
  const [isLoading, setIsLoading] = useState(catalogCoupons.length === 0);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const rows = await fetchCoupons();
      setCoupons(rows);
    } catch (caught) {
      const message =
        caught instanceof Error
          ? caught.message
          : 'クーポンの取得に失敗しました。';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return {
    coupons,
    isLoading,
    error,
    reload,
  };
}
