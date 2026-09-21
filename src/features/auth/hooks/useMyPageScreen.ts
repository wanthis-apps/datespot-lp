import { useMemo, useState } from 'react';
import { useCoupons, useCouponUsage } from '@/features/coupons';
import { useSpotCatalogStore, useSpotFilterStore } from '@/features/spots';
import { PREMIUM_PLAN } from '@/features/subscription/constants';
import { useMembershipStore } from '@/features/subscription/store/membershipStore';
import { palettes, type Palette } from '@/theme';
import type { Coupon, Spot, TimeOfDay, UserRole } from '@/types';

export type CouponListItem = {
  coupon: Coupon;
  spotName: string;
  used: boolean;
};

export type MyPageViewModel = {
  role: UserRole;
  isPremium: boolean;
  isPlanVisible: boolean;
  timeOfDay: TimeOfDay;
  palette: Palette;
  ctaLabel: string;
  coupons: CouponListItem[];
  couponsLoading: boolean;
  couponsError: string | null;
  redeemingCouponId: string | null;
  openPlan: () => void;
  closePlan: () => void;
  subscribe: () => void;
  redeemCoupon: (couponId: string) => Promise<{ ok: boolean; message: string }>;
  reloadCoupons: () => Promise<void>;
};

export function useMyPageScreen(): MyPageViewModel {
  const role = useMembershipStore((state) => state.role);
  const setRole = useMembershipStore((state) => state.setRole);
  const timeOfDay = useSpotFilterStore((state) => state.timeOfDay);
  const spots = useSpotCatalogStore((state) => state.spots);
  const [isPlanVisible, setIsPlanVisible] = useState(false);
  const {
    coupons,
    isLoading: couponsLoading,
    error: couponsError,
    reload,
  } = useCoupons();
  const { redeem, redeemingCouponId, reload: reloadUsage, usedCouponIds } =
    useCouponUsage();
  const isPremium = role === 'premium';

  const couponItems = useMemo((): CouponListItem[] => {
    const spotNames = new Map<string, string>(
      spots.map((spot: Spot) => [spot.id, spot.name]),
    );

    return coupons.map((coupon) => ({
      coupon,
      spotName: spotNames.get(coupon.spotId) ?? 'スポット',
      used: usedCouponIds.includes(coupon.id),
    }));
  }, [coupons, usedCouponIds, spots]);

  return {
    role,
    isPremium,
    isPlanVisible,
    timeOfDay,
    palette: palettes[timeOfDay],
    ctaLabel: isPremium
      ? '特典・プラン内容を見る'
      : `プレミアムプラン（${PREMIUM_PLAN.headline}）に登録する`,
    coupons: couponItems,
    couponsLoading,
    couponsError,
    redeemingCouponId,
    openPlan: () => setIsPlanVisible(true),
    closePlan: () => setIsPlanVisible(false),
    subscribe: () => {
      setRole('premium');
      setIsPlanVisible(false);
    },
    redeemCoupon: redeem,
    reloadCoupons: async () => {
      await Promise.all([reload(), reloadUsage()]);
    },
  };
}
