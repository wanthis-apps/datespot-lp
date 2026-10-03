import { useCallback, useEffect, useRef } from 'react';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useFavoriteStore } from '../store/favoriteStore';

export type UseFavoritesResult = {
  favoriteSpotIds: string[];
  isLoading: boolean;
  error: string | null;
  isFavorite: (spotId: string) => boolean;
  addFavorite: (spotId: string) => Promise<void>;
  removeFavorite: (spotId: string) => Promise<void>;
  toggleFavorite: (spotId: string) => Promise<void>;
  removeFavorites: (spotIds: string[]) => Promise<void>;
};

export function useFavorites(): UseFavoritesResult {
  const favoriteSpotIds = useFavoriteStore((state) => state.favoriteSpotIds);
  const status = useFavoriteStore((state) => state.status);
  const error = useFavoriteStore((state) => state.error);
  const hydrate = useFavoriteStore((state) => state.hydrate);
  const addFavorite = useFavoriteStore((state) => state.addFavorite);
  const removeFavorite = useFavoriteStore((state) => state.removeFavorite);
  const toggleFavorite = useFavoriteStore((state) => state.toggleFavorite);
  const removeFavorites = useFavoriteStore((state) => state.removeFavorites);
  const isFavorite = useFavoriteStore((state) => state.isFavorite);

  const signedInUserId = useAuthStore((state) => {
    const current = state.user;
    if (
      current === null ||
      current.is_anonymous === true ||
      current.email === undefined
    ) {
      return null;
    }
    return current.id;
  });
  const signedInUserIdRef = useRef<string | null>(signedInUserId);

  useEffect(() => {
    if (status === 'idle') {
      void hydrate();
    }
  }, [hydrate, status]);

  useEffect(() => {
    const previousUserId = signedInUserIdRef.current;
    signedInUserIdRef.current = signedInUserId;
    if (previousUserId === signedInUserId || signedInUserId === null) {
      return;
    }

    void hydrate();
  }, [hydrate, signedInUserId]);

  const add = useCallback(
    async (spotId: string) => {
      await addFavorite(spotId);
    },
    [addFavorite],
  );

  const remove = useCallback(
    async (spotId: string) => {
      await removeFavorite(spotId);
    },
    [removeFavorite],
  );

  const toggle = useCallback(
    async (spotId: string) => {
      await toggleFavorite(spotId);
    },
    [toggleFavorite],
  );

  const removeMany = useCallback(
    async (spotIds: string[]) => {
      await removeFavorites(spotIds);
    },
    [removeFavorites],
  );

  return {
    favoriteSpotIds,
    isLoading: status === 'idle' || status === 'loading',
    error,
    isFavorite,
    addFavorite: add,
    removeFavorite: remove,
    toggleFavorite: toggle,
    removeFavorites: removeMany,
  };
}
