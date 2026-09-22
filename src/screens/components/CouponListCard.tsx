import { type ReactElement } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, RemoteImage } from '@/components';
import { formatValidUntil } from '../../../hooks/mapRecords';
import type { Palette } from '@/theme';
import type { Coupon } from '../../../types/database';

type CouponListCardProps = {
  coupon: Coupon;
  palette: Palette;
  onUse: () => void;
};

export function CouponListCard({
  coupon,
  palette,
  onUse,
}: CouponListCardProps): ReactElement {
  const spotName = coupon.spot?.name ?? 'スポット';

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: palette.surface, borderColor: palette.border },
      ]}
    >
      <View style={[styles.accent, { backgroundColor: palette.primary }]} />
      <View style={styles.body}>
        <View style={styles.header}>
          <RemoteImage
            uri={coupon.spot?.image_url}
            style={styles.thumb}
            accessibilityLabel={spotName}
          />
          <View style={styles.headerText}>
            <Text
              style={[styles.spotName, { color: palette.textSecondary }]}
              numberOfLines={1}
            >
              {spotName}
            </Text>
            <Text style={[styles.title, { color: palette.text }]}>
              {coupon.title}
            </Text>
          </View>
        </View>

        <Text style={[styles.detail, { color: palette.textSecondary }]}>
          {coupon.discount_detail}
        </Text>

        <View style={styles.metaRow}>
          <Ionicons name="calendar-outline" size={14} color={palette.muted} />
          <Text style={[styles.expiry, { color: palette.muted }]}>
            {formatValidUntil(coupon.valid_until)}
          </Text>
        </View>

        <Button label="クーポンを使用する" onPress={onUse} palette={palette} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#2B1D1F',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  accent: {
    width: 6,
  },
  body: {
    flex: 1,
    padding: 16,
    gap: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 14,
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  spotName: {
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 24,
  },
  detail: {
    fontSize: 14,
    lineHeight: 21,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  expiry: {
    fontSize: 12,
    fontWeight: '600',
  },
});
