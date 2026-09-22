import { useEffect, useState, type ReactElement } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  SPOT_TAG_OPTIONS,
  type TagMatchMode,
} from '../../hooks/spotTags';
import type { Palette } from '@/theme';
import { Button } from './Button';

export type TagFilterModalProps = {
  visible: boolean;
  palette: Palette;
  selectedTags: string[];
  tagMatchMode: TagMatchMode;
  onClose: () => void;
  onApply: (tags: string[], mode: TagMatchMode) => void;
};

export function TagFilterModal({
  visible,
  palette,
  selectedTags,
  tagMatchMode,
  onClose,
  onApply,
}: TagFilterModalProps): ReactElement {
  const insets = useSafeAreaInsets();
  const [draftTags, setDraftTags] = useState<string[]>(selectedTags);
  const [draftMode, setDraftMode] = useState<TagMatchMode>(tagMatchMode);

  useEffect(() => {
    if (visible) {
      setDraftTags(selectedTags);
      setDraftMode(tagMatchMode);
    }
  }, [selectedTags, tagMatchMode, visible]);

  const toggleTag = (tag: string): void => {
    setDraftTags((current) =>
      current.includes(tag)
        ? current.filter((item) => item !== tag)
        : [...current, tag],
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="こだわり条件を閉じる"
          style={styles.backdrop}
          onPress={onClose}
        />
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: palette.surface,
              paddingBottom: Math.max(insets.bottom, 16),
            },
          ]}
        >
          <View style={[styles.handle, { backgroundColor: palette.border }]} />
          <View style={styles.header}>
            <Text style={[styles.title, { color: palette.text }]}>
              こだわり条件
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="閉じる"
              onPress={onClose}
              style={[styles.close, { backgroundColor: palette.background }]}
            >
              <Ionicons name="close" size={18} color={palette.text} />
            </Pressable>
          </View>
          <Text style={[styles.lead, { color: palette.textSecondary }]}>
            複数の条件を選んで、デートに合うスポットだけを残せます。
          </Text>

          <View style={styles.modeRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: draftMode === 'and' }}
              onPress={() => setDraftMode('and')}
              style={[
                styles.modeChip,
                {
                  backgroundColor:
                    draftMode === 'and' ? palette.primary : palette.background,
                  borderColor:
                    draftMode === 'and' ? palette.primary : palette.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.modeLabel,
                  { color: draftMode === 'and' ? '#FFFFFF' : palette.text },
                ]}
              >
                すべて含む（AND）
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: draftMode === 'or' }}
              onPress={() => setDraftMode('or')}
              style={[
                styles.modeChip,
                {
                  backgroundColor:
                    draftMode === 'or' ? palette.primary : palette.background,
                  borderColor:
                    draftMode === 'or' ? palette.primary : palette.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.modeLabel,
                  { color: draftMode === 'or' ? '#FFFFFF' : palette.text },
                ]}
              >
                どれか1つ（OR）
              </Text>
            </Pressable>
          </View>

          <View style={styles.list}>
            {SPOT_TAG_OPTIONS.map((option) => {
              const selected = draftTags.includes(option.value);
              return (
                <Pressable
                  key={option.value}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => toggleTag(option.value)}
                  style={[
                    styles.option,
                    {
                      backgroundColor: selected
                        ? palette.primaryMuted
                        : palette.background,
                      borderColor: selected ? palette.primary : palette.border,
                    },
                  ]}
                >
                  <Text style={styles.emoji}>{option.emoji}</Text>
                  <Text
                    style={[
                      styles.optionLabel,
                      { color: selected ? palette.primary : palette.text },
                    ]}
                  >
                    {option.label}
                  </Text>
                  <Ionicons
                    name={selected ? 'checkbox' : 'square-outline'}
                    size={20}
                    color={selected ? palette.primary : palette.muted}
                  />
                </Pressable>
              );
            })}
          </View>

          <View style={styles.actions}>
            <Button
              label="リセット"
              palette={palette}
              variant="ghost"
              onPress={() => {
                setDraftTags([]);
                setDraftMode('and');
              }}
            />
            <Button
              label={
                draftTags.length === 0
                  ? '条件を適用する'
                  : `${draftTags.length}件の条件を適用`
              }
              palette={palette}
              onPress={() => {
                onApply(draftTags, draftMode);
                onClose();
              }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(43, 29, 31, 0.45)',
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 10,
    paddingHorizontal: 20,
    gap: 12,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 999,
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
  close: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lead: {
    fontSize: 13,
    lineHeight: 20,
  },
  modeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  modeChip: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: 'center',
  },
  modeLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  list: {
    gap: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  emoji: {
    fontSize: 18,
  },
  optionLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
  },
  actions: {
    gap: 10,
    paddingTop: 4,
  },
});
