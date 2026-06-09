import { NativeModules, Platform } from 'react-native';
import Constants from 'expo-constants';

export function initializeAds() {
  if (Platform.OS === 'web') {
    return;
  }

  const isExpoGo =
    Constants.executionEnvironment === 'storeClient' ||
    Constants.executionEnvironment === 'store-client' ||
    Constants.appOwnership === 'expo';

  if (isExpoGo) {
    console.log('ℹ️ Running in Expo Go: Bypassing native AdMob initialization.');
    return;
  }

  try {
    const hasNativeModule = NativeModules.RNGoogleMobileAdsModule || NativeModules.RNGoogleMobileAds;
    if (!hasNativeModule) {
      console.warn('⚠️ RNGoogleMobileAds native module is not compiled in this build. Bypassing AdMob.');
      return;
    }

    // Since this file is only resolved/loaded on native platforms,
    // static import/require is safe here.
    const mobileAds = require('react-native-google-mobile-ads').default;
    mobileAds()
      .initialize()
      .then(adapterStatuses => {
        console.log('⚡ AdMob Mobile Ads SDK Initialized Successfully!', adapterStatuses);
      })
      .catch(err => {
        console.warn('⚠️ AdMob Initialization Failed:', err.message);
      });
  } catch (e) {
    console.log('⚠️ Mobile ads library not supported in this environment:', e.message);
  }
}
