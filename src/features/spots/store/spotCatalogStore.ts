import { create } from 'zustand';
import { fetchCoupons } from '@/features/coupons/api/couponRepository';
import { uniqueCatalogCoupons } from '@/features/coupons/utils/uniqueCoupons';
import type { Coupon, Spot } from '@/types';
import {
  notifyOfflineCache,
  readCachedCatalogCoupons,
  readCachedCatalogSpots,
  writeCachedCatalog,
} from '../../../../hooks/dataCache';
import {
  fetchSpotCatalog,
  type DataSource,
} from '../api/spotRepository';

type CatalogStatus = 'idle' | 'loading' | 'ready' | 'error';

type SpotCatalogState = {
  spots: Spot[];
  coupons: Coupon[];
  source: DataSource | null;
  status: CatalogStatus;
  message: string;
  error: string | null;
  loadSpots: () => Promise<void>;
};

export const useSpotCatalogStore = create<SpotCatalogState>((set, get) => ({
  spots: [],
  coupons: [],
  source: null,
  status: 'idle',
  message: '',
  error: null,
  loadSpots: async () => {
    if (get().status === 'loading') {
      return;
    }

    set({
      status: 'loading',
      message: 'スポットを読み込み中です。',
      error: null,
    });

    try {
      const [result, couponResult] = await Promise.all([
        fetchSpotCatalog(),
        fetchCoupons().catch((couponError: unknown) => {
          console.error('[DateSpot] coupons 取得で例外', couponError);
          return null;
        }),
      ]);

      if (!result.ok) {
        const cachedSpots = await readCachedCatalogSpots();
        const cachedCoupons = await readCachedCatalogCoupons();
        if (cachedSpots.length > 0) {
          set({
            spots: cachedSpots,
            coupons: uniqueCatalogCoupons(cachedCoupons),
            source: result.source,
            status: 'ready',
            message: result.message,
            error: null,
          });
          notifyOfflineCache();
          return;
        }

        set({
          spots: [],
          coupons: [],
          source: result.source,
          status: 'error',
          message: result.message,
          error: result.message,
        });
        return;
      }

      const coupons =
        couponResult === null
          ? uniqueCatalogCoupons(await readCachedCatalogCoupons())
          : couponResult;

      set({
        spots: result.spots,
        coupons,
        source: result.source,
        status: 'ready',
        message: result.message,
        error: null,
      });
      void writeCachedCatalog(result.spots, coupons);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'スポットの取得に失敗しました。';
      console.error('[DateSpot] スポット取得で例外', message);
      const cachedSpots = await readCachedCatalogSpots();
      const cachedCoupons = await readCachedCatalogCoupons();
      if (cachedSpots.length > 0) {
        set({
          spots: cachedSpots,
          coupons: uniqueCatalogCoupons(cachedCoupons),
          source: null,
          status: 'ready',
          message,
          error: null,
        });
        notifyOfflineCache();
        return;
      }

      set({
        spots: [],
        coupons: [],
        source: null,
        status: 'error',
        message,
        error: message,
      });
    }
  },
}));
