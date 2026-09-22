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
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { palettes, type Palette } from '@/theme';
import { showToast } from './toastStore';

export type ThemeMode = 'system' | 'light' | 'dark';
export type ColorScheme = 'light' | 'dark';

export type ThemeContextValue = {
  mode: ThemeMode;
  colorScheme: ColorScheme;
  isDark: boolean;
  palette: Palette;
  setMode: (mode: ThemeMode) => void;
  setDarkMode: (enabled: boolean) => void;
};

const THEME_STORAGE_KEY = '@datespot/theme-mode';

const ThemeContext = createContext<ThemeContextValue | null>(null);

function isThemeMode(value: string): value is ThemeMode {
  return value === 'system' || value === 'light' || value === 'dark';
}

export function ThemeProvider({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');

  useEffect(() => {
    void AsyncStorage.getItem(THEME_STORAGE_KEY).then((stored) => {
      if (stored !== null && isThemeMode(stored)) {
        setModeState(stored);
      }
    });
  }, []);

  const setMode = useCallback((next: ThemeMode): void => {
    setModeState(next);
    void AsyncStorage.setItem(THEME_STORAGE_KEY, next);
    showToast({
      message:
        next === 'system'
          ? 'システム設定に合わせました'
          : next === 'dark'
            ? 'ダークモードをオンにしました'
            : 'ライトモードをオンにしました',
      type: 'success',
    });
  }, []);

  const setDarkMode = useCallback(
    (enabled: boolean): void => {
      setMode(enabled ? 'dark' : 'light');
    },
    [setMode],
  );

  const colorScheme: ColorScheme =
    mode === 'system'
      ? systemScheme === 'dark'
        ? 'dark'
        : 'light'
      : mode;

  const value = useMemo((): ThemeContextValue => {
    const isDark = colorScheme === 'dark';
    return {
      mode,
      colorScheme,
      isDark,
      palette: isDark ? palettes.night : palettes.day,
      setMode,
      setDarkMode,
    };
  }, [colorScheme, mode, setDarkMode, setMode]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useAppTheme(): ThemeContextValue {
  const value = useContext(ThemeContext);
  if (value === null) {
    throw new Error('useAppTheme は ThemeProvider の内側で使ってください。');
  }

  return value;
}
