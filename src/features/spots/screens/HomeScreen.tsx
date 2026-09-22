import { useMemo, useState, type ReactElement } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ErrorState, FilterBar, LoadingState, SearchBar, SpotDetailModal } from '@/components';
import { mapCatalogSpot } from '../../../../hooks/mapRecords';
import { applySearchAndSort } from '../../../../hooks/spotQuery';
import { useSpots } from '../../../../hooks/useSpots';
import type { TabScreenProps } from '@/navigation/types';
import type { Spot } from '@/types';
import type { Spot as FoundationSpot } from '../../../../types/database';
import { HomeHeader } from '../components/HomeHeader';
import { SpotCard } from '../components/SpotCard';
import { useHomeScreen } from '../hooks/useHomeScreen';

type HomeScreenProps = TabScreenProps<'Home'>;

export function HomeScreen(_props: HomeScreenProps): ReactElement {
  const insets = useSafeAreaInsets();
  const [selectedSpot, setSelectedSpot] = useState<FoundationSpot | null>(null);
  const {
    selectedCategory,
    selectedPriceRange,
    searchQuery,
    sortBy,
    setSelectedCategory,
    setSelectedPriceRange,
    setSearchQuery,
    setSortBy,
  } = useSpots();
  const {
    heading,
    timeOfDay,
    relationship,
    area,
    areas,
    category,
    favoritesOnly,
    favoriteSpotIds,
    spots,
    palette,
    isLoading,
    error,
    sourceLabel,
    emptyMessage,
    canReset,
    setTimeOfDay,
    setRelationship,
    setArea,
    setFavoritesOnly,
    resetFilters,
    reload,
  } = useHomeScreen();

  const visibleSpots = useMemo(() => {
    const catalogById = new Map(spots.map((spot) => [spot.id, spot]));
    const filtered = spots.flatMap((spot) => {
      const mapped = mapCatalogSpot(spot);
      if (selectedCategory !== null && mapped.category !== selectedCategory) {
        return [];
      }

      if (
        selectedPriceRange !== null &&
        mapped.price_range !== selectedPriceRange
      ) {
        return [];
      }

      return [mapped];
    });

    return applySearchAndSort(filtered, searchQuery, sortBy).flatMap((spot) => {
      const catalogSpot = catalogById.get(spot.id);
      return catalogSpot === undefined ? [] : [catalogSpot];
    });
  }, [searchQuery, selectedCategory, selectedPriceRange, sortBy, spots]);

  const screenStyle = [
    styles.screen,
    {
      backgroundColor: palette.background,
      paddingTop: insets.top + 8,
    },
  ];

  if (isLoading && spots.length === 0 && !favoritesOnly) {
    return (
      <View style={screenStyle}>
        <StatusBar style={timeOfDay === 'night' ? 'light' : 'dark'} />
        <LoadingState palette={palette} message="スポットを読み込み中です…" />
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
            void reload();
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
        extraData={`${timeOfDay}-${relationship}-${area}-${category}-${searchQuery}-${sortBy}-${favoritesOnly}-${favoriteSpotIds.join(',')}-${sourceLabel}-${error ?? ''}-${selectedCategory ?? ''}-${selectedPriceRange ?? ''}`}
        keyExtractor={(item) => item.id}
        stickyHeaderIndices={[0]}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.list,
          { paddingBottom: insets.bottom + 24 },
        ]}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={
          <HomeHeader
            heading={heading}
            timeOfDay={timeOfDay}
            relationship={relationship}
            area={area}
            areas={areas}
            favoritesOnly={favoritesOnly}
            palette={palette}
            sourceLabel={sourceLabel}
            canReset={canReset}
            onTimeOfDayChange={setTimeOfDay}
            onRelationshipChange={setRelationship}
            onAreaChange={setArea}
            onFavoritesOnlyChange={setFavoritesOnly}
            onReset={resetFilters}
            searchBar={
              <SearchBar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                sortBy={sortBy}
                setSortBy={setSortBy}
                palette={palette}
              />
            }
            filterBar={
              <FilterBar
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                selectedPriceRange={selectedPriceRange}
                setSelectedPriceRange={setSelectedPriceRange}
                palette={palette}
              />
            }
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={[styles.empty, { color: palette.textSecondary }]}>
              {emptyMessage}
            </Text>
          </View>
        }
        renderItem={({ item }: { item: Spot }) => (
          <SpotCard
            spot={item}
            palette={palette}
            onPress={() => {
              setSelectedSpot(mapCatalogSpot(item));
            }}
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
  list: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  separator: {
    height: 16,
  },
  empty: {
    paddingTop: 12,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 22,
  },
  emptyWrap: {
    paddingTop: 24,
    alignItems: 'center',
    gap: 12,
  },
});
