import { type ReactElement } from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CouponCardSkeleton, ErrorState, FittedHeading } from '@/components';
import { useAppTheme } from '@/context';
import { listedCouponSummary } from '@/features/coupons/utils/uniqueCoupons';
import { useCouponList } from '../../hooks/useCouponList';
import type { TabScreenProps } from '@/navigation/types';
import type { Coupon } from '../../types/database';
import { CouponListCard } from './components/CouponListCard';
import { EmptyState } from './components/EmptyState';

type CouponsScreenProps = TabScreenProps<'Coupons'>;

export function CouponsScreen({ navigation }: CouponsScreenProps): ReactElement {
  const insets = useSafeAreaInsets();
  const { isDark, palette } = useAppTheme();
  const { coupons, loading, error, refetch } = useCouponList();

  const handleOpenSpot = (coupon: Coupon): void => {
    const spotId = coupon.spot_id.trim();
    if (spotId.length === 0) {
      return;
    }

    navigation.navigate('SpotDetail', { spotId });
  };

  const handleUseCoupon = (coupon: Coupon): void => {
    Alert.alert(
      'クーポンを使用しますか？',
      listedCouponSummary(coupon),
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '使用する',
          onPress: () => {
            console.log('[DateSpot] coupon use (dummy)', {
              id: coupon.id,
              title: coupon.title,
              spot: coupon.spot?.name ?? coupon.spot_id,
            });
            Alert.alert(
              '利用を受け付けました',
              'この操作は画面確認用のダミーアクションです。',
            );
          },
        },
      ],
    );
  };

  const screenStyle = [
    styles.screen,
    {
      backgroundColor: palette.background,
      paddingTop: insets.top + 8,
    },
  ];

  if (loading && coupons.length === 0) {
    return (
      <View style={screenStyle}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <View style={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
          <View style={styles.header}>
            <Text style={[styles.kicker, { color: palette.primary }]}>
              Coupons
            </Text>
            <FittedHeading style={[styles.heading, { color: palette.text }]}>
              クーポン一覧
            </FittedHeading>
          </View>
          <View style={styles.skeletonList}>
            <CouponCardSkeleton palette={palette} />
            <CouponCardSkeleton palette={palette} />
            <CouponCardSkeleton palette={palette} />
          </View>
        </View>
      </View>
    );
  }

  if (error !== null && coupons.length === 0) {
    return (
      <View style={screenStyle}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <ErrorState
          palette={palette}
          message={error}
          onRetry={() => {
            void refetch();
          }}
        />
      </View>
    );
  }

  return (
    <View style={screenStyle}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <FlatList
        data={coupons}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 24 },
          coupons.length === 0 ? styles.emptyContent : null,
        ]}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={[styles.kicker, { color: palette.primary }]}>
              Coupons
            </Text>
            <FittedHeading style={[styles.heading, { color: palette.text }]}>
              クーポン一覧
            </FittedHeading>
            <Text style={[styles.lead, { color: palette.textSecondary }]}>
              {'提携スポットで使える\n特典をまとめています。'}
            </Text>
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            palette={palette}
            icon="ticket-outline"
            title="クーポンがありません"
            message={'いま使えるクーポンはありません。\nスポットを探して、\n特典付きのお店を見つけてみましょう。'}
          />
        }
        renderItem={({ item }) => (
          <CouponListCard
            coupon={item}
            palette={palette}
            onOpenSpot={() => handleOpenSpot(item)}
            onUse={() => handleUseCoupon(item)}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  emptyContent: {
    flexGrow: 1,
  },
  header: {
    gap: 8,
    marginBottom: 20,
  },
  kicker: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  heading: {
    fontSize: 26,
    fontWeight: '700',
  },
  lead: {
    fontSize: 14,
    lineHeight: 22,
  },
  separator: {
    height: 14,
  },
  skeletonList: {
    gap: 14,
  },
});
