import { type ReactElement } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Palette } from '@/theme';
import { openGoogleMapsDirections } from '@/utils/openDirections';

type DirectionsButtonProps = {
  latitude: number;
  longitude: number;
  palette: Palette;
};

export function DirectionsButton({
  latitude,
  longitude,
  palette,
}: DirectionsButtonProps): ReactElement {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Googleマップで経路を見る"
      onPress={() => {
        void openGoogleMapsDirections(latitude, longitude);
      }}
      style={[styles.button, { backgroundColor: palette.primary }]}
    >
      <Ionicons name="navigate" size={18} color="#FFFFFF" />
      <Text style={styles.label}>Googleマップで経路を見る</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    borderRadius: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
