export type GeoPoint = {
  latitude: number;
  longitude: number;
};

const EARTH_RADIUS_KM = 6371;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function haversineKm(
  from: GeoPoint,
  to: GeoPoint,
): number {
  const dLat = toRadians(to.latitude - from.latitude);
  const dLon = toRadians(to.longitude - from.longitude);
  const lat1 = toRadians(from.latitude);
  const lat2 = toRadians(to.latitude);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

export function formatDistanceKm(distanceKm: number): string {
  if (!Number.isFinite(distanceKm)) {
    return '距離不明';
  }

  if (distanceKm < 1) {
    return `${Math.max(1, Math.round(distanceKm * 1000))}m`;
  }

  return `${distanceKm.toFixed(1)}km`;
}
