import { create } from 'zustand';
import type { RelationshipStatus, SpotCategory, TimeOfDay } from '@/types';

type SpotFilterState = {
  timeOfDay: TimeOfDay;
  relationship: RelationshipStatus | null;
  area: string | null;
  category: SpotCategory | null;
  query: string;
  favoritesOnly: boolean;
  setTimeOfDay: (timeOfDay: TimeOfDay) => void;
  setRelationship: (relationship: RelationshipStatus | null) => void;
  setArea: (area: string | null) => void;
  setCategory: (category: SpotCategory | null) => void;
  setQuery: (query: string) => void;
  setFavoritesOnly: (favoritesOnly: boolean) => void;
  resetFilters: () => void;
};

function getDefaultTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours();
  return hour >= 6 && hour < 18 ? 'day' : 'night';
}

const DEFAULT_RELATIONSHIP: RelationshipStatus = 'first_date';

export const useSpotFilterStore = create<SpotFilterState>((set) => ({
  timeOfDay: getDefaultTimeOfDay(),
  relationship: DEFAULT_RELATIONSHIP,
  area: null,
  category: null,
  query: '',
  favoritesOnly: false,
  setTimeOfDay: (timeOfDay) => set({ timeOfDay }),
  setRelationship: (relationship) => set({ relationship }),
  setArea: (area) => set({ area }),
  setCategory: (category) => set({ category }),
  setQuery: (query) => set({ query }),
  setFavoritesOnly: (favoritesOnly) => set({ favoritesOnly }),
  resetFilters: () =>
    set({
      relationship: DEFAULT_RELATIONSHIP,
      area: null,
      category: null,
      query: '',
      favoritesOnly: false,
    }),
}));
