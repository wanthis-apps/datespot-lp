import { type ReactElement } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Palette } from '@/theme';
import type { UserRole } from '@/types';
import { ROLE_LABELS } from '../constants';

type MembershipStatusCardProps = {
  role: UserRole;
  palette: Palette;
};

export function MembershipStatusCard({
  role,
  palette,
}: MembershipStatusCardProps): ReactElement {
  const isPremium = role === 'premium';

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: palette.surface, borderColor: palette.border },
      ]}
    >
      <View
        style={[
          styles.iconWrap,
          { backgroundColor: palette.primaryMuted },
        ]}
      >
        <Ionicons
          name={isPremium ? 'sparkles' : 'person-circle-outline'}
          size={28}
          color={palette.primary}
        />
      </View>
      <Text style={[styles.label, { color: palette.textSecondary }]}>
        現在の会員ステータス
      </Text>
      <Text style={[styles.role, { color: palette.text }]}>
        {ROLE_LABELS[role]}
      </Text>
      <Text style={[styles.note, { color: palette.textSecondary }]}>
        {isPremium
          ? '提携店舗のドリンク特典が利用できます。'
          : '検索と基本提案は無料でご利用いただけます。'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
  role: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 6,
  },
  note: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 10,
  },
});
