import { type ReactElement } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FittedHeading } from '@/components';
import { useAppTheme } from '@/context';
import {
  NOTIFICATION_SETTING_ITEMS,
  useNotificationSettings,
} from '../../hooks/useNotificationSettings';
import type { RootStackScreenProps } from '@/navigation/types';
import { SettingsListItem } from './components/SettingsListItem';

type NotificationSettingsScreenProps =
  RootStackScreenProps<'NotificationSettings'>;

export function NotificationSettingsScreen(
  _props: NotificationSettingsScreenProps,
): ReactElement {
  const insets = useSafeAreaInsets();
  const { isDark, palette } = useAppTheme();
  const { preferences, enabledCount, setPreference } = useNotificationSettings();

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
        <Text style={[styles.kicker, { color: palette.primary }]}>
          Privacy
        </Text>
        <FittedHeading style={[styles.heading, { color: palette.text }]}>
          通知・プライバシー設定
        </FittedHeading>
        <Text style={[styles.lead, { color: palette.textSecondary }]}>
          {'受け取るお知らせの種類を選べます。\n設定はこの端末に保存され、\nログイン中はアカウントにも同期します。'}
        </Text>

        <View
          style={[
            styles.summary,
            { backgroundColor: palette.surface, borderColor: palette.border },
          ]}
        >
          <Text style={[styles.summaryLabel, { color: palette.muted }]}>
            有効な通知
          </Text>
          <Text style={[styles.summaryValue, { color: palette.text }]}>
            {enabledCount} / {NOTIFICATION_SETTING_ITEMS.length}
          </Text>
        </View>

        <Text style={[styles.sectionTitle, { color: palette.text }]}>通知</Text>
        <View style={styles.list}>
          {NOTIFICATION_SETTING_ITEMS.map((item) => {
            const enabled = preferences[item.key];
            return (
              <SettingsListItem
                key={item.key}
                palette={palette}
                icon="notifications-outline"
                title={`${item.emoji} ${item.title}`}
                subtitle={item.subtitle}
                trailing={
                  <Switch
                    value={enabled}
                    onValueChange={(value) => {
                      void setPreference(item.key, value);
                    }}
                    trackColor={{
                      false: palette.border,
                      true: palette.primaryMuted,
                    }}
                    thumbColor={enabled ? palette.primary : palette.muted}
                  />
                }
              />
            );
          })}
        </View>

        <Text style={[styles.sectionTitle, { color: palette.text }]}>
          プライバシー
        </Text>
        <View
          style={[
            styles.privacyCard,
            { backgroundColor: palette.surface, borderColor: palette.border },
          ]}
        >
          <Text style={[styles.privacyTitle, { color: palette.text }]}>
            端末内データの取り扱い
          </Text>
          <Text style={[styles.privacyBody, { color: palette.textSecondary }]}>
            お気に入り、閲覧履歴、プランは端末またはログイン中のアカウントに保存されます。退会するとこれらのデータは削除対象になります。
          </Text>
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
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 8,
  },
  list: {
    gap: 10,
  },
  privacyCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    gap: 8,
  },
  privacyTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  privacyBody: {
    fontSize: 14,
    lineHeight: 22,
  },
});
