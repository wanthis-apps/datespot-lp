import { useRef, useState, type ReactElement } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Button,
  DeleteAccountModal,
  DevMenuModal,
  FittedHeading,
  RemoteImage,
} from '@/components';
import { useAppTheme, useI18n, type ThemeMode } from '@/context';
import { LANGUAGE_OPTIONS } from '@/i18n';
import { APP_VERSION } from '@/features/debug/debugActions';
import { useNotificationSettings } from '../../hooks/useNotificationSettings';
import { useProfileScreen } from '../../hooks/useProfileScreen';
import type { TabScreenProps } from '@/navigation/types';
import { ProfileEditModal } from './components/ProfileEditModal';
import { SettingsListItem } from './components/SettingsListItem';

type ProfileScreenProps = TabScreenProps<'MyPage'>;

export function ProfileScreen({ navigation }: ProfileScreenProps): ReactElement {
  const insets = useSafeAreaInsets();
  const {
    profile,
    isDark,
    palette,
    favoriteCount,
    isSyncing,
    isGuest,
    isEmailUser,
    updateDisplayName,
    resync,
    logout,
  } = useProfileScreen();
  const { mode, setMode } = useAppTheme();
  const { language, setLanguage, t } = useI18n();
  const { anyEnabled, enabledCount } = useNotificationSettings();
  const [isEditVisible, setIsEditVisible] = useState(false);
  const [isDeleteVisible, setIsDeleteVisible] = useState(false);
  const [isDevMenuVisible, setIsDevMenuVisible] = useState(false);
  const versionTapCountRef = useRef(0);
  const versionTapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const openDevMenu = (): void => {
    if (!__DEV__) {
      return;
    }

    setIsDevMenuVisible(true);
  };

  const handleVersionPress = (): void => {
    if (!__DEV__) {
      return;
    }

    versionTapCountRef.current += 1;
    if (versionTapTimerRef.current !== null) {
      clearTimeout(versionTapTimerRef.current);
    }

    if (versionTapCountRef.current >= 3) {
      versionTapCountRef.current = 0;
      openDevMenu();
      return;
    }

    versionTapTimerRef.current = setTimeout(() => {
      versionTapCountRef.current = 0;
      versionTapTimerRef.current = null;
    }, 800);
  };

  const handleResync = (): void => {
    if (isSyncing) {
      return;
    }

    void resync().then(() => {
      Alert.alert(t('profile.resyncDoneTitle'), t('profile.resyncDoneBody'));
    });
  };

  const handleLogout = (): void => {
    Alert.alert(t('profile.logoutTitle'), t('profile.logoutBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('profile.logout'),
        style: 'destructive',
        onPress: () => {
          void logout();
        },
      },
    ]);
  };

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
          {t('profile.kicker')}
        </Text>
        <FittedHeading style={[styles.heading, { color: palette.text }]}>
          {t('profile.heading')}
        </FittedHeading>

        {!isEmailUser ? (
          <View style={styles.loginPrompt}>
            <Text style={[styles.loginLead, { color: palette.textSecondary }]}>
              {'ログインすると、\nお気に入りや会員ステータスを\nアカウントに保存できます。'}
            </Text>
            <Button
              label="ログイン / 会員登録"
              palette={palette}
              onPress={() => navigation.navigate('Auth')}
            />
          </View>
        ) : (
          <>
        <View
          style={[
            styles.profileCard,
            { backgroundColor: palette.surface, borderColor: palette.border },
          ]}
        >
          {profile.avatarUrl !== null ? (
            <RemoteImage
              uri={profile.avatarUrl}
              style={styles.avatar}
              accessibilityLabel={profile.name}
            />
          ) : (
            <View
              style={[styles.avatar, { backgroundColor: palette.primaryMuted }]}
            >
              <Ionicons name="person" size={32} color={palette.primary} />
            </View>
          )}
          <Text style={[styles.name, { color: palette.text }]}>
            {profile.name}
          </Text>
          <Text style={[styles.email, { color: palette.textSecondary }]}>
            {profile.email}
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View
            style={[
              styles.statChip,
              { backgroundColor: palette.surface, borderColor: palette.border },
            ]}
          >
            <Text style={[styles.statValue, { color: palette.primary }]}>
              {favoriteCount}
            </Text>
            <Text style={[styles.statLabel, { color: palette.textSecondary }]}>
              {t('profile.favorites')}
            </Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: palette.text }]}>
          {t('profile.sectionAccount')}
        </Text>
        <View
          style={[
            styles.membershipCard,
            { backgroundColor: palette.surface, borderColor: palette.border },
          ]}
        >
          <View
            style={[
              styles.membershipIcon,
              { backgroundColor: palette.primaryMuted },
            ]}
          >
            <Ionicons name="ribbon-outline" size={22} color={palette.primary} />
          </View>
          <View style={styles.membershipCopy}>
            <Text style={[styles.membershipLabel, { color: palette.textSecondary }]}>
              {t('profile.membershipLabel')}
            </Text>
            <Text style={[styles.membershipValue, { color: palette.text }]}>
              {isGuest ? t('profile.membershipGuest') : t('profile.membershipFree')}
            </Text>
            <Text style={[styles.membershipNote, { color: palette.textSecondary }]}>
              {t('profile.membershipNote')}
            </Text>
          </View>
        </View>
        <View style={styles.list}>
          <SettingsListItem
            palette={palette}
            icon="person-outline"
            title={t('profile.account')}
            subtitle={t('profile.accountSub')}
            showChevron
            onPress={() => setIsEditVisible(true)}
          />
          <SettingsListItem
            palette={palette}
            icon="calendar-outline"
            title={t('profile.plans')}
            subtitle={t('profile.plansSub')}
            showChevron
            onPress={() => navigation.navigate('Plans')}
          />
          <SettingsListItem
            palette={palette}
            icon="trash-outline"
            title={t('profile.deleteAccount')}
            subtitle={t('profile.deleteAccountSub')}
            showChevron
            onPress={() => setIsDeleteVisible(true)}
          />
        </View>
          </>
        )}

        <Text style={[styles.sectionTitle, { color: palette.text }]}>
          {t('profile.sectionApp')}
        </Text>
        <View style={styles.list}>
          <View
            style={[
              styles.languageCard,
              { backgroundColor: palette.surface, borderColor: palette.border },
            ]}
          >
            <View style={styles.languageHeader}>
              <View
                style={[
                  styles.languageIcon,
                  { backgroundColor: palette.primaryMuted },
                ]}
              >
                <Ionicons name="color-palette-outline" size={18} color={palette.primary} />
              </View>
              <View style={styles.languageCopy}>
                <Text style={[styles.languageTitle, { color: palette.text }]}>
                  {t('profile.theme')}
                </Text>
                <Text
                  style={[styles.languageSubtitle, { color: palette.textSecondary }]}
                >
                  {t('profile.themeSub')}
                </Text>
              </View>
            </View>
            <View style={styles.themeOptions}>
              {(
                [
                  { value: 'light', label: t('profile.light') },
                  { value: 'dark', label: t('profile.dark') },
                  { value: 'system', label: t('profile.themeSystem') },
                ] as const satisfies ReadonlyArray<{
                  value: ThemeMode;
                  label: string;
                }>
              ).map((option) => {
                const selected = option.value === mode;
                return (
                  <Pressable
                    key={option.value}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onPress={() => setMode(option.value)}
                    style={[
                      styles.themeOption,
                      {
                        backgroundColor: selected
                          ? palette.primary
                          : palette.background,
                        borderColor: selected ? palette.primary : palette.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.themeOptionLabel,
                        { color: selected ? '#FFFFFF' : palette.text },
                      ]}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
          <View
            style={[
              styles.languageCard,
              { backgroundColor: palette.surface, borderColor: palette.border },
            ]}
          >
            <View style={styles.languageHeader}>
              <View
                style={[
                  styles.languageIcon,
                  { backgroundColor: palette.primaryMuted },
                ]}
              >
                <Ionicons name="language-outline" size={18} color={palette.primary} />
              </View>
              <View style={styles.languageCopy}>
                <Text style={[styles.languageTitle, { color: palette.text }]}>
                  {t('language.label')}
                </Text>
                <Text
                  style={[styles.languageSubtitle, { color: palette.textSecondary }]}
                >
                  {t('profile.languageSub')}
                </Text>
              </View>
            </View>
            <View
              style={[
                styles.languageTrack,
                { backgroundColor: palette.background },
              ]}
            >
              {LANGUAGE_OPTIONS.map((option) => {
                const selected = option.value === language;
                return (
                  <Pressable
                    key={option.value}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onPress={() => setLanguage(option.value)}
                    style={[
                      styles.languageOption,
                      selected ? { backgroundColor: palette.primary } : null,
                    ]}
                  >
                    <Text
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      minimumFontScale={0.85}
                      style={[
                        styles.languageOptionLabel,
                        {
                          color: selected ? '#FFFFFF' : palette.textSecondary,
                        },
                      ]}
                    >
                      {t(option.labelKey)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
          <SettingsListItem
            palette={palette}
            icon="notifications-outline"
            title={t('profile.notifications')}
            subtitle={t('profile.notificationsSub')}
            showChevron
            onPress={() => navigation.navigate('Notifications')}
          />
          <SettingsListItem
            palette={palette}
            icon="notifications-circle-outline"
            title={t('profile.notificationPrivacy')}
            subtitle={
              anyEnabled
                ? t('profile.notificationsOn', { count: enabledCount })
                : t('profile.notificationsOff')
            }
            showChevron
            onPress={() => navigation.navigate('NotificationSettings')}
          />
          <SettingsListItem
            palette={palette}
            icon="refresh-outline"
            title={t('profile.resync')}
            subtitle={
              isSyncing ? t('profile.resyncing') : t('profile.resyncSub')
            }
            showChevron
            onPress={handleResync}
          />
        </View>

        <Text style={[styles.sectionTitle, { color: palette.text }]}>
          {t('profile.sectionCoupon')}
        </Text>
        <View style={styles.list}>
          <SettingsListItem
            palette={palette}
            icon="receipt-outline"
            title={t('profile.couponHistory')}
            subtitle={t('profile.couponHistorySub')}
            showChevron
            onPress={() => navigation.navigate('CouponHistory')}
          />
        </View>

        <Text style={[styles.sectionTitle, { color: palette.text }]}>
          {t('profile.sectionSupport')}
        </Text>
        <View style={styles.list}>
          <SettingsListItem
            palette={palette}
            icon="book-outline"
            title={t('profile.tutorial')}
            subtitle={t('profile.tutorialSub')}
            showChevron
            onPress={() => navigation.navigate('Onboarding', { replay: true })}
          />
          <SettingsListItem
            palette={palette}
            icon="help-circle-outline"
            title={t('profile.faq')}
            subtitle={t('profile.faqSub')}
            showChevron
            onPress={() => navigation.navigate('Faq')}
          />
          <SettingsListItem
            palette={palette}
            icon="chatbubble-ellipses-outline"
            title={t('profile.contact')}
            subtitle={t('profile.contactSub')}
            showChevron
            onPress={() => navigation.navigate('Contact')}
          />
          <SettingsListItem
            palette={palette}
            icon="document-text-outline"
            title={t('profile.legal')}
            subtitle={t('profile.legalSub')}
            showChevron
            onPress={() => navigation.navigate('Legal')}
          />
          {__DEV__ ? (
            <SettingsListItem
              palette={palette}
              icon="construct-outline"
              title="デバッグメニュー"
              subtitle="キャッシュ初期化・状態切り替え"
              showChevron
              onPress={openDevMenu}
            />
          ) : null}
        </View>

        {isEmailUser ? (
          <Button
            label={t('profile.logout')}
            palette={palette}
            variant="ghost"
            onPress={handleLogout}
          />
        ) : null}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`バージョン ${APP_VERSION}`}
          accessibilityHint={
            __DEV__ ? '3回タップするとデバッグメニューが開きます' : undefined
          }
          onPress={handleVersionPress}
          style={styles.versionWrap}
        >
          <Text style={[styles.versionLabel, { color: palette.muted }]}>
            DateSpot  v{APP_VERSION}
          </Text>
          <Text style={[styles.versionHint, { color: palette.muted }]}>
            {__DEV__ ? '開発ビルド' : 'バージョン情報'}
          </Text>
        </Pressable>
      </ScrollView>

      <ProfileEditModal
        visible={isEditVisible}
        palette={palette}
        initialName={profile.name}
        onClose={() => setIsEditVisible(false)}
        onSave={updateDisplayName}
      />
      <DeleteAccountModal
        visible={isDeleteVisible}
        palette={palette}
        onClose={() => setIsDeleteVisible(false)}
      />
      {__DEV__ ? (
        <DevMenuModal
          visible={isDevMenuVisible}
          onClose={() => setIsDevMenuVisible(false)}
        />
      ) : null}
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
    gap: 18,
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
  loginPrompt: {
    gap: 12,
  },
  loginLead: {
    fontSize: 14,
    lineHeight: 22,
  },
  profileCard: {
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 20,
    gap: 8,
    shadowColor: '#2B1D1F',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    overflow: 'hidden',
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
  },
  email: {
    fontSize: 14,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statChip: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
  },
  membershipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  membershipIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  membershipCopy: {
    flex: 1,
    gap: 2,
  },
  membershipLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  membershipValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  membershipNote: {
    fontSize: 12,
    lineHeight: 18,
  },
  themeOptions: {
    gap: 8,
  },
  themeOption: {
    borderWidth: 1,
    borderRadius: 12,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  themeOptionLabel: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  list: {
    gap: 10,
  },
  languageCard: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
  },
  languageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  languageIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  languageCopy: {
    flex: 1,
    gap: 2,
  },
  languageTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  languageSubtitle: {
    fontSize: 12,
    lineHeight: 18,
  },
  languageTrack: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  languageOption: {
    flex: 1,
    minHeight: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  languageOptionLabel: {
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  versionWrap: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 4,
    gap: 2,
  },
  versionLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  versionHint: {
    fontSize: 11,
  },
});
