import { type ReactElement } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme';

type ScreenPlaceholderProps = {
  title: string;
  description: string;
};

export function ScreenPlaceholder({
  title,
  description,
}: ScreenPlaceholderProps): ReactElement {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
