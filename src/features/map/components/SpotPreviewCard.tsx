import { type ReactElement } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RemoteImage } from '@/components';
import type { Palette } from '@/theme';
import type { Spot } from '@/types';
import { CATEGORY_LABELS, hasFreeCoupon } from '@/features/spots';

type SpotPreviewCardProps = {
  spot: Spot;
  palette: Palette;
  onClose: () => void;
  onPress?: () => void;
};

export function SpotPreviewCard({
  spot,
  palette,
  onClose,
  onPress,
}: SpotPreviewCardProps): ReactElement {
  const perk = hasFreeCoupon(spot)
    ? spot.couponDescription
    : '提携特典はありません';

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[
        styles.card,
        { backgroundColor: palette.surface, borderColor: palette.border },
      ]}
    >
      <RemoteImage
        uri={spot.imageUrl}
        style={styles.image}
        accessibilityLabel={spot.name}
      />
      <View style={styles.body}>
        <Text style={[styles.name, { color: palette.text }]} numberOfLines={1}>
          {spot.name}
        </Text>
        <Text style={[styles.meta, { color: palette.textSecondary }]}>
          {spot.area} ・ {CATEGORY_LABELS[spot.category]}
        </Text>
        <Text
          style={[
            styles.perk,
            { color: hasFreeCoupon(spot) ? palette.primary : palette.muted },
          ]}
          numberOfLines={1}
        >
          {perk}
        </Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="閉じる"
        onPress={onClose}
        style={styles.close}
      >
        <Ionicons name="close" size={18} color={palette.textSecondary} />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    padding: 10,
    gap: 12,
  },
  image: {
    width: 72,
    height: 72,
    borderRadius: 14,
  },
  body: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
  },
  meta: {
    fontSize: 12,
    fontWeight: '500',
  },
  perk: {
    fontSize: 12,
    fontWeight: '700',
  },
  close: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
