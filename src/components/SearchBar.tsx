import { memo, type ReactElement } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { SpotSortBy } from '../../hooks/spotQuery';
import type { Palette } from '@/theme';

export type SearchBarProps = {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortBy: SpotSortBy;
  setSortBy: (sortBy: SpotSortBy) => void;
  palette: Palette;
  placeholder?: string;
};

const SORT_CHIPS: ReadonlyArray<{ value: SpotSortBy; label: string }> = [
  { value: 'default', label: '標準' },
  { value: 'price_asc', label: '価格が安い順' },
  { value: 'price_desc', label: '価格が高い順' },
  { value: 'name', label: '名前順' },
];

function SearchBarComponent({
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  palette,
  placeholder = '店名・説明・住所で検索',
}: SearchBarProps): ReactElement {
  return (
    <View style={styles.container}>
      <View
        style={[
          styles.inputWrap,
          { backgroundColor: palette.surface, borderColor: palette.border },
        ]}
      >
        <Ionicons name="search" size={18} color={palette.muted} />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={placeholder}
          placeholderTextColor={palette.muted}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          style={[styles.input, { color: palette.text }]}
        />
        {searchQuery.length > 0 ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="検索文字をクリア"
            hitSlop={8}
            onPress={() => setSearchQuery('')}
            style={[styles.clear, { backgroundColor: palette.primaryMuted }]}
          >
            <Ionicons name="close" size={14} color={palette.primary} />
          </Pressable>
        ) : null}
      </View>

      <View style={styles.sortSection}>
        <Text style={[styles.sortLabel, { color: palette.textSecondary }]}>
          並び替え
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sortRow}
        >
          {SORT_CHIPS.map((option) => {
            const selected = option.value === sortBy;

            return (
              <Pressable
                key={option.value}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => setSortBy(option.value)}
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
    </View>
  );
}

export const SearchBar = memo(SearchBarComponent);

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },
  clear: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sortSection: {
    gap: 8,
  },
  sortLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  sortRow: {
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
});
