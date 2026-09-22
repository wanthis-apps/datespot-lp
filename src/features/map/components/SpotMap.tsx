import { type ReactElement, useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import type { Spot } from '@/types';
import { getValidCoordinate, isSameRegion } from '../utils/mapCoordinates';
import type { SpotMapProps } from './SpotMap.types';

export function SpotMap({
  spots,
  selectedSpotId,
  initialRegion,
  pinColor,
  defaultPinColor,
  onMarkerPress,
  onMapPress,
}: SpotMapProps): ReactElement {
  const mapRef = useRef<MapView>(null);
  const previousRegionRef = useRef(initialRegion);

  useEffect(() => {
    const previousRegion = previousRegionRef.current;
    previousRegionRef.current = initialRegion;
    if (isSameRegion(previousRegion, initialRegion)) {
      return;
    }

    mapRef.current?.animateToRegion(initialRegion, 280);
  }, [initialRegion]);

  const handleMarkerPress = (spot: Spot): void => {
    onMarkerPress(spot.id);
    const coordinate = getValidCoordinate(spot);
    if (coordinate === null) {
      return;
    }

    mapRef.current?.animateToRegion({
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
      latitudeDelta: 0.04,
      longitudeDelta: 0.04,
    });
  };

  return (
    <View collapsable={false} style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={initialRegion}
        onPress={onMapPress}
        showsUserLocation={false}
        showsCompass={false}
      >
        {spots.map((spot) => {
          const coordinate = getValidCoordinate(spot);
          if (coordinate === null) {
            return null;
          }

          return (
            <Marker
              key={spot.id}
              identifier={spot.id}
              coordinate={coordinate}
              pinColor={
                spot.id === selectedSpotId || spot.isPartnerStore
                  ? pinColor
                  : defaultPinColor
              }
              onPress={() => handleMarkerPress(spot)}
              stopPropagation
            />
          );
        })}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
});
