import { useCallback, useMemo, useState, type ReactElement } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AnnouncementModal,
  AreaHeader,
  ErrorState,
  FilterBar,
  FilterChipSkeletonRow,
  SearchBar,
  SpotCardSkeleton,
  SpotDetailModal,
  TagFilterModal,
} from '@/components';
import { useArea, useAppTheme } from '@/context';
import { mapCatalogSpot } from '../../../../hooks/mapRecords';
import { applySearchAndSort } from '../../../../hooks/spotQuery';
import { matchesSelectedTags } from '../../../../hooks/spotTags';
import { useSpots } from '../../../../hooks/useSpots';
import { useAnnouncement } from '../../../../hooks/useAnnouncement';
import { useNotifications } from '../../../../hooks/useNotifications';
import { useRecentlyViewed } from '../../../../hooks/useRecentlyViewed';
import type { TabScreenProps } from '@/navigation/types';
import type { Spot } from '@/types';
import type { Spot as FoundationSpot } from '../../../../types/database';
import { HomeHeader } from '../components/HomeHeader';
import { RecentlyViewedSection } from '../components/RecentlyViewedSection';
import { SpotCard } from '../components/SpotCard';
import { useHomeScreen } from '../hooks/useHomeScreen';

type HomeScreenProps = TabScreenProps<'Home'>;

export function HomeScreen({ navigation }: HomeScreenProps): ReactElement {
  const insets = useSafeAreaInsets();
  const { isDark } = useAppTheme();
  const { area: referenceArea } = useArea();
  const { unreadCount } = useNotifications();
  const { recentlyViewedSpots, addRecentlyViewed } = useRecentlyViewed();
  const announcement = useAnnouncement();
  const [selectedSpot, setSelectedSpot] = useState<FoundationSpot | null>(null);
  const {
    selectedCategory,
    selectedPriceRange,
    selectedTags,
    tagMatchMode,
    searchQuery,
    sortBy,
    setSelectedCategory,
    setSelectedPriceRange,
    setSelectedTags,
    setTagMatchMode,
    setSearchQuery,
    setSortBy,
    hasActiveFilters,
    resetFilters: resetSpotFilters,
  } = useSpots();
  const [tagFilterVisible, setTagFilterVisible] = useState(false);
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

  const openSpot = useCallback((spot: FoundationSpot): void => {
    addRecentlyViewed(spot.id);
    setSelectedSpot(spot);
  }, [addRecentlyViewed]);

  const handleResetFilters = useCallback((): void => {
    resetFilters();
    resetSpotFilters();
  }, [resetFilters, resetSpotFilters]);

  const handlePressCatalogSpot = useCallback(
    (spot: Spot): void => {
      openSpot(mapCatalogSpot(spot));
    },
    [openSpot],
  );

  const renderSpotCard = useCallback(
    ({ item }: { item: Spot }): ReactElement => (
      <SpotCard
        spot={item}
        palette={palette}
        onPress={() => handlePressCatalogSpot(item)}
      />
    ),
    [handlePressCatalogSpot, palette],
  );

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

      if (!matchesSelectedTags(mapped, selectedTags, tagMatchMode)) {
        return [];
      }

      return [mapped];
    });

    return applySearchAndSort(filtered, searchQuery, sortBy, {
      latitude: referenceArea.latitude,
      longitude: referenceArea.longitude,
    }).flatMap((spot) => {
      const catalogSpot = catalogById.get(spot.id);
      return catalogSpot === undefined ? [] : [catalogSpot];
    });
  }, [
    referenceArea.latitude,
    referenceArea.longitude,
    searchQuery,
    selectedCategory,
    selectedPriceRange,
    selectedTags,
    sortBy,
    tagMatchMode,
    spots,
  ]);

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
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <View style={[styles.list, { paddingBottom: insets.bottom + 24 }]}>
          <View style={styles.skeletonHeader}>
            <AreaHeader palette={palette} />
            <FilterChipSkeletonRow palette={palette} />
            <FilterChipSkeletonRow palette={palette} />
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
            void reload();
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
        extraData={`${isDark}-${timeOfDay}-${relationship}-${area}-${referenceArea.id}-${category}-${searchQuery}-${sortBy}-${favoritesOnly}-${favoriteSpotIds.join(',')}-${sourceLabel}-${error ?? ''}-${selectedCategory ?? ''}-${selectedPriceRange ?? ''}-${unreadCount}-${selectedTags.join(',')}-${tagMatchMode}-${recentlyViewedSpots.map((spot) => spot.id).join(',')}`}
        keyExtractor={(item) => item.id}
        stickyHeaderIndices={[0]}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.list,
          { paddingBottom: insets.bottom + 24 },
        ]}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={
          <View>
            <HomeHeader
              heading={heading}
              timeOfDay={timeOfDay}
              relationship={relationship}
              area={area}
              areas={areas}
              favoritesOnly={favoritesOnly}
              palette={palette}
              sourceLabel={sourceLabel}
              canReset={canReset || hasActiveFilters}
              onTimeOfDayChange={setTimeOfDay}
              onRelationshipChange={setRelationship}
              onAreaChange={setArea}
              onFavoritesOnlyChange={setFavoritesOnly}
              onReset={handleResetFilters}
              unreadCount={unreadCount}
              onPressNotifications={() => navigation.navigate('Notifications')}
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
                  selectedTagCount={selectedTags.length}
                  onPressTagFilter={() => setTagFilterVisible(true)}
                  palette={palette}
                />
              }
            />
            <RecentlyViewedSection
              spots={recentlyViewedSpots}
              palette={palette}
              onPressSpot={openSpot}
            />
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={[styles.empty, { color: palette.textSecondary }]}>
              {emptyMessage}
            </Text>
          </View>
        }
        renderItem={renderSpotCard}
      />
      <SpotDetailModal
        visible={selectedSpot !== null}
        spot={selectedSpot}
        palette={palette}
        onClose={() => setSelectedSpot(null)}
      />
      <TagFilterModal
        visible={tagFilterVisible}
        palette={palette}
        selectedTags={selectedTags}
        tagMatchMode={tagMatchMode}
        onClose={() => setTagFilterVisible(false)}
        onApply={(tags, mode) => {
          setSelectedTags(tags);
          setTagMatchMode(mode);
        }}
      />
      <AnnouncementModal
        visible={announcement.visible}
        announcement={announcement.announcement}
        palette={palette}
        onPressDetail={() => {
          announcement.close();
          navigation.navigate('Coupons');
        }}
        onClose={announcement.close}
        onHideNextTime={announcement.hideNextTime}
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
  skeletonHeader: {
    gap: 12,
    marginBottom: 20,
  },
  skeletonList: {
    gap: 16,
  },
});
