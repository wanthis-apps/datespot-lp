import { type ReactElement, useRef } from 'react';
import { Platform, StyleSheet } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import type { Spot } from '@/types';
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

  const handleMarkerPress = (spot: Spot): void => {
    onMarkerPress(spot.id);
    mapRef.current?.animateToRegion({
      latitude: spot.location.lat,
      longitude: spot.location.lng,
      latitudeDelta: 0.04,
      longitudeDelta: 0.04,
    });
  };

  return (
    <MapView
      ref={mapRef}
      style={styles.map}
      provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
      initialRegion={initialRegion}
      onPress={onMapPress}
      showsUserLocation={false}
      showsCompass={false}
    >
      {spots.map((spot) => (
        <Marker
          key={spot.id}
          identifier={spot.id}
          coordinate={{
            latitude: spot.location.lat,
            longitude: spot.location.lng,
          }}
          pinColor={
            spot.id === selectedSpotId || spot.isPartnerStore
              ? pinColor
              : defaultPinColor
          }
          onPress={() => handleMarkerPress(spot)}
          stopPropagation
        />
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFill,
  },
});
