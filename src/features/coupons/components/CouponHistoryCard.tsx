import { type ReactElement } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Palette } from '@/theme';

type CouponHistoryCardProps = {
  palette: Palette;
  spotName: string;
  description: string;
  usedAt: string;
};

export function CouponHistoryCard({
  palette,
  spotName,
  description,
  usedAt,
}: CouponHistoryCardProps): ReactElement {
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: palette.surface, borderColor: palette.border },
      ]}
    >
      <View style={styles.iconWrap}>
        <Ionicons name="ticket-outline" size={20} color={palette.primary} />
      </View>
      <View style={styles.body}>
        <Text style={[styles.spotName, { color: palette.textSecondary }]}>
          {spotName}
        </Text>
        <Text style={[styles.description, { color: palette.text }]}>
          {description}
        </Text>
        <Text style={[styles.usedAt, { color: palette.muted }]}>{usedAt}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    gap: 2,
  },
  spotName: {
    fontSize: 12,
    fontWeight: '600',
  },
  description: {
    fontSize: 15,
    fontWeight: '700',
  },
  usedAt: {
    fontSize: 12,
  },
});
