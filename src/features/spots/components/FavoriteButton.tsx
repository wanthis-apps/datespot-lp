import { memo, useCallback, type ReactElement } from 'react';
import { Alert, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { useAuth } from '@/features/auth';
import type { Palette } from '@/theme';
import { useFavorites } from '../hooks/useFavorites';

type FavoriteButtonProps = {
  spotId: string;
  palette: Palette;
  size?: 'card' | 'header';
};

function FavoriteButtonComponent({
  spotId,
  palette,
  size = 'card',
}: FavoriteButtonProps): ReactElement {
  const navigation = useNavigation();
  const { user, isEmailUser } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isFavorite(spotId);
  const dimension = size === 'header' ? 36 : 40;
  const canUseFavorites = user !== null && isEmailUser;

  const handlePress = useCallback((): void => {
    if (!canUseFavorites) {
      Alert.alert(
        'ログインが必要です',
        'お気に入り機能を使用するにはログインしてください。',
        [
          { text: 'キャンセル', style: 'cancel' },
          {
            text: 'ログイン画面へ',
            onPress: () => {
              navigation.dispatch(CommonActions.navigate({ name: 'Auth' }));
            },
          },
        ],
      );
      return;
    }

    void toggleFavorite(spotId);
  }, [canUseFavorites, navigation, spotId, toggleFavorite]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        favorited ? 'お気に入りから外す' : 'お気に入りに追加'
      }
      accessibilityState={{ selected: favorited }}
      hitSlop={12}
      onPress={(event) => {
        event.stopPropagation();
        handlePress();
      }}
      style={[
        styles.button,
        {
          width: dimension,
          height: dimension,
          borderRadius: dimension / 2,
        },
      ]}
    >
      <Ionicons
        name={favorited ? 'heart' : 'heart-outline'}
        size={size === 'header' ? 22 : 20}
        color={favorited ? palette.primary : palette.text}
      />
    </Pressable>
  );
}

export const FavoriteButton = memo(FavoriteButtonComponent);

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: 'rgba(43, 29, 31, 0.16)',
    shadowColor: '#1A1214',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.38,
    shadowRadius: 5,
    elevation: 6,
  },
});
