import { type ReactElement } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RemoteImage } from '@/components';
import type { Palette } from '@/theme';
import type { Spot } from '@/types';
import { CATEGORY_LABELS } from '../types';

type SpotListRowProps = {
  spot: Spot;
  palette: Palette;
  onPress: () => void;
};

export function SpotListRow({
  spot,
  palette,
  onPress,
}: SpotListRowProps): ReactElement {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${spot.name}の詳細を開く`}
      onPress={onPress}
      style={[
        styles.row,
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
      </View>
      <Ionicons name="chevron-forward" size={18} color={palette.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 16,
    padding: 10,
  },
  image: {
    width: 64,
    height: 64,
    borderRadius: 12,
  },
  body: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
  },
  meta: {
    fontSize: 12,
    fontWeight: '500',
  },
});
