import { useRef, useState, type ReactElement } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, DeleteAccountModal, DevMenuModal, RemoteImage } from '@/components';
import { FilterChipRow } from '@/features/spots/components/FilterChipRow';
import { useAppTheme, useI18n } from '@/context';
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
    usedCouponCount,
    isSyncing,
    isGuest,
    isEmailUser,
    updateDisplayName,
    resync,
    logout,
  } = useProfileScreen();
  const { mode, setMode, setDarkMode } = useAppTheme();
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
    setIsDevMenuVisible(true);
  };

  const handleVersionPress = (): void => {
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
        <Text style={[styles.heading, { color: palette.text }]}>
          {t('profile.heading')}
        </Text>

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
          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.navigate('CouponHistory')}
            style={[
              styles.statChip,
              { backgroundColor: palette.surface, borderColor: palette.border },
            ]}
          >
            <Text style={[styles.statValue, { color: palette.primary }]}>
              {usedCouponCount}
            </Text>
            <Text style={[styles.statLabel, { color: palette.textSecondary }]}>
              {t('profile.usedCoupons')}
            </Text>
          </Pressable>
        </View>

        <Text style={[styles.sectionTitle, { color: palette.text }]}>
          {t('profile.settings')}
        </Text>
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
            icon="language-outline"
            title={t('language.label')}
            subtitle={t('profile.languageSub')}
          />
          <FilterChipRow
            value={language}
            onChange={setLanguage}
            palette={palette}
            options={LANGUAGE_OPTIONS.map((option) => ({
              value: option.value,
              label: t(option.labelKey),
            }))}
          />
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
            icon="moon-outline"
            title={t('profile.darkMode')}
            subtitle={
              mode === 'system'
                ? t('profile.darkSystem', {
                    scheme: isDark ? t('profile.dark') : t('profile.light'),
                  })
                : isDark
                  ? t('common.on')
                  : t('common.off')
            }
            trailing={
              <Switch
                value={isDark}
                onValueChange={setDarkMode}
                trackColor={{
                  false: palette.border,
                  true: palette.primaryMuted,
                }}
                thumbColor={isDark ? palette.primary : palette.muted}
              />
            }
          />
          <SettingsListItem
            palette={palette}
            icon="phone-portrait-outline"
            title={t('profile.followSystem')}
            subtitle={
              mode === 'system'
                ? t('profile.followSystemOn')
                : t('profile.followSystemOff')
            }
            showChevron
            onPress={() => setMode('system')}
          />
          <SettingsListItem
            palette={palette}
            icon="receipt-outline"
            title={t('profile.couponHistory')}
            subtitle={t('profile.couponHistorySub')}
            showChevron
            onPress={() => navigation.navigate('CouponHistory')}
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
            icon="refresh-outline"
            title={t('profile.resync')}
            subtitle={
              isSyncing ? t('profile.resyncing') : t('profile.resyncSub')
            }
            showChevron
            onPress={handleResync}
          />
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
          <SettingsListItem
            palette={palette}
            icon="trash-outline"
            title={t('profile.deleteAccount')}
            subtitle={t('profile.deleteAccountSub')}
            showChevron
            onPress={() => setIsDeleteVisible(true)}
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

        {isGuest || !isEmailUser ? (
          <Button
            label={t('profile.login')}
            palette={palette}
            onPress={() => navigation.navigate('Auth')}
          />
        ) : null}
        <Button
          label={isEmailUser ? t('profile.logout') : t('profile.backToLogin')}
          palette={palette}
          variant="ghost"
          onPress={handleLogout}
        />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`バージョン ${APP_VERSION}`}
          accessibilityHint="3回タップするとデバッグメニューが開きます"
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
      <DevMenuModal
        visible={isDevMenuVisible}
        onClose={() => setIsDevMenuVisible(false)}
      />
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
  list: {
    gap: 10,
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
