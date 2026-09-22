import { type ReactElement } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/context';
import { FilterChipRow } from '@/features/spots/components/FilterChipRow';
import {
  FAQ_CATEGORY_LABELS,
  useFaq,
  type FaqFilter,
} from '../../hooks/useFaq';
import type { RootStackScreenProps } from '@/navigation/types';

type FaqScreenProps = RootStackScreenProps<'Faq'>;

const FILTER_OPTIONS: ReadonlyArray<{ value: FaqFilter; label: string }> = [
  { value: 'all', label: 'すべて' },
  { value: 'app', label: FAQ_CATEGORY_LABELS.app },
  { value: 'coupon', label: FAQ_CATEGORY_LABELS.coupon },
  { value: 'account', label: FAQ_CATEGORY_LABELS.account },
];

export function FaqScreen(_props: FaqScreenProps): ReactElement {
  const insets = useSafeAreaInsets();
  const { isDark, palette } = useAppTheme();
  const { items, filter, setFilter, openId, toggleItem } = useFaq();

  return (
    <View
      style={[
        styles.screen,
        {
          backgroundColor: palette.background,
          paddingTop: insets.top + 8,
        },
      ]}
    >
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 24 },
        ]}
      >
        <Text style={[styles.kicker, { color: palette.primary }]}>Help</Text>
        <Text style={[styles.heading, { color: palette.text }]}>
          よくある質問
        </Text>
        <Text style={[styles.lead, { color: palette.textSecondary }]}>
          アプリの使い方やクーポン、アカウントについてまとめています。
        </Text>
        <FilterChipRow
          value={filter}
          onChange={setFilter}
          palette={palette}
          options={[...FILTER_OPTIONS]}
        />

        <View style={styles.list}>
          {items.map((item) => {
            const open = openId === item.id;
            return (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                accessibilityState={{ expanded: open }}
                onPress={() => toggleItem(item.id)}
                style={[
                  styles.card,
                  {
                    backgroundColor: palette.surface,
                    borderColor: open ? palette.primary : palette.border,
                  },
                ]}
              >
                <View style={styles.questionRow}>
                  <View
                    style={[
                      styles.iconWrap,
                      { backgroundColor: palette.primaryMuted },
                    ]}
                  >
                    <Ionicons
                      name="help"
                      size={16}
                      color={palette.primary}
                    />
                  </View>
                  <View style={styles.questionCopy}>
                    <Text style={[styles.category, { color: palette.primary }]}>
                      {FAQ_CATEGORY_LABELS[item.category]}
                    </Text>
                    <Text style={[styles.question, { color: palette.text }]}>
                      {item.question}
                    </Text>
                  </View>
                  <Ionicons
                    name={open ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={palette.muted}
                  />
                </View>
                {open ? (
                  <Text style={[styles.answer, { color: palette.textSecondary }]}>
                    {item.answer}
                  </Text>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
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
  list: {
    gap: 10,
    marginTop: 8,
  },
  card: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    gap: 10,
  },
  questionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  questionCopy: {
    flex: 1,
    gap: 4,
  },
  category: {
    fontSize: 11,
    fontWeight: '700',
  },
  question: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 22,
  },
  answer: {
    fontSize: 14,
    lineHeight: 22,
    paddingLeft: 42,
  },
});
