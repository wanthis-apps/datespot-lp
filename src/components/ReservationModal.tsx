import { useEffect, useState, type ReactElement } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  checkDummyAvailability,
  getReservationDateOptions,
  RESERVATION_PARTY_SIZES,
  RESERVATION_TIMES,
} from '../../hooks/useReservation';
import type { Palette } from '@/theme';
import type { Spot } from '../../types/database';
import { Button } from './Button';

export type ReservationModalProps = {
  visible: boolean;
  spot: Spot | null;
  palette: Palette;
  onClose: () => void;
};

export function ReservationModal({
  visible,
  spot,
  palette,
  onClose,
}: ReservationModalProps): ReactElement {
  const insets = useSafeAreaInsets();
  const dateOptions = getReservationDateOptions();
  const defaultDate = dateOptions[0];
  const defaultTime = RESERVATION_TIMES[2];
  const [dateId, setDateId] = useState(defaultDate?.id ?? 'today');
  const [timeId, setTimeId] = useState(defaultTime?.id ?? '18:00');
  const [partySize, setPartySize] = useState(2);

  useEffect(() => {
    if (visible) {
      setDateId(defaultDate?.id ?? 'today');
      setTimeId(defaultTime?.id ?? '18:00');
      setPartySize(2);
    }
  }, [defaultDate?.id, defaultTime?.id, visible]);

  const selectedDate =
    dateOptions.find((option) => option.id === dateId) ?? defaultDate;
  const selectedTime =
    RESERVATION_TIMES.find((option) => option.id === timeId) ?? defaultTime;

  const handleSearch = (): void => {
    if (spot === null || selectedDate === undefined || selectedTime === undefined) {
      return;
    }

    const result = checkDummyAvailability(
      spot.id,
      selectedDate.id,
      selectedTime.id,
      partySize,
    );

    Alert.alert(
      result.available ? '空席が見つかりました' : '空席がありません',
      `${spot.name}\n${selectedDate.label}（${selectedDate.dateLabel}） ${selectedTime.label} / ${partySize}名\n\n${result.message}`,
      result.available
        ? [
            { text: '閉じる', style: 'cancel' },
            {
              text: '提携サイトで予約する',
              onPress: () => {
                console.log('[DateSpot] reservation partner handoff (dummy)', {
                  spotId: spot.id,
                  dateId: selectedDate.id,
                  timeId: selectedTime.id,
                  partySize,
                });
                Alert.alert(
                  '提携サイトへ移動します',
                  'この操作は画面確認用のダミー遷移です。予約は確定していません。',
                );
              },
            },
          ]
        : [{ text: '閉じる', style: 'cancel' }],
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
          accessibilityLabel="予約を閉じる"
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
              予約・空席確認
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
            {spot === null
              ? 'スポットを選んでください。'
              : `${spot.name}の空席目安を確認できます。`}
          </Text>

          <Text style={[styles.sectionLabel, { color: palette.textSecondary }]}>
            日付
          </Text>
          <View style={styles.chipWrap}>
            {dateOptions.map((option) => {
              const selected = option.id === dateId;
              return (
                <Pressable
                  key={option.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => setDateId(option.id)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: selected
                        ? palette.primary
                        : palette.background,
                      borderColor: selected ? palette.primary : palette.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipLabel,
                      { color: selected ? '#FFFFFF' : palette.text },
                    ]}
                  >
                    {option.label}
                  </Text>
                  <Text
                    style={[
                      styles.chipMeta,
                      { color: selected ? '#FFFFFF' : palette.muted },
                    ]}
                  >
                    {option.dateLabel}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={[styles.sectionLabel, { color: palette.textSecondary }]}>
            時間帯
          </Text>
          <View style={styles.chipWrap}>
            {RESERVATION_TIMES.map((option) => {
              const selected = option.id === timeId;
              return (
                <Pressable
                  key={option.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => setTimeId(option.id)}
                  style={[
                    styles.timeChip,
                    {
                      backgroundColor: selected
                        ? palette.primary
                        : palette.background,
                      borderColor: selected ? palette.primary : palette.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipLabel,
                      { color: selected ? '#FFFFFF' : palette.text },
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={[styles.sectionLabel, { color: palette.textSecondary }]}>
            人数
          </Text>
          <View style={styles.chipWrap}>
            {RESERVATION_PARTY_SIZES.map((size) => {
              const selected = size === partySize;
              return (
                <Pressable
                  key={size}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => setPartySize(size)}
                  style={[
                    styles.timeChip,
                    {
                      backgroundColor: selected
                        ? palette.primary
                        : palette.background,
                      borderColor: selected ? palette.primary : palette.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipLabel,
                      { color: selected ? '#FFFFFF' : palette.text },
                    ]}
                  >
                    {size}名
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Button
            label="空席を検索・予約に進む"
            palette={palette}
            onPress={handleSearch}
          />
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
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minWidth: 96,
    gap: 2,
  },
  timeChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  chipLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  chipMeta: {
    fontSize: 11,
    fontWeight: '600',
  },
});
