import { type ReactElement, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Palette } from '@/theme';

type SettingsListItemProps = {
  palette: Palette;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  trailing?: ReactNode;
  showChevron?: boolean;
};

export function SettingsListItem({
  palette,
  icon,
  title,
  subtitle,
  onPress,
  trailing,
  showChevron = false,
}: SettingsListItemProps): ReactElement {
  const content = (
    <>
      <View style={[styles.iconWrap, { backgroundColor: palette.primaryMuted }]}>
        <Ionicons name={icon} size={18} color={palette.primary} />
      </View>
      <View style={styles.body}>
        <Text style={[styles.title, { color: palette.text }]}>{title}</Text>
        {subtitle !== undefined ? (
          <Text style={[styles.subtitle, { color: palette.textSecondary }]}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailing}
      {showChevron ? (
        <Ionicons name="chevron-forward" size={18} color={palette.muted} />
      ) : null}
    </>
  );

  if (onPress === undefined) {
    return (
      <View
        style={[
          styles.row,
          { backgroundColor: palette.surface, borderColor: palette.border },
        ]}
      >
        {content}
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[
        styles.row,
        { backgroundColor: palette.surface, borderColor: palette.border },
      ]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 18,
  },
});
