import { useCallback, useEffect } from 'react';
import { useFavoriteStore } from '../store/favoriteStore';

export type UseFavoritesResult = {
  favoriteSpotIds: string[];
  isLoading: boolean;
  isFavorite: (spotId: string) => boolean;
  toggleFavorite: (spotId: string) => Promise<void>;
};

export function useFavorites(): UseFavoritesResult {
  const favoriteSpotIds = useFavoriteStore((state) => state.favoriteSpotIds);
  const status = useFavoriteStore((state) => state.status);
  const hydrate = useFavoriteStore((state) => state.hydrate);
  const toggleFavorite = useFavoriteStore((state) => state.toggleFavorite);
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

  return {
    favoriteSpotIds,
    isLoading: status === 'idle' || status === 'loading',
    isFavorite,
    toggleFavorite: toggle,
  };
}
