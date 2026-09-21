import { type ReactElement } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Palette } from '@/theme';
import type { TimeOfDay } from '@/types';
import { TIME_OF_DAY_LABELS } from '../types';

type TimeToggleProps = {
  value: TimeOfDay;
  onChange: (value: TimeOfDay) => void;
  palette: Palette;
};

type TimeOption = {
  value: TimeOfDay;
  icon: 'sunny' | 'moon';
};

const TIME_OPTIONS: TimeOption[] = [
  { value: 'day', icon: 'sunny' },
  { value: 'night', icon: 'moon' },
];

export function TimeToggle({
  value,
  onChange,
  palette,
}: TimeToggleProps): ReactElement {
  return (
    <View style={[styles.track, { backgroundColor: palette.primaryMuted }]}>
      {TIME_OPTIONS.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            style={[
              styles.option,
              selected && { backgroundColor: palette.surface },
            ]}
          >
            <Ionicons
              name={option.icon}
              size={16}
              color={selected ? palette.primary : palette.textSecondary}
            />
            <Text
              style={[
                styles.label,
                {
                  color: selected ? palette.text : palette.textSecondary,
                  fontWeight: selected ? '700' : '500',
                },
              ]}
            >
              {TIME_OF_DAY_LABELS[option.value]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    borderRadius: 999,
    padding: 4,
    gap: 4,
  },
  option: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 999,
  },
  label: {
    fontSize: 15,
  },
});
