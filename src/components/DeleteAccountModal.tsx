import { type ReactElement } from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FilterChipRow } from '@/features/spots/components/FilterChipRow';
import {
  DELETE_ACCOUNT_REASONS,
  useDeleteAccount,
} from '../../hooks/useDeleteAccount';
import type { DeleteAccountReason } from '../../types/database';
import type { Palette } from '@/theme';
import { Button } from './Button';

export type DeleteAccountModalProps = {
  visible: boolean;
  palette: Palette;
  onClose: () => void;
};

export function DeleteAccountModal({
  visible,
  palette,
  onClose,
}: DeleteAccountModalProps): ReactElement {
  const { reason, deleting, setReason, reset, confirmDelete } =
    useDeleteAccount();

  const handleClose = (): void => {
    if (deleting) {
      return;
    }
    reset();
    onClose();
  };

  const handleDelete = (): void => {
    if (reason === null) {
      Alert.alert('退会理由を選択してください', 'アンケートに回答してから退会できます。');
      return;
    }

    void confirmDelete().then((result) => {
      if (!result.ok) {
        Alert.alert('退会できませんでした', result.message);
        return;
      }
      reset();
      onClose();
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.root}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="退会をキャンセル"
          style={styles.backdrop}
          onPress={handleClose}
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
          <View style={styles.header}>
            <View
              style={[styles.iconWrap, { backgroundColor: palette.primaryMuted }]}
            >
              <Ionicons name="warning-outline" size={20} color={palette.danger} />
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="閉じる"
              disabled={deleting}
              onPress={handleClose}
            >
              <Ionicons name="close" size={20} color={palette.text} />
            </Pressable>
          </View>

          <Text style={[styles.title, { color: palette.text }]}>
            アカウントを削除しますか？
          </Text>
          <Text style={[styles.lead, { color: palette.textSecondary }]}>
            退会すると、以下のデータは元に戻せません。
          </Text>
          <View style={styles.warnings}>
            <Text style={[styles.warningItem, { color: palette.textSecondary }]}>
              ・保存したお気に入りスポット
            </Text>
            <Text style={[styles.warningItem, { color: palette.textSecondary }]}>
              ・作成したデートプラン
            </Text>
            <Text style={[styles.warningItem, { color: palette.textSecondary }]}>
              ・口コミ、閲覧履歴、クーポン利用履歴
            </Text>
          </View>

          <Text style={[styles.label, { color: palette.text }]}>
            退会理由（任意選択）
          </Text>
          <FilterChipRow
            value={reason}
            onChange={(value: DeleteAccountReason | null) => {
              if (value !== null) {
                setReason(value);
              }
            }}
            palette={palette}
            options={[...DELETE_ACCOUNT_REASONS]}
          />

          <Button
            label={deleting ? '退会処理中…' : '退会する'}
            palette={palette}
            variant="danger"
            disabled={deleting || reason === null}
            onPress={handleDelete}
          />
          <Button
            label="キャンセル"
            palette={palette}
            variant="ghost"
            disabled={deleting}
            onPress={handleClose}
          />
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
    padding: 20,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  lead: {
    fontSize: 14,
    lineHeight: 22,
  },
  warnings: {
    gap: 4,
  },
  warningItem: {
    fontSize: 14,
    lineHeight: 22,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
  },
});
