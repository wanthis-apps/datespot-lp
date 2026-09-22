import { type ReactElement } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components';
import type { Palette } from '@/theme';

export type LegalDocument = 'terms' | 'privacy';

type LegalModalProps = {
  visible: boolean;
  document: LegalDocument;
  palette: Palette;
  onClose: () => void;
};

const LEGAL_COPY: Record<
  LegalDocument,
  { title: string; body: string }
> = {
  terms: {
    title: '利用規約',
    body: 'DateSpot-app はデートスポットの案内を目的としたアプリです。掲載情報は参考情報であり、営業時間や料金は各店舗の最新情報をご確認ください。本画面は開発中のダミー表示です。',
  },
  privacy: {
    title: 'プライバシーポリシー',
    body: 'お気に入りや利用履歴は、アプリ内の表示と同期のために利用します。この画面は開発確認用のダミーポリシーです。外部ブラウザは開きません。',
  },
};

export function LegalModal({
  visible,
  document,
  palette,
  onClose,
}: LegalModalProps): ReactElement {
  const copy = LEGAL_COPY[document];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View
          style={[
            styles.card,
            { backgroundColor: palette.surface, borderColor: palette.border },
          ]}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: palette.text }]}>
              {copy.title}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="閉じる"
              onPress={onClose}
            >
              <Ionicons name="close" size={20} color={palette.text} />
            </Pressable>
          </View>
          <ScrollView style={styles.scroll}>
            <Text style={[styles.body, { color: palette.textSecondary }]}>
              {copy.body}
            </Text>
          </ScrollView>
          <Button label="閉じる" palette={palette} onPress={onClose} />
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
    maxHeight: '70%',
    borderWidth: 1,
    borderRadius: 24,
    padding: 20,
    gap: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  scroll: {
    flexGrow: 0,
  },
  body: {
    fontSize: 14,
    lineHeight: 22,
  },
});
