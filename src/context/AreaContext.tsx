import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type AreaId =
  | 'shibuya'
  | 'ebisu'
  | 'roppongi'
  | 'odaiba'
  | 'yokohama';

export type AreaPreset = {
  id: AreaId;
  name: string;
  latitude: number;
  longitude: number;
};

export type AreaContextValue = {
  area: AreaPreset;
  areas: readonly AreaPreset[];
  setArea: (next: AreaId | AreaPreset) => void;
};

export const AREA_PRESETS: readonly AreaPreset[] = [
  {
    id: 'shibuya',
    name: '渋谷',
    latitude: 35.658,
    longitude: 139.7016,
  },
  {
    id: 'ebisu',
    name: '恵比寿',
    latitude: 35.6467,
    longitude: 139.7101,
  },
  {
    id: 'roppongi',
    name: '六本木',
    latitude: 35.6628,
    longitude: 139.7314,
  },
  {
    id: 'odaiba',
    name: 'お台場',
    latitude: 35.6267,
    longitude: 139.7761,
  },
  {
    id: 'yokohama',
    name: '横浜',
    latitude: 35.4658,
    longitude: 139.6223,
  },
];

const AREA_STORAGE_KEY = '@datespot/area-id';
const DEFAULT_AREA: AreaPreset = {
  id: 'shibuya',
  name: '渋谷',
  latitude: 35.658,
  longitude: 139.7016,
};

const AreaContext = createContext<AreaContextValue | null>(null);

function isAreaId(value: string): value is AreaId {
  return AREA_PRESETS.some((area) => area.id === value);
}

export function findAreaPreset(next: AreaId | AreaPreset): AreaPreset {
  if (typeof next !== 'string') {
    return next;
  }

  return AREA_PRESETS.find((area) => area.id === next) ?? DEFAULT_AREA;
}

export function AreaProvider({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  const [area, setAreaState] = useState<AreaPreset>(DEFAULT_AREA);

  useEffect(() => {
    void AsyncStorage.getItem(AREA_STORAGE_KEY).then((stored) => {
      if (stored !== null && isAreaId(stored)) {
        setAreaState(findAreaPreset(stored));
      }
    });
  }, []);

  const setArea = useCallback((next: AreaId | AreaPreset): void => {
    const resolved = findAreaPreset(next);
    setAreaState(resolved);
    void AsyncStorage.setItem(AREA_STORAGE_KEY, resolved.id);
  }, []);

  const value = useMemo(
    (): AreaContextValue => ({
      area,
      areas: AREA_PRESETS,
      setArea,
    }),
    [area, setArea],
  );

  return <AreaContext.Provider value={value}>{children}</AreaContext.Provider>;
}

export function useArea(): AreaContextValue {
  const value = useContext(AreaContext);
  if (value === null) {
    throw new Error('useArea は AreaProvider の内側で使ってください。');
  }

  return value;
}
