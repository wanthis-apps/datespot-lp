import { useState, type ReactElement } from 'react';
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
import { Button, RemoteImage } from '@/components';
import { useProfileScreen } from '../../hooks/useProfileScreen';
import type { TabScreenProps } from '@/navigation/types';
import { LegalModal, type LegalDocument } from './components/LegalModal';
import { ProfileEditModal } from './components/ProfileEditModal';
import { SettingsListItem } from './components/SettingsListItem';

type ProfileScreenProps = TabScreenProps<'MyPage'>;

export function ProfileScreen({ navigation }: ProfileScreenProps): ReactElement {
  const insets = useSafeAreaInsets();
  const {
    profile,
    timeOfDay,
    palette,
    favoriteCount,
    usedCouponCount,
    notificationsEnabled,
    isSyncing,
    isGuest,
    isEmailUser,
    setNotificationsEnabled,
    updateDisplayName,
    resync,
    logout,
  } = useProfileScreen();
  const [isEditVisible, setIsEditVisible] = useState(false);
  const [legalDocument, setLegalDocument] = useState<LegalDocument | null>(
    null,
  );

  const handleResync = (): void => {
    if (isSyncing) {
      return;
    }

    void resync().then(() => {
      Alert.alert('同期が完了しました', '最新データの読み込みを実行しました。');
    });
  };

  const handleLogout = (): void => {
    Alert.alert('ログアウトしますか？', 'この端末のセッションを終了します。', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: 'ログアウト',
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
      <StatusBar style={timeOfDay === 'night' ? 'light' : 'dark'} />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 24 },
        ]}
      >
        <Text style={[styles.kicker, { color: palette.primary }]}>Profile</Text>
        <Text style={[styles.heading, { color: palette.text }]}>マイページ</Text>

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
              お気に入り
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
              使用済みクーポン
            </Text>
          </Pressable>
        </View>

        <Text style={[styles.sectionTitle, { color: palette.text }]}>設定</Text>
        <View style={styles.list}>
          <SettingsListItem
            palette={palette}
            icon="person-outline"
            title="アカウント設定"
            subtitle="表示名などのプロフィールを編集"
            showChevron
            onPress={() => setIsEditVisible(true)}
          />
          <SettingsListItem
            palette={palette}
            icon="notifications-outline"
            title="通知設定"
            subtitle={notificationsEnabled ? 'オン' : 'オフ'}
            trailing={
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{
                  false: palette.border,
                  true: palette.primaryMuted,
                }}
                thumbColor={
                  notificationsEnabled ? palette.primary : palette.muted
                }
              />
            }
          />
          <SettingsListItem
            palette={palette}
            icon="receipt-outline"
            title="クーポン利用履歴"
            subtitle="使ったクーポンを確認"
            showChevron
            onPress={() => navigation.navigate('CouponHistory')}
          />
          <SettingsListItem
            palette={palette}
            icon="refresh-outline"
            title="データの再同期"
            subtitle={isSyncing ? '同期中…' : 'Supabaseから最新データを取得'}
            showChevron
            onPress={handleResync}
          />
          <SettingsListItem
            palette={palette}
            icon="document-text-outline"
            title="利用規約"
            showChevron
            onPress={() => setLegalDocument('terms')}
          />
          <SettingsListItem
            palette={palette}
            icon="shield-checkmark-outline"
            title="プライバシーポリシー"
            showChevron
            onPress={() => setLegalDocument('privacy')}
          />
        </View>

        {isGuest || !isEmailUser ? (
          <Button
            label="ログイン / 新規登録"
            palette={palette}
            onPress={() => navigation.navigate('Auth')}
          />
        ) : null}
        <Button
          label={isEmailUser ? 'ログアウト' : 'ログイン画面に戻る'}
          palette={palette}
          variant="ghost"
          onPress={handleLogout}
        />
      </ScrollView>

      <ProfileEditModal
        visible={isEditVisible}
        palette={palette}
        initialName={profile.name}
        onClose={() => setIsEditVisible(false)}
        onSave={updateDisplayName}
      />
      <LegalModal
        visible={legalDocument !== null}
        document={legalDocument ?? 'terms'}
        palette={palette}
        onClose={() => setLegalDocument(null)}
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
});
