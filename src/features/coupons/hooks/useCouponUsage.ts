import { useCallback, useEffect } from 'react';
import type { UserCouponHistory } from '@/types';
import { useCouponUsageStore } from '../store/couponUsageStore';

export type UseCouponUsageResult = {
  usedCouponIds: string[];
  history: UserCouponHistory[];
  isLoading: boolean;
  error: string | null;
  redeemingCouponId: string | null;
  isUsed: (couponId: string) => boolean;
  redeem: (couponId: string) => Promise<{ ok: boolean; message: string }>;
  reload: () => Promise<void>;
};

export function useCouponUsage(): UseCouponUsageResult {
  const usedCouponIds = useCouponUsageStore((state) => state.usedCouponIds);
  const history = useCouponUsageStore((state) => state.history);
  const status = useCouponUsageStore((state) => state.status);
  const error = useCouponUsageStore((state) => state.error);
  const redeemingCouponId = useCouponUsageStore(
    (state) => state.redeemingCouponId,
  );
  const hydrate = useCouponUsageStore((state) => state.hydrate);
  const redeem = useCouponUsageStore((state) => state.redeem);
  const isUsed = useCouponUsageStore((state) => state.isUsed);

  useEffect(() => {
    if (status === 'idle') {
      void hydrate();
    }
  }, [hydrate, status]);

  const reload = useCallback(async () => {
    await hydrate();
  }, [hydrate]);

  return {
    usedCouponIds,
    history,
    isLoading: status === 'loading' || status === 'idle',
    error,
    redeemingCouponId,
    isUsed,
    redeem,
    reload,
  };
}
