import { useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

const ONBOARDING_STORAGE_KEY = '@datespot/onboarding-completed';

export type UseOnboardingResult = {
  completed: boolean;
  hydrated: boolean;
  complete: () => Promise<void>;
};

type OnboardingState = {
  completed: boolean;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  complete: () => Promise<void>;
  reset: () => Promise<void>;
};

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  completed: false,
  hydrated: false,
  hydrate: async () => {
    if (get().hydrated) {
      return;
    }

    try {
      const raw = await AsyncStorage.getItem(ONBOARDING_STORAGE_KEY);
      set({ completed: raw === 'true', hydrated: true });
    } catch (error) {
      console.warn('[DateSpot] オンボーディング状態の読み込みに失敗', error);
      set({ completed: false, hydrated: true });
    }
  },
  complete: async () => {
    set({ completed: true, hydrated: true });
    try {
      await AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    } catch (error) {
      console.warn('[DateSpot] オンボーディング完了の保存に失敗', error);
    }
  },
  reset: async () => {
    set({ completed: false, hydrated: true });
    try {
      await AsyncStorage.removeItem(ONBOARDING_STORAGE_KEY);
    } catch (error) {
      console.warn('[DateSpot] オンボーディング状態の削除に失敗', error);
    }
  },
}));

export function useOnboarding(): UseOnboardingResult {
  const completed = useOnboardingStore((state) => state.completed);
  const hydrated = useOnboardingStore((state) => state.hydrated);
  const hydrate = useOnboardingStore((state) => state.hydrate);
  const completeStore = useOnboardingStore((state) => state.complete);

  useEffect(() => {
    if (!hydrated) {
      void hydrate();
    }
  }, [hydrate, hydrated]);

  const complete = useCallback(async (): Promise<void> => {
    await completeStore();
  }, [completeStore]);

  return {
    completed,
    hydrated,
    complete,
  };
}
