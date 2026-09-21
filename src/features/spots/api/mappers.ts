import type {
  CouponRow,
  SpotRowWithCoupons,
  UserCouponHistoryRow,
} from '@/types/database';
import type {
  Coupon,
  RelationshipStatus,
  Spot,
  SpotCategory,
  TimeRecommended,
  UserCouponHistory,
} from '@/types';
import { RELATIONSHIP_OPTIONS } from '../types';

const SPOT_CATEGORIES: SpotCategory[] = [
  'cafe',
  'activity',
  'lunch',
  'dinner',
  'bar',
  'night_view',
];

const TIME_RECOMMENDED: TimeRecommended[] = ['day', 'night', 'both'];

function isRelationshipStatus(value: string): value is RelationshipStatus {
  return (RELATIONSHIP_OPTIONS as readonly string[]).includes(value);
}

function isSpotCategory(value: string): value is SpotCategory {
  return (SPOT_CATEGORIES as readonly string[]).includes(value);
}

function isTimeRecommended(value: string): value is TimeRecommended {
  return (TIME_RECOMMENDED as readonly string[]).includes(value);
}

function pickCouponDescription(coupons: CouponRow[]): string | null {
  const now = Date.now();
  const activeCoupon = coupons.find(
    (coupon) => new Date(coupon.valid_until).getTime() >= now,
  );

  return activeCoupon?.description ?? coupons[0]?.description ?? null;
}

export function mapCouponRow(row: CouponRow): Coupon {
  return {
    id: row.id,
    spotId: row.spot_id,
    description: row.description,
    validUntil: row.valid_until,
  };
}

export function mapUserCouponHistory(
  row: UserCouponHistoryRow,
): UserCouponHistory {
  return {
    userId: row.user_id,
    couponId: row.coupon_id,
    usedAt: row.used_at,
  };
}

export function mapSpotRow(row: SpotRowWithCoupons): Spot | null {
  if (!isSpotCategory(row.category) || !isTimeRecommended(row.time_recommended)) {
    return null;
  }

  return {
    id: row.id,
    name: row.name,
    location: { lat: row.lat, lng: row.lng },
    category: row.category,
    timeRecommended: row.time_recommended,
    relationshipTags: row.relationship_tags.filter(isRelationshipStatus),
    isPartnerStore: row.is_partner_store,
    imageUrl: row.image_url.trim(),
    area: row.area,
    description: row.description,
    couponDescription: pickCouponDescription(row.coupons),
  };
}
