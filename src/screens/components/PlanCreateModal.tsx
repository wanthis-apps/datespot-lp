import { useEffect, useMemo, useState, type ReactElement } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, RemoteImage } from '@/components';
import { mapCatalogSpot } from '../../../hooks/mapRecords';
import { useFavoriteSpots } from '../../../hooks/useFavoriteSpots';
import type { CreatePlanInput } from '../../../hooks/usePlans';
import { useSpotCatalogStore } from '@/features/spots/store/spotCatalogStore';
import type { Palette } from '@/theme';
import type { Spot } from '../../../types/database';

const SUGGESTED_TIMES = ['11:00', '13:00', '15:00', '17:00', '19:00'] as const;

type DraftSpot = {
  spot: Spot;
  visit_time: string;
};

type PlanCreateModalProps = {
  visible: boolean;
  palette: Palette;
  saving: boolean;
  initialSpots?: Spot[];
  onClose: () => void;
  onSave: (input: CreatePlanInput) => Promise<{ ok: boolean; message: string }>;
};

function buildDefaultTitle(spots: Spot[]): string {
  if (spots.length === 0) {
    return '';
  }

  const names = spots.slice(0, 2).map((spot) => spot.name);
  return `${names.join('・')}のデートプラン`;
}

export function PlanCreateModal({
  visible,
  palette,
  saving,
  initialSpots,
  onClose,
  onSave,
}: PlanCreateModalProps): ReactElement {
  const insets = useSafeAreaInsets();
  const catalogSpots = useSpotCatalogStore((state) => state.spots);
  const { spots: favoriteSpots } = useFavoriteSpots();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<DraftSpot[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [messageOk, setMessageOk] = useState<boolean | null>(null);

  useEffect(() => {
    if (!visible) {
      return;
    }

    const seeds = initialSpots ?? [];
    setTitle(buildDefaultTitle(seeds));
    setDescription('');
    setIsPublic(false);
    setQuery('');
    setMessage(null);
    setMessageOk(null);
    setSelected(
      seeds.map((spot, index) => ({
        spot,
        visit_time: SUGGESTED_TIMES[index] ?? '',
      })),
    );
  }, [initialSpots, visible]);

  const availableSpots = useMemo(() => {
    const byId = new Map<string, Spot>();
    catalogSpots.forEach((spot) => {
      byId.set(spot.id, mapCatalogSpot(spot));
    });
    favoriteSpots.forEach((spot) => {
      byId.set(spot.id, spot);
    });
    return Array.from(byId.values());
  }, [catalogSpots, favoriteSpots]);

  const selectedIds = useMemo(
    () => new Set(selected.map((item) => item.spot.id)),
    [selected],
  );

  const filteredSpots = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return availableSpots.filter((spot) => {
      if (selectedIds.has(spot.id)) {
        return false;
      }
      if (normalized === '') {
        return true;
      }
      const haystack = `${spot.name} ${spot.address ?? ''} ${spot.description ?? ''}`.toLowerCase();
      return haystack.includes(normalized);
    });
  }, [availableSpots, query, selectedIds]);

  const visibleFavorites = favoriteSpots.filter(
    (spot) => !selectedIds.has(spot.id),
  );

  const resetForm = (): void => {
    setTitle('');
    setDescription('');
    setIsPublic(false);
    setQuery('');
    setSelected([]);
    setMessage(null);
    setMessageOk(null);
  };

  const handleClose = (): void => {
    resetForm();
    onClose();
  };

  const addSpot = (spot: Spot): void => {
    setSelected((current) => {
      if (current.some((item) => item.spot.id === spot.id)) {
        return current;
      }

      const suggested = SUGGESTED_TIMES[current.length];
      return [
        ...current,
        {
          spot,
          visit_time: suggested ?? '',
        },
      ];
    });
  };

  const removeSpot = (spotId: string): void => {
    setSelected((current) => current.filter((item) => item.spot.id !== spotId));
  };

  const moveSpot = (index: number, direction: -1 | 1): void => {
    setSelected((current) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= current.length) {
        return current;
      }

      const next = current.slice();
      const currentItem = next[index];
      const swapItem = next[nextIndex];
      if (currentItem === undefined || swapItem === undefined) {
        return current;
      }

      next[index] = swapItem;
      next[nextIndex] = currentItem;
      return next;
    });
  };

  const updateVisitTime = (spotId: string, visitTime: string): void => {
    setSelected((current) =>
      current.map((item) =>
        item.spot.id === spotId ? { ...item, visit_time: visitTime } : item,
      ),
    );
  };

  const handleSave = (): void => {
    void (async () => {
      const result = await onSave({
        title,
        description,
        is_public: isPublic,
        spots: selected,
      });
      setMessage(result.message);
      setMessageOk(result.ok);
      if (result.ok) {
        resetForm();
        onClose();
      }
    })();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="作成を閉じる"
          style={styles.backdrop}
          onPress={handleClose}
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
          <View style={styles.sheetHeader}>
            <Text style={[styles.sheetTitle, { color: palette.text }]}>
              新しいプランを作る
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="閉じる"
              onPress={handleClose}
              style={[styles.close, { backgroundColor: palette.background }]}
            >
              <Ionicons name="close" size={18} color={palette.text} />
            </Pressable>
          </View>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
          >
            <Text style={[styles.label, { color: palette.textSecondary }]}>
              プラン名
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="例: 代官山のんびり午後"
              placeholderTextColor={palette.muted}
              style={[
                styles.input,
                {
                  color: palette.text,
                  backgroundColor: palette.background,
                  borderColor: palette.border,
                },
              ]}
            />

            <Text style={[styles.label, { color: palette.textSecondary }]}>
              メモ
            </Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="雰囲気や回り方のメモ"
              placeholderTextColor={palette.muted}
              multiline
              textAlignVertical="top"
              style={[
                styles.input,
                styles.memoInput,
                {
                  color: palette.text,
                  backgroundColor: palette.background,
                  borderColor: palette.border,
                },
              ]}
            />

            <View style={styles.publicRow}>
              <View style={styles.publicCopy}>
                <Text style={[styles.publicTitle, { color: palette.text }]}>
                  公開する
                </Text>
                <Text style={[styles.publicHint, { color: palette.muted }]}>
                  オンにすると他のユーザーも閲覧できます
                </Text>
              </View>
              <Switch
                value={isPublic}
                onValueChange={setIsPublic}
                trackColor={{
                  false: palette.border,
                  true: palette.primaryMuted,
                }}
                thumbColor={isPublic ? palette.primary : palette.muted}
              />
            </View>

            <Text style={[styles.sectionTitle, { color: palette.text }]}>
              追加したスポット
            </Text>
            {selected.length === 0 ? (
              <Text style={[styles.empty, { color: palette.textSecondary }]}>
                お気に入りや一覧からスポットを追加してください。
              </Text>
            ) : (
              selected.map((item, index) => (
                <View
                  key={item.spot.id}
                  style={[
                    styles.selectedRow,
                    {
                      backgroundColor: palette.background,
                      borderColor: palette.border,
                    },
                  ]}
                >
                  <RemoteImage
                    uri={item.spot.image_url}
                    style={styles.selectedImage}
                    accessibilityLabel={item.spot.name}
                  />
                  <View style={styles.selectedBody}>
                    <Text
                      style={[styles.selectedName, { color: palette.text }]}
                      numberOfLines={1}
                    >
                      {index + 1}. {item.spot.name}
                    </Text>
                    <TextInput
                      value={item.visit_time}
                      onChangeText={(value) =>
                        updateVisitTime(item.spot.id, value)
                      }
                      placeholder="訪問時間 例: 14:00"
                      placeholderTextColor={palette.muted}
                      style={[
                        styles.timeInput,
                        {
                          color: palette.text,
                          borderColor: palette.border,
                          backgroundColor: palette.surface,
                        },
                      ]}
                    />
                  </View>
                  <View style={styles.selectedActions}>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="上へ移動"
                      disabled={index === 0}
                      onPress={() => moveSpot(index, -1)}
                      style={styles.iconButton}
                    >
                      <Ionicons
                        name="chevron-up"
                        size={18}
                        color={index === 0 ? palette.border : palette.text}
                      />
                    </Pressable>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="下へ移動"
                      disabled={index === selected.length - 1}
                      onPress={() => moveSpot(index, 1)}
                      style={styles.iconButton}
                    >
                      <Ionicons
                        name="chevron-down"
                        size={18}
                        color={
                          index === selected.length - 1
                            ? palette.border
                            : palette.text
                        }
                      />
                    </Pressable>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="スポットを外す"
                      onPress={() => removeSpot(item.spot.id)}
                      style={styles.iconButton}
                    >
                      <Ionicons
                        name="close-circle-outline"
                        size={18}
                        color={palette.primary}
                      />
                    </Pressable>
                  </View>
                </View>
              ))
            )}

            {visibleFavorites.length > 0 ? (
              <View style={styles.pickerSection}>
                <Text style={[styles.sectionTitle, { color: palette.text }]}>
                  お気に入りから追加
                </Text>
                <View style={styles.favoriteWrap}>
                  {visibleFavorites.map((spot) => (
                    <Pressable
                      key={spot.id}
                      accessibilityRole="button"
                      onPress={() => addSpot(spot)}
                      style={[
                        styles.favoriteChip,
                        { backgroundColor: palette.primaryMuted },
                      ]}
                    >
                      <Ionicons name="heart" size={12} color={palette.primary} />
                      <Text
                        style={[styles.favoriteText, { color: palette.primary }]}
                      >
                        {spot.name}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            ) : null}

            <Text style={[styles.sectionTitle, { color: palette.text }]}>
              スポットを探して追加
            </Text>
            <View
              style={[
                styles.searchWrap,
                {
                  backgroundColor: palette.background,
                  borderColor: palette.border,
                },
              ]}
            >
              <Ionicons name="search" size={18} color={palette.muted} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="店名・エリアで検索"
                placeholderTextColor={palette.muted}
                autoCapitalize="none"
                autoCorrect={false}
                style={[styles.searchInput, { color: palette.text }]}
              />
            </View>

            {filteredSpots.length === 0 ? (
              <Text style={[styles.empty, { color: palette.textSecondary }]}>
                追加できるスポットがありません。
              </Text>
            ) : (
              filteredSpots.map((spot) => (
                <Pressable
                  key={spot.id}
                  accessibilityRole="button"
                  onPress={() => addSpot(spot)}
                  style={[
                    styles.pickRow,
                    {
                      backgroundColor: palette.background,
                      borderColor: palette.border,
                    },
                  ]}
                >
                  <RemoteImage
                    uri={spot.image_url}
                    style={styles.pickImage}
                    accessibilityLabel={spot.name}
                  />
                  <View style={styles.pickBody}>
                    <Text
                      style={[styles.pickName, { color: palette.text }]}
                      numberOfLines={1}
                    >
                      {spot.name}
                    </Text>
                    {spot.address !== null ? (
                      <Text
                        style={[styles.pickAddress, { color: palette.muted }]}
                        numberOfLines={1}
                      >
                        {spot.address}
                      </Text>
                    ) : null}
                  </View>
                  <Ionicons name="add-circle" size={22} color={palette.primary} />
                </Pressable>
              ))
            )}

            {message !== null ? (
              <View
                style={[
                  styles.messageBox,
                  { backgroundColor: palette.primaryMuted },
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    {
                      color: messageOk === false ? palette.primary : palette.text,
                    },
                  ]}
                >
                  {message}
                </Text>
              </View>
            ) : null}

            <Button
              label={saving ? '保存中…' : '保存する'}
              palette={palette}
              disabled={saving}
              onPress={handleSave}
            />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
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
    maxHeight: '92%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 10,
    overflow: 'hidden',
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 999,
    marginBottom: 8,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  sheetTitle: {
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
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 10,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  memoInput: {
    minHeight: 80,
  },
  publicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 4,
  },
  publicCopy: {
    flex: 1,
    gap: 2,
  },
  publicTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  publicHint: {
    fontSize: 12,
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 8,
  },
  empty: {
    fontSize: 13,
    lineHeight: 20,
  },
  selectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 16,
    padding: 10,
  },
  selectedImage: {
    width: 52,
    height: 52,
    borderRadius: 12,
  },
  selectedBody: {
    flex: 1,
    gap: 6,
  },
  selectedName: {
    fontSize: 14,
    fontWeight: '700',
  },
  timeInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 13,
  },
  selectedActions: {
    alignItems: 'center',
    gap: 2,
  },
  iconButton: {
    padding: 2,
  },
  pickerSection: {
    gap: 8,
  },
  favoriteWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  favoriteChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  favoriteText: {
    fontSize: 12,
    fontWeight: '700',
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },
  pickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 16,
    padding: 10,
  },
  pickImage: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  pickBody: {
    flex: 1,
    gap: 3,
  },
  pickName: {
    fontSize: 14,
    fontWeight: '700',
  },
  pickAddress: {
    fontSize: 12,
  },
  messageBox: {
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  messageText: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '600',
  },
});
