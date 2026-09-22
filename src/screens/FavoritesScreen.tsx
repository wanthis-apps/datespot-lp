import { useMemo, useState, type ReactElement } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, ErrorState, SearchBar, SpotCardSkeleton, SpotDetailModal } from '@/components';
import { useAppTheme, useDistanceOrigin } from '@/context';
import { applySearchAndSort, type SpotSortBy } from '../../hooks/spotQuery';
import { useFavoriteBulk } from '../../hooks/useFavoriteBulk';
import { useFavoriteSpots } from '../../hooks/useFavoriteSpots';
import { usePlans } from '../../hooks/usePlans';
import { useRecentlyViewed } from '../../hooks/useRecentlyViewed';
import type { TabScreenProps } from '@/navigation/types';
import type { Spot } from '../../types/database';
import { EmptyState } from './components/EmptyState';
import { FavoriteSpotCard } from './components/FavoriteSpotCard';
import { PlanCreateModal } from './components/PlanCreateModal';

type FavoritesScreenProps = TabScreenProps<'Favorites'>;

export function FavoritesScreen(_props: FavoritesScreenProps): ReactElement {
  const insets = useSafeAreaInsets();
  const { isDark, palette } = useAppTheme();
  const origin = useDistanceOrigin();
  const { spots, loading, error, toggleFavorite, removeFavorites, refetch } =
    useFavoriteSpots();
  const { saving, createPlan } = usePlans();
  const { addRecentlyViewed } = useRecentlyViewed();
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SpotSortBy>('default');
  const [planVisible, setPlanVisible] = useState(false);
  const [planSeedSpots, setPlanSeedSpots] = useState<Spot[]>([]);
  const visibleSpots = useMemo(
    () =>
      applySearchAndSort(spots, searchQuery, sortBy, origin),
    [origin, searchQuery, sortBy, spots],
  );
  const {
    editing,
    selectedIds,
    selectedSpots,
    selectedCount,
    enterEdit,
    exitEdit,
    toggleSelect,
  } = useFavoriteBulk(visibleSpots);

  const handleOpenSpot = (spot: Spot): void => {
    if (editing) {
      toggleSelect(spot.id);
      return;
    }

    console.log('[DateSpot] favorite spot press', {
      id: spot.id,
      name: spot.name,
    });
    addRecentlyViewed(spot.id);
    setSelectedSpot(spot);
  };

  const handleRemoveFavorite = (spot: Spot): void => {
    console.log('[DateSpot] favorite remove', {
      id: spot.id,
      name: spot.name,
    });
    Alert.alert(
      'お気に入りを解除しますか？',
      `${spot.name} をお気に入りから外します。`,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '解除する',
          style: 'destructive',
          onPress: () => {
            void toggleFavorite(spot.id);
          },
        },
      ],
    );
  };

  const handleBulkDelete = (): void => {
    if (selectedCount === 0) {
      Alert.alert('スポットを選択してください', '削除するスポットを選んでください。');
      return;
    }

    Alert.alert(
      '選択したスポットを削除しますか？',
      `${selectedCount}件のお気に入りを解除します。`,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除する',
          style: 'destructive',
          onPress: () => {
            void removeFavorites(selectedIds).then(() => {
              exitEdit();
            });
          },
        },
      ],
    );
  };

  const handleCreatePlan = (): void => {
    if (selectedCount === 0) {
      Alert.alert(
        'スポットを選択してください',
        'プランに入れるスポットを選んでください。',
      );
      return;
    }

    setPlanSeedSpots(selectedSpots);
    setPlanVisible(true);
  };

  const footerHeight = editing ? 168 + insets.bottom : 0;

  const screenStyle = [
    styles.screen,
    {
      backgroundColor: palette.background,
      paddingTop: insets.top + 8,
    },
  ];

  if (loading && spots.length === 0) {
    return (
      <View style={screenStyle}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <View style={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
          <View style={styles.header}>
            <Text style={[styles.kicker, { color: palette.primary }]}>
              Favorites
            </Text>
            <Text style={[styles.heading, { color: palette.text }]}>
              お気に入り
            </Text>
          </View>
          <View style={styles.skeletonList}>
            <SpotCardSkeleton palette={palette} />
            <SpotCardSkeleton palette={palette} />
            <SpotCardSkeleton palette={palette} />
          </View>
        </View>
      </View>
    );
  }

  if (error !== null && spots.length === 0) {
    return (
      <View style={screenStyle}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
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
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <FlatList
        data={visibleSpots}
        extraData={`${searchQuery}-${sortBy}-${editing}-${selectedIds.join(',')}`}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 24 + footerHeight },
          visibleSpots.length === 0 ? styles.emptyContent : null,
        ]}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <View style={styles.titleCopy}>
                <Text style={[styles.kicker, { color: palette.primary }]}>
                  Favorites
                </Text>
                <Text style={[styles.heading, { color: palette.text }]}>
                  お気に入り
                </Text>
              </View>
              {spots.length > 0 ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={editing ? '編集を終了' : '編集'}
                  onPress={editing ? exitEdit : enterEdit}
                  style={[
                    styles.editButton,
                    {
                      backgroundColor: editing
                        ? palette.primaryMuted
                        : palette.surface,
                      borderColor: editing ? palette.primary : palette.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.editLabel,
                      { color: editing ? palette.primary : palette.text },
                    ]}
                  >
                    {editing ? '完了' : '編集'}
                  </Text>
                </Pressable>
              ) : null}
            </View>
            <Text style={[styles.lead, { color: palette.textSecondary }]}>
              {editing
                ? '複数のスポットを選んで、一括削除やプラン作成ができます。'
                : '保存したデートスポットを、あとからゆっくり見返せます。'}
            </Text>
            <SearchBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              sortBy={sortBy}
              setSortBy={setSortBy}
              palette={palette}
            />
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            palette={palette}
            icon="heart-outline"
            title={
              spots.length === 0
                ? 'お気に入りはまだありません'
                : '該当するスポットがありません'
            }
            message={
              spots.length === 0
                ? 'ホームでハートを押すと、気になるスポットがここに集まります。'
                : '検索条件を変えて、もう一度探してみてください。'
            }
          />
        }
        renderItem={({ item }) => (
          <FavoriteSpotCard
            spot={item}
            palette={palette}
            selectionMode={editing}
            selected={selectedIds.includes(item.id)}
            onPress={() => handleOpenSpot(item)}
            onRemoveFavorite={() => handleRemoveFavorite(item)}
          />
        )}
      />
      {editing ? (
        <View
          style={[
            styles.footer,
            {
              backgroundColor: palette.surface,
              borderColor: palette.border,
              paddingBottom: Math.max(insets.bottom, 12),
            },
          ]}
        >
          <Text style={[styles.footerCount, { color: palette.textSecondary }]}>
            {selectedCount}件選択中
          </Text>
          <Button
            label="選択したスポットを削除"
            palette={palette}
            variant="ghost"
            onPress={handleBulkDelete}
          />
          <Button
            label="選択したスポットからプランを作成"
            palette={palette}
            onPress={handleCreatePlan}
          />
        </View>
      ) : null}
      <SpotDetailModal
        visible={selectedSpot !== null}
        spot={selectedSpot}
        palette={palette}
        onClose={() => setSelectedSpot(null)}
      />
      <PlanCreateModal
        visible={planVisible}
        palette={palette}
        saving={saving}
        initialSpots={planSeedSpots}
        onClose={() => {
          setPlanVisible(false);
          exitEdit();
        }}
        onSave={createPlan}
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  titleCopy: {
    flex: 1,
    gap: 8,
  },
  editButton: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginTop: 18,
  },
  editLabel: {
    fontSize: 13,
    fontWeight: '700',
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
  skeletonList: {
    gap: 14,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 8,
  },
  footerCount: {
    fontSize: 13,
    fontWeight: '700',
  },
});
