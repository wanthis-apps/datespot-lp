import { type ReactElement } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/components';
import { CouponCard } from '@/features/coupons';
import { MembershipStatusCard } from '@/features/subscription/components/MembershipStatusCard';
import { PremiumPlanModal } from '@/features/subscription/components/PremiumPlanModal';
import type { TabScreenProps } from '@/navigation/types';
import { useMyPageScreen } from '../hooks/useMyPageScreen';

type MyPageScreenProps = TabScreenProps<'MyPage'>;

export function MyPageScreen(_props: MyPageScreenProps): ReactElement {
  const insets = useSafeAreaInsets();
  const {
    role,
    isPremium,
    isPlanVisible,
    timeOfDay,
    palette,
    ctaLabel,
    coupons,
    couponsLoading,
    couponsError,
    redeemingCouponId,
    openPlan,
    closePlan,
    subscribe,
    redeemCoupon,
    reloadCoupons,
  } = useMyPageScreen();

  const handleUseCoupon = (couponId: string, description: string): void => {
    Alert.alert('クーポンを利用しますか？', description, [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '利用する',
        onPress: () => {
          void redeemCoupon(couponId).then((result) => {
            Alert.alert(result.ok ? '完了' : '利用できません', result.message);
          });
        },
      },
    ]);
  };

  return (
    <View
      style={[
        styles.screen,
        {
          backgroundColor: palette.background,
          paddingTop: insets.top + 8,
        },
      ]}
    >
      <StatusBar style={timeOfDay === 'night' ? 'light' : 'dark'} />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 24 },
        ]}
      >
        <Text style={[styles.kicker, { color: palette.primary }]}>Account</Text>
        <Text style={[styles.heading, { color: palette.text }]}>マイページ</Text>
        <MembershipStatusCard role={role} palette={palette} />
        <Button label={ctaLabel} onPress={openPlan} palette={palette} />

        <Text style={[styles.sectionTitle, { color: palette.text }]}>
          クーポン一覧
        </Text>
        {couponsLoading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={palette.primary} />
            <Text style={[styles.body, { color: palette.textSecondary }]}>
              クーポンを読み込み中です…
            </Text>
          </View>
        ) : couponsError !== null ? (
          <View style={styles.errorBox}>
            <Text style={[styles.body, { color: palette.textSecondary }]}>
              {couponsError}
            </Text>
            <Button
              label="再読み込み"
              onPress={() => {
                void reloadCoupons();
              }}
              palette={palette}
              variant="ghost"
            />
          </View>
        ) : coupons.length === 0 ? (
          <Text style={[styles.body, { color: palette.textSecondary }]}>
            利用できるクーポンはまだありません。
          </Text>
        ) : (
          <View style={styles.couponList}>
            {coupons.map((item) => (
              <CouponCard
                key={item.coupon.id}
                coupon={item.coupon}
                palette={palette}
                used={item.used}
                spotName={item.spotName}
                isUsing={redeemingCouponId === item.coupon.id}
                onUse={() =>
                  handleUseCoupon(item.coupon.id, item.coupon.description)
                }
              />
            ))}
          </View>
        )}
      </ScrollView>
      <PremiumPlanModal
        visible={isPlanVisible}
        isPremium={isPremium}
        palette={palette}
        onClose={closePlan}
        onSubscribe={subscribe}
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
    gap: 20,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 8,
  },
  body: {
    fontSize: 14,
    lineHeight: 22,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  errorBox: {
    gap: 12,
  },
  couponList: {
    gap: 12,
  },
});
