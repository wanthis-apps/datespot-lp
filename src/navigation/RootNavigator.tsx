import { type ReactElement } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SpotDetailScreen } from '@/features/spots/screens/SpotDetailScreen';
import { TabNavigator } from './TabNavigator';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator(): ReactElement {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={TabNavigator} />
        <Stack.Screen
          name="SpotDetail"
          component={SpotDetailScreen}
          options={{ headerShown: true, title: 'スポット詳細' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
