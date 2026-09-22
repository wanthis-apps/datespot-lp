import { type ReactElement, useEffect, useRef, useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import type { Spot } from '@/types';
import { getValidCoordinate, isSameRegion } from '../utils/mapCoordinates';
import type { SpotMapProps } from './SpotMap.types';

type MapLayoutSize = {
  width: number;
  height: number;
};

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
  const [layout, setLayout] = useState<MapLayoutSize | null>(null);

  const handleContainerLayout = (event: LayoutChangeEvent): void => {
    const { width, height } = event.nativeEvent.layout;
    if (width <= 0 || height <= 0) {
      return;
    }

    setLayout((current) => {
      if (
        current !== null &&
        current.width === width &&
        current.height === height
      ) {
        return current;
      }
      return { width, height };
    });
  };

  useEffect(() => {
    if (layout === null) {
      previousRegionRef.current = initialRegion;
      return;
    }

    const previousRegion = previousRegionRef.current;
    previousRegionRef.current = initialRegion;
    if (isSameRegion(previousRegion, initialRegion)) {
      return;
    }

    mapRef.current?.animateToRegion(initialRegion, 280);
  }, [initialRegion, layout]);

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
    <View
      collapsable={false}
      style={styles.container}
      onLayout={handleContainerLayout}
    >
      {layout !== null ? (
        <MapView
          ref={mapRef}
          style={{
            flex: 1,
            width: layout.width,
            height: layout.height,
          }}
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
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
