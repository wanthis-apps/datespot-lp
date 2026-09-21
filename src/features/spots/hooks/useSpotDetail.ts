import { useCallback, useEffect, useState } from 'react';
import type { Coupon, Spot } from '@/types';
import { fetchSpotById } from '../api/spotRepository';
import { useSpotCatalogStore } from '../store/spotCatalogStore';

export type UseSpotDetailResult = {
  spot: Spot | null;
  coupons: Coupon[];
  isLoading: boolean;
  error: string | null;
  reload: () => Promise<void>;
};

export function useSpotDetail(spotId: string): UseSpotDetailResult {
  const cachedSpot = useSpotCatalogStore((state) =>
    state.spots.find((item) => item.id === spotId),
  );
  const cachedCoupons = useSpotCatalogStore((state) =>
    state.coupons.filter((item) => item.spotId === spotId),
  );

  const [spot, setSpot] = useState<Spot | null>(cachedSpot ?? null);
  const [coupons, setCoupons] = useState<Coupon[]>(cachedCoupons);
  const [isLoading, setIsLoading] = useState(cachedSpot === undefined);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchSpotById(spotId);
      setSpot(result.spot);
      setCoupons(result.coupons);

      if (!result.ok || result.spot === null) {
        setError(result.message);
      }
    } catch (caught) {
      const message =
        caught instanceof Error
          ? caught.message
          : 'スポット詳細の取得に失敗しました。';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [spotId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return {
    spot,
    coupons,
    isLoading,
    error,
    reload,
  };
}
