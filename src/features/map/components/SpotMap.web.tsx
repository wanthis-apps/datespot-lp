import { type ReactElement } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SpotCard } from '@/features/spots/components/SpotCard';
import { palettes } from '@/theme';
import type { SpotMapProps } from './SpotMap.types';

export function SpotMap({
  spots,
  onMarkerPress,
}: SpotMapProps): ReactElement {
  const palette = palettes.day;

  return (
    <View style={styles.container}>
      <Text style={styles.notice}>
        マップは iOS / Android アプリで表示されます。
      </Text>
      <ScrollView contentContainerStyle={styles.list}>
        {spots.map((spot) => (
          <SpotCard
            key={spot.id}
            spot={spot}
            palette={palette}
            onPress={() => onMarkerPress(spot.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 56,
  },
  notice: {
    textAlign: 'center',
    marginBottom: 16,
    color: '#7A6467',
  },
  list: {
    gap: 16,
    paddingBottom: 24,
  },
});
