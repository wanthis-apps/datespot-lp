import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { useSpotFilterStore } from '@/features/spots/store/spotFilterStore';
import type { UserCouponHistory } from '@/types';
import {
  fetchUserCouponHistory,
  redeemCoupon,
} from '../api/couponRepository';

const USED_COUPONS_STORAGE_KEY = '@datespot/used-coupons';

type CatalogStatus = 'idle' | 'loading' | 'ready' | 'error';

type CouponUsageState = {
  usedCouponIds: string[];
  history: UserCouponHistory[];
  status: CatalogStatus;
  error: string | null;
  redeemingCouponId: string | null;
  hydrate: () => Promise<void>;
  redeem: (couponId: string) => Promise<{ ok: boolean; message: string }>;
  isUsed: (couponId: string) => boolean;
};

async function readLocalUsedIds(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(USED_COUPONS_STORAGE_KEY);
    if (raw === null) {
      return [];
    }

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((value): value is string => typeof value === 'string');
  } catch (error) {
    console.warn('[DateSpot] 利用済みクーポンのローカル読み込みに失敗', error);
    return [];
  }
}

async function writeLocalUsedIds(ids: string[]): Promise<void> {
  try {
    await AsyncStorage.setItem(USED_COUPONS_STORAGE_KEY, JSON.stringify(ids));
  } catch (error) {
    console.warn('[DateSpot] 利用済みクーポンのローカル保存に失敗', error);
  }
}

function uniqueIds(ids: string[]): string[] {
  return [...new Set(ids)];
}

export const useCouponUsageStore = create<CouponUsageState>((set, get) => ({
  usedCouponIds: [],
  history: [],
  status: 'idle',
  error: null,
  redeemingCouponId: null,
  isUsed: (couponId) => get().usedCouponIds.includes(couponId),
  hydrate: async () => {
    if (get().status === 'loading') {
      return;
    }

    set({ status: 'loading', error: null });

    const localIds = await readLocalUsedIds();

    try {
      const history = await fetchUserCouponHistory();
      const usedCouponIds = uniqueIds([
        ...localIds,
        ...history.map((item) => item.couponId),
      ]);
      await writeLocalUsedIds(usedCouponIds);
      set({
        history,
        usedCouponIds,
        status: 'ready',
        error: null,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'クーポン利用履歴の取得に失敗しました。';
      console.error('[DateSpot] クーポン履歴の取得に失敗', message);
      set({
        history: [],
        usedCouponIds: localIds,
        status: 'error',
        error: message,
      });
    }
  },
  redeem: async (couponId) => {
    if (get().usedCouponIds.includes(couponId)) {
      return { ok: false, message: 'このクーポンは利用済みです。' };
    }

    if (get().redeemingCouponId !== null) {
      return { ok: false, message: '別のクーポンを処理中です。' };
    }

    set({ redeemingCouponId: couponId, error: null });

    try {
      const relationship =
        useSpotFilterStore.getState().relationship ?? 'first_date';
      const result = await redeemCoupon(couponId, relationship);

      if (!result.ok) {
        set({
          redeemingCouponId: null,
          error: result.message,
        });
        return { ok: false, message: result.message };
      }

      const historyItem = result.history;
      const usedCouponIds = uniqueIds([...get().usedCouponIds, couponId]);
      await writeLocalUsedIds(usedCouponIds);

      set({
        usedCouponIds,
        history:
          historyItem === null ? get().history : [historyItem, ...get().history],
        redeemingCouponId: null,
        error: null,
        status: 'ready',
      });

      return { ok: true, message: result.message };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'クーポンの利用に失敗しました。';
      set({ redeemingCouponId: null, error: message });
      return { ok: false, message };
    }
  },
}));
