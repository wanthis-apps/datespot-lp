import {
  createContext,
  useContext,
  useMemo,
  type ReactElement,
  type ReactNode,
} from 'react';
import {
  useDeviceLocation,
  type DeviceLocation,
} from '../../hooks/useDeviceLocation';
import type { GeoPoint } from '../../hooks/geo';
import { useArea } from './AreaContext';

const UserLocationContext = createContext<DeviceLocation | null>(null);

export function UserLocationProvider({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  const location = useDeviceLocation();

  return (
    <UserLocationContext.Provider value={location}>
      {children}
    </UserLocationContext.Provider>
  );
}

export function useUserLocation(): DeviceLocation {
  const value = useContext(UserLocationContext);
  if (value === null) {
    throw new Error(
      'useUserLocation は UserLocationProvider の内側で使ってください。',
    );
  }

  return value;
}

export function useDistanceOrigin(): GeoPoint {
  const { coordinates } = useUserLocation();
  const { area } = useArea();

  return useMemo(
    () =>
      coordinates ?? {
        latitude: area.latitude,
        longitude: area.longitude,
      },
    [area.latitude, area.longitude, coordinates],
  );
}
