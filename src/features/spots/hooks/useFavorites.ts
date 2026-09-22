import { useCallback, useEffect } from 'react';
import { useFavoriteStore } from '../store/favoriteStore';

export type UseFavoritesResult = {
  favoriteSpotIds: string[];
  isLoading: boolean;
  isFavorite: (spotId: string) => boolean;
  toggleFavorite: (spotId: string) => Promise<void>;
  removeFavorites: (spotIds: string[]) => Promise<void>;
};

export function useFavorites(): UseFavoritesResult {
  const favoriteSpotIds = useFavoriteStore((state) => state.favoriteSpotIds);
  const status = useFavoriteStore((state) => state.status);
  const hydrate = useFavoriteStore((state) => state.hydrate);
  const toggleFavorite = useFavoriteStore((state) => state.toggleFavorite);
  const removeFavorites = useFavoriteStore((state) => state.removeFavorites);
  const isFavorite = useFavoriteStore((state) => state.isFavorite);

  useEffect(() => {
    if (status === 'idle') {
      void hydrate();
    }
  }, [hydrate, status]);

  const toggle = useCallback(
    async (spotId: string) => {
      await toggleFavorite(spotId);
    },
    [toggleFavorite],
  );

  const remove = useCallback(
    async (spotIds: string[]) => {
      await removeFavorites(spotIds);
    },
    [removeFavorites],
  );

  return {
    favoriteSpotIds,
    isLoading: status === 'idle' || status === 'loading',
    isFavorite,
    toggleFavorite: toggle,
    removeFavorites: remove,
  };
}
