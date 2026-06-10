import 'react-native-gesture-handler';
import './polyfill';
import * as Sentry from '@sentry/react-native';

// Initialize Sentry as early as possible to catch crashes during module imports
if (process.env.EXPO_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
    enableNative: true, // Make sure native crashes are captured
  });
  console.log('⚡ Sentry successfully initialized in index.js!');
}

import { registerRootComponent } from 'expo';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(Sentry.wrap(App));
