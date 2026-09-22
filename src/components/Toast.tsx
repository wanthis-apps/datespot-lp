import { useEffect, useRef, type ReactElement } from 'react';
import { Animated, Pressable, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { ToastItem, ToastType } from '@/context/toastStore';
import { useAppTheme } from '@/context/ThemeContext';

export type ToastProps = {
  toast: ToastItem | null;
  onHide: () => void;
};

const TYPE_ICON: Record<ToastType, keyof typeof Ionicons.glyphMap> = {
  success: 'checkmark-circle',
  error: 'alert-circle',
  info: 'information-circle',
};

export function Toast({ toast, onHide }: ToastProps): ReactElement | null {
  const insets = useSafeAreaInsets();
  const { palette } = useAppTheme();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-16)).current;

  useEffect(() => {
    if (toast === null) {
      return;
    }

    opacity.setValue(0);
    translateY.setValue(-16);

    const animation = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]);

    animation.start();

    const hideTimer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -12,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) {
          onHide();
        }
      });
    }, toast.durationMs);

    return () => {
      clearTimeout(hideTimer);
      animation.stop();
    };
  }, [onHide, opacity, toast, translateY]);

  if (toast === null) {
    return null;
  }

  const accent =
    toast.type === 'success'
      ? '#3D8B6E'
      : toast.type === 'error'
        ? palette.danger
        : palette.primary;

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.host,
        {
          top: insets.top + 8,
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={toast.message}
        onPress={onHide}
        style={[
          styles.card,
          {
            backgroundColor: palette.surface,
            borderColor: palette.border,
          },
        ]}
      >
        <Ionicons name={TYPE_ICON[toast.type]} size={18} color={accent} />
        <Text style={[styles.message, { color: palette.text }]}>
          {toast.message}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 40,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: '#2B1D1F',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
});
