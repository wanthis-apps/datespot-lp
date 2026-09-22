import type { SpotRowWithCoupons } from '@/types/database';
import { mapSpotRow } from './mappers';

const SAMPLE_ROW: SpotRowWithCoupons = {
  id: '00000000-0000-4000-8000-000000000001',
  name: 'Bloom Café 代官山',
  lat: 35.6496,
  lng: 139.7032,
  category: 'cafe',
  time_recommended: 'day',
  relationship_tags: ['first_date', 'new_couple'],
  is_partner_store: true,
  image_url: 'https://example.com/bloom.jpg',
  area: '代官山',
  description: 'テスト用',
  tags: ['rainy_ok', 'credit_card'],
  created_at: '2026-01-01T00:00:00.000Z',
  coupons: [
    {
      id: '00000000-0000-4000-8000-000000000101',
      spot_id: '00000000-0000-4000-8000-000000000001',
      description: 'ドリンク1杯無料',
      valid_until: '2099-12-31T23:59:59.000Z',
    },
  ],
};

export function verifySpotMapper(): boolean {
  const spot = mapSpotRow(SAMPLE_ROW);
  const ok =
    spot !== null &&
    spot.name === SAMPLE_ROW.name &&
    spot.location.lat === SAMPLE_ROW.lat &&
    spot.couponDescription === 'ドリンク1杯無料' &&
    spot.relationshipTags.length === 2;

  console.log('[DateSpot] mapper 検証', { ok, name: spot?.name ?? null });
  return ok;
}
