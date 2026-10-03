import { useCallback, useEffect, useState } from 'react';
import type { Coupon } from '@/types';
import {
  notifyOfflineCache,
  readCachedCatalogCoupons,
  writeCachedCatalog,
} from '../../../../hooks/dataCache';
import { fetchCoupons } from '../api/couponRepository';
import { uniqueCatalogCoupons } from '../utils/uniqueCoupons';
import { useSpotCatalogStore } from '@/features/spots/store/spotCatalogStore';

export type UseCouponsResult = {
  coupons: Coupon[];
  isLoading: boolean;
  error: string | null;
  reload: () => Promise<void>;
};

export function useCoupons(): UseCouponsResult {
  const catalogCoupons = useSpotCatalogStore((state) => state.coupons);
  const [coupons, setCoupons] = useState<Coupon[]>(() =>
    uniqueCatalogCoupons(catalogCoupons),
  );
  const [isLoading, setIsLoading] = useState(catalogCoupons.length === 0);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const rows = uniqueCatalogCoupons(await fetchCoupons());
      setCoupons(rows);
      const catalogSpots = useSpotCatalogStore.getState().spots;
      await writeCachedCatalog(catalogSpots, rows);
    } catch (caught) {
      const cached = await readCachedCatalogCoupons();
      if (cached.length > 0) {
        setCoupons(uniqueCatalogCoupons(cached));
        notifyOfflineCache();
      } else {
        const message =
          caught instanceof Error
            ? caught.message
            : 'クーポンの取得に失敗しました。';
        setError(message);
      }
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
