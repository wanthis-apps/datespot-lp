import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { showToast } from '@/context/toastStore';

const FAVORITES_STORAGE_KEY = '@datespot/favorite-spots';

type FavoriteStatus = 'idle' | 'loading' | 'ready';

type FavoriteState = {
  favoriteSpotIds: string[];
  status: FavoriteStatus;
  hydrate: () => Promise<void>;
  toggleFavorite: (spotId: string) => Promise<void>;
  removeFavorites: (spotIds: string[]) => Promise<void>;
  replaceFavorites: (spotIds: string[]) => Promise<void>;
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
    const wasFavorite = current.includes(spotId);
    const favoriteSpotIds = wasFavorite
      ? current.filter((id) => id !== spotId)
      : [...current, spotId];

    set({ favoriteSpotIds, status: 'ready' });
    await writeLocalFavorites(favoriteSpotIds);
    showToast({
      message: wasFavorite
        ? 'お気に入りを解除しました'
        : 'お気に入りに追加しました',
      type: 'success',
    });
  },
  removeFavorites: async (spotIds) => {
    const removeSet = new Set(spotIds);
    const favoriteSpotIds = get().favoriteSpotIds.filter(
      (id) => !removeSet.has(id),
    );

    set({ favoriteSpotIds, status: 'ready' });
    await writeLocalFavorites(favoriteSpotIds);
    if (spotIds.length > 0) {
      showToast({
        message: `${spotIds.length}件のお気に入りを削除しました`,
        type: 'success',
      });
    }
  },
  replaceFavorites: async (spotIds) => {
    const favoriteSpotIds = [...new Set(spotIds.filter((id) => id !== ''))];
    set({ favoriteSpotIds, status: 'ready' });
    await writeLocalFavorites(favoriteSpotIds);
  },
}));
