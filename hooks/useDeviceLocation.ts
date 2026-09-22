import { useEffect, useMemo, useState } from 'react';
import * as Location from 'expo-location';
import type { GeoPoint } from './geo';

export type LocationPermissionState = 'unknown' | 'granted' | 'denied';

export type DeviceLocation = {
  coordinates: GeoPoint | null;
  permission: LocationPermissionState;
};

function samePoint(left: GeoPoint | null, right: GeoPoint): boolean {
  return (
    left !== null &&
    left.latitude === right.latitude &&
    left.longitude === right.longitude
  );
}

export function useDeviceLocation(): DeviceLocation {
  const [coordinates, setCoordinates] = useState<GeoPoint | null>(null);
  const [permission, setPermission] =
    useState<LocationPermissionState>('unknown');

  useEffect(() => {
    let active = true;
    let subscription: Location.LocationSubscription | null = null;

    const publish = (latitude: number, longitude: number): void => {
      if (!active) {
        return;
      }

      const next = { latitude, longitude };
      setCoordinates((current) => (samePoint(current, next) ? current : next));
    };

    const start = async (): Promise<void> => {
      try {
        const existing = await Location.getForegroundPermissionsAsync();
        const response =
          existing.status === 'granted'
            ? existing
            : await Location.requestForegroundPermissionsAsync();

        if (!active) {
          return;
        }

        if (response.status !== 'granted') {
          setPermission('denied');
          return;
        }

        setPermission('granted');

        try {
          const position = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          publish(position.coords.latitude, position.coords.longitude);
        } catch {
          const lastKnown = await Location.getLastKnownPositionAsync();
          if (lastKnown !== null) {
            publish(lastKnown.coords.latitude, lastKnown.coords.longitude);
          }
        }

        if (!active) {
          return;
        }

        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            distanceInterval: 30,
            timeInterval: 10000,
          },
          (nextPosition) => {
            publish(
              nextPosition.coords.latitude,
              nextPosition.coords.longitude,
            );
          },
        );

        if (!active) {
          subscription.remove();
          subscription = null;
        }
      } catch {
        if (active) {
          setPermission((current) =>
            current === 'granted' ? current : 'denied',
          );
        }
      }
    };

    void start();

    return () => {
      active = false;
      subscription?.remove();
    };
  }, []);

  return useMemo(
    () => ({ coordinates, permission }),
    [coordinates, permission],
  );
}
