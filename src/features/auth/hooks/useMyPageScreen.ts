import { useMemo, useState } from 'react';
import { useCoupons, useCouponUsage } from '@/features/coupons';
import { useFavorites, useSpotCatalogStore, useSpotFilterStore } from '@/features/spots';
import { PREMIUM_PLAN } from '@/features/subscription/constants';
import { useMembershipStore } from '@/features/subscription/store/membershipStore';
import { palettes, type Palette } from '@/theme';
import type { Coupon, Spot, TimeOfDay, UserCouponHistory, UserRole } from '@/types';

export type CouponListItem = {
  coupon: Coupon;
  spotName: string;
  used: boolean;
};

export type UsedCouponHistoryItem = {
  key: string;
  couponId: string;
  spotId: string | null;
  spotName: string;
  description: string;
  usedAt: string;
};

export type MyPageViewModel = {
  role: UserRole;
  isPremium: boolean;
  isPlanVisible: boolean;
  timeOfDay: TimeOfDay;
  palette: Palette;
  ctaLabel: string;
  favoriteSpots: Spot[];
  usedHistory: UsedCouponHistoryItem[];
  availableCoupons: CouponListItem[];
  couponsLoading: boolean;
  couponsError: string | null;
  historyLoading: boolean;
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
  const { favoriteSpotIds } = useFavorites();
  const [isPlanVisible, setIsPlanVisible] = useState(false);
  const {
    coupons,
    isLoading: couponsLoading,
    error: couponsError,
    reload,
  } = useCoupons();
  const {
    redeem,
    redeemingCouponId,
    reload: reloadUsage,
    usedCouponIds,
    history,
    isLoading: historyLoading,
  } = useCouponUsage();
  const isPremium = role === 'premium';

  const spotById = useMemo(() => {
    return new Map<string, Spot>(spots.map((spot) => [spot.id, spot]));
  }, [spots]);

  const couponById = useMemo(() => {
    return new Map<string, Coupon>(
      coupons.map((coupon) => [coupon.id, coupon]),
    );
  }, [coupons]);

  const favoriteSpots = useMemo(() => {
    return favoriteSpotIds.flatMap((spotId) => {
      const spot = spotById.get(spotId);
      return spot === undefined ? [] : [spot];
    });
  }, [favoriteSpotIds, spotById]);

  const usedHistory = useMemo((): UsedCouponHistoryItem[] => {
    return history.map((item: UserCouponHistory, index) => {
      const coupon = couponById.get(item.couponId);
      const spot = coupon === undefined ? undefined : spotById.get(coupon.spotId);

      return {
        key: `${item.couponId}-${item.usedAt}-${index}`,
        couponId: item.couponId,
        spotId: coupon?.spotId ?? null,
        spotName: spot?.name ?? 'スポット',
        description: coupon?.description ?? '利用済みクーポン',
        usedAt: item.usedAt,
      };
    });
  }, [couponById, history, spotById]);

  const availableCoupons = useMemo((): CouponListItem[] => {
    return coupons
      .filter((coupon) => !usedCouponIds.includes(coupon.id))
      .map((coupon) => ({
        coupon,
        spotName: spotById.get(coupon.spotId)?.name ?? 'スポット',
        used: false,
      }));
  }, [coupons, spotById, usedCouponIds]);

  return {
    role,
    isPremium,
    isPlanVisible,
    timeOfDay,
    palette: palettes[timeOfDay],
    ctaLabel: isPremium
      ? '特典・プラン内容を見る'
      : `プレミアムプラン（${PREMIUM_PLAN.headline}）に登録する`,
    favoriteSpots,
    usedHistory,
    availableCoupons,
    couponsLoading,
    couponsError,
    historyLoading,
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
