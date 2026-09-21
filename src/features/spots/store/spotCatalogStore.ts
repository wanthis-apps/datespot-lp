import { create } from 'zustand';
import { fetchCoupons } from '@/features/coupons/api/couponRepository';
import type { Coupon, Spot } from '@/types';
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
      const result = await fetchSpotCatalog();

      if (!result.ok) {
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

      let coupons: Coupon[] = [];
      try {
        coupons = await fetchCoupons();
      } catch (couponError) {
        console.error('[DateSpot] coupons 取得で例外', couponError);
      }

      set({
        spots: result.spots,
        coupons,
        source: result.source,
        status: 'ready',
        message: result.message,
        error: null,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'スポットの取得に失敗しました。';
      console.error('[DateSpot] スポット取得で例外', message);
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
