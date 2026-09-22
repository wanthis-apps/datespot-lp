import { useCallback, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { useSpotCatalogStore } from '@/features/spots/store/spotCatalogStore';
import type { Spot } from '../types/database';
import { mapCatalogSpot } from './mapRecords';

const RECENTLY_VIEWED_KEY = '@datespot/recently-viewed';
const MAX_RECENTLY_VIEWED = 16;

export type UseRecentlyViewedResult = {
  recentlyViewedIds: string[];
  recentlyViewedSpots: Spot[];
  addRecentlyViewed: (spotId: string) => void;
};

type RecentlyViewedState = {
  ids: string[];
  hydrated: boolean;
  hydrate: () => Promise<void>;
  addRecentlyViewed: (spotId: string) => void;
  replaceIds: (spotIds: string[]) => void;
};

function parseIds(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === 'string' && item !== '');
}

function prependUnique(ids: string[], spotId: string): string[] {
  return [spotId, ...ids.filter((id) => id !== spotId)].slice(
    0,
    MAX_RECENTLY_VIEWED,
  );
}

export const useRecentlyViewedStore = create<RecentlyViewedState>((set, get) => ({
  ids: [],
  hydrated: false,
  hydrate: async () => {
    if (get().hydrated) {
      return;
    }

    try {
      const raw = await AsyncStorage.getItem(RECENTLY_VIEWED_KEY);
      const parsed: unknown = raw === null ? [] : JSON.parse(raw);
      set({ ids: parseIds(parsed), hydrated: true });
    } catch (error) {
      console.warn('[DateSpot] 閲覧履歴の読み込みに失敗', error);
      set({ ids: [], hydrated: true });
    }
  },
  addRecentlyViewed: (spotId) => {
    const trimmed = spotId.trim();
    if (trimmed === '') {
      return;
    }

    const next = prependUnique(get().ids, trimmed);
    set({ ids: next, hydrated: true });
    void AsyncStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(next));
  },
  replaceIds: (spotIds) => {
    const next = parseIds(spotIds).slice(0, MAX_RECENTLY_VIEWED);
    set({ ids: next, hydrated: true });
    void AsyncStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(next));
  },
}));

export function useRecentlyViewed(): UseRecentlyViewedResult {
  const ids = useRecentlyViewedStore((state) => state.ids);
  const hydrated = useRecentlyViewedStore((state) => state.hydrated);
  const hydrate = useRecentlyViewedStore((state) => state.hydrate);
  const addRecentlyViewed = useRecentlyViewedStore(
    (state) => state.addRecentlyViewed,
  );
  const catalogSpots = useSpotCatalogStore((state) => state.spots);

  useEffect(() => {
    if (!hydrated) {
      void hydrate();
    }
  }, [hydrate, hydrated]);

  const recentlyViewedSpots = useMemo(() => {
    const byId = new Map<string, Spot>();
    catalogSpots.forEach((spot) => {
      byId.set(spot.id, mapCatalogSpot(spot));
    });

    return ids.flatMap((id) => {
      const spot = byId.get(id);
      return spot === undefined ? [] : [spot];
    });
  }, [catalogSpots, ids]);

  const add = useCallback(
    (spotId: string) => {
      addRecentlyViewed(spotId);
    },
    [addRecentlyViewed],
  );

  return {
    recentlyViewedIds: ids,
    recentlyViewedSpots,
    addRecentlyViewed: add,
  };
}
