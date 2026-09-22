import { useCallback, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { showToast } from '@/context/toastStore';
import { useAuth } from '@/features/auth';
import { getSupabaseClient } from '@/services/supabase';
import type {
  NotificationPreferenceKey,
  NotificationPreferences,
} from '../types/database';

const STORAGE_KEY = '@datespot/notification-preferences';

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  couponExpiry: true,
  favoriteReviews: true,
  planUpdates: true,
  promotions: true,
};

export const NOTIFICATION_SETTING_ITEMS: ReadonlyArray<{
  key: NotificationPreferenceKey;
  emoji: string;
  title: string;
  subtitle: string;
}> = [
  {
    key: 'couponExpiry',
    emoji: '🎟',
    title: 'クーポン有効期限のお知らせ',
    subtitle: '期限が近いクーポンをリマインドします',
  },
  {
    key: 'favoriteReviews',
    emoji: '📍',
    title: 'お気に入りスポットの新着口コミ・写真',
    subtitle: '保存したスポットの更新を届けます',
  },
  {
    key: 'planUpdates',
    emoji: '🗺',
    title: 'おすすめデートプランの更新',
    subtitle: '新しいコース提案を受け取ります',
  },
  {
    key: 'promotions',
    emoji: '📣',
    title: 'アプリからのお知らせ・プロモーション',
    subtitle: 'キャンペーンや重要なお知らせです',
  },
];

type NotificationSettingsState = {
  preferences: NotificationPreferences;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setPreference: (
    key: NotificationPreferenceKey,
    enabled: boolean,
  ) => Promise<void>;
  resetDefaults: () => Promise<void>;
};

function parsePreferences(value: unknown): NotificationPreferences {
  if (typeof value !== 'object' || value === null) {
    return { ...DEFAULT_NOTIFICATION_PREFERENCES };
  }

  const record = value as Record<string, unknown>;
  return {
    couponExpiry:
      typeof record.couponExpiry === 'boolean'
        ? record.couponExpiry
        : DEFAULT_NOTIFICATION_PREFERENCES.couponExpiry,
    favoriteReviews:
      typeof record.favoriteReviews === 'boolean'
        ? record.favoriteReviews
        : DEFAULT_NOTIFICATION_PREFERENCES.favoriteReviews,
    planUpdates:
      typeof record.planUpdates === 'boolean'
        ? record.planUpdates
        : DEFAULT_NOTIFICATION_PREFERENCES.planUpdates,
    promotions:
      typeof record.promotions === 'boolean'
        ? record.promotions
        : DEFAULT_NOTIFICATION_PREFERENCES.promotions,
  };
}

function mapRemotePreferences(row: unknown): NotificationPreferences | null {
  if (typeof row !== 'object' || row === null) {
    return null;
  }

  const record = row as Record<string, unknown>;
  return {
    couponExpiry:
      typeof record.coupon_expiry === 'boolean'
        ? record.coupon_expiry
        : DEFAULT_NOTIFICATION_PREFERENCES.couponExpiry,
    favoriteReviews:
      typeof record.favorite_reviews === 'boolean'
        ? record.favorite_reviews
        : DEFAULT_NOTIFICATION_PREFERENCES.favoriteReviews,
    planUpdates:
      typeof record.plan_updates === 'boolean'
        ? record.plan_updates
        : DEFAULT_NOTIFICATION_PREFERENCES.planUpdates,
    promotions:
      typeof record.promotions === 'boolean'
        ? record.promotions
        : DEFAULT_NOTIFICATION_PREFERENCES.promotions,
  };
}

async function persistLocal(
  preferences: NotificationPreferences,
): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.warn('[DateSpot] 通知設定の保存に失敗', error);
  }
}

async function persistRemote(
  userId: string,
  preferences: NotificationPreferences,
): Promise<void> {
  const client = getSupabaseClient();
  if (client === null) {
    return;
  }

  try {
    const { error } = await client.from('notification_settings').upsert({
      user_id: userId,
      coupon_expiry: preferences.couponExpiry,
      favorite_reviews: preferences.favoriteReviews,
      plan_updates: preferences.planUpdates,
      promotions: preferences.promotions,
      updated_at: new Date().toISOString(),
    });

    if (error !== null) {
      console.warn('[DateSpot] 通知設定の同期に失敗', error.message);
    }
  } catch (caught) {
    console.warn('[DateSpot] 通知設定の同期に失敗', caught);
  }
}

export const useNotificationSettingsStore = create<NotificationSettingsState>(
  (set, get) => ({
    preferences: { ...DEFAULT_NOTIFICATION_PREFERENCES },
    hydrated: false,
    hydrate: async () => {
      if (get().hydrated) {
        return;
      }

      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        const parsed: unknown = raw === null ? {} : JSON.parse(raw);
        set({ preferences: parsePreferences(parsed), hydrated: true });
      } catch (error) {
        console.warn('[DateSpot] 通知設定の読み込みに失敗', error);
        set({
          preferences: { ...DEFAULT_NOTIFICATION_PREFERENCES },
          hydrated: true,
        });
      }
    },
    setPreference: async (key, enabled) => {
      const preferences = { ...get().preferences, [key]: enabled };
      set({ preferences, hydrated: true });
      await persistLocal(preferences);
    },
    resetDefaults: async () => {
      const preferences = { ...DEFAULT_NOTIFICATION_PREFERENCES };
      set({ preferences, hydrated: true });
      await persistLocal(preferences);
    },
  }),
);

export type UseNotificationSettingsResult = {
  preferences: NotificationPreferences;
  enabledCount: number;
  anyEnabled: boolean;
  hydrated: boolean;
  setPreference: (
    key: NotificationPreferenceKey,
    enabled: boolean,
  ) => Promise<void>;
};

export function useNotificationSettings(): UseNotificationSettingsResult {
  const { userId } = useAuth();
  const preferences = useNotificationSettingsStore(
    (state) => state.preferences,
  );
  const hydrated = useNotificationSettingsStore((state) => state.hydrated);
  const hydrate = useNotificationSettingsStore((state) => state.hydrate);
  const setStorePreference = useNotificationSettingsStore(
    (state) => state.setPreference,
  );

  useEffect(() => {
    if (!hydrated) {
      void hydrate();
    }
  }, [hydrate, hydrated]);

  useEffect(() => {
    if (!hydrated || userId === null) {
      return;
    }

    const client = getSupabaseClient();
    if (client === null) {
      return;
    }

    void client
      .from('notification_settings')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error !== null || data === null) {
          void persistRemote(userId, useNotificationSettingsStore.getState().preferences);
          return;
        }

        const remote = mapRemotePreferences(data);
        if (remote === null) {
          return;
        }

        useNotificationSettingsStore.setState({
          preferences: remote,
          hydrated: true,
        });
        void persistLocal(remote);
      });
  }, [hydrated, userId]);

  const setPreference = useCallback(
    async (key: NotificationPreferenceKey, enabled: boolean) => {
      await setStorePreference(key, enabled);
      if (userId !== null) {
        await persistRemote(
          userId,
          useNotificationSettingsStore.getState().preferences,
        );
      }
      showToast({
        message: enabled ? '通知設定をオンにしました' : '通知設定をオフにしました',
        type: 'success',
      });
    },
    [setStorePreference, userId],
  );

  const enabledCount = useMemo(
    () => Object.values(preferences).filter((value) => value).length,
    [preferences],
  );

  return {
    preferences,
    enabledCount,
    anyEnabled: enabledCount > 0,
    hydrated,
    setPreference,
  };
}
