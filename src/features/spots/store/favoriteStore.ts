import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { showToast } from '@/context/toastStore';
import {
  deleteFavorite,
  deleteFavorites,
  fetchFavoriteSpotIds,
  insertFavorite,
  type FavoriteRemoteResult,
} from '../api/favoriteRepository';

const FAVORITES_STORAGE_KEY = '@datespot/favorite-spots';

type FavoriteStatus = 'idle' | 'loading' | 'ready';

type FavoriteState = {
  favoriteSpotIds: string[];
  status: FavoriteStatus;
  error: string | null;
  hydrate: () => Promise<void>;
  addFavorite: (spotId: string, options?: { silent?: boolean }) => Promise<void>;
  removeFavorite: (spotId: string) => Promise<void>;
  toggleFavorite: (spotId: string) => Promise<void>;
  removeFavorites: (spotIds: string[]) => Promise<void>;
  replaceFavorites: (spotIds: string[]) => Promise<void>;
  clearLocal: () => Promise<void>;
  isFavorite: (spotId: string) => boolean;
};

const toggleGeneration = new Map<string, number>();

function nextGeneration(spotId: string): number {
  const generation = (toggleGeneration.get(spotId) ?? 0) + 1;
  toggleGeneration.set(spotId, generation);
  return generation;
}

function isCurrentGeneration(spotId: string, generation: number): boolean {
  return toggleGeneration.get(spotId) === generation;
}

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

function uniqueIds(ids: readonly string[]): string[] {
  return [...new Set(ids.filter((id) => id !== ''))];
}

export const useFavoriteStore = create<FavoriteState>((set, get) => ({
  favoriteSpotIds: [],
  status: 'idle',
  error: null,
  isFavorite: (spotId) => get().favoriteSpotIds.includes(spotId),
  hydrate: async () => {
    if (get().status === 'loading') {
      return;
    }

    set({ status: 'loading', error: null });
    const localIds = await readLocalFavorites();
    set({ favoriteSpotIds: localIds });

    const remoteIds = await fetchFavoriteSpotIds();
    if (get().status !== 'loading') {
      return;
    }

    if (remoteIds !== null) {
      set({ favoriteSpotIds: remoteIds, status: 'ready', error: null });
      await writeLocalFavorites(remoteIds);
      return;
    }

    set({ status: 'ready' });
  },
  addFavorite: async (spotId, options) => {
    if (spotId === '' || get().favoriteSpotIds.includes(spotId)) {
      return;
    }

    const generation = nextGeneration(spotId);
    const previous = get().favoriteSpotIds;
    const favoriteSpotIds = [spotId, ...previous];
    set({ favoriteSpotIds, status: 'ready', error: null });
    await writeLocalFavorites(favoriteSpotIds);

    const result = await insertFavorite(spotId);
    if (!isCurrentGeneration(spotId, generation)) {
      return;
    }

    applyRemoteResult(
      set,
      get,
      previous,
      result,
      options?.silent === true ? '' : 'お気に入りに追加しました',
    );
  },
  removeFavorite: async (spotId) => {
    if (!get().favoriteSpotIds.includes(spotId)) {
      return;
    }

    const generation = nextGeneration(spotId);
    const previous = get().favoriteSpotIds;
    const favoriteSpotIds = previous.filter((id) => id !== spotId);
    set({ favoriteSpotIds, status: 'ready', error: null });
    await writeLocalFavorites(favoriteSpotIds);

    const result = await deleteFavorite(spotId);
    if (!isCurrentGeneration(spotId, generation)) {
      return;
    }

    applyRemoteResult(set, get, previous, result, 'お気に入りを解除しました', {
      label: '元に戻す',
      run: () => {
        void get().addFavorite(spotId, { silent: true });
      },
    });
  },
  toggleFavorite: async (spotId) => {
    if (get().favoriteSpotIds.includes(spotId)) {
      await get().removeFavorite(spotId);
      return;
    }

    await get().addFavorite(spotId);
  },
  removeFavorites: async (spotIds) => {
    const removeSet = new Set(spotIds);
    if (removeSet.size === 0) {
      return;
    }

    const previous = get().favoriteSpotIds;
    const favoriteSpotIds = previous.filter((id) => !removeSet.has(id));
    set({ favoriteSpotIds, status: 'ready', error: null });
    await writeLocalFavorites(favoriteSpotIds);

    const removedIds = [...removeSet];
    const result = await deleteFavorites(removedIds);
    applyRemoteResult(
      set,
      get,
      previous,
      result,
      `${removedIds.length}件のお気に入りを削除しました`,
      {
        label: '元に戻す',
        run: () => {
          removedIds.forEach((id) => {
            void get().addFavorite(id, { silent: true });
          });
        },
      },
    );
  },
  clearLocal: async () => {
    toggleGeneration.clear();
    set({ favoriteSpotIds: [], status: 'ready', error: null });
    await writeLocalFavorites([]);
  },
  replaceFavorites: async (spotIds) => {
    const favoriteSpotIds = uniqueIds(spotIds);
    const previous = get().favoriteSpotIds;
    set({ favoriteSpotIds, status: 'ready', error: null });
    await writeLocalFavorites(favoriteSpotIds);

    const removed = previous.filter((id) => !favoriteSpotIds.includes(id));
    const added = favoriteSpotIds.filter((id) => !previous.includes(id));
    const deleteResult = await deleteFavorites(removed);
    if (deleteResult.status === 'failed') {
      applyRemoteResult(set, get, previous, deleteResult, '');
      return;
    }

    for (const spotId of added) {
      const insertResult = await insertFavorite(spotId);
      if (insertResult.status === 'failed') {
        applyRemoteResult(set, get, previous, insertResult, '');
        return;
      }
    }
  },
}));

function applyRemoteResult(
  set: (
    partial: Partial<Pick<FavoriteState, 'favoriteSpotIds' | 'error' | 'status'>>,
  ) => void,
  get: () => FavoriteState,
  previous: string[],
  result: FavoriteRemoteResult,
  successMessage: string,
  undo?: { label: string; run: () => void },
): void {
  if (result.status === 'failed') {
    console.error('[DateSpot] favorites sync failed', result.message);
    set({ favoriteSpotIds: previous, error: result.message, status: 'ready' });
    void writeLocalFavorites(previous);
    showToast({
      message: '通信に失敗したため、元に戻しました',
      type: 'error',
    });
    return;
  }

  if (successMessage !== '') {
    showToast({
      message: successMessage,
      type: 'success',
      durationMs: undo === undefined ? undefined : 5200,
      actionLabel: undo?.label,
      onAction: undo?.run,
    });
  }

  void writeLocalFavorites(get().favoriteSpotIds);
}
