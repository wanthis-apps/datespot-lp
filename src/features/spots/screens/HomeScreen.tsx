import { type ReactElement } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ErrorState, LoadingState } from '@/components';
import type { TabScreenProps } from '@/navigation/types';
import type { Spot } from '@/types';
import { HomeHeader } from '../components/HomeHeader';
import { SpotCard } from '../components/SpotCard';
import { useHomeScreen } from '../hooks/useHomeScreen';

type HomeScreenProps = TabScreenProps<'Home'>;

export function HomeScreen({ navigation }: HomeScreenProps): ReactElement {
  const insets = useSafeAreaInsets();
  const {
    heading,
    timeOfDay,
    relationship,
    area,
    areas,
    category,
    query,
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
    setCategory,
    setQuery,
    setFavoritesOnly,
    resetFilters,
    reload,
  } = useHomeScreen();

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
        data={spots}
        extraData={`${timeOfDay}-${relationship}-${area}-${category}-${query}-${favoritesOnly}-${favoriteSpotIds.join(',')}-${sourceLabel}-${error ?? ''}`}
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
            category={category}
            query={query}
            favoritesOnly={favoritesOnly}
            palette={palette}
            sourceLabel={sourceLabel}
            canReset={canReset}
            onTimeOfDayChange={setTimeOfDay}
            onRelationshipChange={setRelationship}
            onAreaChange={setArea}
            onCategoryChange={setCategory}
            onQueryChange={setQuery}
            onFavoritesOnlyChange={setFavoritesOnly}
            onReset={resetFilters}
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
              navigation.navigate('SpotDetail', { spotId: item.id });
            }}
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
