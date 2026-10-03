import { memo, type ReactElement } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { FittedHeading, RemoteImage } from '@/components';
import type { Palette } from '@/theme';
import type { Spot } from '../../../../types/database';

type RecentlyViewedSectionProps = {
  spots: Spot[];
  palette: Palette;
  onPressSpot: (spot: Spot) => void;
};

function RecentlyViewedSectionComponent({
  spots,
  palette,
  onPressSpot,
}: RecentlyViewedSectionProps): ReactElement | null {
  if (spots.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <FittedHeading style={[styles.title, { color: palette.text }]}>
        最近チェックしたスポット
      </FittedHeading>
      <ScrollView
        horizontal
        nestedScrollEnabled
        directionalLockEnabled
        keyboardShouldPersistTaps="handled"
        showsHorizontalScrollIndicator={false}
        style={styles.scroll}
        contentContainerStyle={styles.row}
      >
        {spots.map((spot) => (
          <Pressable
            key={spot.id}
            accessibilityRole="button"
            accessibilityLabel={`${spot.name}の詳細を開く`}
            onPress={() => onPressSpot(spot)}
            style={[
              styles.card,
              {
                backgroundColor: palette.surface,
                borderColor: palette.border,
              },
            ]}
          >
            <RemoteImage
              uri={spot.image_url}
              style={styles.image}
              accessibilityLabel={spot.name}
            />
            <Text
              style={[styles.name, { color: palette.text }]}
              numberOfLines={2}
            >
              {spot.name}
            </Text>
            {spot.address !== null ? (
              <Text
                style={[styles.meta, { color: palette.muted }]}
                numberOfLines={1}
              >
                {spot.address}
              </Text>
            ) : null}
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

export const RecentlyViewedSection = memo(RecentlyViewedSectionComponent);

const styles = StyleSheet.create({
  section: {
    gap: 10,
    marginTop: 4,
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  scroll: {
    flexGrow: 0,
  },
  row: {
    gap: 10,
    paddingRight: 8,
  },
  card: {
    width: 148,
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 96,
  },
  name: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
    paddingHorizontal: 10,
    paddingTop: 8,
  },
  meta: {
    fontSize: 11,
    paddingHorizontal: 10,
    paddingBottom: 10,
    paddingTop: 4,
  },
});
