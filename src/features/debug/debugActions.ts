import AsyncStorage from '@react-native-async-storage/async-storage';
import { showToast, type ToastType } from '@/context/toastStore';
import { useAuthStore, type MockAuthMode } from '@/features/auth/store/authStore';
import { useCouponUsageStore } from '@/features/coupons/store/couponUsageStore';
import { useFavoriteStore } from '@/features/spots/store/favoriteStore';
import { useSpotFilterStore } from '@/features/spots/store/spotFilterStore';
import { useNotificationSettingsStore } from '../../../hooks/useNotificationSettings';
import { useNotificationStore } from '../../../hooks/useNotifications';
import { useOnboardingStore } from '../../../hooks/useOnboarding';
import { usePlansSeedStore } from '../../../hooks/usePlans';
import { useRecentlyViewedStore } from '../../../hooks/useRecentlyViewed';
import { useReviewHelpfulStore } from '../../../hooks/useReviews';

export const APP_VERSION = '1.0.0';
export const DATESPOT_STORAGE_PREFIX = '@datespot/';

export const DUMMY_FAVORITE_IDS: readonly string[] = [
  'spot-daikanyama-bloom',
  'spot-ebisu-olive',
  'spot-omotesando-sun',
  'spot-tokyo-tower',
];

export const DUMMY_RECENTLY_VIEWED_IDS: readonly string[] = [
  'spot-tokyo-tower',
  'spot-daikanyama-bloom',
  'spot-ebisu-lueur',
  'spot-inokashira-boat',
];

export type DebugActionResult = {
  ok: boolean;
  message: string;
};

async function clearDatespotStorage(): Promise<number> {
  const keys = await AsyncStorage.getAllKeys();
  const target = keys.filter((key) => key.startsWith(DATESPOT_STORAGE_PREFIX));
  if (target.length > 0) {
    await AsyncStorage.multiRemove(target);
  }
  return target.length;
}

async function resetInMemoryAfterClear(): Promise<void> {
  await useFavoriteStore.getState().replaceFavorites([]);
  useRecentlyViewedStore.getState().replaceIds([]);
  await useOnboardingStore.getState().reset();
  useNotificationStore.getState().clearAll();
  usePlansSeedStore.getState().resetToEmpty();
  await useCouponUsageStore.getState().resetLocal();
  await useNotificationSettingsStore.getState().resetDefaults();
  await useReviewHelpfulStore.getState().reset();
  useSpotFilterStore.getState().resetFilters();
}

export async function clearAllLocalData(): Promise<DebugActionResult> {
  try {
    const removed = await clearDatespotStorage();
    await resetInMemoryAfterClear();
    const message =
      removed === 0
        ? 'ローカルデータを初期化しました'
        : `ローカルデータを初期化しました（${removed}件）`;
    showToast({ message, type: 'success' });
    return { ok: true, message };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'ローカルデータの初期化に失敗しました';
    showToast({ message, type: 'error' });
    return { ok: false, message };
  }
}

export async function resetOnboardingFlag(): Promise<DebugActionResult> {
  try {
    await useOnboardingStore.getState().reset();
    const message = 'オンボーディングを再表示します';
    showToast({ message, type: 'info' });
    return { ok: true, message };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'オンボーディングのリセットに失敗しました';
    showToast({ message, type: 'error' });
    return { ok: false, message };
  }
}

export async function restoreDummyData(): Promise<DebugActionResult> {
  try {
    await useFavoriteStore
      .getState()
      .replaceFavorites([...DUMMY_FAVORITE_IDS]);
    useRecentlyViewedStore
      .getState()
      .replaceIds([...DUMMY_RECENTLY_VIEWED_IDS]);
    useNotificationStore.getState().resetToMock();
    usePlansSeedStore.getState().resetToMock();
    const message = 'ダミーデータを復元しました';
    showToast({ message, type: 'success' });
    return { ok: true, message };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'ダミーデータの復元に失敗しました';
    showToast({ message, type: 'error' });
    return { ok: false, message };
  }
}

export async function setMockAuthMode(
  mode: MockAuthMode,
): Promise<DebugActionResult> {
  try {
    await useAuthStore.getState().setMockAuth(mode);
    const message =
      mode === 'guest'
        ? 'ゲスト状態に切り替えました'
        : 'ログイン状態に切り替えました';
    showToast({ message, type: 'success' });
    return { ok: true, message };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : '認証状態の切り替えに失敗しました';
    showToast({ message, type: 'error' });
    return { ok: false, message };
  }
}

export function showTestToast(type: ToastType): void {
  const message =
    type === 'success'
      ? '成功トーストのテストです'
      : type === 'error'
        ? 'エラートーストのテストです'
        : 'お知らせトーストのテストです';
  showToast({ message, type, durationMs: 2200 });
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function playTestToastSequence(): Promise<void> {
  showTestToast('success');
  await wait(1600);
  showTestToast('error');
  await wait(1600);
  showTestToast('info');
}
