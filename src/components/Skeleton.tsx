import { useEffect, useRef, type ReactElement } from 'react';
import { Animated, StyleSheet, View, type ViewStyle } from 'react-native';
import type { Palette } from '@/theme';

type SkeletonProps = {
  palette: Palette;
  width?: number | `${number}%`;
  height?: number;
  radius?: number;
  style?: ViewStyle;
};

export function Skeleton({
  palette,
  width = '100%',
  height = 16,
  radius = 10,
  style,
}: SkeletonProps): ReactElement {
  const opacity = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => {
      animation.stop();
    };
  }, [opacity]);

  return (
    <Animated.View
      accessibilityRole="progressbar"
      style={[
        {
          width,
          height,
          borderRadius: radius,
          backgroundColor: palette.border,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function SpotCardSkeleton({
  palette,
}: {
  palette: Palette;
}): ReactElement {
  return (
    <View
      style={[
        styles.spotCard,
        { backgroundColor: palette.surface, borderColor: palette.border },
      ]}
    >
      <Skeleton palette={palette} height={168} radius={0} />
      <View style={styles.spotBody}>
        <Skeleton palette={palette} width="72%" height={18} />
        <View style={styles.tagRow}>
          <Skeleton palette={palette} width={72} height={22} radius={999} />
          <Skeleton palette={palette} width={56} height={22} radius={999} />
        </View>
        <Skeleton palette={palette} width="100%" height={12} />
        <Skeleton palette={palette} width="84%" height={12} />
      </View>
    </View>
  );
}

export function CouponCardSkeleton({
  palette,
}: {
  palette: Palette;
}): ReactElement {
  return (
    <View
      style={[
        styles.couponCard,
        { backgroundColor: palette.surface, borderColor: palette.border },
      ]}
    >
      <View style={[styles.couponAccent, { backgroundColor: palette.border }]} />
      <View style={styles.couponBody}>
        <View style={styles.couponHeader}>
          <Skeleton palette={palette} width={56} height={56} radius={14} />
          <View style={styles.couponHeaderText}>
            <Skeleton palette={palette} width="46%" height={12} />
            <Skeleton palette={palette} width="78%" height={16} />
          </View>
        </View>
        <Skeleton palette={palette} width="92%" height={12} />
        <Skeleton palette={palette} width="40%" height={12} />
        <Skeleton palette={palette} width="100%" height={44} radius={16} />
      </View>
    </View>
  );
}

export function FilterChipSkeleton({
  palette,
  width = 84,
}: {
  palette: Palette;
  width?: number;
}): ReactElement {
  return <Skeleton palette={palette} width={width} height={32} radius={999} />;
}

export function FilterChipSkeletonRow({
  palette,
}: {
  palette: Palette;
}): ReactElement {
  return (
    <View style={styles.chipRow}>
      <FilterChipSkeleton palette={palette} width={64} />
      <FilterChipSkeleton palette={palette} width={80} />
      <FilterChipSkeleton palette={palette} width={96} />
      <FilterChipSkeleton palette={palette} width={72} />
    </View>
  );
}

const styles = StyleSheet.create({
  spotCard: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  spotBody: {
    padding: 16,
    gap: 10,
  },
  tagRow: {
    flexDirection: 'row',
    gap: 8,
  },
  couponCard: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  couponAccent: {
    width: 6,
  },
  couponBody: {
    flex: 1,
    padding: 16,
    gap: 10,
  },
  couponHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  couponHeaderText: {
    flex: 1,
    gap: 8,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
  },
});
