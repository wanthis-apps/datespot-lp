import { useMemo } from 'react';
import { useCouponUsage } from '@/features/coupons';
import { formatUsedAt } from '@/features/coupons/utils/couponStatus';
import { useAppTheme } from '@/context';
import { useSpotCatalogStore } from '@/features/spots';
import type { Palette } from '@/theme';

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
  isDark: boolean;
  palette: Palette;
  refetch: () => Promise<void>;
};

export function useCouponHistory(): UseCouponHistoryResult {
  const { isDark, palette } = useAppTheme();
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
    isDark,
    palette,
    refetch: reload,
  };
}
