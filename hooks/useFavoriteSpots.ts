import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFavorites } from '@/features/spots/hooks/useFavorites';
import { useSpotCatalogStore } from '@/features/spots/store/spotCatalogStore';
import { getSupabaseClient } from '@/services/supabase';
import type { Spot } from '../types/database';
import { mapCatalogSpot, mapSpotRow, toErrorMessage } from './mapRecords';

export type UseFavoriteSpotsResult = {
  spots: Spot[];
  loading: boolean;
  error: string | null;
  toggleFavorite: (spotId: string) => Promise<void>;
  refetch: () => Promise<void>;
};

export function useFavoriteSpots(): UseFavoriteSpotsResult {
  const catalogSpots = useSpotCatalogStore((state) => state.spots);
  const {
    favoriteSpotIds,
    isLoading: favoritesLoading,
    toggleFavorite,
  } = useFavorites();
  const [remoteSpots, setRemoteSpots] = useState<Spot[]>([]);
  const [loadingRemote, setLoadingRemote] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async (): Promise<void> => {
    setLoadingRemote(true);
    setError(null);

    const client = getSupabaseClient();
    if (client === null) {
      setRemoteSpots([]);
      setLoadingRemote(false);
      return;
    }

    try {
      const { data, error: queryError } = await client.from('spots').select('*');
      if (queryError !== null) {
        setRemoteSpots([]);
        setError(`お気に入りスポットの取得に失敗しました: ${queryError.message}`);
        return;
      }

      const rows = Array.isArray(data) ? data : [];
      setRemoteSpots(
        rows.flatMap((row) => {
          const spot = mapSpotRow(row);
          return spot === null ? [] : [spot];
        }),
      );
    } catch (caught) {
      setRemoteSpots([]);
      setError(
        `お気に入りスポットの取得に失敗しました: ${toErrorMessage(caught)}`,
      );
    } finally {
      setLoadingRemote(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const spots = useMemo(() => {
    const byId = new Map<string, Spot>();

    catalogSpots.forEach((spot) => {
      byId.set(spot.id, mapCatalogSpot(spot));
    });
    remoteSpots.forEach((spot) => {
      const current = byId.get(spot.id);
      byId.set(spot.id, {
        ...spot,
        price_range: spot.price_range ?? current?.price_range ?? null,
        image_url: spot.image_url ?? current?.image_url ?? null,
      });
    });

    return favoriteSpotIds.flatMap((spotId) => {
      const spot = byId.get(spotId);
      return spot === undefined ? [] : [spot];
    });
  }, [catalogSpots, favoriteSpotIds, remoteSpots]);

  return {
    spots,
    loading: favoritesLoading || loadingRemote,
    error: spots.length === 0 ? error : null,
    toggleFavorite,
    refetch,
  };
}
