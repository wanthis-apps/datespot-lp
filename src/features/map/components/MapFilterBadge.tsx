import { memo, type ReactElement } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Palette } from '@/theme';
import type { RelationshipStatus, SpotCategory, TimeOfDay } from '@/types';
import {
  CATEGORY_LABELS,
  RELATIONSHIP_LABELS,
  TIME_OF_DAY_LABELS,
} from '@/features/spots';

type MapFilterBadgeProps = {
  timeOfDay: TimeOfDay;
  relationship: RelationshipStatus | null;
  area: string | null;
  category: SpotCategory | null;
  favoritesOnly: boolean;
  query: string;
  palette: Palette;
};

function MapFilterBadgeComponent({
  timeOfDay,
  relationship,
  area,
  category,
  favoritesOnly,
  query,
  palette,
}: MapFilterBadgeProps): ReactElement {
  const parts = [
    TIME_OF_DAY_LABELS[timeOfDay],
    relationship === null ? '関係性すべて' : RELATIONSHIP_LABELS[relationship],
    area ?? '全エリア',
    category === null ? '全カテゴリー' : CATEGORY_LABELS[category],
  ];

  if (favoritesOnly) {
    parts.push('お気に入り');
  }

  const trimmedQuery = query.trim();
  if (trimmedQuery.length > 0) {
    parts.push(`「${trimmedQuery}」`);
  }

  return (
    <View style={[styles.badge, { backgroundColor: palette.surface }]}>
      <Text style={[styles.text, { color: palette.text }]} numberOfLines={2}>
        {parts.join(' ・ ')}
      </Text>
    </View>
  );
}

export const MapFilterBadge = memo(MapFilterBadgeComponent);

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'center',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    maxWidth: '100%',
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});
