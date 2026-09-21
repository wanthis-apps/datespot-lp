import { useEffect, useMemo, useState, type ReactElement } from 'react';
import {
  Image,
  StyleSheet,
  View,
  type ImageStyle,
  type StyleProp,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PLACEHOLDER_IMAGE = require('../../assets/icon.png') as number;

type RemoteImageProps = {
  uri: string | null | undefined;
  style?: StyleProp<ImageStyle>;
  accessibilityLabel?: string;
};

export function isUsableImageUri(uri: string | null | undefined): uri is string {
  if (typeof uri !== 'string') {
    return false;
  }

  const trimmed = uri.trim();
  if (trimmed.length === 0) {
    return false;
  }

  return (
    trimmed.startsWith('https://') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('file://') ||
    trimmed.startsWith('data:image/')
  );
}

export function RemoteImage({
  uri,
  style,
  accessibilityLabel = 'スポット画像',
}: RemoteImageProps): ReactElement {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [uri]);

  const showRemote = useMemo(
    () => isUsableImageUri(uri) && !hasError,
    [hasError, uri],
  );

  return (
    <View style={[styles.wrap, style]}>
      <Image
        source={PLACEHOLDER_IMAGE}
        style={styles.fill}
        resizeMode="cover"
        accessibilityIgnoresInvertColors
      />
      <View style={styles.scrim} />
      <Ionicons name="image-outline" size={28} color="#FFFFFF" />
      {showRemote && isUsableImageUri(uri) ? (
        <Image
          source={{ uri }}
          style={styles.fill}
          resizeMode="cover"
          accessibilityLabel={accessibilityLabel}
          onError={() => {
            setHasError(true);
          }}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#C9B4B0',
  },
  fill: {
    ...StyleSheet.absoluteFill,
  },
  scrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(43, 29, 31, 0.28)',
  },
});
