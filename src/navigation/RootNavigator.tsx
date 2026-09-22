import { type ReactElement } from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoadingState } from '@/components';
import { useAppTheme, useI18n } from '@/context';
import { useAuth } from '@/features/auth';
import { useOnboarding } from '../../hooks/useOnboarding';
import { SpotDetailScreen } from '@/features/spots/screens/SpotDetailScreen';
import {
  AuthScreen,
  ContactScreen,
  CouponHistoryScreen,
  FaqScreen,
  LegalScreen,
  NotificationsScreen,
  NotificationSettingsScreen,
  OnboardingScreen,
} from '@/screens';
import { TabNavigator } from './TabNavigator';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator(): ReactElement {
  const { isReady, isLoading, needsAuth } = useAuth();
  const { completed, hydrated } = useOnboarding();
  const { palette } = useAppTheme();
  const { t } = useI18n();

  if (isLoading || !isReady || !hydrated) {
    return (
      <View style={{ flex: 1, backgroundColor: palette.background }}>
        <LoadingState palette={palette} message={t('common.starting')} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {!completed ? (
        <OnboardingScreen />
      ) : needsAuth ? (
        <AuthScreen />
      ) : (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Main" component={TabNavigator} />
          <Stack.Screen
            name="SpotDetail"
            component={SpotDetailScreen}
            options={{ headerShown: true, title: t('nav.spotDetail') }}
          />
          <Stack.Screen
            name="CouponHistory"
            component={CouponHistoryScreen}
            options={{ headerShown: true, title: t('nav.couponHistory') }}
          />
          <Stack.Screen
            name="Notifications"
            component={NotificationsScreen}
            options={{ headerShown: true, title: t('nav.notifications') }}
          />
          <Stack.Screen
            name="Faq"
            component={FaqScreen}
            options={{ headerShown: true, title: t('nav.faq') }}
          />
          <Stack.Screen
            name="Legal"
            component={LegalScreen}
            options={{ headerShown: true, title: t('nav.legal') }}
          />
          <Stack.Screen
            name="Contact"
            component={ContactScreen}
            options={{ headerShown: true, title: t('nav.contact') }}
          />
          <Stack.Screen
            name="NotificationSettings"
            component={NotificationSettingsScreen}
            options={{
              headerShown: true,
              title: t('nav.notificationSettings'),
            }}
          />
          <Stack.Screen
            name="Onboarding"
            component={OnboardingScreen}
            options={{ headerShown: false, title: t('nav.onboarding') }}
          />
          <Stack.Screen
            name="Auth"
            component={AuthScreen}
            options={{ headerShown: true, title: t('nav.auth') }}
          />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}
