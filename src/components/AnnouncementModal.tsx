import { type ReactElement } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Announcement } from '../../hooks/useAnnouncement';
import type { Palette } from '@/theme';
import { Button } from './Button';
import { RemoteImage } from './RemoteImage';

export type AnnouncementModalProps = {
  visible: boolean;
  announcement: Announcement;
  palette: Palette;
  onPressDetail: () => void;
  onClose: () => void;
  onHideNextTime: () => void;
};

export function AnnouncementModal({
  visible,
  announcement,
  palette,
  onPressDetail,
  onClose,
  onHideNextTime,
}: AnnouncementModalProps): ReactElement {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="キャンペーンを閉じる"
          style={styles.backdrop}
          onPress={onClose}
        />
        <View
          style={[
            styles.card,
            {
              backgroundColor: palette.surface,
              borderColor: palette.border,
            },
          ]}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="閉じる"
            onPress={onClose}
            style={[styles.close, { backgroundColor: palette.background }]}
          >
            <Ionicons name="close" size={16} color={palette.text} />
          </Pressable>
          <RemoteImage
            uri={announcement.imageUrl}
            style={styles.banner}
            accessibilityLabel={announcement.title}
          />
          <View style={styles.body}>
            <Text style={[styles.kicker, { color: palette.primary }]}>
              Campaign
            </Text>
            <Text style={[styles.title, { color: palette.text }]}>
              {announcement.title}
            </Text>
            <Text style={[styles.lead, { color: palette.textSecondary }]}>
              {announcement.body}
            </Text>
            <Button
              label={announcement.ctaLabel}
              palette={palette}
              onPress={onPressDetail}
            />
            <Button
              label="閉じる"
              palette={palette}
              variant="ghost"
              onPress={onClose}
            />
            <Pressable accessibilityRole="button" onPress={onHideNextTime}>
              <Text style={[styles.hideNext, { color: palette.muted }]}>
                次回から表示しない
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(43, 29, 31, 0.45)',
  },
  card: {
    borderWidth: 1,
    borderRadius: 24,
    overflow: 'hidden',
  },
  close: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 2,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  banner: {
    width: '100%',
    height: 168,
  },
  body: {
    padding: 20,
    gap: 10,
  },
  kicker: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 28,
  },
  lead: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 6,
  },
  hideNext: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    paddingVertical: 4,
  },
});
