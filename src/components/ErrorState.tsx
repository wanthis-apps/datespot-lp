import { type ReactElement } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Palette } from '@/theme';
import { Button } from './Button';

export type ErrorStateProps = {
  palette: Palette;
  title?: string;
  message: string;
  onRetry: () => void;
  retryLabel?: string;
};

function isOffline(): boolean {
  if (typeof navigator === 'undefined') {
    return false;
  }

  return navigator.onLine === false;
}

function isNetworkError(message: string): boolean {
  const normalized = message.toLowerCase();
  return (
    isOffline() ||
    normalized.includes('network') ||
    normalized.includes('offline') ||
    normalized.includes('failed to fetch') ||
    normalized.includes('ネットワーク') ||
    normalized.includes('オフライン') ||
    normalized.includes('接続')
  );
}

export function ErrorState({
  palette,
  title,
  message,
  onRetry,
  retryLabel = '再読み込み',
}: ErrorStateProps): ReactElement {
  const networkIssue = isNetworkError(message);
  const heading =
    title ?? (networkIssue ? '接続できません' : '読み込みに失敗しました');
  const body = networkIssue
    ? 'ネットワーク接続を確認して、もう一度お試しください。'
    : message;

  return (
    <View style={styles.container} accessibilityRole="alert">
      <View style={[styles.iconWrap, { backgroundColor: palette.primaryMuted }]}>
        <Ionicons
          name={networkIssue ? 'cloud-offline-outline' : 'alert-circle-outline'}
          size={28}
          color={palette.primary}
        />
      </View>
      <Text style={[styles.title, { color: palette.text }]}>{heading}</Text>
      <Text style={[styles.message, { color: palette.textSecondary }]}>
        {body}
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
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
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
