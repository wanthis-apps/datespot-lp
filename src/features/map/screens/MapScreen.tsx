import { useCallback, useEffect, useMemo, useRef, useState, type ReactElement } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AreaHeader, LoadingState } from '@/components';
import { showToast } from '@/context';
import { useAppTheme, useUserLocation } from '@/context';
import type { TabScreenProps } from '@/navigation/types';
import { MapFilterBadge } from '../components/MapFilterBadge';
import { SpotMap } from '../components/SpotMap';
import type { SpotMapHandle } from '../components/SpotMap.types';
import { SpotPreviewCard } from '../components/SpotPreviewCard';
import { useMapScreen } from '../hooks/useMapScreen';
import { useMapPinStore } from '../store/mapPinStore';

type MapScreenProps = TabScreenProps<'Map'>;

export function MapScreen({ navigation, route }: MapScreenProps): ReactElement {
  const insets = useSafeAreaInsets();
  const { isDark } = useAppTheme();
  const { coordinates, requestCurrentLocation } = useUserLocation();
  const coordinatesRef = useRef(coordinates);
  coordinatesRef.current = coordinates;
  const [freshCenter, setFreshCenter] = useState<{
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  } | null>(null);
  const [awaitingFix, setAwaitingFix] = useState(true);
  const [markerEpoch, setMarkerEpoch] = useState(0);
  const hasShownMapRef = useRef(false);
  const mapHandleRef = useRef<SpotMapHandle>(null);
  const isFocused = useIsFocused();
  const isFocusedRef = useRef(false);
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

  const focusCurrentLocation = (): void => {
    void requestCurrentLocation().then((point) => {
      if (point === null) {
        showToast({
          message: '現在地を取得できませんでした',
          type: 'error',
        });
        return;
      }

      mapHandleRef.current?.animateToRegion({
        latitude: point.latitude,
        longitude: point.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      });
    });
  };

  const openSpotDetail = (spotId: string): void => {
    const trimmed = spotId.trim();
    if (trimmed.length === 0) {
      return;
    }

    navigation.navigate('SpotDetail', { spotId: trimmed });
  };

  const showMap = area !== null || !awaitingFix;
  const cachedSpots = useMapPinStore((state) => state.spots);
  const rememberSpots = useMapPinStore((state) => state.remember);
  const stableSpots = spots.length > 0 ? spots : cachedSpots;
  const mapSpotsRef = useRef(stableSpots);
  mapSpotsRef.current = stableSpots;

  useEffect(() => {
    rememberSpots(spots);
  }, [rememberSpots, spots]);

  const handleRegionChangeComplete = useCallback((): void => {
    if (!isFocused || !isFocusedRef.current) {
      return;
    }
  }, [isFocused]);

  useFocusEffect(
    useCallback(() => {
      isFocusedRef.current = true;
      console.log(
        `[MapScreen] Focus時 スポット保持件数: ${mapSpotsRef.current.length}件`,
      );
      setMarkerEpoch((value) => value + 1);

      let active = true;

      if (area !== null) {
        setFreshCenter(null);
        setAwaitingFix(false);
        hasShownMapRef.current = true;
        return () => {
          active = false;
          isFocusedRef.current = false;
        };
      }

      const alreadyShown = hasShownMapRef.current;
      const known = coordinatesRef.current;
      if (known !== null && !alreadyShown) {
        setFreshCenter({
          latitude: known.latitude,
          longitude: known.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
        hasShownMapRef.current = true;
        setAwaitingFix(false);
      } else if (!alreadyShown) {
        setAwaitingFix(true);
      }

      void requestCurrentLocation().then((point) => {
        if (!active) {
          return;
        }

        if (point !== null && !alreadyShown) {
          setFreshCenter({
            latitude: point.latitude,
            longitude: point.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          });
        }

        hasShownMapRef.current = true;
        setAwaitingFix(false);
      });

      return () => {
        active = false;
        isFocusedRef.current = false;
      };
    }, [area, requestCurrentLocation]),
  );

  const cameraRegion =
    area !== null || freshCenter === null ? initialRegion : freshCenter;
  const focusRequest = route.params;
  const mapSpots = useMemo(() => {
    if (
      selectedSpot === null ||
      stableSpots.some((spot) => spot.id === selectedSpot.id)
    ) {
      return stableSpots;
    }

    return [...stableSpots, selectedSpot];
  }, [selectedSpot, stableSpots]);
  const focusTarget = useMemo(() => {
    if (focusRequest === undefined) {
      return null;
    }

    return {
      latitude: focusRequest.latitude,
      longitude: focusRequest.longitude,
      latitudeDelta: 0.02,
      longitudeDelta: 0.02,
    };
  }, [focusRequest]);

  useEffect(() => {
    if (focusRequest === undefined) {
      return;
    }

    selectSpot(focusRequest.spotId);
  }, [focusRequest, selectSpot]);

  return (
    <View style={[styles.screen, { backgroundColor: palette.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View style={styles.mapHost}>
        {showMap ? (
        <SpotMap
          ref={mapHandleRef}
          spots={mapSpots}
          selectedSpotId={selectedSpot?.id ?? null}
          initialRegion={cameraRegion}
          cameraNonce={markerEpoch}
          mapInstanceKey={markerEpoch}
          markerEpoch={markerEpoch}
          focusTarget={focusTarget}
          onRegionChangeComplete={handleRegionChangeComplete}
          pinColor={palette.primary}
          defaultPinColor={palette.muted}
          showsUserLocation
          mapPadding={{
            top: insets.top + 132,
            right: 8,
            bottom: insets.bottom + 24,
            left: 8,
          }}
          onMarkerPress={(spotId) => {
            if (selectedSpot?.id === spotId) {
              openSpotDetail(spotId);
              return;
            }
            selectSpot(spotId);
          }}
          onMapPress={clearSelectedSpot}
        />
        ) : (
          <LoadingState palette={palette} message="現在地を取得しています…" />
        )}
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
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="現在地へ戻る"
        onPress={focusCurrentLocation}
        style={[
          styles.locateButton,
          {
            backgroundColor: palette.surface,
            borderColor: palette.border,
            bottom: insets.bottom + (selectedSpot !== null ? 248 : 24),
          },
        ]}
      >
        <MaterialIcons name="my-location" size={22} color={palette.primary} />
      </Pressable>
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
              openSpotDetail(selectedSpot.id);
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
  locateButton: {
    position: 'absolute',
    right: 16,
    zIndex: 5,
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1A1214',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
});
