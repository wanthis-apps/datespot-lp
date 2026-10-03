import { memo, type ReactElement } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { RemoteImage } from '@/components';
import type { Palette } from '@/theme';
import { formatJapaneseText } from '@/utils/formatJapaneseText';
import type { Spot } from '@/types';
import { CATEGORY_LABELS } from '../types';
import { hasFreeCoupon } from '../utils/filterSpots';
import { FavoriteButton } from './FavoriteButton';

type SpotCardProps = {
  spot: Spot;
  palette: Palette;
  onPress?: () => void;
};

function SpotCardComponent({
  spot,
  palette,
  onPress,
}: SpotCardProps): ReactElement {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[
        styles.card,
        { backgroundColor: palette.surface, borderColor: palette.border },
      ]}
    >
      <View style={styles.imageWrap}>
        <RemoteImage
          uri={spot.imageUrl}
          style={styles.image}
          accessibilityLabel={spot.name}
        />
        <LinearGradient
          colors={['transparent', 'rgba(0, 0, 0, 0.45)']}
          style={styles.imageFade}
        />
        {hasFreeCoupon(spot) ? (
          <View style={[styles.badge, { backgroundColor: palette.coupon }]}>
            <Text style={[styles.badgeText, { color: palette.couponText }]}>
              {spot.couponDescription}
            </Text>
          </View>
        ) : null}
        <View style={styles.favorite}>
          <FavoriteButton spotId={spot.id} palette={palette} />
        </View>
      </View>
      <View style={styles.body}>
        <Text style={[styles.name, { color: palette.text }]}>{spot.name}</Text>
        <Text style={[styles.meta, { color: palette.textSecondary }]}>
          {spot.area} ・ {CATEGORY_LABELS[spot.category]}
        </Text>
        <Text
          numberOfLines={2}
          textBreakStrategy="balanced"
          style={[styles.description, { color: palette.textSecondary }]}
        >
          {formatJapaneseText(spot.description, { maxBreaks: 1 })}
        </Text>
      </View>
    </Pressable>
  );
}

export const SpotCard = memo(SpotCardComponent);

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  imageWrap: {
    height: 168,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 72,
  },
  favorite: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 2,
  },
  badge: {
    position: 'absolute',
    top: 12,
    left: 12,
    zIndex: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  body: {
    paddingVertical: 16,
    paddingHorizontal: 14,
    gap: 6,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
  },
  meta: {
    fontSize: 13,
    fontWeight: '500',
  },
  description: {
    fontSize: 13,
    lineHeight: 20,
    letterSpacing: 0.5,
  },
});
