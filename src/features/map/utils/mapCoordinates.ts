import type { Spot } from '@/types';
import { TOKYO_REGION, type MapRegion } from '../types';

export type MapCoordinate = {
  latitude: number;
  longitude: number;
};

const MIN_DELTA = 0.04;
const REGION_PADDING = 1.4;

function toFiniteNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
}

function isValidLatitude(value: number): boolean {
  return value >= -90 && value <= 90;
}

function isValidLongitude(value: number): boolean {
  return value >= -180 && value <= 180;
}

export function getValidCoordinate(spot: Spot): MapCoordinate | null {
  const location = spot.location;
  if (location == null || typeof location !== 'object') {
    return null;
  }

  const latitude = toFiniteNumber(location.lat);
  const longitude = toFiniteNumber(location.lng);
  if (
    latitude === null ||
    longitude === null ||
    !isValidLatitude(latitude) ||
    !isValidLongitude(longitude)
  ) {
    return null;
  }

  return { latitude, longitude };
}

export function isSameRegion(left: MapRegion, right: MapRegion): boolean {
  return (
    left.latitude === right.latitude &&
    left.longitude === right.longitude &&
    left.latitudeDelta === right.latitudeDelta &&
    left.longitudeDelta === right.longitudeDelta
  );
}

export function computeMapRegion(spots: readonly Spot[]): MapRegion {
  const coordinates = spots.flatMap((spot) => {
    const coordinate = getValidCoordinate(spot);
    return coordinate === null ? [] : [coordinate];
  });

  if (coordinates.length === 0) {
    return TOKYO_REGION;
  }

  const firstCoordinate = coordinates[0];
  if (coordinates.length === 1 && firstCoordinate !== undefined) {
    return {
      latitude: firstCoordinate.latitude,
      longitude: firstCoordinate.longitude,
      latitudeDelta: MIN_DELTA,
      longitudeDelta: MIN_DELTA,
    };
  }

  const latitudes = coordinates.map((coordinate) => coordinate.latitude);
  const longitudes = coordinates.map((coordinate) => coordinate.longitude);
  const minLatitude = Math.min(...latitudes);
  const maxLatitude = Math.max(...latitudes);
  const minLongitude = Math.min(...longitudes);
  const maxLongitude = Math.max(...longitudes);

  return {
    latitude: (minLatitude + maxLatitude) / 2,
    longitude: (minLongitude + maxLongitude) / 2,
    latitudeDelta: Math.max((maxLatitude - minLatitude) * REGION_PADDING, MIN_DELTA),
    longitudeDelta: Math.max(
      (maxLongitude - minLongitude) * REGION_PADDING,
      MIN_DELTA,
    ),
  };
}
