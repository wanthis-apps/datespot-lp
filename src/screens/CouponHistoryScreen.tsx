import { type ReactElement } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ErrorState, LoadingState } from '@/components';
import { useCouponHistory } from '../../hooks/useCouponHistory';
import type { RootStackScreenProps } from '@/navigation/types';
import { EmptyState } from './components/EmptyState';

type CouponHistoryScreenProps = RootStackScreenProps<'CouponHistory'>;

export function CouponHistoryScreen(
  _props: CouponHistoryScreenProps,
): ReactElement {
  const insets = useSafeAreaInsets();
  const { items, loading, error, timeOfDay, palette, refetch } =
    useCouponHistory();

  const screenStyle = [
    styles.screen,
    {
      backgroundColor: palette.background,
      paddingTop: insets.top + 8,
    },
  ];

  if (loading && items.length === 0) {
    return (
      <View style={screenStyle}>
        <StatusBar style={timeOfDay === 'night' ? 'light' : 'dark'} />
        <LoadingState
          palette={palette}
          message="利用履歴を読み込み中です…"
        />
      </View>
    );
  }

  if (error !== null && items.length === 0) {
    return (
      <View style={screenStyle}>
        <StatusBar style={timeOfDay === 'night' ? 'light' : 'dark'} />
        <ErrorState
          palette={palette}
          message={error}
          onRetry={() => {
            void refetch();
          }}
        />
      </View>
    );
  }

  return (
    <View style={screenStyle}>
      <StatusBar style={timeOfDay === 'night' ? 'light' : 'dark'} />
      <FlatList
        data={items}
        keyExtractor={(item) => item.key}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 24 },
          items.length === 0 ? styles.emptyContent : null,
        ]}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={[styles.kicker, { color: palette.primary }]}>
              History
            </Text>
            <Text style={[styles.heading, { color: palette.text }]}>
              クーポン利用履歴
            </Text>
            <Text style={[styles.lead, { color: palette.textSecondary }]}>
              使った特典を、日付とスポットで振り返れます。
            </Text>
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            palette={palette}
            icon="receipt-outline"
            title="利用履歴はありません"
            message="クーポンを使うと、ここに履歴が残ります。"
          />
        }
        renderItem={({ item }) => (
          <View
            style={[
              styles.card,
              { backgroundColor: palette.surface, borderColor: palette.border },
            ]}
          >
            <View
              style={[styles.badge, { backgroundColor: palette.primaryMuted }]}
            >
              <Text style={[styles.badgeText, { color: palette.primary }]}>
                使用済み
              </Text>
            </View>
            <Text style={[styles.spotName, { color: palette.textSecondary }]}>
              {item.spotName}
            </Text>
            <Text style={[styles.detail, { color: palette.text }]}>
              {item.discountDetail}
            </Text>
            <Text style={[styles.usedAt, { color: palette.muted }]}>
              {item.usedAtLabel}
            </Text>
          </View>
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
  separator: {
    height: 14,
  },
  card: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    gap: 8,
    shadowColor: '#2B1D1F',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  spotName: {
    fontSize: 12,
    fontWeight: '600',
  },
  detail: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
  },
  usedAt: {
    fontSize: 12,
    fontWeight: '600',
  },
});
