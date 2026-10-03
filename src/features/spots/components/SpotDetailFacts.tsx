import { type ReactElement } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Palette } from '@/theme';
import type { Spot } from '@/types';
import { formatJapaneseText } from '@/utils/formatJapaneseText';
import { CATEGORY_LABELS, TIME_RECOMMENDED_LABELS } from '../types';

type SpotDetailFactsProps = {
  spot: Spot;
  palette: Palette;
};

export function SpotDetailFacts({
  spot,
  palette,
}: SpotDetailFactsProps): ReactElement {
  return (
    <View style={styles.block}>
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
      <Text
        textBreakStrategy="balanced"
        style={[styles.description, { color: palette.textSecondary }]}
      >
        {formatJapaneseText(spot.description, { maxBreaks: 2 })}
      </Text>
      {spot.couponDescription !== null ? (
        <Text style={[styles.coupon, { color: palette.primary }]}>
          {spot.couponDescription}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: 8,
  },
  meta: {
    fontSize: 12,
    fontWeight: '600',
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
  },
  partner: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  partnerText: {
    fontSize: 12,
    fontWeight: '700',
  },
  description: {
    fontSize: 14,
    lineHeight: 21,
    letterSpacing: 0.5,
  },
  coupon: {
    fontSize: 13,
    fontWeight: '700',
  },
});
