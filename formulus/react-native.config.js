module.exports = {
  project: {
    ios: {},
    android: {},
  },
  assets: ['./assets/fonts/', './assets/webview/'],
  dependencies: {
    // Temporarily disable packages with missing native libraries for emulator
    'react-native-nitro-sound': {
      platforms: {
        android: null,
        ios: null,
      },
    },
    'react-native-vision-camera': {
      platforms: {
        android: null,
        ios: null,
      },
    },
  },
};
