import { useMemo } from 'react';
import { palettes, type Palette } from '@/theme';
import type { RelationshipStatus, Spot, SpotCategory, TimeOfDay } from '@/types';
import { useFavoriteStore } from '../store/favoriteStore';
import { useSpotFilterStore } from '../store/spotFilterStore';
import { collectAreas, filterSpots } from '../utils/filterSpots';
import { useSpotCatalog } from './useSpotCatalog';

export type HomeScreenViewModel = {
  heading: string;
  timeOfDay: TimeOfDay;
  relationship: RelationshipStatus | null;
  area: string | null;
  areas: string[];
  category: SpotCategory | null;
  query: string;
  favoritesOnly: boolean;
  favoriteSpotIds: string[];
  spots: Spot[];
  palette: Palette;
  isLoading: boolean;
  error: string | null;
  sourceLabel: string;
  emptyMessage: string;
  canReset: boolean;
  setTimeOfDay: (timeOfDay: TimeOfDay) => void;
  setRelationship: (relationship: RelationshipStatus | null) => void;
  setArea: (area: string | null) => void;
  setCategory: (category: SpotCategory | null) => void;
  setQuery: (query: string) => void;
  setFavoritesOnly: (favoritesOnly: boolean) => void;
  resetFilters: () => void;
  reload: () => Promise<void>;
};

export function useHomeScreen(): HomeScreenViewModel {
  const timeOfDay = useSpotFilterStore((state) => state.timeOfDay);
  const relationship = useSpotFilterStore((state) => state.relationship);
  const area = useSpotFilterStore((state) => state.area);
  const category = useSpotFilterStore((state) => state.category);
  const query = useSpotFilterStore((state) => state.query);
  const favoritesOnly = useSpotFilterStore((state) => state.favoritesOnly);
  const setTimeOfDay = useSpotFilterStore((state) => state.setTimeOfDay);
  const setRelationship = useSpotFilterStore((state) => state.setRelationship);
  const setArea = useSpotFilterStore((state) => state.setArea);
  const setCategory = useSpotFilterStore((state) => state.setCategory);
  const setQuery = useSpotFilterStore((state) => state.setQuery);
  const setFavoritesOnly = useSpotFilterStore((state) => state.setFavoritesOnly);
  const resetFilters = useSpotFilterStore((state) => state.resetFilters);
  const favoriteSpotIds = useFavoriteStore((state) => state.favoriteSpotIds);
  const {
    spots: allSpots,
    isLoading,
    error,
    source,
    message,
    reload,
  } = useSpotCatalog();

  const areas = useMemo(() => collectAreas(allSpots), [allSpots]);

  const spots = useMemo(
    () =>
      filterSpots(allSpots, {
        timeOfDay,
        relationship,
        area,
        category,
        query,
        favoritesOnly,
        favoriteSpotIds,
      }),
    [
      allSpots,
      area,
      category,
      favoriteSpotIds,
      favoritesOnly,
      query,
      relationship,
      timeOfDay,
    ],
  );

  const sourceLabel =
    source === null
      ? '読み込み中'
      : source === 'supabase'
        ? `Supabase（${allSpots.length}件）`
        : `モック（${allSpots.length}件）`;

  const canReset =
    relationship !== 'first_date' ||
    area !== null ||
    category !== null ||
    query.trim().length > 0 ||
    favoritesOnly;

  const emptyMessage =
    isLoading
      ? 'スポットを読み込み中です。'
      : error !== null
        ? error
        : allSpots.length === 0
          ? message || 'スポットがありません。'
          : favoritesOnly && favoriteSpotIds.length === 0
            ? 'お気に入りに追加したスポットはまだありません。'
            : 'この条件に合うスポットはまだありません。';

  return {
    heading:
      timeOfDay === 'day'
        ? '今日のデートは、どこにする？'
        : '今夜のデートは、どこにする？',
    timeOfDay,
    relationship,
    area,
    areas,
    category,
    query,
    favoritesOnly,
    favoriteSpotIds,
    spots,
    palette: palettes[timeOfDay],
    isLoading,
    error,
    sourceLabel,
    emptyMessage,
    canReset,
    setTimeOfDay,
    setRelationship,
    setArea,
    setCategory,
    setQuery,
    setFavoritesOnly,
    resetFilters,
    reload,
  };
}
