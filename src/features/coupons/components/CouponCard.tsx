import { memo, type ReactElement } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components';
import type { Palette } from '@/theme';
import type { Coupon } from '@/types';
import { formatCouponExpiry, isCouponExpired } from '../utils/couponStatus';

type CouponCardProps = {
  coupon: Coupon;
  palette: Palette;
  used: boolean;
  isUsing?: boolean;
  spotName?: string;
  onUse: () => void;
};

function CouponCardComponent({
  coupon,
  palette,
  used,
  isUsing = false,
  spotName,
  onUse,
}: CouponCardProps): ReactElement {
  const expired = isCouponExpired(coupon);
  const disabled = used || expired || isUsing;

  let actionLabel = 'このクーポンを使う';
  if (isUsing) {
    actionLabel = '処理中…';
  } else if (used) {
    actionLabel = '利用済み';
  } else if (expired) {
    actionLabel = '期限切れ';
  }

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: palette.surface, borderColor: palette.border },
      ]}
    >
      {spotName !== undefined ? (
        <Text style={[styles.spotName, { color: palette.textSecondary }]}>
          {spotName}
        </Text>
      ) : null}
      <Text style={[styles.description, { color: palette.text }]}>
        {coupon.description}
      </Text>
      <Text style={[styles.expiry, { color: palette.muted }]}>
        {formatCouponExpiry(coupon.validUntil)}
      </Text>
      <Button
        label={actionLabel}
        onPress={onUse}
        palette={palette}
        disabled={disabled}
        variant={used || expired ? 'ghost' : 'primary'}
      />
    </View>
  );
}

export const CouponCard = memo(CouponCardComponent);

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  spotName: {
    fontSize: 12,
    fontWeight: '600',
  },
  description: {
    fontSize: 16,
    fontWeight: '700',
  },
  expiry: {
    fontSize: 12,
    marginBottom: 4,
  },
});
