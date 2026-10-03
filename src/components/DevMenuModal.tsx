import { useCallback, useState, type ReactElement } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/context';
import type { ToastType } from '@/context/toastStore';
import { useAuth } from '@/features/auth';
import {
  APP_VERSION,
  clearAllLocalData,
  playTestToastSequence,
  resetOnboardingFlag,
  restoreDummyData,
  setMockAuthMode,
  showTestToast,
} from '@/features/debug/debugActions';
import type { Palette } from '@/theme';
import { Button } from './Button';

export type DevMenuModalProps = {
  visible: boolean;
  onClose: () => void;
};

const TOAST_AFTER_CLOSE_MS = 320;

type ActionTone = 'default' | 'danger';

type ActionRowProps = {
  palette: Palette;
  emoji: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  disabled?: boolean;
  tone?: ActionTone;
};

function ActionRow({
  palette,
  emoji,
  title,
  subtitle,
  onPress,
  disabled = false,
  tone = 'default',
}: ActionRowProps): ReactElement {
  const titleColor = tone === 'danger' ? palette.danger : palette.text;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.actionRow,
        {
          backgroundColor: palette.background,
          borderColor: palette.border,
          opacity: disabled ? 0.5 : 1,
        },
      ]}
    >
      <Text style={styles.actionEmoji}>{emoji}</Text>
      <View style={styles.actionBody}>
        <Text style={[styles.actionTitle, { color: titleColor }]}>{title}</Text>
        <Text style={[styles.actionSubtitle, { color: palette.textSecondary }]}>
          {subtitle}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={palette.muted} />
    </Pressable>
  );
}

export function DevMenuModal({
  visible,
  onClose,
}: DevMenuModalProps): ReactElement | null {
  const { palette } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { isGuest, isEmailUser, needsAuth } = useAuth();
  const [busy, setBusy] = useState(false);

  const authLabel = isEmailUser
    ? 'ログイン中'
    : isGuest
      ? 'ゲスト'
      : needsAuth
        ? '未認証'
        : '不明';

  const runAction = useCallback(
    async (task: () => Promise<unknown>): Promise<void> => {
      if (busy) {
        return;
      }

      setBusy(true);
      try {
        await task();
      } finally {
        setBusy(false);
      }
    },
    [busy],
  );

  const handleClearAll = (): void => {
    void runAction(clearAllLocalData);
  };

  const handleResetOnboarding = (): void => {
    void runAction(async () => {
      onClose();
      await resetOnboardingFlag();
    });
  };

  const handleRestoreDummy = (): void => {
    void runAction(restoreDummyData);
  };

  const handleAuth = (mode: 'guest' | 'signed_in'): void => {
    void runAction(async () => {
      await setMockAuthMode(mode);
    });
  };

  const handleToast = (type: ToastType): void => {
    onClose();
    setTimeout(() => {
      showTestToast(type);
    }, TOAST_AFTER_CLOSE_MS);
  };

  const handleToastSequence = (): void => {
    onClose();
    setTimeout(() => {
      void playTestToastSequence();
    }, TOAST_AFTER_CLOSE_MS);
  };

  if (!__DEV__) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="デバッグメニューを閉じる"
          style={styles.backdrop}
          onPress={onClose}
        />
        <View
          style={[
            styles.card,
            {
              backgroundColor: palette.surface,
              borderColor: palette.border,
              paddingBottom: Math.max(insets.bottom, 16) + 8,
            },
          ]}
        >
          <View style={styles.header}>
            <View
              style={[styles.iconWrap, { backgroundColor: palette.primaryMuted }]}
            >
              <Ionicons name="construct-outline" size={20} color={palette.primary} />
            </View>
            <View style={styles.headerText}>
              <Text style={[styles.kicker, { color: palette.primary }]}>
                DEVELOPER
              </Text>
              <Text style={[styles.title, { color: palette.text }]}>
                デバッグメニュー
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="閉じる"
              onPress={onClose}
            >
              <Ionicons name="close" size={20} color={palette.text} />
            </Pressable>
          </View>

          <Text style={[styles.lead, { color: palette.textSecondary }]}>
            実機確認用のローカルデータ操作です。本番のサーバーデータは変更しません。
          </Text>

          <View
            style={[
              styles.statusChip,
              {
                backgroundColor: palette.background,
                borderColor: palette.border,
              },
            ]}
          >
            <Text style={[styles.statusLabel, { color: palette.textSecondary }]}>
              認証
            </Text>
            <Text style={[styles.statusValue, { color: palette.text }]}>
              {authLabel}
            </Text>
            <Text style={[styles.statusLabel, { color: palette.textSecondary }]}>
              v{APP_VERSION}
            </Text>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={[styles.sectionTitle, { color: palette.text }]}>
              データ
            </Text>
            <ActionRow
              palette={palette}
              emoji="🧹"
              title="キャッシュ・設定クリア"
              subtitle="@datespot/* の全データを初期化します"
              tone="danger"
              disabled={busy}
              onPress={handleClearAll}
            />
            <ActionRow
              palette={palette}
              emoji="🔄"
              title="オンボーディングリセット"
              subtitle="初回起動フラグを消して案内を再表示します"
              disabled={busy}
              onPress={handleResetOnboarding}
            />
            <ActionRow
              palette={palette}
              emoji="🎟"
              title="ダミーデータ全復元"
              subtitle="お気に入り・履歴・プラン・通知を初期状態へ"
              disabled={busy}
              onPress={handleRestoreDummy}
            />

            <Text style={[styles.sectionTitle, { color: palette.text }]}>
              認証モック
            </Text>
            <View style={styles.authRow}>
              <Pressable
                accessibilityRole="button"
                disabled={busy || isGuest}
                onPress={() => handleAuth('guest')}
                style={[
                  styles.authButton,
                  {
                    backgroundColor: isGuest
                      ? palette.primaryMuted
                      : palette.background,
                    borderColor: isGuest ? palette.primary : palette.border,
                    opacity: busy ? 0.5 : 1,
                  },
                ]}
              >
                <Text style={[styles.authButtonTitle, { color: palette.text }]}>
                  👤 ゲスト
                </Text>
                <Text
                  style={[
                    styles.authButtonSub,
                    { color: palette.textSecondary },
                  ]}
                >
                  未ログイン
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                disabled={busy || isEmailUser}
                onPress={() => handleAuth('signed_in')}
                style={[
                  styles.authButton,
                  {
                    backgroundColor: isEmailUser
                      ? palette.primaryMuted
                      : palette.background,
                    borderColor: isEmailUser ? palette.primary : palette.border,
                    opacity: busy ? 0.5 : 1,
                  },
                ]}
              >
                <Text style={[styles.authButtonTitle, { color: palette.text }]}>
                  🔑 ログイン
                </Text>
                <Text
                  style={[
                    styles.authButtonSub,
                    { color: palette.textSecondary },
                  ]}
                >
                  モックユーザー
                </Text>
              </Pressable>
            </View>

            <Text style={[styles.sectionTitle, { color: palette.text }]}>
              トースト
            </Text>
            <View style={styles.toastRow}>
              {(['success', 'error', 'info'] as const).map((type) => (
                <Pressable
                  key={type}
                  accessibilityRole="button"
                  disabled={busy}
                  onPress={() => handleToast(type)}
                  style={[
                    styles.toastChip,
                    {
                      backgroundColor: palette.background,
                      borderColor: palette.border,
                    },
                  ]}
                >
                  <Text style={[styles.toastChipLabel, { color: palette.text }]}>
                    {type === 'success'
                      ? '成功'
                      : type === 'error'
                        ? 'エラー'
                        : 'お知らせ'}
                  </Text>
                </Pressable>
              ))}
            </View>
            <ActionRow
              palette={palette}
              emoji="🔔"
              title="テストトースト呼び出し"
              subtitle="成功 → エラー → お知らせの順でアニメーション確認"
              disabled={busy}
              onPress={handleToastSequence}
            />
          </ScrollView>

          {busy ? (
            <View style={styles.busyRow}>
              <ActivityIndicator size="small" color={palette.primary} />
              <Text style={[styles.busyLabel, { color: palette.textSecondary }]}>
                処理中…
              </Text>
            </View>
          ) : null}

          <Button
            label="閉じる"
            palette={palette}
            variant="ghost"
            disabled={busy}
            onPress={onClose}
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
  card: {
    maxHeight: '88%',
    borderWidth: 1,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 24,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  kicker: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  lead: {
    fontSize: 13,
    lineHeight: 20,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusValue: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
  },
  scroll: {
    flexShrink: 1,
  },
  scrollContent: {
    gap: 10,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 6,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  actionEmoji: {
    fontSize: 20,
    width: 28,
    textAlign: 'center',
  },
  actionBody: {
    flex: 1,
    gap: 2,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  actionSubtitle: {
    fontSize: 12,
    lineHeight: 18,
  },
  authRow: {
    flexDirection: 'row',
    gap: 10,
  },
  authButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 14,
    gap: 4,
  },
  authButtonTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  authButtonSub: {
    fontSize: 12,
  },
  toastRow: {
    flexDirection: 'row',
    gap: 8,
  },
  toastChip: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  toastChipLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  busyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  busyLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
});
