import { type ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AreaHeader } from '@/components';
import { useAppTheme, useUserLocation } from '@/context';
import type { TabScreenProps } from '@/navigation/types';
import { MapFilterBadge } from '../components/MapFilterBadge';
import { SpotMap } from '../components/SpotMap';
import { SpotPreviewCard } from '../components/SpotPreviewCard';
import { useMapScreen } from '../hooks/useMapScreen';

type MapScreenProps = TabScreenProps<'Map'>;

export function MapScreen({ navigation }: MapScreenProps): ReactElement {
  const insets = useSafeAreaInsets();
  const { isDark } = useAppTheme();
  const { coordinates, permission } = useUserLocation();
  const {
    timeOfDay,
    relationship,
    area,
    category,
    query,
    favoritesOnly,
    spots,
    selectedSpot,
    palette,
    initialRegion,
    selectSpot,
    clearSelectedSpot,
    dismissSelectedSpot,
  } = useMapScreen();

  return (
    <View style={[styles.screen, { backgroundColor: palette.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View style={styles.mapHost}>
        <SpotMap
          spots={spots}
          selectedSpotId={selectedSpot?.id ?? null}
          initialRegion={initialRegion}
          pinColor={palette.primary}
          defaultPinColor={palette.muted}
          showsUserLocation={permission === 'granted'}
          userCoordinate={coordinates}
          mapPadding={{
            top: insets.top + 132,
            right: 8,
            bottom: insets.bottom + (selectedSpot !== null ? 132 : 24),
            left: 8,
          }}
          onMarkerPress={(spotId) => {
            if (selectedSpot?.id === spotId) {
              navigation.navigate('SpotDetail', { spotId });
            }
            selectSpot(spotId);
          }}
          onMapPress={clearSelectedSpot}
        />
      </View>
      <View
        pointerEvents="box-none"
        style={[styles.badgeWrap, { top: insets.top + 12 }]}
      >
        <AreaHeader palette={palette} />
        <MapFilterBadge
          timeOfDay={timeOfDay}
          relationship={relationship}
          area={area}
          category={category}
          favoritesOnly={favoritesOnly}
          query={query}
          palette={palette}
        />
      </View>
      {selectedSpot !== null ? (
        <View
          pointerEvents="box-none"
          style={[styles.previewWrap, { bottom: insets.bottom + 16 }]}
        >
          <SpotPreviewCard
            spot={selectedSpot}
            palette={palette}
            onClose={dismissSelectedSpot}
            onPress={() => {
              navigation.navigate('SpotDetail', {
                spotId: selectedSpot.id,
              });
            }}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  mapHost: {
    flex: 1,
  },
  badgeWrap: {
    position: 'absolute',
    left: 20,
    right: 20,
    gap: 10,
  },
  previewWrap: {
    position: 'absolute',
    left: 16,
    right: 16,
  },
});
