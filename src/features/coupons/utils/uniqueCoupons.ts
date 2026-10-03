import type { Coupon as CatalogCoupon } from '@/types';
import type { Coupon as ListedCoupon } from '../../../../types/database';

function normalizeOffer(value: string): string {
  return value.trim().toLowerCase();
}

export function uniqueCatalogCoupons(
  coupons: readonly CatalogCoupon[],
): CatalogCoupon[] {
  const seenIds = new Set<string>();
  const seenOffers = new Set<string>();
  const unique: CatalogCoupon[] = [];

  for (const coupon of coupons) {
    const offerKey = `${coupon.spotId}\u0000${normalizeOffer(coupon.description)}`;
    if (seenIds.has(coupon.id) || seenOffers.has(offerKey)) {
      continue;
    }

    seenIds.add(coupon.id);
    seenOffers.add(offerKey);
    unique.push(coupon);
  }

  return unique;
}

function listedOfferKey(coupon: ListedCoupon): string {
  return [
    coupon.spot_id,
    normalizeOffer(coupon.title),
    normalizeOffer(coupon.discount_detail),
  ].join('\u0000');
}

export function uniqueListedCoupons(
  coupons: readonly ListedCoupon[],
): ListedCoupon[] {
  const seenIds = new Set<string>();
  const seenOffers = new Set<string>();
  const unique: ListedCoupon[] = [];

  for (const coupon of coupons) {
    const offerKey = listedOfferKey(coupon);
    if (seenIds.has(coupon.id) || seenOffers.has(offerKey)) {
      continue;
    }

    seenIds.add(coupon.id);
    seenOffers.add(offerKey);
    unique.push(coupon);
  }

  return unique;
}

export function listedCouponSummary(coupon: ListedCoupon): string {
  const lines: string[] = [];
  const seen = new Set<string>();

  for (const raw of [coupon.title, coupon.discount_detail]) {
    const line = raw.trim();
    const key = normalizeOffer(line);
    if (line.length === 0 || seen.has(key)) {
      continue;
    }

    seen.add(key);
    lines.push(line);
  }

  return lines.join('\n');
}
