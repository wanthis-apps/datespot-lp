import { type ReactElement } from 'react';
import { Pressable, FlatList, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/context';
import { FilterChipRow } from '@/features/spots/components/FilterChipRow';
import {
  useNotifications,
  type NotificationFilter,
} from '../../hooks/useNotifications';
import type { RootStackScreenProps } from '@/navigation/types';
import { EmptyState } from './components/EmptyState';
import { NotificationListItem } from './components/NotificationListItem';

type NotificationsScreenProps = RootStackScreenProps<'Notifications'>;

const FILTER_OPTIONS: ReadonlyArray<{
  value: NotificationFilter;
  label: string;
}> = [
  { value: 'all', label: 'すべて' },
  { value: 'coupon', label: 'クーポン' },
  { value: 'system', label: 'システムお知らせ' },
];

export function NotificationsScreen(
  _props: NotificationsScreenProps,
): ReactElement {
  const insets = useSafeAreaInsets();
  const { isDark, palette } = useAppTheme();
  const {
    notifications,
    unreadCount,
    filter,
    setFilter,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  return (
    <View
      style={[
        styles.screen,
        {
          backgroundColor: palette.background,
          paddingTop: insets.top + 8,
        },
      ]}
    >
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <FlatList
        data={notifications}
        extraData={`${filter}-${unreadCount}`}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 24 },
          notifications.length === 0 ? styles.emptyContent : null,
        ]}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={[styles.kicker, { color: palette.primary }]}>
              Inbox
            </Text>
            <Text style={[styles.heading, { color: palette.text }]}>
              お知らせ
            </Text>
            <Text style={[styles.lead, { color: palette.textSecondary }]}>
              クーポンの期限や、スポットの新着情報をまとめて確認できます。
            </Text>
            <FilterChipRow
              value={filter}
              onChange={setFilter}
              palette={palette}
              options={[...FILTER_OPTIONS]}
            />
            {unreadCount > 0 ? (
              <Pressable
                accessibilityRole="button"
                onPress={markAllAsRead}
              >
                <Text style={[styles.markAll, { color: palette.primary }]}>
                  すべて既読にする（{unreadCount}件）
                </Text>
              </Pressable>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            palette={palette}
            icon="notifications-off-outline"
            title="お知らせはありません"
            message="このカテゴリの通知はまだ届いていません。"
          />
        }
        renderItem={({ item }) => (
          <NotificationListItem
            item={item}
            palette={palette}
            onPress={() => markAsRead(item.id)}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  emptyContent: {
    flexGrow: 1,
  },
  header: {
    gap: 8,
    marginBottom: 20,
  },
  kicker: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  heading: {
    fontSize: 26,
    fontWeight: '700',
  },
  lead: {
    fontSize: 14,
    lineHeight: 22,
  },
  markAll: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'right',
    marginTop: 4,
  },
  separator: {
    height: 12,
  },
});
