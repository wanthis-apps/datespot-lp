import { type ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { TabScreenProps } from '@/navigation/types';
import { MapFilterBadge } from '../components/MapFilterBadge';
import { SpotMap } from '../components/SpotMap';
import { SpotPreviewCard } from '../components/SpotPreviewCard';
import { useMapScreen } from '../hooks/useMapScreen';

type MapScreenProps = TabScreenProps<'Map'>;

export function MapScreen({ navigation }: MapScreenProps): ReactElement {
  const insets = useSafeAreaInsets();
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
      <StatusBar style={timeOfDay === 'night' ? 'light' : 'dark'} />
      <View style={styles.mapHost}>
        <SpotMap
          spots={spots}
          selectedSpotId={selectedSpot?.id ?? null}
          initialRegion={initialRegion}
          pinColor={palette.primary}
          defaultPinColor={palette.muted}
          onMarkerPress={(spotId) => {
            if (selectedSpot?.id === spotId) {
              navigation.navigate('SpotDetail', { spotId });
            }
            selectSpot(spotId);
          }}
          onMapPress={clearSelectedSpot}
        />
      </View>
      <View style={[styles.badgeWrap, { top: insets.top + 12 }]}>
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
          style={[
            styles.previewWrap,
            { bottom: insets.bottom + 16 },
          ]}
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
    width: '100%',
    height: '100%',
  },
  mapHost: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  badgeWrap: {
    position: 'absolute',
    left: 20,
    right: 20,
  },
  previewWrap: {
    position: 'absolute',
    left: 16,
    right: 16,
  },
});
