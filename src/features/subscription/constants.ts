import type { UserRole } from '@/types';

export const ROLE_LABELS: Record<UserRole, string> = {
  free: '無料会員',
  premium: 'プレミアム会員',
};

export const PREMIUM_PLAN = {
  name: 'プレミアムプラン',
  priceLabel: '月額 ¥980',
  headline: 'ドリンク1杯無料特典付き',
  description:
    '提携店舗で使えるドリンク1杯無料クーポンなど、\nデートをもっと特別にする特典を開放します。',
  benefits: [
    '提携店舗でのドリンク1杯無料クーポン',
    'クーポン利用履歴の確認',
    '今後追加予定の予約・限定スポットへの優先案内',
  ],
} as const;

export type PremiumPlan = typeof PREMIUM_PLAN;
