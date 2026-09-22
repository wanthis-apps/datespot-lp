import { useMemo } from 'react';
import { create } from 'zustand';
import type { Notification, NotificationCategory } from '../types/database';

export type NotificationFilter = 'all' | NotificationCategory;

export type UseNotificationsResult = {
  notifications: Notification[];
  unreadCount: number;
  filter: NotificationFilter;
  setFilter: (filter: NotificationFilter) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
};

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'notice-1',
    category: 'coupon',
    title: '【新着クーポン】恵比寿のカフェで10%OFF!',
    body: 'オリーブの木 恵比寿で使えるペア割クーポンが追加されました。今週末までの限定です。',
    created_at: '2026-09-22T04:20:00.000Z',
    is_read: false,
  },
  {
    id: 'notice-2',
    category: 'system',
    title: 'お気に入りスポットの最新口コミが追加されました',
    body: 'Bloom Café 代官山に新しい口コミが届きました。雰囲気の参考にしてみてください。',
    created_at: '2026-09-21T11:10:00.000Z',
    is_read: false,
  },
  {
    id: 'notice-3',
    category: 'coupon',
    title: '【まもなく期限】ケーキセットクーポン',
    body: 'SUN Terrace 表参道のケーキセット100円引きは、今週末で有効期限を迎えます。',
    created_at: '2026-09-20T08:40:00.000Z',
    is_read: false,
  },
  {
    id: 'notice-4',
    category: 'system',
    title: 'DateSpotへようこそ',
    body: 'エリアを切り替えて、現在地がなくてもスポットを探せます。お気に入りからデートプランも作れます。',
    created_at: '2026-09-12T02:00:00.000Z',
    is_read: true,
  },
  {
    id: 'notice-5',
    category: 'coupon',
    title: '【パートナー店】六本木のバーでドリンク1杯無料',
    body: 'Lueur Bar 恵比寿のパートナー特典が更新されました。夜のデートにどうぞ。',
    created_at: '2026-09-18T13:25:00.000Z',
    is_read: true,
  },
  {
    id: 'notice-6',
    category: 'system',
    title: 'デートプランをシェアしてみましょう',
    body: '保存したプラン「代官山のんびり午後」を、お相手へ共有できます。',
    created_at: '2026-09-19T09:05:00.000Z',
    is_read: false,
  },
];

type NotificationState = {
  items: Notification[];
  filter: NotificationFilter;
  setFilter: (filter: NotificationFilter) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  resetToMock: () => void;
  clearAll: () => void;
};

function cloneMockNotifications(): Notification[] {
  return MOCK_NOTIFICATIONS.map((item) => ({ ...item }));
}

export const useNotificationStore = create<NotificationState>((set) => ({
  items: cloneMockNotifications(),
  filter: 'all',
  setFilter: (filter) => set({ filter }),
  markAsRead: (id) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, is_read: true } : item,
      ),
    })),
  markAllAsRead: () =>
    set((state) => ({
      items: state.items.map((item) => ({ ...item, is_read: true })),
    })),
  resetToMock: () =>
    set({
      items: cloneMockNotifications(),
      filter: 'all',
    }),
  clearAll: () => set({ items: [], filter: 'all' }),
}));

export function useNotifications(): UseNotificationsResult {
  const items = useNotificationStore((state) => state.items);
  const filter = useNotificationStore((state) => state.filter);
  const setFilter = useNotificationStore((state) => state.setFilter);
  const markAsRead = useNotificationStore((state) => state.markAsRead);
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);

  const notifications = useMemo(() => {
    const filtered =
      filter === 'all'
        ? items
        : items.filter((item) => item.category === filter);

    return [...filtered].sort((left, right) =>
      right.created_at.localeCompare(left.created_at),
    );
  }, [filter, items]);

  const unreadCount = useMemo(
    () => items.filter((item) => !item.is_read).length,
    [items],
  );

  return {
    notifications,
    unreadCount,
    filter,
    setFilter,
    markAsRead,
    markAllAsRead,
  };
}

export function formatNotificationDate(createdAt: string): string {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) {
    return '日時不明';
  }

  return date.toLocaleString('ja-JP', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
