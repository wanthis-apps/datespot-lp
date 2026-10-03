import type { Spot } from '@/types';
import type { MapRegion } from '../types';

export type MapEdgePadding = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export type SpotMapHandle = {
  animateToRegion: (region: MapRegion, durationMs?: number) => void;
};

export type SpotMapProps = {
  spots: Spot[];
  selectedSpotId: string | null;
  initialRegion: MapRegion;
  cameraNonce: number;
  mapInstanceKey?: number;
  markerEpoch?: number;
  focusTarget?: MapRegion | null;
  onRegionChangeComplete?: (region: MapRegion) => void;
  pinColor: string;
  defaultPinColor: string;
  showsUserLocation?: boolean;
  mapPadding?: MapEdgePadding;
  onMarkerPress: (spotId: string) => void;
  onMapPress: () => void;
};
