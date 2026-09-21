import { useCallback, useEffect } from 'react';
import type { Coupon, Spot } from '@/types';
import type { DataSource } from '../api/logSpotCatalog';
import { useSpotCatalogStore } from '../store/spotCatalogStore';

export type UseSpotCatalogResult = {
  spots: Spot[];
  coupons: Coupon[];
  isLoading: boolean;
  error: string | null;
  source: DataSource | null;
  message: string;
  reload: () => Promise<void>;
};

export function useSpotCatalog(): UseSpotCatalogResult {
  const spots = useSpotCatalogStore((state) => state.spots);
  const coupons = useSpotCatalogStore((state) => state.coupons);
  const status = useSpotCatalogStore((state) => state.status);
  const error = useSpotCatalogStore((state) => state.error);
  const source = useSpotCatalogStore((state) => state.source);
  const message = useSpotCatalogStore((state) => state.message);
  const loadSpots = useSpotCatalogStore((state) => state.loadSpots);

  useEffect(() => {
    if (status === 'idle') {
      void loadSpots();
    }
  }, [loadSpots, status]);

  const reload = useCallback(async () => {
    await loadSpots();
  }, [loadSpots]);

  return {
    spots,
    coupons,
    isLoading: status === 'loading' || status === 'idle',
    error,
    source,
    message,
    reload,
  };
}
