import { type ReactElement } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RemoteImage } from '@/components';
import type { Palette } from '@/theme';
import type { Plan } from '../../../types/database';

type PlanCardProps = {
  plan: Plan;
  palette: Palette;
  onDelete: () => void;
  onShare: () => void;
};

export function PlanCard({
  plan,
  palette,
  onDelete,
  onShare,
}: PlanCardProps): ReactElement {
  const thumbnails = plan.plan_spots
    .slice(0, 4)
    .map((item) => item.spot?.image_url ?? null);

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: palette.surface, borderColor: palette.border },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.titles}>
          <Text style={[styles.title, { color: palette.text }]} numberOfLines={2}>
            {plan.title}
          </Text>
          {plan.description !== null ? (
            <Text
              style={[styles.description, { color: palette.textSecondary }]}
              numberOfLines={2}
            >
              {plan.description}
            </Text>
          ) : null}
        </View>
        <View style={styles.headerActions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${plan.title}をシェア`}
            hitSlop={8}
            onPress={onShare}
            style={[styles.iconButton, { backgroundColor: palette.coupon }]}
          >
            <Ionicons name="share-outline" size={16} color={palette.couponText} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${plan.title}を削除`}
            hitSlop={8}
            onPress={onDelete}
            style={[styles.iconButton, { backgroundColor: palette.primaryMuted }]}
          >
            <Ionicons name="trash-outline" size={16} color={palette.primary} />
          </Pressable>
        </View>
      </View>

      <View style={styles.metaRow}>
        <View style={[styles.chip, { backgroundColor: palette.coupon }]}>
          <Text style={[styles.chipText, { color: palette.couponText }]}>
            {plan.plan_spots.length}スポット
          </Text>
        </View>
        {plan.is_public ? (
          <View style={[styles.chip, { backgroundColor: palette.primaryMuted }]}>
            <Text style={[styles.chipText, { color: palette.primary }]}>公開</Text>
          </View>
        ) : (
          <View style={[styles.chip, { backgroundColor: palette.background }]}>
            <Text style={[styles.chipText, { color: palette.textSecondary }]}>
              非公開
            </Text>
          </View>
        )}
      </View>

      {thumbnails.length === 0 ? (
        <Text style={[styles.emptyThumbs, { color: palette.muted }]}>
          スポット画像はまだありません
        </Text>
      ) : (
        <View style={styles.thumbs}>
          {thumbnails.map((uri, index) => (
            <RemoteImage
              key={`${plan.id}-thumb-${index}`}
              uri={uri}
              style={styles.thumb}
              accessibilityLabel={`${plan.title}のスポット${index + 1}`}
            />
          ))}
        </View>
      )}

      <View style={styles.spotNames}>
        {plan.plan_spots.map((item, index) => (
          <Text
            key={item.id}
            style={[styles.spotName, { color: palette.textSecondary }]}
            numberOfLines={1}
          >
            {index + 1}. {item.spot?.name ?? 'スポット'}
            {item.visit_time !== null ? `  ${item.visit_time}` : ''}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    gap: 12,
    shadowColor: '#2B1D1F',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  titles: {
    flex: 1,
    gap: 6,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
  },
  description: {
    fontSize: 13,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  thumbs: {
    flexDirection: 'row',
    gap: 8,
  },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: 14,
  },
  emptyThumbs: {
    fontSize: 12,
  },
  spotNames: {
    gap: 4,
  },
  spotName: {
    fontSize: 13,
    lineHeight: 18,
  },
});
