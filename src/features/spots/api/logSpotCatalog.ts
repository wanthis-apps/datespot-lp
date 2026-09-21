import type { Spot } from '@/types';

export type DataSource = 'supabase' | 'mock';

export type SpotCatalogResult = {
  spots: Spot[];
  source: DataSource;
  message: string;
  ok: boolean;
};

export function logSpotCatalogResult(result: SpotCatalogResult): void {
  const couponCount = result.spots.filter(
    (spot) => spot.couponDescription !== null,
  ).length;

  console.log('[DateSpot] スポット取得結果', {
    source: result.source,
    ok: result.ok,
    count: result.spots.length,
    couponCount,
    names: result.spots.map((spot) => spot.name),
    message: result.message,
  });
}
