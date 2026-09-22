import type { Coupon } from '@/types';

export function isCouponExpired(
  coupon: Coupon,
  now: number = Date.now(),
): boolean {
  const expiresAt = new Date(coupon.validUntil).getTime();
  return Number.isNaN(expiresAt) || expiresAt < now;
}

export function formatCouponExpiry(validUntil: string): string {
  const date = new Date(validUntil);
  if (Number.isNaN(date.getTime())) {
    return '期限不明';
  }

  return `${date.toLocaleDateString('ja-JP')} まで`;
}

export function formatUsedAt(usedAt: string): string {
  const date = new Date(usedAt);
  if (Number.isNaN(date.getTime())) {
    return '利用日時不明';
  }

  return date.toLocaleString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
