import type { Spot } from '@/types';
import type { MapRegion } from '../types';

export type SpotMapProps = {
  spots: Spot[];
  selectedSpotId: string | null;
  initialRegion: MapRegion;
  pinColor: string;
  defaultPinColor: string;
  onMarkerPress: (spotId: string) => void;
  onMapPress: () => void;
};
