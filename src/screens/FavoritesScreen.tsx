import { useMemo, useState, type ReactElement } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { FlashList, type ListRenderItemInfo } from '@shopify/flash-list';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Button,
  ErrorState,
  FittedHeading,
  SearchBar,
  SpotDetailModal,
} from '@/components';
import { useAppTheme, useDistanceOrigin } from '@/context';
import { toCatalogSpot } from '../../hooks/mapRecords';
import {
  applySearchAndSort,
  matchesFavoriteQuery,
  type SpotSortBy,
} from '../../hooks/spotQuery';
import { useFavoriteBulk } from '../../hooks/useFavoriteBulk';
import { useFavoriteSpots } from '../../hooks/useFavoriteSpots';
import { usePlans } from '../../hooks/usePlans';
import { useRecentlyViewed } from '../../hooks/useRecentlyViewed';
import { SpotCard } from '@/features/spots/components/SpotCard';
import { useSpotCatalogStore } from '@/features/spots/store/spotCatalogStore';
import type { TabScreenProps } from '@/navigation/types';
import type { Spot as CatalogSpot } from '@/types';
import type { Spot } from '../../types/database';
import { EmptyState } from './components/EmptyState';
import { PlanCreateModal } from './components/PlanCreateModal';

type FavoritesScreenProps = TabScreenProps<'Favorites'>;

export function FavoritesScreen(_props: FavoritesScreenProps): ReactElement {
  const insets = useSafeAreaInsets();
  const { isDark, palette } = useAppTheme();
  const origin = useDistanceOrigin();
  const { spots, loading, error, removeFavorites, refetch } = useFavoriteSpots();
  const catalogSpots = useSpotCatalogStore((state) => state.spots);
  const { saving, createPlan } = usePlans();
  const { addRecentlyViewed } = useRecentlyViewed();
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SpotSortBy>('default');
  const [planVisible, setPlanVisible] = useState(false);
  const [planSeedSpots, setPlanSeedSpots] = useState<Spot[]>([]);
  const visibleSpots = useMemo(() => {
    const filtered = spots.filter((spot) =>
      matchesFavoriteQuery(spot, searchQuery),
    );
    if (sortBy === 'default') {
      return filtered;
    }

    return applySearchAndSort(filtered, '', sortBy, origin);
  }, [origin, searchQuery, sortBy, spots]);
  const catalogById = useMemo(() => {
    const byId = new Map<string, CatalogSpot>();
    catalogSpots.forEach((spot) => {
      byId.set(spot.id, spot);
    });
    return byId;
  }, [catalogSpots]);
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
  const hasSearchQuery = searchQuery.trim().length > 0;
  const isSearchMiss = hasSearchQuery && spots.length > 0 && visibleSpots.length === 0;

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
        <View style={[styles.content, styles.loadingScreen, { paddingBottom: insets.bottom + 24 }]}>
          <View style={styles.header}>
            <Text style={[styles.kicker, { color: palette.primary }]}>
              Favorites
            </Text>
            <FittedHeading style={[styles.heading, { color: palette.text }]}>
              お気に入り
            </FittedHeading>
          </View>
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={palette.primary} />
            <Text style={[styles.loadingText, { color: palette.textSecondary }]}>
              お気に入りを読み込んでいます
            </Text>
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
      {/*
        項目高さの仮目安は 320。
        SpotCard は画像 168 + 本文（padding 32 + 名前 1〜2 行 + メタ + 説明 2 行）で約 300、
        編集中の選択バッジを足すと約 360。
        @shopify/flash-list@2.0.2 は v2 のため estimatedItemSize を受け取らず、
        初回描画時にセル高さを自動計測する。
      */}
      <FlashList<Spot>
        key={`favorites-list-${sortBy}`}
        style={styles.list}
        keyboardShouldPersistTaps="handled"
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
                <FittedHeading style={[styles.heading, { color: palette.text }]}>
                  お気に入り
                </FittedHeading>
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
                ? '複数のスポットを選んで、\n一括削除やプラン作成ができます。'
                : '保存したデートスポットを、\nあとからゆっくり見返せます。'}
            </Text>
            <SearchBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              sortBy={sortBy}
              setSortBy={setSortBy}
              palette={palette}
              placeholder="名前・住所で検索"
            />
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            palette={palette}
            icon={isSearchMiss ? 'search-outline' : 'heart-outline'}
            title={
              isSearchMiss
                ? '一致するスポットが見つかりません'
                : 'お気に入りのスポットがまだありません'
            }
            message={
              isSearchMiss
                ? '名前や住所（エリア）のキーワードを変えて、\nもう一度探してみてください。'
                : 'ホームでハートを押すと、\n気になるスポットがここに集まります。'
            }
          />
        }
        renderItem={({ item }: ListRenderItemInfo<Spot>) => {
          const cardSpot = catalogById.get(item.id) ?? toCatalogSpot(item);
          const selected = selectedIds.includes(item.id);

          return (
            <View>
              {editing ? (
                <Pressable
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: selected }}
                  accessibilityLabel={`${item.name}を${selected ? '選択解除' : '選択'}`}
                  onPress={() => handleOpenSpot(item)}
                  style={[
                    styles.selectBadge,
                    {
                      backgroundColor: selected
                        ? palette.primary
                        : palette.surface,
                      borderColor: selected ? palette.primary : palette.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.selectBadgeText,
                      { color: selected ? '#FFFFFF' : palette.text },
                    ]}
                  >
                    {selected ? '選択中' : '選択'}
                  </Text>
                </Pressable>
              ) : null}
              <SpotCard
                spot={cardSpot}
                palette={palette}
                onPress={() => handleOpenSpot(item)}
              />
            </View>
          );
        }}
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
  list: {
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
  loadingScreen: {
    flex: 1,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 48,
  },
  loadingText: {
    fontSize: 14,
  },
  selectBadge: {
    alignSelf: 'flex-end',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 8,
  },
  selectBadgeText: {
    fontSize: 12,
    fontWeight: '700',
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
