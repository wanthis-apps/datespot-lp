import { memo, type ReactElement } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DirectionsButton, RemoteImage } from '@/components';
import { SpotDetailFacts } from '@/features/spots/components/SpotDetailFacts';
import type { Palette } from '@/theme';
import type { Spot } from '@/types';

type SpotPreviewCardProps = {
  spot: Spot;
  palette: Palette;
  onClose: () => void;
  onPress: () => void;
};

function SpotPreviewCardComponent({
  spot,
  palette,
  onClose,
  onPress,
}: SpotPreviewCardProps): ReactElement {
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: palette.surface, borderColor: palette.border },
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${spot.name}の詳細を開く`}
        onPress={onPress}
        style={styles.hitArea}
      >
        <View style={styles.topRow}>
          <RemoteImage
            uri={spot.imageUrl}
            style={styles.image}
            accessibilityLabel={spot.name}
          />
          <View style={styles.facts}>
            <SpotDetailFacts spot={spot} palette={palette} />
          </View>
        </View>
        <View style={styles.ctaRow}>
          <Text style={[styles.cta, { color: palette.primary }]}>詳細を見る</Text>
          <Ionicons name="chevron-forward" size={16} color={palette.primary} />
        </View>
      </Pressable>
      <DirectionsButton
        latitude={spot.location.lat}
        longitude={spot.location.lng}
        palette={palette}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="プレビューを閉じる"
        hitSlop={8}
        onPress={onClose}
        style={styles.close}
      >
        <Ionicons name="close" size={18} color={palette.textSecondary} />
      </Pressable>
    </View>
  );
}

export const SpotPreviewCard = memo(SpotPreviewCardComponent);

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.16,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  hitArea: {
    gap: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  image: {
    width: 84,
    height: 84,
    borderRadius: 14,
  },
  facts: {
    flex: 1,
    paddingRight: 28,
  },
  close: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  cta: {
    fontSize: 13,
    fontWeight: '700',
  },
});
