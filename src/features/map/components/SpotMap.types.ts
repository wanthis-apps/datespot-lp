import type { Spot } from '@/types';
import type { MapRegion } from '../types';
import type { MapCoordinate } from '../utils/mapCoordinates';

export type MapEdgePadding = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export type SpotMapProps = {
  spots: Spot[];
  selectedSpotId: string | null;
  initialRegion: MapRegion;
  pinColor: string;
  defaultPinColor: string;
  showsUserLocation?: boolean;
  userCoordinate?: MapCoordinate | null;
  mapPadding?: MapEdgePadding;
  onMarkerPress: (spotId: string) => void;
  onMapPress: () => void;
};
