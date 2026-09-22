import { type ReactElement } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppErrorBoundary } from '@/components/AppErrorBoundary';
import {
  AreaProvider,
  LanguageProvider,
  ThemeProvider,
  ToastProvider,
  UserLocationProvider,
  useAppTheme,
} from '@/context';
import { useAuth } from '@/features/auth';
import { useCouponUsage } from '@/features/coupons';
import { useFavorites } from '@/features/spots/hooks/useFavorites';
import { useSpotCatalog } from '@/features/spots/hooks/useSpotCatalog';
import { RootNavigator } from '@/navigation';

function AppContent(): ReactElement {
  const { isDark } = useAppTheme();
  useAuth();
  useSpotCatalog();
  useCouponUsage();
  useFavorites();

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <RootNavigator />
    </>
  );
}

export default function App(): ReactElement {
  return (
    <SafeAreaProvider>
      <AppErrorBoundary>
        <ThemeProvider>
          <LanguageProvider>
            <ToastProvider>
            <AreaProvider>
              <UserLocationProvider>
                <AppContent />
              </UserLocationProvider>
            </AreaProvider>
            </ToastProvider>
          </LanguageProvider>
        </ThemeProvider>
      </AppErrorBoundary>
    </SafeAreaProvider>
  );
}
