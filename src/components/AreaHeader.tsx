import { useState, type ReactElement } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme, useArea, type AreaPreset } from '@/context';
import type { Palette } from '@/theme';

export type AreaHeaderProps = {
  palette?: Palette;
};

export function AreaHeader({ palette }: AreaHeaderProps): ReactElement {
  const insets = useSafeAreaInsets();
  const { palette: themePalette } = useAppTheme();
  const colors = palette ?? themePalette;
  const { area, areas, setArea } = useArea();
  const [visible, setVisible] = useState(false);

  const handleSelect = (next: AreaPreset): void => {
    setArea(next);
    setVisible(false);
  };

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${area.name}エリアを切り替える`}
        onPress={() => setVisible(true)}
        style={[
          styles.trigger,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        <View
          style={[styles.pinWrap, { backgroundColor: colors.primaryMuted }]}
        >
          <Ionicons name="location" size={16} color={colors.primary} />
        </View>
        <View style={styles.triggerCopy}>
          <Text style={[styles.kicker, { color: colors.primary }]}>
            基準エリア
          </Text>
          <Text style={[styles.areaName, { color: colors.text }]}>
            📍 {area.name}エリア
          </Text>
        </View>
        <Ionicons name="chevron-down" size={18} color={colors.muted} />
      </Pressable>

      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.modalRoot}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="エリア選択を閉じる"
            style={styles.backdrop}
            onPress={() => setVisible(false)}
          />
          <View
            style={[
              styles.sheet,
              {
                backgroundColor: colors.surface,
                paddingBottom: Math.max(insets.bottom, 16),
              },
            ]}
          >
            <View style={[styles.handle, { backgroundColor: colors.border }]} />
            <View style={styles.sheetHeader}>
              <Text style={[styles.sheetTitle, { color: colors.text }]}>
                エリアを選ぶ
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="閉じる"
                onPress={() => setVisible(false)}
                style={[styles.close, { backgroundColor: colors.background }]}
              >
                <Ionicons name="close" size={18} color={colors.text} />
              </Pressable>
            </View>
            <Text style={[styles.sheetLead, { color: colors.textSecondary }]}>
              {'位置情報を許可すると、\n現在地からの距離で並べます。\n未許可のときは、\nこの地点を距離の基準にします。'}
            </Text>
            <View style={styles.list}>
              {areas.map((item) => {
                const selected = item.id === area.id;
                return (
                  <Pressable
                    key={item.id}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onPress={() => handleSelect(item)}
                    style={[
                      styles.option,
                      {
                        backgroundColor: selected
                          ? colors.primaryMuted
                          : colors.background,
                        borderColor: selected ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <View style={styles.optionCopy}>
                      <Text
                        style={[
                          styles.optionName,
                          { color: selected ? colors.primary : colors.text },
                        ]}
                      >
                        {item.name}エリア
                      </Text>
                    </View>
                    {selected ? (
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color={colors.primary}
                      />
                    ) : (
                      <Ionicons
                        name="ellipse-outline"
                        size={20}
                        color={colors.border}
                      />
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  pinWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  triggerCopy: {
    flex: 1,
    gap: 2,
  },
  kicker: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  areaName: {
    fontSize: 16,
    fontWeight: '700',
  },
  modalRoot: {
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
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  sheetLead: {
    fontSize: 13,
    lineHeight: 20,
  },
  list: {
    gap: 10,
    paddingBottom: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  optionCopy: {
    flex: 1,
    gap: 3,
  },
  optionName: {
    fontSize: 15,
    fontWeight: '700',
  },
});
