import { useMemo } from 'react';
import { useCouponUsage } from '@/features/coupons';
import { formatUsedAt } from '@/features/coupons/utils/couponStatus';
import { useSpotCatalogStore, useSpotFilterStore } from '@/features/spots';
import { palettes, type Palette } from '@/theme';
import type { TimeOfDay } from '@/types';

export type CouponHistoryItem = {
  key: string;
  couponId: string;
  spotName: string;
  discountDetail: string;
  usedAt: string;
  usedAtLabel: string;
};

export type UseCouponHistoryResult = {
  items: CouponHistoryItem[];
  loading: boolean;
  error: string | null;
  timeOfDay: TimeOfDay;
  palette: Palette;
  refetch: () => Promise<void>;
};

export function useCouponHistory(): UseCouponHistoryResult {
  const timeOfDay = useSpotFilterStore((state) => state.timeOfDay);
  const spots = useSpotCatalogStore((state) => state.spots);
  const catalogCoupons = useSpotCatalogStore((state) => state.coupons);
  const { history, isLoading, error, reload } = useCouponUsage();

  const items = useMemo((): CouponHistoryItem[] => {
    const spotById = new Map(spots.map((spot) => [spot.id, spot]));
    const couponById = new Map(
      catalogCoupons.map((coupon) => [coupon.id, coupon]),
    );

    return history.map((item, index) => {
      const coupon = couponById.get(item.couponId);
      const spot =
        coupon === undefined ? undefined : spotById.get(coupon.spotId);

      return {
        key: `${item.couponId}-${item.usedAt}-${index}`,
        couponId: item.couponId,
        spotName: spot?.name ?? 'スポット',
        discountDetail: coupon?.description ?? '利用済みクーポン',
        usedAt: item.usedAt,
        usedAtLabel: formatUsedAt(item.usedAt),
      };
    });
  }, [catalogCoupons, history, spots]);

  return {
    items,
    loading: isLoading,
    error,
    timeOfDay,
    palette: palettes[timeOfDay],
    refetch: reload,
  };
}
