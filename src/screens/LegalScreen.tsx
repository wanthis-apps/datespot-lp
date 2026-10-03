import { type ReactElement } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FittedHeading } from '@/components';
import { useAppTheme } from '@/context';
import { FilterChipRow } from '@/features/spots/components/FilterChipRow';
import {
  useLegal,
  type LegalBlock,
  type LegalTab,
} from '../../hooks/useLegal';
import type { RootStackScreenProps } from '@/navigation/types';

type LegalScreenProps = RootStackScreenProps<'Legal'>;

function LegalBlockView({
  block,
  textColor,
  mutedColor,
}: {
  block: LegalBlock;
  textColor: string;
  mutedColor: string;
}): ReactElement {
  if (block.type === 'heading') {
    return <Text style={[styles.sectionTitle, { color: textColor }]}>{block.text}</Text>;
  }

  if (block.type === 'paragraph') {
    return <Text style={[styles.paragraph, { color: mutedColor }]}>{block.text}</Text>;
  }

  return (
    <View style={styles.bulletList}>
      {block.items.map((item) => (
        <View key={item} style={styles.bulletRow}>
          <Text style={[styles.bulletMark, { color: textColor }]}>・</Text>
          <Text style={[styles.bulletText, { color: mutedColor }]}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

export function LegalScreen({ route }: LegalScreenProps): ReactElement {
  const insets = useSafeAreaInsets();
  const { isDark, palette } = useAppTheme();
  const initialTab: LegalTab = route.params?.document ?? 'terms';
  const { tab, setTab, document, tabs } = useLegal(initialTab);

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
        <Text style={[styles.kicker, { color: palette.primary }]}>Legal</Text>
        <FittedHeading style={[styles.heading, { color: palette.text }]}>
          利用規約・プライバシーポリシー
        </FittedHeading>
        <Text style={[styles.lead, { color: palette.textSecondary }]}>
          {'アプリのご利用条件と、\n取り扱う情報についてまとめています。'}
        </Text>
        <FilterChipRow
          value={tab}
          onChange={setTab}
          palette={palette}
          options={[...tabs]}
        />

        <View
          style={[
            styles.dates,
            { backgroundColor: palette.surface, borderColor: palette.border },
          ]}
        >
          <View style={styles.dateItem}>
            <Text style={[styles.dateLabel, { color: palette.muted }]}>
              施行日
            </Text>
            <Text style={[styles.dateValue, { color: palette.text }]}>
              {document.effectiveDate}
            </Text>
          </View>
          <View style={[styles.dateDivider, { backgroundColor: palette.border }]} />
          <View style={styles.dateItem}>
            <Text style={[styles.dateLabel, { color: palette.muted }]}>
              改定日
            </Text>
            <Text style={[styles.dateValue, { color: palette.text }]}>
              {document.revisedDate}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.card,
            { backgroundColor: palette.surface, borderColor: palette.border },
          ]}
        >
          <Text style={[styles.documentTitle, { color: palette.text }]}>
            {document.title}
          </Text>
          {document.blocks.map((block, index) => (
            <LegalBlockView
              key={`${document.tab}-${index}`}
              block={block}
              textColor={palette.text}
              mutedColor={palette.textSecondary}
            />
          ))}
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
    gap: 14,
  },
  kicker: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.2,
    textAlign: 'left',
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
  dates: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  dateItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  dateDivider: {
    width: 1,
    height: 36,
  },
  dateLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  card: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 18,
    gap: 12,
  },
  documentTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 6,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 22,
  },
  bulletList: {
    gap: 8,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  bulletMark: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '700',
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 22,
  },
});
