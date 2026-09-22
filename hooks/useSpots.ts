import { useCallback, useEffect, useMemo, useState } from 'react';
import { getSupabaseClient } from '@/services/supabase';
import type { Spot, SpotCategory } from '../types/database';
import { mapSpotRow, toErrorMessage } from './mapRecords';
import { applySearchAndSort, type SpotSortBy } from './spotQuery';

export type { SpotSortBy } from './spotQuery';

export type UseSpotsResult = {
  spots: Spot[];
  loading: boolean;
  error: string | null;
  selectedCategory: SpotCategory | null;
  selectedPriceRange: number | null;
  searchQuery: string;
  sortBy: SpotSortBy;
  setSelectedCategory: (category: SpotCategory | null) => void;
  setSelectedPriceRange: (priceRange: number | null) => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sortBy: SpotSortBy) => void;
  refetch: () => Promise<void>;
};

export function useSpots(): UseSpotsResult {
  const [allSpots, setAllSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] =
    useState<SpotCategory | null>(null);
  const [selectedPriceRange, setSelectedPriceRange] = useState<number | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SpotSortBy>('default');

  const refetch = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);

    const client = getSupabaseClient();
    if (client === null) {
      setAllSpots([]);
      setError('Supabase が未設定のため、スポットを取得できません。');
      setLoading(false);
      return;
    }

    try {
      const { data, error: queryError } = await client.from('spots').select('*');
      if (queryError !== null) {
        setAllSpots([]);
        setError(`スポットの取得に失敗しました: ${queryError.message}`);
        return;
      }

      const rows = Array.isArray(data) ? data : [];
      setAllSpots(
        rows.flatMap((row) => {
          const spot = mapSpotRow(row);
          return spot === null ? [] : [spot];
        }),
      );
    } catch (caught) {
      setAllSpots([]);
      setError(`スポットの取得に失敗しました: ${toErrorMessage(caught)}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const spots = useMemo(() => {
    const filtered = allSpots.filter((spot) => {
      if (selectedCategory !== null && spot.category !== selectedCategory) {
        return false;
      }

      if (
        selectedPriceRange !== null &&
        spot.price_range !== selectedPriceRange
      ) {
        return false;
      }

      return true;
    });

    return applySearchAndSort(filtered, searchQuery, sortBy);
  }, [allSpots, searchQuery, selectedCategory, selectedPriceRange, sortBy]);

  return {
    spots,
    loading,
    error,
    selectedCategory,
    selectedPriceRange,
    searchQuery,
    sortBy,
    setSelectedCategory,
    setSelectedPriceRange,
    setSearchQuery,
    setSortBy,
    refetch,
  };
}
