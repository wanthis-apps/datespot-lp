import { memo, useCallback, useMemo, type ReactElement } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { RemoteImage } from '@/components';
import { useArea } from '@/context';
import { formatDistanceKm, haversineKm } from '../../../../hooks/geo';
import type { Palette } from '@/theme';
import type { Spot } from '@/types';
import { useFavoriteStore } from '../store/favoriteStore';
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
  const isFavorite = useFavoriteStore((state) =>
    state.favoriteSpotIds.includes(spot.id),
  );
  const toggleFavorite = useFavoriteStore((state) => state.toggleFavorite);
  const { area } = useArea();
  const distanceLabel = useMemo(
    () =>
      formatDistanceKm(
        haversineKm(
          { latitude: area.latitude, longitude: area.longitude },
          { latitude: spot.location.lat, longitude: spot.location.lng },
        ),
      ),
    [
      area.latitude,
      area.longitude,
      spot.location.lat,
      spot.location.lng,
    ],
  );

  const handleToggleFavorite = useCallback((): void => {
    void toggleFavorite(spot.id);
  }, [spot.id, toggleFavorite]);

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
        <View style={styles.favorite}>
          <FavoriteButton
            isFavorite={isFavorite}
            palette={palette}
            onPress={handleToggleFavorite}
          />
        </View>
        {hasFreeCoupon(spot) ? (
          <View style={[styles.badge, { backgroundColor: palette.coupon }]}>
            <Text style={[styles.badgeText, { color: palette.couponText }]}>
              {spot.couponDescription}
            </Text>
          </View>
        ) : null}
      </View>
      <View style={styles.body}>
        <Text style={[styles.name, { color: palette.text }]}>{spot.name}</Text>
        <Text style={[styles.meta, { color: palette.textSecondary }]}>
          {spot.area} ・ {CATEGORY_LABELS[spot.category]} ・ {distanceLabel}
        </Text>
        <Text
          numberOfLines={2}
          style={[styles.description, { color: palette.textSecondary }]}
        >
          {spot.description}
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
    left: 12,
  },
  badge: {
    position: 'absolute',
    top: 12,
    right: 12,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  body: {
    padding: 16,
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
  },
});
