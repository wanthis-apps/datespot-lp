import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { InteractionManager } from 'react-native';
import type { GeoPoint } from './geo';

export type LocationPermissionState = 'unknown' | 'granted' | 'denied';

export type DeviceLocation = {
  coordinates: GeoPoint | null;
  permission: LocationPermissionState;
  hasPermission: boolean;
  requestCurrentLocation: () => Promise<GeoPoint | null>;
};

type LocationModule = typeof import('expo-location');
type LocationWatch = { remove: () => void };

function loadLocationModule(): LocationModule | null {
  try {
    return require('expo-location') as LocationModule;
  } catch (error) {
    console.error(
      '[DateSpot] expo-location を読み込めませんでした。ネイティブモジュールが無いビルドでは位置情報を使えません。',
      error,
    );
    return null;
  }
}

function describeError(error: unknown): string {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}`;
  }

  return String(error);
}

const QUICK_FIX_TIMEOUT_MS = 3000;

function withTimeout<T>(work: Promise<T>, timeoutMs: number): Promise<T | null> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(null), timeoutMs);
    work.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      () => {
        clearTimeout(timer);
        resolve(null);
      },
    );
  });
}

function toPoint(position: {
  coords: { latitude: number; longitude: number };
}): GeoPoint {
  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
  };
}
function samePoint(left: GeoPoint | null, right: GeoPoint): boolean {
  if (left === null) {
    return false;
  }

  const latitudeDelta = Math.abs(left.latitude - right.latitude);
  const longitudeDelta = Math.abs(left.longitude - right.longitude);
  return latitudeDelta < 0.0004 && longitudeDelta < 0.0004;
}

export function useDeviceLocation(): DeviceLocation {
  const [coordinates, setCoordinates] = useState<GeoPoint | null>(null);
  const [permission, setPermission] =
    useState<LocationPermissionState>('unknown');
  const watchRef = useRef<LocationWatch | null>(null);
  const requestRef = useRef<Promise<GeoPoint | null> | null>(null);

  const publish = useCallback(
    (latitude: number, longitude: number, force = false): void => {
      const next = { latitude, longitude };
      setCoordinates((current) => {
        if (!force && samePoint(current, next)) {
          return current;
        }
        if (
          current !== null &&
          current.latitude === next.latitude &&
          current.longitude === next.longitude
        ) {
          return current;
        }
        return next;
      });
    },
    [],
  );

  const refineLocation = useCallback(
    (Location: LocationModule): void => {
      void (async () => {
        try {
          const refined = await withTimeout(
            Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Balanced,
            }),
            QUICK_FIX_TIMEOUT_MS,
          );
          if (refined !== null) {
            const point = toPoint(refined);
            console.log('[DateSpot] 現在地を補正しました', point);
            publish(point.latitude, point.longitude, true);
          }
        } catch (error) {
          console.error(
            '[DateSpot] 現在地の補正に失敗しました',
            describeError(error),
            error,
          );
        }

        if (watchRef.current !== null) {
          return;
        }

        try {
          watchRef.current = await Location.watchPositionAsync(
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
        } catch (error) {
          console.error(
            '[DateSpot] 位置情報の監視を開始できませんでした',
            describeError(error),
            error,
          );
        }
      })();
    },
    [publish],
  );

  const requestCurrentLocation = useCallback(async (): Promise<GeoPoint | null> => {
    if (requestRef.current !== null) {
      return requestRef.current;
    }

    const task = (async (): Promise<GeoPoint | null> => {
      console.log('[DateSpot] 位置情報の取得を開始します');
      const Location = loadLocationModule();
      if (Location === null) {
        setPermission('denied');
        return null;
      }

      try {
        console.log(
          '[DateSpot] requestForegroundPermissionsAsync を呼び出します',
        );
        const response = await Location.requestForegroundPermissionsAsync();
        console.log('[DateSpot] 位置情報パーミッション結果', {
          status: response.status,
          granted: response.granted,
          canAskAgain: response.canAskAgain,
        });

        if (response.status !== 'granted') {
          console.error(
            '[DateSpot] 位置情報パーミッションが拒否されたため、現在地と距離計算を更新できません',
            {
              status: response.status,
              canAskAgain: response.canAskAgain,
            },
          );
          setPermission('denied');
          return null;
        }

        setPermission('granted');

        const lastKnown = await Location.getLastKnownPositionAsync();
        const cached =
          lastKnown === null ? null : toPoint(lastKnown);
        if (cached !== null) {
          console.log('[DateSpot] 直前の位置情報でマップを開きます', cached);
          publish(cached.latitude, cached.longitude, true);
        }

        void refineLocation(Location);

        if (cached !== null) {
          return cached;
        }

        const quick = await withTimeout(
          Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Low,
          }),
          QUICK_FIX_TIMEOUT_MS,
        );
        if (quick === null) {
          console.error(
            '[DateSpot] おおまかな現在地を時間内に取得できませんでした',
          );
          return null;
        }

        const resolved = toPoint(quick);
        console.log('[DateSpot] おおまかな現在地を取得しました', resolved);
        publish(resolved.latitude, resolved.longitude, true);
        return resolved;
      } catch (error) {
        console.error(
          '[DateSpot] 位置情報の要求に失敗しました',
          describeError(error),
          error,
        );
        setPermission((current) =>
          current === 'granted' ? current : 'denied',
        );
        return null;
      }
    })().finally(() => {
      requestRef.current = null;
    });

    requestRef.current = task;
    return task;
  }, [publish, refineLocation]);

  useEffect(() => {
    const interaction = InteractionManager.runAfterInteractions(() => {
      void requestCurrentLocation();
    });

    return () => {
      interaction.cancel();
      const watch = watchRef.current;
      watchRef.current = null;
      try {
        watch?.remove();
      } catch (error) {
        console.error(
          '[DateSpot] 位置情報の監視解除に失敗しました',
          describeError(error),
          error,
        );
      }
    };
  }, [requestCurrentLocation]);

  return useMemo(
    () => ({
      coordinates,
      permission,
      hasPermission: permission === 'granted',
      requestCurrentLocation,
    }),
    [coordinates, permission, requestCurrentLocation],
  );
}
