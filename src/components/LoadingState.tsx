import { type ReactElement } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import type { Palette } from '@/theme';

type LoadingStateProps = {
  palette: Palette;
  message?: string;
};

export function LoadingState({
  palette,
  message = '読み込み中です…',
}: LoadingStateProps): ReactElement {
  return (
    <View style={styles.container} accessibilityRole="progressbar">
      <ActivityIndicator size="large" color={palette.primary} />
      <Text style={[styles.message, { color: palette.textSecondary }]}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 16,
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
});
