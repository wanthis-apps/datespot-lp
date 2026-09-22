import { memo, type ReactElement } from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import type { Palette } from '@/theme';

export type FilterChipOption<T> = {
  value: T;
  label: string;
};

type FilterChipRowProps<T> = {
  options: FilterChipOption<T>[];
  value: T;
  onChange: (value: T) => void;
  palette: Palette;
};

function FilterChipRowComponent<T extends string | null>({
  options,
  value,
  onChange,
  palette,
}: FilterChipRowProps<T>): ReactElement {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {options.map((option) => {
        const selected = option.value === value;
        const key = option.value ?? option.label;

        return (
          <Pressable
            key={key}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            style={[
              styles.chip,
              {
                backgroundColor: selected ? palette.primary : palette.surface,
                borderColor: selected ? palette.primary : palette.border,
              },
            ]}
          >
            <Text
              style={[
                styles.label,
                { color: selected ? '#FFFFFF' : palette.textSecondary },
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

export const FilterChipRow = memo(
  FilterChipRowComponent,
) as typeof FilterChipRowComponent;

const styles = StyleSheet.create({
  row: {
    gap: 8,
    paddingRight: 8,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
});
