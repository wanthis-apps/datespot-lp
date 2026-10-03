import type { Coupon as CatalogCoupon, Spot as CatalogSpot } from '@/types';
import type {
  Coupon,
  Plan,
  PlanSpot,
  Review,
  Spot,
  SpotCategory,
} from '../types/database';
import { normalizeSpotTags, tagsForCatalogSpotId } from './spotTags';

export const FOUNDATION_CATEGORY_LABELS: Record<SpotCategory, string> = {
  cafe: 'カフェ',
  restaurant: 'レストラン',
  park: '公園',
  activity: 'アクティビティ',
  night_view: '夜景',
  other: 'その他',
};

const SPOT_CATEGORIES: readonly SpotCategory[] = [
  'cafe',
  'restaurant',
  'park',
  'activity',
  'night_view',
  'other',
];

export function toErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

export function toFiniteNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
}

export function toNullableString(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

export function normalizeCategory(value: unknown): SpotCategory {
  if (
    typeof value === 'string' &&
    (SPOT_CATEGORIES as readonly string[]).includes(value)
  ) {
    return value as SpotCategory;
  }

  if (value === 'lunch' || value === 'dinner') {
    return 'restaurant';
  }

  return 'other';
}

export function formatPriceRange(priceRange: number | null): string {
  if (priceRange === null || priceRange < 1) {
    return '価格未設定';
  }

  return '¥'.repeat(Math.min(Math.floor(priceRange), 4));
}

export function formatValidUntil(validUntil: string): string {
  const date = new Date(validUntil);
  if (Number.isNaN(date.getTime())) {
    return '期限不明';
  }

  return `${date.toLocaleDateString('ja-JP')} まで`;
}

function readRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value !== 'object' || value === null) {
    return null;
  }

  return value as Record<string, unknown>;
}

function readNestedSpot(
  value: unknown,
): Pick<Spot, 'name' | 'image_url'> | undefined {
  const source = Array.isArray(value) ? value[0] : value;
  const record = readRecord(source);
  if (record === null) {
    return undefined;
  }

  const name = toNullableString(record.name);
  if (name === null) {
    return undefined;
  }

  return {
    name,
    image_url:
      toNullableString(record.image_url) ?? toNullableString(record.imageUrl),
  };
}

export function mapSpotRow(row: unknown): Spot | null {
  const record = readRecord(row);
  if (record === null) {
    return null;
  }

  const id = toNullableString(record.id);
  const name = toNullableString(record.name);
  const latitude = toFiniteNumber(record.latitude) ?? toFiniteNumber(record.lat);
  const longitude =
    toFiniteNumber(record.longitude) ?? toFiniteNumber(record.lng);

  if (id === null || name === null || latitude === null || longitude === null) {
    return null;
  }

  return {
    id,
    name,
    description: toNullableString(record.description),
    category: normalizeCategory(record.category),
    address: toNullableString(record.address) ?? toNullableString(record.area),
    latitude,
    longitude,
    price_range: toFiniteNumber(record.price_range),
    image_url: toNullableString(record.image_url),
    created_at: toNullableString(record.created_at) ?? new Date().toISOString(),
    tags: normalizeSpotTags(record.tags),
  };
}

export function mapCatalogSpot(spot: CatalogSpot): Spot {
  return {
    id: spot.id,
    name: spot.name,
    description: spot.description,
    category: normalizeCategory(spot.category),
    address: spot.area,
    latitude: spot.location.lat,
    longitude: spot.location.lng,
    price_range: null,
    image_url: spot.imageUrl,
    created_at: new Date(0).toISOString(),
    tags: tagsForCatalogSpotId(spot.id),
  };
}

const CATALOG_CATEGORY: Record<SpotCategory, CatalogSpot['category']> = {
  cafe: 'cafe',
  restaurant: 'lunch',
  park: 'activity',
  activity: 'activity',
  night_view: 'night_view',
  other: 'activity',
};

export function toCatalogSpot(spot: Spot): CatalogSpot {
  return {
    id: spot.id,
    name: spot.name,
    location: { lat: spot.latitude, lng: spot.longitude },
    category: CATALOG_CATEGORY[spot.category],
    timeRecommended: 'both',
    relationshipTags: [],
    isPartnerStore: false,
    imageUrl: spot.image_url ?? '',
    area: spot.address ?? '',
    description: spot.description ?? '',
    couponDescription: null,
  };
}

export function mapCouponRow(row: unknown): Coupon | null {
  const record = readRecord(row);
  if (record === null) {
    return null;
  }

  const id = toNullableString(record.id);
  const spotId =
    toNullableString(record.spot_id) ?? toNullableString(record.spotId);
  const title =
    toNullableString(record.title) ?? toNullableString(record.description);
  const discountDetail =
    toNullableString(record.discount_detail) ??
    toNullableString(record.description);
  const validUntil =
    toNullableString(record.valid_until) ??
    toNullableString(record.validUntil);

  if (
    id === null ||
    spotId === null ||
    title === null ||
    discountDetail === null ||
    validUntil === null
  ) {
    return null;
  }

  const coupon: Coupon = {
    id,
    spot_id: spotId,
    title,
    discount_detail: discountDetail,
    valid_until: validUntil,
    created_at: toNullableString(record.created_at) ?? validUntil,
  };

  const spot = readNestedSpot(record.spot ?? record.spots);
  if (spot !== undefined) {
    coupon.spot = spot;
  }

  return coupon;
}

export function mapCatalogCoupon(
  coupon: CatalogCoupon,
  spot: CatalogSpot | undefined,
): Coupon {
  return {
    id: coupon.id,
    spot_id: coupon.spotId,
    title: coupon.description,
    discount_detail: coupon.description,
    valid_until: coupon.validUntil,
    created_at: coupon.validUntil,
    spot: {
      name: spot?.name ?? 'スポット',
      image_url: spot?.imageUrl ?? null,
    },
  };
}

export function mapReviewRow(row: unknown): Review | null {
  const record = readRecord(row);
  if (record === null) {
    return null;
  }

  const id = toNullableString(record.id);
  const spotId = toNullableString(record.spot_id);
  const userId = toNullableString(record.user_id);
  const userName = toNullableString(record.user_name);
  const rating = toFiniteNumber(record.rating);
  const comment = toNullableString(record.comment);
  const helpfulCount = toFiniteNumber(record.helpful_count);
  const createdAt = toNullableString(record.created_at);

  if (
    id === null ||
    spotId === null ||
    userId === null ||
    userName === null ||
    rating === null ||
    rating < 1 ||
    rating > 5 ||
    comment === null ||
    createdAt === null
  ) {
    return null;
  }

  return {
    id,
    spot_id: spotId,
    user_id: userId,
    user_name: userName,
    rating: Math.round(rating),
    comment,
    helpful_count:
      helpfulCount === null ? 0 : Math.max(0, Math.round(helpfulCount)),
    created_at: createdAt,
  };
}

export function formatReviewDate(createdAt: string): string {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) {
    return '投稿日時不明';
  }

  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function mapPlanSpotRow(
  row: unknown,
  fallbackSpot?: Spot,
): PlanSpot | null {
  const record = readRecord(row);
  if (record === null) {
    return null;
  }

  const id = toNullableString(record.id);
  const planId = toNullableString(record.plan_id);
  const spotId = toNullableString(record.spot_id);
  const orderIndex = toFiniteNumber(record.order_index);

  if (id === null || planId === null || spotId === null || orderIndex === null) {
    return null;
  }

  const nestedSpot =
    mapSpotRow(record.spots) ?? mapSpotRow(record.spot) ?? fallbackSpot;

  return {
    id,
    plan_id: planId,
    spot_id: spotId,
    order_index: Math.round(orderIndex),
    visit_time: toNullableString(record.visit_time),
    spot: nestedSpot,
  };
}

export function mapPlanRow(
  row: unknown,
  spotById?: Map<string, Spot>,
): Plan | null {
  const record = readRecord(row);
  if (record === null) {
    return null;
  }

  const id = toNullableString(record.id);
  const userId = toNullableString(record.user_id);
  const title = toNullableString(record.title);
  const createdAt = toNullableString(record.created_at);

  if (id === null || userId === null || title === null || createdAt === null) {
    return null;
  }

  const rawSpots = record.plan_spots;
  const planSpots = Array.isArray(rawSpots)
    ? rawSpots
        .flatMap((item) => {
          const mapped = mapPlanSpotRow(item);
          if (mapped === null) {
            return [];
          }

          const spot = mapped.spot ?? spotById?.get(mapped.spot_id);
          return [{ ...mapped, spot }];
        })
        .sort((a, b) => a.order_index - b.order_index)
    : [];

  return {
    id,
    user_id: userId,
    title,
    description: toNullableString(record.description),
    is_public: record.is_public === true,
    created_at: createdAt,
    plan_spots: planSpots,
  };
}

export function attachPlanSpots(
  plan: Plan,
  spotById: Map<string, Spot>,
): Plan {
  return {
    ...plan,
    plan_spots: plan.plan_spots
      .slice()
      .sort((a, b) => a.order_index - b.order_index)
      .map((item) => ({
        ...item,
        spot: item.spot ?? spotById.get(item.spot_id),
      })),
  };
}
