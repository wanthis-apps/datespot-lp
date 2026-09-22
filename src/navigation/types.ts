import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type TabParamList = {
  Home: undefined;
  Map: undefined;
  Coupons: undefined;
  Favorites: undefined;
  Plans: undefined;
  MyPage: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Main: NavigatorScreenParams<TabParamList>;
  SpotDetail: { spotId: string };
  CouponHistory: undefined;
  Notifications: undefined;
  Faq: undefined;
  Legal: { document?: 'terms' | 'privacy' } | undefined;
  Contact: undefined;
  NotificationSettings: undefined;
  Onboarding: { replay?: boolean } | undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type TabScreenProps<T extends keyof TabParamList> = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, T>,
  NativeStackScreenProps<RootStackParamList>
>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
