import { type ReactElement } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  formatNotificationDate,
} from '../../../hooks/useNotifications';
import type { Palette } from '@/theme';
import type { Notification } from '../../../types/database';

type NotificationListItemProps = {
  item: Notification;
  palette: Palette;
  onPress: () => void;
};

function categoryIcon(
  category: Notification['category'],
): keyof typeof Ionicons.glyphMap {
  return category === 'coupon' ? 'ticket-outline' : 'notifications-outline';
}

function categoryLabel(category: Notification['category']): string {
  return category === 'coupon' ? 'クーポン' : 'お知らせ';
}

export function NotificationListItem({
  item,
  palette,
  onPress,
}: NotificationListItemProps): ReactElement {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: item.is_read }}
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: item.is_read ? palette.surface : palette.primaryMuted,
          borderColor: item.is_read ? palette.border : palette.primary,
        },
      ]}
    >
      <View
        style={[
          styles.iconWrap,
          {
            backgroundColor: item.is_read
              ? palette.background
              : palette.surface,
          },
        ]}
      >
        <Ionicons
          name={categoryIcon(item.category)}
          size={18}
          color={palette.primary}
        />
      </View>
      <View style={styles.body}>
        <View style={styles.metaRow}>
          <Text style={[styles.category, { color: palette.primary }]}>
            {categoryLabel(item.category)}
          </Text>
          <Text style={[styles.date, { color: palette.muted }]}>
            {formatNotificationDate(item.created_at)}
          </Text>
        </View>
        <Text style={[styles.title, { color: palette.text }]}>{item.title}</Text>
        <Text style={[styles.message, { color: palette.textSecondary }]}>
          {item.body}
        </Text>
        <Text
          style={[
            styles.readState,
            { color: item.is_read ? palette.muted : palette.primary },
          ]}
        >
          {item.is_read ? '既読' : '未読'}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderWidth: 1,
    borderRadius: 20,
    padding: 14,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    gap: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  category: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  date: {
    fontSize: 11,
    fontWeight: '600',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 22,
  },
  message: {
    fontSize: 13,
    lineHeight: 20,
  },
  readState: {
    fontSize: 12,
    fontWeight: '700',
  },
});
