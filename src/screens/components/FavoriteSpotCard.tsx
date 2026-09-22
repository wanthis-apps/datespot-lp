import { memo, type ReactElement } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RemoteImage } from '@/components';
import {
  FOUNDATION_CATEGORY_LABELS,
  formatPriceRange,
} from '../../../hooks/mapRecords';
import type { Palette } from '@/theme';
import type { Spot } from '../../../types/database';

type FavoriteSpotCardProps = {
  spot: Spot;
  palette: Palette;
  selectionMode?: boolean;
  selected?: boolean;
  onPress: () => void;
  onRemoveFavorite: () => void;
};

function FavoriteSpotCardComponent({
  spot,
  palette,
  selectionMode = false,
  selected = false,
  onPress,
  onRemoveFavorite,
}: FavoriteSpotCardProps): ReactElement {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        selectionMode
          ? `${spot.name}を${selected ? '選択解除' : '選択'}`
          : `${spot.name}の詳細を開く`
      }
      accessibilityState={selectionMode ? { selected } : undefined}
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: palette.surface,
          borderColor: selected ? palette.primary : palette.border,
        },
      ]}
    >
      {selectionMode ? (
        <View
          style={[
            styles.checkbox,
            {
              backgroundColor: selected ? palette.primary : palette.background,
              borderColor: selected ? palette.primary : palette.border,
            },
          ]}
        >
          {selected ? (
            <Ionicons name="checkmark" size={16} color="#FFFFFF" />
          ) : null}
        </View>
      ) : null}
      <RemoteImage
        uri={spot.image_url}
        style={styles.image}
        accessibilityLabel={spot.name}
      />
      <View style={styles.body}>
        <Text style={[styles.name, { color: palette.text }]} numberOfLines={2}>
          {spot.name}
        </Text>
        <View style={styles.tags}>
          <View
            style={[styles.tag, { backgroundColor: palette.primaryMuted }]}
          >
            <Text style={[styles.tagText, { color: palette.primary }]}>
              {FOUNDATION_CATEGORY_LABELS[spot.category]}
            </Text>
          </View>
          <View style={[styles.tag, { backgroundColor: palette.coupon }]}>
            <Text style={[styles.tagText, { color: palette.couponText }]}>
              {formatPriceRange(spot.price_range)}
            </Text>
          </View>
        </View>
        {spot.address !== null ? (
          <Text
            style={[styles.address, { color: palette.muted }]}
            numberOfLines={1}
          >
            {spot.address}
          </Text>
        ) : null}
      </View>
      {selectionMode ? null : (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="お気に入りから外す"
          hitSlop={8}
          onPress={(event) => {
            event.stopPropagation();
            onRemoveFavorite();
          }}
          style={[styles.heart, { backgroundColor: palette.primaryMuted }]}
        >
          <Ionicons name="heart" size={18} color={palette.primary} />
        </Pressable>
      )}
    </Pressable>
  );
}

export const FavoriteSpotCard = memo(FavoriteSpotCardComponent);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderRadius: 20,
    padding: 12,
    shadowColor: '#2B1D1F',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 88,
    height: 88,
    borderRadius: 16,
  },
  body: {
    flex: 1,
    gap: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '700',
  },
  address: {
    fontSize: 12,
  },
  heart: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
