import { useState, type ReactElement } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, FittedHeading } from '@/components';
import { useAppTheme } from '@/context';
import { FilterChipRow } from '@/features/spots/components/FilterChipRow';
import {
  CONTACT_CATEGORY_OPTIONS,
  useContact,
} from '../../hooks/useContact';
import type { RootStackScreenProps } from '@/navigation/types';

type ContactScreenProps = RootStackScreenProps<'Contact'>;

export function ContactScreen(_props: ContactScreenProps): ReactElement {
  const insets = useSafeAreaInsets();
  const { isDark, palette } = useAppTheme();
  const {
    category,
    subject,
    body,
    email,
    submitting,
    setCategory,
    setSubject,
    setBody,
    setEmail,
    submit,
  } = useContact();
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [resultOk, setResultOk] = useState(false);

  const handleSubmit = (): void => {
    void submit().then((result) => {
      setResultOk(result.ok);
      setResultMessage(result.message);
    });
  };

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: palette.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + 8,
            paddingBottom: insets.bottom + 24,
          },
        ]}
      >
        <Text style={[styles.kicker, { color: palette.primary }]}>Contact</Text>
        <FittedHeading style={[styles.heading, { color: palette.text }]}>
          お問い合わせ・ご意見
        </FittedHeading>
        <Text style={[styles.lead, { color: palette.textSecondary }]}>
          {'不具合報告や改善のご要望を送信できます。\n内容を確認し、必要に応じてご連絡します。'}
        </Text>

        <Text style={[styles.label, { color: palette.text }]}>カテゴリ</Text>
        <FilterChipRow
          value={category}
          onChange={setCategory}
          palette={palette}
          options={[...CONTACT_CATEGORY_OPTIONS]}
        />

        <Text style={[styles.label, { color: palette.text }]}>件名</Text>
        <TextInput
          value={subject}
          onChangeText={setSubject}
          placeholder="例: クーポンが表示されない"
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

        <Text style={[styles.label, { color: palette.text }]}>詳細</Text>
        <TextInput
          value={body}
          onChangeText={setBody}
          placeholder="発生した状況や、期待する動作を記入してください"
          placeholderTextColor={palette.muted}
          multiline
          textAlignVertical="top"
          style={[
            styles.input,
            styles.bodyInput,
            {
              color: palette.text,
              backgroundColor: palette.surface,
              borderColor: palette.border,
            },
          ]}
        />

        <Text style={[styles.label, { color: palette.text }]}>
          メールアドレス
        </Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          placeholderTextColor={palette.muted}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          style={[
            styles.input,
            {
              color: palette.text,
              backgroundColor: palette.surface,
              borderColor: palette.border,
            },
          ]}
        />

        <Button
          label={submitting ? '送信中…' : '送信する'}
          palette={palette}
          disabled={submitting}
          onPress={handleSubmit}
        />
      </ScrollView>

      <Modal
        visible={resultMessage !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setResultMessage(null)}
      >
        <View style={styles.modalRoot}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="閉じる"
            style={styles.backdrop}
            onPress={() => setResultMessage(null)}
          />
          <View
            style={[
              styles.resultCard,
              {
                backgroundColor: palette.surface,
                borderColor: palette.border,
              },
            ]}
          >
            <View
              style={[
                styles.resultIcon,
                { backgroundColor: palette.primaryMuted },
              ]}
            >
              <Ionicons
                name={resultOk ? 'checkmark-circle' : 'alert-circle'}
                size={28}
                color={palette.primary}
              />
            </View>
            <Text style={[styles.resultTitle, { color: palette.text }]}>
              {resultOk ? '送信が完了しました' : '送信できませんでした'}
            </Text>
            <Text style={[styles.resultBody, { color: palette.textSecondary }]}>
              {resultMessage}
            </Text>
            <Button
              label="閉じる"
              palette={palette}
              onPress={() => setResultMessage(null)}
            />
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    gap: 12,
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
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  bodyInput: {
    minHeight: 140,
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(43, 29, 31, 0.45)',
  },
  resultCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 22,
    gap: 12,
    alignItems: 'center',
  },
  resultIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  resultBody: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
  },
});
