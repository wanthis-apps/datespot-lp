import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFavorites } from '@/features/spots/hooks/useFavorites';
import { useSpotCatalogStore } from '@/features/spots/store/spotCatalogStore';
import { getSupabaseClient } from '@/services/supabase';
import type { Spot } from '../types/database';
import {
  notifyOfflineCache,
  readCachedSpots,
  writeCachedSpots,
} from './dataCache';
import { mapCatalogSpot, mapSpotRow, toErrorMessage } from './mapRecords';

export type UseFavoriteSpotsResult = {
  spots: Spot[];
  loading: boolean;
  error: string | null;
  toggleFavorite: (spotId: string) => Promise<void>;
  removeFavorites: (spotIds: string[]) => Promise<void>;
  refetch: () => Promise<void>;
};

export function useFavoriteSpots(): UseFavoriteSpotsResult {
  const catalogSpots = useSpotCatalogStore((state) => state.spots);
  const {
    favoriteSpotIds,
    isLoading: favoritesLoading,
    toggleFavorite,
    removeFavorites,
  } = useFavorites();
  const [remoteSpots, setRemoteSpots] = useState<Spot[]>([]);
  const [loadingRemote, setLoadingRemote] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async (): Promise<void> => {
    setLoadingRemote(true);
    setError(null);

    const applyCache = async (reason: string | null): Promise<void> => {
      const cached = await readCachedSpots();
      if (cached.length > 0) {
        setRemoteSpots(cached);
        setError(null);
        notifyOfflineCache();
        return;
      }

      setRemoteSpots([]);
      setError(reason);
    };

    const client = getSupabaseClient();
    if (client === null) {
      await applyCache(null);
      setLoadingRemote(false);
      return;
    }

    try {
      const { data, error: queryError } = await client.from('spots').select('*');
      if (queryError !== null) {
        await applyCache(
          `お気に入りスポットの取得に失敗しました: ${queryError.message}`,
        );
        return;
      }

      const rows = Array.isArray(data) ? data : [];
      const mapped = rows.flatMap((row) => {
        const spot = mapSpotRow(row);
        return spot === null ? [] : [spot];
      });
      setRemoteSpots(mapped);
      if (mapped.length > 0) {
        await writeCachedSpots(mapped);
      }
    } catch (caught) {
      await applyCache(
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
    removeFavorites,
    refetch,
  };
}
