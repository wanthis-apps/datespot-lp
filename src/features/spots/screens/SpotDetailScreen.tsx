import { type ReactElement, useEffect, useLayoutEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { ErrorState, LoadingState, SpotDetailModal } from '@/components';
import { useAppTheme } from '@/context';
import { mapCatalogSpot } from '../../../../hooks/mapRecords';
import { useRecentlyViewed } from '../../../../hooks/useRecentlyViewed';
import type { RootStackScreenProps } from '@/navigation/types';
import { useSpotDetail } from '../hooks/useSpotDetail';

type SpotDetailScreenProps = RootStackScreenProps<'SpotDetail'>;

export function SpotDetailScreen({
  navigation,
  route,
}: SpotDetailScreenProps): ReactElement {
  const spotId = route.params?.spotId ?? '';
  const { palette } = useAppTheme();
  const { spot, isLoading, error, reload } = useSpotDetail(spotId);
  const { addRecentlyViewed } = useRecentlyViewed();
  const foundationSpot = useMemo(
    () => (spot === null ? null : mapCatalogSpot(spot)),
    [spot],
  );

  useEffect(() => {
    if (spotId.length === 0) {
      return;
    }

    addRecentlyViewed(spotId);
  }, [addRecentlyViewed, spotId]);

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  if (spotId.length === 0) {
    return (
      <View style={[styles.screen, { backgroundColor: palette.background }]}>
        <ErrorState
          palette={palette}
          message="スポットを特定できませんでした。"
          onRetry={() => navigation.goBack()}
          retryLabel="戻る"
        />
      </View>
    );
  }

  if (isLoading && foundationSpot === null) {
    return (
      <View style={[styles.screen, { backgroundColor: palette.background }]}>
        <LoadingState palette={palette} />
      </View>
    );
  }

  if (error !== null || foundationSpot === null) {
    return (
      <View style={[styles.screen, { backgroundColor: palette.background }]}>
        <ErrorState
          palette={palette}
          message={error ?? 'スポットを読み込めませんでした。'}
          onRetry={reload}
        />
      </View>
    );
  }

  return (
    <SpotDetailModal
      visible
      spot={foundationSpot}
      palette={palette}
      onClose={() => navigation.goBack()}
    />
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
  },
});
