import { registerRootComponent } from 'expo';
import type { ComponentType } from 'react';
import { Text, View } from 'react-native';

try {
  require('react-native-url-polyfill/auto');
} catch (error) {
  console.error('[DateSpot] url polyfill failed', error);
}

type GlobalErrorUtils = {
  getGlobalHandler: () => (error: Error, isFatal?: boolean) => void;
  setGlobalHandler: (
    handler: (error: Error, isFatal?: boolean) => void,
  ) => void;
};

const errorUtils = (globalThis as { ErrorUtils?: GlobalErrorUtils }).ErrorUtils;

if (errorUtils !== undefined) {
  const previousHandler = errorUtils.getGlobalHandler();
  errorUtils.setGlobalHandler((error, isFatal) => {
    console.error('[DateSpot] global error', {
      isFatal,
      message: error.message,
      stack: error.stack,
    });
    previousHandler(error, isFatal);
  });
}

function FallbackApp({ error }: { error: unknown }) {
  const message =
    error instanceof Error
      ? `${error.message}\n\n${error.stack ?? ''}`
      : String(error);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#1c1412',
        paddingTop: 72,
        paddingHorizontal: 20,
      }}
    >
      <Text style={{ color: '#ff3b30', fontSize: 22, fontWeight: '700' }}>
        起動エラー
      </Text>
      <Text
        selectable
        style={{ color: '#ff3b30', marginTop: 12, fontSize: 14, lineHeight: 20 }}
      >
        {message}
      </Text>
    </View>
  );
}

function loadApp(): ComponentType {
  try {
    const mod = require('./App') as { default: ComponentType };
    return mod.default;
  } catch (error) {
    console.error('[DateSpot] App module failed to load', error);
    return function AppLoadError() {
      return <FallbackApp error={error} />;
    };
  }
}

registerRootComponent(loadApp());
