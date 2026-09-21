import { type ReactElement } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import type { Palette } from '@/theme';

type ButtonVariant = 'primary' | 'ghost';

type ButtonProps = {
  label: string;
  onPress: () => void;
  palette: Palette;
  disabled?: boolean;
  variant?: ButtonVariant;
};

export function Button({
  label,
  onPress,
  palette,
  disabled = false,
  variant = 'primary',
}: ButtonProps): ReactElement {
  const isPrimary = variant === 'primary';

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.button,
        {
          backgroundColor: isPrimary ? palette.primary : 'transparent',
          borderColor: isPrimary ? palette.primary : palette.border,
          opacity: disabled ? 0.5 : 1,
        },
      ]}
    >
      <Text
        style={[
          styles.label,
          { color: isPrimary ? '#FFFFFF' : palette.text },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 22,
  },
});
