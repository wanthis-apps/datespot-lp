module.exports = function (api) {
  api.cache(true);
  return {
    // Expo SDK 57: babel-preset-expo が .env の EXPO_PUBLIC_* をバンドルへ埋め込む。
    // react-native-dotenv / babel-plugin-inline-dotenv / @env は使わない。
    presets: ['babel-preset-expo'],
  };
};
