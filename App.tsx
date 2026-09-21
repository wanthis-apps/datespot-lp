import { type ReactElement } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppErrorBoundary } from '@/components/AppErrorBoundary';
import { useAuth } from '@/features/auth';
import { useCouponUsage } from '@/features/coupons';
import { useFavorites } from '@/features/spots/hooks/useFavorites';
import { useSpotCatalog } from '@/features/spots/hooks/useSpotCatalog';
import { RootNavigator } from '@/navigation';

function AppContent(): ReactElement {
  useAuth();
  useSpotCatalog();
  useCouponUsage();
  useFavorites();

  return (
    <>
      <StatusBar style="dark" />
      <RootNavigator />
    </>
  );
}

export default function App(): ReactElement {
  return (
    <SafeAreaProvider>
      <AppErrorBoundary>
        <AppContent />
      </AppErrorBoundary>
    </SafeAreaProvider>
  );
}
