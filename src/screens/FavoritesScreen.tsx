import { useMemo, useState, type ReactElement } from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ErrorState,
  SearchBar,
  SpotCardSkeleton,
  SpotDetailModal,
} from '@/components';
import { applySearchAndSort, type SpotSortBy } from '../../hooks/spotQuery';
import { useFavoriteSpots } from '../../hooks/useFavoriteSpots';
import { useSpotFilterStore } from '@/features/spots';
import type { TabScreenProps } from '@/navigation/types';
import { palettes } from '@/theme';
import type { Spot } from '../../types/database';
import { EmptyState } from './components/EmptyState';
import { FavoriteSpotCard } from './components/FavoriteSpotCard';

type FavoritesScreenProps = TabScreenProps<'Favorites'>;

export function FavoritesScreen(_props: FavoritesScreenProps): ReactElement {
  const insets = useSafeAreaInsets();
  const timeOfDay = useSpotFilterStore((state) => state.timeOfDay);
  const palette = palettes[timeOfDay];
  const { spots, loading, error, toggleFavorite, refetch } = useFavoriteSpots();
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SpotSortBy>('default');
  const visibleSpots = useMemo(
    () => applySearchAndSort(spots, searchQuery, sortBy),
    [searchQuery, sortBy, spots],
  );

  const handleOpenSpot = (spot: Spot): void => {
    console.log('[DateSpot] favorite spot press', {
      id: spot.id,
      name: spot.name,
    });
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
        <StatusBar style={timeOfDay === 'night' ? 'light' : 'dark'} />
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
        data={visibleSpots}
        extraData={`${searchQuery}-${sortBy}`}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 24 },
          visibleSpots.length === 0 ? styles.emptyContent : null,
        ]}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={[styles.kicker, { color: palette.primary }]}>
              Favorites
            </Text>
            <Text style={[styles.heading, { color: palette.text }]}>
              お気に入り
            </Text>
            <Text style={[styles.lead, { color: palette.textSecondary }]}>
              保存したデートスポットを、あとからゆっくり見返せます。
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
            onPress={() => handleOpenSpot(item)}
            onRemoveFavorite={() => handleRemoveFavorite(item)}
          />
        )}
      />
      <SpotDetailModal
        visible={selectedSpot !== null}
        spot={selectedSpot}
        palette={palette}
        onClose={() => setSelectedSpot(null)}
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
  skeletonList: {
    gap: 14,
  },
});
