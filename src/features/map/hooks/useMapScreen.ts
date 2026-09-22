import { useEffect, useMemo, useRef, useState } from 'react';
import { useArea, useAppTheme } from '@/context';
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
  const timeOfDay = useSpotFilterStore((state) => state.timeOfDay);
  const relationship = useSpotFilterStore((state) => state.relationship);
  const area = useSpotFilterStore((state) => state.area);
  const category = useSpotFilterStore((state) => state.category);
  const query = useSpotFilterStore((state) => state.query);
  const favoritesOnly = useSpotFilterStore((state) => state.favoritesOnly);
  const favoriteSpotIds = useFavoriteStore((state) => state.favoriteSpotIds);
  const allSpots = useSpotCatalogStore((state) => state.spots);
  const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null);
  const skipNextMapPressRef = useRef(false);

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
    spots.find((spot) => spot.id === selectedSpotId) ?? null;

  const initialRegion = useMemo(
    (): MapRegion => ({
      latitude: referenceArea.latitude,
      longitude: referenceArea.longitude,
      latitudeDelta: 0.06,
      longitudeDelta: 0.06,
    }),
    [referenceArea.latitude, referenceArea.longitude],
  );

  useEffect(() => {
    if (
      selectedSpotId !== null &&
      !spots.some((spot) => spot.id === selectedSpotId)
    ) {
      setSelectedSpotId(null);
    }
  }, [selectedSpotId, spots]);

  const selectSpot = (spotId: string): void => {
    skipNextMapPressRef.current = true;
    setSelectedSpotId(spotId);
  };

  const clearSelectedSpot = (): void => {
    if (skipNextMapPressRef.current) {
      skipNextMapPressRef.current = false;
      return;
    }
    setSelectedSpotId(null);
  };

  const dismissSelectedSpot = (): void => {
    setSelectedSpotId(null);
  };

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
