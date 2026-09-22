import { useCallback, useMemo, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useCouponUsage } from '@/features/coupons';
import { useAppTheme } from '@/context';
import { useFavorites, useSpotCatalogStore } from '@/features/spots';
import type { Palette } from '@/theme';

export type ProfileUser = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
};

export type UseProfileScreenResult = {
  profile: ProfileUser;
  isDark: boolean;
  palette: Palette;
  favoriteCount: number;
  usedCouponCount: number;
  isSyncing: boolean;
  isGuest: boolean;
  isEmailUser: boolean;
  updateDisplayName: (name: string) => void;
  resync: () => Promise<void>;
  logout: () => Promise<void>;
};

const FALLBACK_PROFILE: ProfileUser = {
  id: 'guest',
  name: 'ゲスト',
  email: 'guest@datespot.app',
  avatarUrl: null,
};

function readMetadataString(
  metadata: User['user_metadata'],
  key: string,
): string | null {
  const value = metadata[key];
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

function toDisplayName(user: User): string {
  const fullName = readMetadataString(user.user_metadata, 'full_name');
  if (fullName !== null) {
    return fullName;
  }

  const email = user.email;
  if (email !== undefined && email.includes('@')) {
    const localPart = email.split('@')[0];
    if (localPart !== undefined && localPart !== '') {
      return localPart;
    }
  }

  return FALLBACK_PROFILE.name;
}

export function useProfileScreen(): UseProfileScreenResult {
  const { user, isGuest, isEmailUser, reload: reloadAuth, signOut } = useAuth();
  const { favoriteSpotIds } = useFavorites();
  const { history, reload: reloadUsage } = useCouponUsage();
  const loadSpots = useSpotCatalogStore((state) => state.loadSpots);
  const { isDark, palette } = useAppTheme();
  const [isSyncing, setIsSyncing] = useState(false);
  const [editedName, setEditedName] = useState<string | null>(null);

  const profile = useMemo((): ProfileUser => {
    if (user === null) {
      return {
        ...FALLBACK_PROFILE,
        name: editedName ?? FALLBACK_PROFILE.name,
      };
    }

    return {
      id: user.id,
      name: editedName ?? toDisplayName(user),
      email: user.email ?? FALLBACK_PROFILE.email,
      avatarUrl: readMetadataString(user.user_metadata, 'avatar_url'),
    };
  }, [editedName, user]);

  const updateDisplayName = useCallback((name: string): void => {
    const trimmed = name.trim();
    setEditedName(trimmed === '' ? null : trimmed);
  }, []);

  const resync = useCallback(async (): Promise<void> => {
    setIsSyncing(true);
    try {
      await Promise.all([reloadAuth(), loadSpots(), reloadUsage()]);
    } finally {
      setIsSyncing(false);
    }
  }, [loadSpots, reloadAuth, reloadUsage]);

  const logout = useCallback(async (): Promise<void> => {
    await signOut();
    setEditedName(null);
    console.log('[DateSpot] logout confirmed');
  }, [signOut]);

  return {
    profile,
    isDark,
    palette,
    favoriteCount: favoriteSpotIds.length,
    usedCouponCount: history.length,
    isSyncing,
    isGuest,
    isEmailUser,
    updateDisplayName,
    resync,
    logout,
  };
}
