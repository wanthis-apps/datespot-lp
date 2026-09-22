import { type ReactElement } from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoadingState } from '@/components';
import { useAuth } from '@/features/auth';
import { useSpotFilterStore } from '@/features/spots';
import { SpotDetailScreen } from '@/features/spots/screens/SpotDetailScreen';
import { AuthScreen, CouponHistoryScreen } from '@/screens';
import { palettes } from '@/theme';
import { TabNavigator } from './TabNavigator';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator(): ReactElement {
  const { isReady, isLoading, needsAuth } = useAuth();
  const timeOfDay = useSpotFilterStore((state) => state.timeOfDay);
  const palette = palettes[timeOfDay];

  if (isLoading || !isReady) {
    return (
      <View style={{ flex: 1, backgroundColor: palette.background }}>
        <LoadingState palette={palette} message="起動しています…" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {needsAuth ? (
        <AuthScreen />
      ) : (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Main" component={TabNavigator} />
          <Stack.Screen
            name="SpotDetail"
            component={SpotDetailScreen}
            options={{ headerShown: true, title: 'スポット詳細' }}
          />
          <Stack.Screen
            name="CouponHistory"
            component={CouponHistoryScreen}
            options={{ headerShown: true, title: 'クーポン利用履歴' }}
          />
          <Stack.Screen
            name="Auth"
            component={AuthScreen}
            options={{ headerShown: true, title: 'ログイン' }}
          />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}
