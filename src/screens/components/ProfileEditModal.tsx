import { useEffect, useState, type ReactElement } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components';
import type { Palette } from '@/theme';

type ProfileEditModalProps = {
  visible: boolean;
  palette: Palette;
  initialName: string;
  onClose: () => void;
  onSave: (name: string) => void;
};

export function ProfileEditModal({
  visible,
  palette,
  initialName,
  onClose,
  onSave,
}: ProfileEditModalProps): ReactElement {
  const [name, setName] = useState(initialName);

  useEffect(() => {
    if (visible) {
      setName(initialName);
    }
  }, [initialName, visible]);

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
              プロフィール編集
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="閉じる"
              onPress={onClose}
            >
              <Ionicons name="close" size={20} color={palette.text} />
            </Pressable>
          </View>
          <Text style={[styles.label, { color: palette.textSecondary }]}>
            表示名
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="表示名を入力"
            placeholderTextColor={palette.muted}
            style={[
              styles.input,
              {
                color: palette.text,
                borderColor: palette.border,
                backgroundColor: palette.background,
              },
            ]}
          />
          <Text style={[styles.hint, { color: palette.muted }]}>
            この変更は端末上の表示用です。
          </Text>
          <Button
            label="保存する"
            palette={palette}
            onPress={() => {
              onSave(name);
              onClose();
            }}
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
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
  },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  hint: {
    fontSize: 12,
    lineHeight: 18,
  },
});
