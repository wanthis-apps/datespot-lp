import { type ReactElement } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Palette } from '@/theme';
import { Button } from './Button';

type ErrorStateProps = {
  palette: Palette;
  title?: string;
  message: string;
  onRetry: () => void;
  retryLabel?: string;
};

export function ErrorState({
  palette,
  title = '読み込みに失敗しました',
  message,
  onRetry,
  retryLabel = '再読み込み',
}: ErrorStateProps): ReactElement {
  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: palette.text }]}>{title}</Text>
      <Text style={[styles.message, { color: palette.textSecondary }]}>
        {message}
      </Text>
      <View style={styles.action}>
        <Button label={retryLabel} onPress={onRetry} palette={palette} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
  },
  action: {
    marginTop: 8,
    alignSelf: 'stretch',
    maxWidth: 280,
    width: '100%',
  },
});
