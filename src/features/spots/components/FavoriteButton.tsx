import { memo, type ReactElement } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Palette } from '@/theme';

type FavoriteButtonProps = {
  isFavorite: boolean;
  onPress: () => void;
  palette: Palette;
  size?: 'card' | 'header';
};

function FavoriteButtonComponent({
  isFavorite,
  onPress,
  palette,
  size = 'card',
}: FavoriteButtonProps): ReactElement {
  const dimension = size === 'header' ? 36 : 40;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        isFavorite ? 'お気に入りから外す' : 'お気に入りに追加'
      }
      accessibilityState={{ selected: isFavorite }}
      hitSlop={8}
      onPress={onPress}
      style={[
        styles.button,
        {
          width: dimension,
          height: dimension,
          backgroundColor:
            size === 'card' ? 'rgba(20, 12, 14, 0.45)' : 'transparent',
        },
      ]}
    >
      <Ionicons
        name={isFavorite ? 'heart' : 'heart-outline'}
        size={size === 'header' ? 22 : 20}
        color={
          isFavorite
            ? palette.primary
            : size === 'header'
              ? palette.text
              : '#FFFFFF'
        }
      />
    </Pressable>
  );
}

export const FavoriteButton = memo(FavoriteButtonComponent);

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
  },
});
