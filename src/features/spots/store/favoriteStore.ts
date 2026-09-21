import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

const FAVORITES_STORAGE_KEY = '@datespot/favorite-spots';

type FavoriteStatus = 'idle' | 'loading' | 'ready';

type FavoriteState = {
  favoriteSpotIds: string[];
  status: FavoriteStatus;
  hydrate: () => Promise<void>;
  toggleFavorite: (spotId: string) => Promise<void>;
  isFavorite: (spotId: string) => boolean;
};

async function readLocalFavorites(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
    if (raw === null) {
      return [];
    }

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((value): value is string => typeof value === 'string');
  } catch (error) {
    console.warn('[DateSpot] お気に入りの読み込みに失敗', error);
    return [];
  }
}

async function writeLocalFavorites(ids: string[]): Promise<void> {
  try {
    await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(ids));
  } catch (error) {
    console.warn('[DateSpot] お気に入りの保存に失敗', error);
  }
}

export const useFavoriteStore = create<FavoriteState>((set, get) => ({
  favoriteSpotIds: [],
  status: 'idle',
  isFavorite: (spotId) => get().favoriteSpotIds.includes(spotId),
  hydrate: async () => {
    if (get().status === 'loading') {
      return;
    }

    set({ status: 'loading' });
    const favoriteSpotIds = await readLocalFavorites();
    set({ favoriteSpotIds, status: 'ready' });
  },
  toggleFavorite: async (spotId) => {
    const current = get().favoriteSpotIds;
    const favoriteSpotIds = current.includes(spotId)
      ? current.filter((id) => id !== spotId)
      : [...current, spotId];

    set({ favoriteSpotIds, status: 'ready' });
    await writeLocalFavorites(favoriteSpotIds);
  },
}));
