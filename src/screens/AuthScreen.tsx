import { useState, type ReactElement } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/components';
import { useAppTheme } from '@/context';
import { useAuth } from '@/features/auth';
import type { RootStackScreenProps } from '@/navigation/types';

type AuthMode = 'login' | 'signup';

type AuthScreenProps = Partial<RootStackScreenProps<'Auth'>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

function validateAuthForm(email: string, password: string): string | null {
  const trimmedEmail = email.trim();
  if (trimmedEmail.length === 0) {
    return 'メールアドレスを入力してください。';
  }
  if (!EMAIL_PATTERN.test(trimmedEmail)) {
    return 'メールアドレスの形式が正しくありません。';
  }
  if (password.length === 0) {
    return 'パスワードを入力してください。';
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `パスワードは${MIN_PASSWORD_LENGTH}文字以上にしてください。`;
  }
  return null;
}

export function AuthScreen({ navigation }: AuthScreenProps): ReactElement {
  const insets = useSafeAreaInsets();
  const { isDark, palette } = useAppTheme();
  const { signIn, signUp, continueAsGuest } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const enterMain = (): void => {
    if (navigation === undefined) {
      return;
    }

    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.reset({
      index: 0,
      routes: [{ name: 'Main' }],
    });
  };

  const handleSubmit = (): void => {
    const validationError = validateAuthForm(email, password);
    if (validationError !== null) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError(null);
    const action = mode === 'login' ? signIn : signUp;
    void action(email.trim(), password)
      .then((result) => {
        if (!result.ok) {
          setError(result.message);
          return;
        }
        if (result.message.includes('確認メール')) {
          setError(result.message);
          setMode('login');
          return;
        }
        enterMain();
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  const handleGuest = (): void => {
    setSubmitting(true);
    setError(null);
    void continueAsGuest()
      .then((result) => {
        if (!result.ok) {
          setError(result.message);
          return;
        }
        enterMain();
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  return (
    <View
      style={[
        styles.screen,
        {
          backgroundColor: palette.background,
          paddingTop: insets.top + 12,
        },
      ]}
    >
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + 24 },
          ]}
        >
          <View style={styles.brand}>
            <View
              style={[styles.logo, { backgroundColor: palette.primaryMuted }]}
            >
              <Text style={[styles.logoMark, { color: palette.primary }]}>
                DS
              </Text>
            </View>
            <Text style={[styles.kicker, { color: palette.primary }]}>
              DateSpot
            </Text>
            <Text style={[styles.heading, { color: palette.text }]}>
              {mode === 'login' ? 'ログイン' : '新規アカウント作成'}
            </Text>
            <Text style={[styles.lead, { color: palette.textSecondary }]}>
              メールアドレスで始めるか、ゲストとしてスポットを探せます。
            </Text>
          </View>

          <View style={styles.tabs}>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: mode === 'login' }}
              onPress={() => {
                setMode('login');
                setError(null);
              }}
              style={[
                styles.tab,
                {
                  backgroundColor:
                    mode === 'login' ? palette.primary : palette.surface,
                  borderColor:
                    mode === 'login' ? palette.primary : palette.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.tabLabel,
                  { color: mode === 'login' ? '#FFFFFF' : palette.textSecondary },
                ]}
              >
                ログイン
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: mode === 'signup' }}
              onPress={() => {
                setMode('signup');
                setError(null);
              }}
              style={[
                styles.tab,
                {
                  backgroundColor:
                    mode === 'signup' ? palette.primary : palette.surface,
                  borderColor:
                    mode === 'signup' ? palette.primary : palette.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.tabLabel,
                  { color: mode === 'signup' ? '#FFFFFF' : palette.textSecondary },
                ]}
              >
                新規登録
              </Text>
            </Pressable>
          </View>

          <View style={styles.form}>
            <Text style={[styles.label, { color: palette.textSecondary }]}>
              メールアドレス
            </Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              placeholder="you@example.com"
              placeholderTextColor={palette.muted}
              style={[
                styles.input,
                {
                  color: palette.text,
                  backgroundColor: palette.surface,
                  borderColor: palette.border,
                },
              ]}
            />
            <Text style={[styles.label, { color: palette.textSecondary }]}>
              パスワード
            </Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder={`${MIN_PASSWORD_LENGTH}文字以上`}
              placeholderTextColor={palette.muted}
              style={[
                styles.input,
                {
                  color: palette.text,
                  backgroundColor: palette.surface,
                  borderColor: palette.border,
                },
              ]}
            />
            {error !== null ? (
              <View
                style={[
                  styles.errorBox,
                  { backgroundColor: palette.primaryMuted },
                ]}
              >
                <Text style={[styles.errorText, { color: palette.primary }]}>
                  {error}
                </Text>
              </View>
            ) : null}
            <Button
              label={
                submitting
                  ? '処理中…'
                  : mode === 'login'
                    ? 'ログイン'
                    : 'アカウントを作成'
              }
              palette={palette}
              disabled={submitting}
              onPress={handleSubmit}
            />
            <Button
              label="ゲストとして利用する"
              palette={palette}
              variant="ghost"
              disabled={submitting}
              onPress={handleGuest}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 24,
  },
  brand: {
    alignItems: 'center',
    gap: 8,
    paddingTop: 12,
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  logoMark: {
    fontSize: 24,
    fontWeight: '800',
  },
  kicker: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  heading: {
    fontSize: 26,
    fontWeight: '700',
  },
  lead: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
  },
  tabs: {
    flexDirection: 'row',
    gap: 10,
  },
  tab: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: 'center',
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  form: {
    gap: 10,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
  },
  input: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  errorBox: {
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  errorText: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '600',
  },
});
