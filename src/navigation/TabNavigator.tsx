import { type ComponentProps, type ReactElement } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAppTheme, useI18n } from '@/context';
import { MapScreen } from '@/features/map';
import { HomeScreen } from '@/features/spots';
import {
  CouponsScreen,
  FavoritesScreen,
  PlansScreen,
  ProfileScreen,
} from '@/screens';
import type { AppTranslationKey } from '@/i18n';
import type { TabParamList } from './types';

const TAB_LABEL_KEYS: Record<keyof TabParamList, AppTranslationKey> = {
  Home: 'tabs.Home',
  Map: 'tabs.Map',
  Coupons: 'tabs.Coupons',
  Favorites: 'tabs.Favorites',
  Plans: 'tabs.Plans',
  MyPage: 'tabs.MyPage',
};

const Tab = createBottomTabNavigator<TabParamList>();

type IoniconsName = ComponentProps<typeof Ionicons>['name'];

type TabIconSet = {
  focused: IoniconsName;
  unfocused: IoniconsName;
};

const TAB_ICONS: Record<keyof TabParamList, TabIconSet> = {
  Home: { focused: 'home', unfocused: 'home-outline' },
  Map: { focused: 'map', unfocused: 'map-outline' },
  Coupons: { focused: 'ticket', unfocused: 'ticket-outline' },
  Favorites: { focused: 'heart', unfocused: 'heart-outline' },
  Plans: { focused: 'calendar', unfocused: 'calendar-outline' },
  MyPage: { focused: 'person', unfocused: 'person-outline' },
};

export function TabNavigator(): ReactElement {
  const { palette } = useAppTheme();
  const { t } = useI18n();

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
        tabBarLabel: t(TAB_LABEL_KEYS[route.name]),
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
        name="Coupons"
        component={CouponsScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Plans"
        component={PlansScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="MyPage"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
}
