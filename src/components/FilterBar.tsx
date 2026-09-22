import { memo, type ReactElement } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { Palette } from '@/theme';
import type { SpotCategory } from '../../types/database';

export type FilterBarProps = {
  selectedCategory: SpotCategory | null;
  setSelectedCategory: (category: SpotCategory | null) => void;
  selectedPriceRange?: number | null;
  setSelectedPriceRange?: (priceRange: number | null) => void;
  selectedTagCount?: number;
  onPressTagFilter?: () => void;
  palette: Palette;
};

const CATEGORY_CHIPS: ReadonlyArray<{
  value: SpotCategory | null;
  label: string;
}> = [
  { value: null, label: 'すべて' },
  { value: 'cafe', label: 'カフェ' },
  { value: 'restaurant', label: 'ディナー' },
  { value: 'park', label: '公園' },
  { value: 'night_view', label: '夜景' },
  { value: 'activity', label: 'アクティビティ' },
  { value: 'other', label: 'その他' },
];

const PRICE_CHIPS: ReadonlyArray<{
  value: number | null;
  label: string;
}> = [
  { value: null, label: 'すべて' },
  { value: 1, label: '¥' },
  { value: 2, label: '¥¥' },
  { value: 3, label: '¥¥¥' },
  { value: 4, label: '¥¥¥¥' },
];

type ChipRowProps<T extends string | number | null> = {
  label: string;
  options: ReadonlyArray<{ value: T; label: string }>;
  value: T;
  onChange: (value: T) => void;
  palette: Palette;
};

function ChipRow<T extends string | number | null>({
  label,
  options,
  value,
  onChange,
  palette,
}: ChipRowProps<T>): ReactElement {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionLabel, { color: palette.textSecondary }]}>
        {label}
      </Text>
      <ScrollView
        horizontal
        nestedScrollEnabled
        directionalLockEnabled
        keyboardShouldPersistTaps="handled"
        showsHorizontalScrollIndicator={false}
        style={styles.scroll}
        contentContainerStyle={styles.row}
      >
        {options.map((option) => {
          const selected = option.value === value;
          const key = String(option.value ?? option.label);

          return (
            <Pressable
              key={key}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => {
                onChange(selected && option.value !== null ? (null as T) : option.value);
              }}
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
                  styles.chipLabel,
                  { color: selected ? '#FFFFFF' : palette.textSecondary },
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

function FilterBarComponent({
  selectedCategory,
  setSelectedCategory,
  selectedPriceRange = null,
  setSelectedPriceRange,
  selectedTagCount = 0,
  onPressTagFilter,
  palette,
}: FilterBarProps): ReactElement {
  return (
    <View style={styles.container}>
      <ChipRow
        label="カテゴリー"
        options={CATEGORY_CHIPS}
        value={selectedCategory}
        onChange={setSelectedCategory}
        palette={palette}
      />
      {setSelectedPriceRange !== undefined ? (
        <ChipRow
          label="価格帯"
          options={PRICE_CHIPS}
          value={selectedPriceRange}
          onChange={setSelectedPriceRange}
          palette={palette}
        />
      ) : null}
      {onPressTagFilter !== undefined ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="こだわり条件を開く"
          onPress={onPressTagFilter}
          style={[
            styles.tagTrigger,
            {
              backgroundColor: palette.surface,
              borderColor:
                selectedTagCount > 0 ? palette.primary : palette.border,
            },
          ]}
        >
          <Text style={[styles.sectionLabel, { color: palette.textSecondary }]}>
            こだわり条件
          </Text>
          <Text
            style={[
              styles.tagTriggerText,
              {
                color: selectedTagCount > 0 ? palette.primary : palette.text,
              },
            ]}
          >
            {selectedTagCount > 0
              ? `${selectedTagCount}件選択中`
              : '雨の日OK・個室など'}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export const FilterBar = memo(FilterBarComponent);

const styles = StyleSheet.create({
  container: {
    gap: 14,
  },
  section: {
    gap: 8,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  scroll: {
    flexGrow: 0,
  },
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
  chipLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  tagTrigger: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 4,
  },
  tagTriggerText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
