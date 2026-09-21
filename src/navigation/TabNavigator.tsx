import { type ComponentProps, type ReactElement } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MyPageScreen } from '@/features/auth';
import { MapScreen } from '@/features/map';
import { HomeScreen, useSpotFilterStore } from '@/features/spots';
import { palettes } from '@/theme';
import type { TabParamList } from './types';

const Tab = createBottomTabNavigator<TabParamList>();

type IoniconsName = ComponentProps<typeof Ionicons>['name'];

type TabIconSet = {
  focused: IoniconsName;
  unfocused: IoniconsName;
};

const TAB_ICONS: Record<keyof TabParamList, TabIconSet> = {
  Home: { focused: 'home', unfocused: 'home-outline' },
  Map: { focused: 'map', unfocused: 'map-outline' },
  MyPage: { focused: 'person', unfocused: 'person-outline' },
};

const TAB_LABELS: Record<keyof TabParamList, string> = {
  Home: 'ホーム',
  Map: 'マップ',
  MyPage: 'マイページ',
};

export function TabNavigator(): ReactElement {
  const timeOfDay = useSpotFilterStore((state) => state.timeOfDay);
  const palette = palettes[timeOfDay];

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerTitleAlign: 'center',
        headerShadowVisible: false,
        headerStyle: { backgroundColor: palette.background },
        headerTintColor: palette.text,
        tabBarActiveTintColor: palette.primary,
        tabBarInactiveTintColor: palette.muted,
        tabBarStyle: {
          backgroundColor: palette.surface,
          borderTopColor: palette.border,
        },
        tabBarLabel: TAB_LABELS[route.name],
        tabBarIcon: ({ color, size, focused }) => {
          const iconSet = TAB_ICONS[route.name];
          const iconName = focused ? iconSet.focused : iconSet.unfocused;
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="MyPage"
        component={MyPageScreen}
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
}
