import { type ReactElement } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Palette } from '@/theme';

type SpotSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  palette: Palette;
  placeholder?: string;
};

export function SpotSearchBar({
  value,
  onChange,
  palette,
  placeholder = '店名・エリアで検索',
}: SpotSearchBarProps): ReactElement {
  return (
    <View
      style={[
        styles.wrap,
        { backgroundColor: palette.surface, borderColor: palette.border },
      ]}
    >
      <Ionicons name="search" size={18} color={palette.muted} />
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={palette.muted}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        style={[styles.input, { color: palette.text }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
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
});
