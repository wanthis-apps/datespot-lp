import { useCallback, useMemo, useRef, useState } from 'react';
import { AREA_PRESETS, useArea, useAppTheme, useUserLocation } from '@/context';
import type { Palette } from '@/theme';
import type { RelationshipStatus, Spot, SpotCategory, TimeOfDay } from '@/types';
import { useFavoriteStore } from '@/features/spots/store/favoriteStore';
import { useSpotCatalogStore } from '@/features/spots/store/spotCatalogStore';
import { useSpotFilterStore } from '@/features/spots/store/spotFilterStore';
import { filterSpots } from '@/features/spots/utils/filterSpots';
import type { MapRegion } from '../types';

export type MapScreenViewModel = {
  timeOfDay: TimeOfDay;
  relationship: RelationshipStatus | null;
  area: string | null;
  category: SpotCategory | null;
  query: string;
  favoritesOnly: boolean;
  spots: Spot[];
  selectedSpot: Spot | null;
  palette: Palette;
  initialRegion: MapRegion;
  selectSpot: (spotId: string) => void;
  clearSelectedSpot: () => void;
  dismissSelectedSpot: () => void;
};

export function useMapScreen(): MapScreenViewModel {
  const { palette } = useAppTheme();
  const { area: referenceArea } = useArea();
  const { coordinates } = useUserLocation();
  const timeOfDay = useSpotFilterStore((state) => state.timeOfDay);
  const relationship = useSpotFilterStore((state) => state.relationship);
  const area = useSpotFilterStore((state) => state.area);
  const category = useSpotFilterStore((state) => state.category);
  const query = useSpotFilterStore((state) => state.query);
  const favoritesOnly = useSpotFilterStore((state) => state.favoritesOnly);
  const favoriteSpotIds = useFavoriteStore((state) => state.favoriteSpotIds);
  const allSpots = useSpotCatalogStore((state) => state.spots);
  const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null);
  const ignoreMapPressUntilRef = useRef(0);

  const spots = useMemo(
    () =>
      filterSpots(allSpots, {
        timeOfDay,
        relationship,
        area,
        category,
        query,
        favoritesOnly,
        favoriteSpotIds,
      }),
    [
      allSpots,
      area,
      category,
      favoriteSpotIds,
      favoritesOnly,
      query,
      relationship,
      timeOfDay,
    ],
  );

  const selectedSpot =
    allSpots.find((spot) => spot.id === selectedSpotId) ??
    spots.find((spot) => spot.id === selectedSpotId) ??
    null;

  const initialRegion = useMemo((): MapRegion => {
    const namedArea = regionForAreaName(area, allSpots);
    if (namedArea !== null) {
      return namedArea;
    }

    if (coordinates !== null) {
      return {
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
    }

    return {
      latitude: referenceArea.latitude,
      longitude: referenceArea.longitude,
      latitudeDelta: 0.06,
      longitudeDelta: 0.06,
    };
  }, [
    allSpots,
    area,
    coordinates,
    referenceArea.latitude,
    referenceArea.longitude,
  ]);

  const selectSpot = useCallback((spotId: string): void => {
    ignoreMapPressUntilRef.current = Date.now() + 600;
    setSelectedSpotId(spotId);
  }, []);

  const clearSelectedSpot = useCallback((): void => {
    if (Date.now() < ignoreMapPressUntilRef.current) {
      return;
    }
    setSelectedSpotId(null);
  }, []);

  const dismissSelectedSpot = useCallback((): void => {
    setSelectedSpotId(null);
  }, []);

  return {
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
  };
}

function regionForAreaName(
  areaName: string | null,
  spots: readonly Spot[],
): MapRegion | null {
  if (areaName === null || areaName.trim() === '') {
    return null;
  }

  const preset = AREA_PRESETS.find(
    (item) =>
      item.name === areaName ||
      areaName.includes(item.name) ||
      item.name.includes(areaName),
  );
  if (preset !== undefined) {
    return {
      latitude: preset.latitude,
      longitude: preset.longitude,
      latitudeDelta: 0.06,
      longitudeDelta: 0.06,
    };
  }

  const matched = spots.filter((spot) => spot.area === areaName);
  if (matched.length === 0) {
    return null;
  }

  const latitude =
    matched.reduce((sum, spot) => sum + spot.location.lat, 0) / matched.length;
  const longitude =
    matched.reduce((sum, spot) => sum + spot.location.lng, 0) / matched.length;

  return {
    latitude,
    longitude,
    latitudeDelta: 0.06,
    longitudeDelta: 0.06,
  };
}
