import { type ReactElement, useEffect, useLayoutEffect } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ErrorState, LoadingState, RemoteImage } from '@/components';
import { useAppTheme } from '@/context';
import { useRecentlyViewed } from '../../../../hooks/useRecentlyViewed';
import { CouponCard, useCouponUsage } from '@/features/coupons';
import type { RootStackScreenProps } from '@/navigation/types';
import { FavoriteButton } from '../components/FavoriteButton';
import { useFavorites } from '../hooks/useFavorites';
import { useSpotDetail } from '../hooks/useSpotDetail';
import {
  CATEGORY_LABELS,
  TIME_RECOMMENDED_LABELS,
} from '../types';

type SpotDetailScreenProps = RootStackScreenProps<'SpotDetail'>;

export function SpotDetailScreen({
  navigation,
  route,
}: SpotDetailScreenProps): ReactElement {
  const { spotId } = route.params;
  const insets = useSafeAreaInsets();
  const { isDark, palette } = useAppTheme();
  const { spot, coupons, isLoading, error, reload } = useSpotDetail(spotId);
  const { isUsed, redeem, redeemingCouponId } = useCouponUsage();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addRecentlyViewed } = useRecentlyViewed();
  const favorited = isFavorite(spotId);

  useEffect(() => {
    addRecentlyViewed(spotId);
  }, [addRecentlyViewed, spotId]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: spot?.name ?? 'スポット詳細',
      headerStyle: { backgroundColor: palette.background },
      headerTintColor: palette.text,
      headerShadowVisible: false,
      headerRight: () => (
        <FavoriteButton
          isFavorite={favorited}
          palette={palette}
          size="header"
          onPress={() => {
            void toggleFavorite(spotId);
          }}
        />
      ),
    });
  }, [
    favorited,
    navigation,
    palette,
    spot?.name,
    spotId,
    toggleFavorite,
  ]);

  const handleUseCoupon = (couponId: string, description: string): void => {
    Alert.alert('クーポンを利用しますか？', description, [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '利用する',
        onPress: () => {
          void redeem(couponId).then((result) => {
            Alert.alert(result.ok ? '完了' : '利用できません', result.message);
          });
        },
      },
    ]);
  };

  if (isLoading && spot === null) {
    return (
      <View style={[styles.screen, { backgroundColor: palette.background }]}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <LoadingState palette={palette} message="スポット詳細を読み込み中です…" />
      </View>
    );
  }

  if (error !== null && spot === null) {
    return (
      <View style={[styles.screen, { backgroundColor: palette.background }]}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <ErrorState
          palette={palette}
          message={error}
          onRetry={() => {
            void reload();
          }}
        />
      </View>
    );
  }

  if (spot === null) {
    return (
      <View style={[styles.screen, { backgroundColor: palette.background }]}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <ErrorState
          palette={palette}
          message="スポットが見つかりませんでした。"
          onRetry={() => {
            void reload();
          }}
        />
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: palette.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 32 },
        ]}
      >
        <View style={styles.hero}>
          <RemoteImage
            uri={spot.imageUrl}
            style={styles.image}
            accessibilityLabel={spot.name}
          />
          <View style={styles.favoriteOnImage}>
            <FavoriteButton
              isFavorite={favorited}
              palette={palette}
              onPress={() => {
                void toggleFavorite(spotId);
              }}
            />
          </View>
        </View>
        <View style={styles.body}>
          <Text style={[styles.meta, { color: palette.textSecondary }]}>
            {spot.area} ・ {CATEGORY_LABELS[spot.category]} ・{' '}
            {TIME_RECOMMENDED_LABELS[spot.timeRecommended]}
          </Text>
          <Text style={[styles.name, { color: palette.text }]}>{spot.name}</Text>
          {spot.isPartnerStore ? (
            <View style={[styles.partner, { backgroundColor: palette.coupon }]}>
              <Text style={[styles.partnerText, { color: palette.couponText }]}>
                提携店
              </Text>
            </View>
          ) : null}
          <Text style={[styles.description, { color: palette.textSecondary }]}>
            {spot.description}
          </Text>

          <Text style={[styles.sectionTitle, { color: palette.text }]}>
            クーポン
          </Text>
          {coupons.length === 0 ? (
            <Text style={[styles.empty, { color: palette.textSecondary }]}>
              このスポットのクーポンはありません。
            </Text>
          ) : (
            <View style={styles.couponList}>
              {coupons.map((coupon) => (
                <CouponCard
                  key={coupon.id}
                  coupon={coupon}
                  palette={palette}
                  used={isUsed(coupon.id)}
                  isUsing={redeemingCouponId === coupon.id}
                  onUse={() => handleUseCoupon(coupon.id, coupon.description)}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    gap: 16,
  },
  hero: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 240,
  },
  favoriteOnImage: {
    position: 'absolute',
    top: 12,
    left: 20,
  },
  body: {
    paddingHorizontal: 20,
    gap: 12,
  },
  meta: {
    fontSize: 13,
    fontWeight: '500',
  },
  name: {
    fontSize: 26,
    fontWeight: '700',
    lineHeight: 34,
  },
  partner: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  partnerText: {
    fontSize: 12,
    fontWeight: '700',
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
  },
  sectionTitle: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '700',
  },
  empty: {
    fontSize: 14,
    lineHeight: 22,
  },
  couponList: {
    gap: 12,
  },
});
