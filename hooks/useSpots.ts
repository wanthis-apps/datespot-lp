import { useCallback, useEffect, useMemo, useState } from 'react';
import { useArea } from '@/context';
import { getSupabaseClient } from '@/services/supabase';
import type { Spot, SpotCategory } from '../types/database';
import {
  notifyOfflineCache,
  readCachedSpots,
  writeCachedSpots,
} from './dataCache';
import {
  DEFAULT_FILTER_SETTINGS,
  readFilterSettings,
  writeFilterSettings,
} from './filterSettings';
import { haversineKm } from './geo';
import { mapSpotRow, toErrorMessage } from './mapRecords';
import { applySearchAndSort, type SpotSortBy } from './spotQuery';
import {
  matchesSelectedTags,
  type TagMatchMode,
} from './spotTags';

export type { SpotSortBy } from './spotQuery';
export type { TagMatchMode } from './spotTags';

export type UseSpotsResult = {
  spots: Spot[];
  loading: boolean;
  error: string | null;
  selectedCategory: SpotCategory | null;
  selectedPriceRange: number | null;
  selectedTags: string[];
  tagMatchMode: TagMatchMode;
  searchQuery: string;
  sortBy: SpotSortBy;
  hasActiveFilters: boolean;
  setSelectedCategory: (category: SpotCategory | null) => void;
  setSelectedPriceRange: (priceRange: number | null) => void;
  setSelectedTags: (tags: string[]) => void;
  setTagMatchMode: (mode: TagMatchMode) => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sortBy: SpotSortBy) => void;
  resetFilters: () => void;
  refetch: () => Promise<void>;
};

export function useSpots(): UseSpotsResult {
  const { area, setArea } = useArea();
  const [allSpots, setAllSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [selectedCategory, setSelectedCategoryState] =
    useState<SpotCategory | null>(DEFAULT_FILTER_SETTINGS.selectedCategory);
  const [selectedPriceRange, setSelectedPriceRangeState] = useState<
    number | null
  >(DEFAULT_FILTER_SETTINGS.selectedPriceRange);
  const [selectedTags, setSelectedTagsState] = useState<string[]>(
    DEFAULT_FILTER_SETTINGS.selectedTags,
  );
  const [tagMatchMode, setTagMatchModeState] = useState<TagMatchMode>(
    DEFAULT_FILTER_SETTINGS.tagMatchMode,
  );
  const [searchQuery, setSearchQueryState] = useState(
    DEFAULT_FILTER_SETTINGS.searchQuery,
  );
  const [sortBy, setSortByState] = useState<SpotSortBy>(
    DEFAULT_FILTER_SETTINGS.sortBy,
  );

  const refetch = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);

    const applyCache = async (reason: string): Promise<void> => {
      const cached = await readCachedSpots();
      if (cached.length > 0) {
        setAllSpots(cached);
        setError(null);
        notifyOfflineCache();
        return;
      }

      setAllSpots([]);
      setError(reason);
    };

    const client = getSupabaseClient();
    if (client === null) {
      await applyCache('Supabase が未設定のため、スポットを取得できません。');
      setLoading(false);
      return;
    }

    try {
      const { data, error: queryError } = await client.from('spots').select('*');
      if (queryError !== null) {
        await applyCache(`スポットの取得に失敗しました: ${queryError.message}`);
        return;
      }

      const rows = Array.isArray(data) ? data : [];
      const mapped = rows.flatMap((row) => {
        const spot = mapSpotRow(row);
        return spot === null ? [] : [spot];
      });
      setAllSpots(mapped);
      if (mapped.length > 0) {
        await writeCachedSpots(mapped);
      }
    } catch (caught) {
      await applyCache(
        `スポットの取得に失敗しました: ${toErrorMessage(caught)}`,
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  useEffect(() => {
    void readFilterSettings().then((settings) => {
      if (settings !== null) {
        setSelectedCategoryState(settings.selectedCategory);
        setSelectedPriceRangeState(settings.selectedPriceRange);
        setSelectedTagsState(settings.selectedTags);
        setTagMatchModeState(settings.tagMatchMode);
        setSearchQueryState(settings.searchQuery);
        setSortByState(settings.sortBy);
        setArea(settings.areaId);
      }
      setHydrated(true);
    });
  }, [setArea]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    void writeFilterSettings({
      areaId: area.id,
      selectedCategory,
      selectedPriceRange,
      selectedTags,
      tagMatchMode,
      searchQuery,
      sortBy,
    });
  }, [
    area.id,
    hydrated,
    searchQuery,
    selectedCategory,
    selectedPriceRange,
    selectedTags,
    sortBy,
    tagMatchMode,
  ]);

  const origin = useMemo(
    () => ({
      latitude: area.latitude,
      longitude: area.longitude,
    }),
    [area.latitude, area.longitude],
  );

  const facetedSpots = useMemo(() => {
    return allSpots.filter((spot) => {
      if (selectedCategory !== null && spot.category !== selectedCategory) {
        return false;
      }

      if (
        selectedPriceRange !== null &&
        spot.price_range !== selectedPriceRange
      ) {
        return false;
      }

      return matchesSelectedTags(spot, selectedTags, tagMatchMode);
    });
  }, [allSpots, selectedCategory, selectedPriceRange, selectedTags, tagMatchMode]);

  const spots = useMemo(() => {
    return applySearchAndSort(facetedSpots, searchQuery, sortBy, origin).map(
      (spot) => ({
        ...spot,
        distance_km: haversineKm(origin, {
          latitude: spot.latitude,
          longitude: spot.longitude,
        }),
      }),
    );
  }, [facetedSpots, origin, searchQuery, sortBy]);

  const setSelectedCategory = useCallback((category: SpotCategory | null) => {
    setSelectedCategoryState(category);
  }, []);

  const setSelectedPriceRange = useCallback((priceRange: number | null) => {
    setSelectedPriceRangeState(priceRange);
  }, []);

  const setSelectedTags = useCallback((tags: string[]) => {
    setSelectedTagsState(tags);
  }, []);

  const setTagMatchMode = useCallback((mode: TagMatchMode) => {
    setTagMatchModeState(mode);
  }, []);

  const setSearchQuery = useCallback((query: string) => {
    setSearchQueryState(query);
  }, []);

  const setSortBy = useCallback((next: SpotSortBy) => {
    setSortByState(next);
  }, []);

  const resetFilters = useCallback((): void => {
    setSelectedCategoryState(DEFAULT_FILTER_SETTINGS.selectedCategory);
    setSelectedPriceRangeState(DEFAULT_FILTER_SETTINGS.selectedPriceRange);
    setSelectedTagsState(DEFAULT_FILTER_SETTINGS.selectedTags);
    setTagMatchModeState(DEFAULT_FILTER_SETTINGS.tagMatchMode);
    setSearchQueryState(DEFAULT_FILTER_SETTINGS.searchQuery);
    setSortByState(DEFAULT_FILTER_SETTINGS.sortBy);
    setArea(DEFAULT_FILTER_SETTINGS.areaId);
  }, [setArea]);

  const hasActiveFilters = useMemo(() => {
    return (
      area.id !== DEFAULT_FILTER_SETTINGS.areaId ||
      selectedCategory !== null ||
      selectedPriceRange !== null ||
      selectedTags.length > 0 ||
      tagMatchMode !== DEFAULT_FILTER_SETTINGS.tagMatchMode ||
      searchQuery.trim() !== '' ||
      sortBy !== DEFAULT_FILTER_SETTINGS.sortBy
    );
  }, [
    area.id,
    searchQuery,
    selectedCategory,
    selectedPriceRange,
    selectedTags.length,
    sortBy,
    tagMatchMode,
  ]);

  return {
    spots,
    loading,
    error,
    selectedCategory,
    selectedPriceRange,
    selectedTags,
    tagMatchMode,
    searchQuery,
    sortBy,
    hasActiveFilters,
    setSelectedCategory,
    setSelectedPriceRange,
    setSelectedTags,
    setTagMatchMode,
    setSearchQuery,
    setSortBy,
    resetFilters,
    refetch,
  };
}
