import {
  forwardRef,
  memo,
  useEffect,
  useImperativeHandle,
  useRef,
  type ReactElement,
} from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import type { Spot } from '@/types';
import { getValidCoordinate } from '../utils/mapCoordinates';
import type { SpotMapHandle, SpotMapProps } from './SpotMap.types';

const SpotMapComponent = forwardRef<SpotMapHandle, SpotMapProps>(function SpotMapComponent({
  spots,
  selectedSpotId,
  initialRegion,
  cameraNonce,
  mapInstanceKey = 0,
  focusTarget = null,
  onRegionChangeComplete,
  pinColor,
  defaultPinColor,
  mapPadding,
  onMarkerPress,
  onMapPress,
}, ref): ReactElement {
  const mapRef = useRef<MapView>(null);

  useImperativeHandle(ref, () => ({
    animateToRegion: (region, durationMs = 450) => {
      mapRef.current?.animateToRegion(region, durationMs);
    },
  }));

  useEffect(() => {
    if (cameraNonce === 0) {
      return;
    }

    mapRef.current?.animateToRegion(initialRegion, 280);
  }, [cameraNonce, initialRegion]);

  useEffect(() => {
    if (focusTarget === null) {
      return;
    }

    const timer = setTimeout(() => {
      mapRef.current?.animateToRegion(focusTarget, 450);
    }, 280);

    return () => {
      clearTimeout(timer);
    };
  }, [focusTarget]);

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
        key={`map-${mapInstanceKey}`}
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={initialRegion}
        mapType="standard"
        userInterfaceStyle="light"
        customMapStyle={[]}
        mapPadding={mapPadding}
        onPress={(event) => {
          if (event.nativeEvent.action === 'marker-press') {
            return;
          }
          onMapPress();
        }}
        onRegionChangeComplete={onRegionChangeComplete}
        showsUserLocation
        showsMyLocationButton={false}
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
            />
          );
        })}
      </MapView>
    </View>
  );
});

export const SpotMap = memo(SpotMapComponent);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
});
