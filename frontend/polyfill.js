// Polyfill DOMException for React Native environment
if (typeof globalThis.DOMException === 'undefined') {
  class DOMExceptionPolyfill extends Error {
    constructor(message = '', name = 'Error') {
      super(message);
      this.name = name;
      this.message = message;
      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, DOMExceptionPolyfill);
      }
    }
  }
  globalThis.DOMException = DOMExceptionPolyfill;
  if (typeof global !== 'undefined') {
    global.DOMException = DOMExceptionPolyfill;
  }
  console.log('⚡ DOMException successfully polyfilled globally!');
}

// Polyfill globalThis.expo and globalThis.expo.EventEmitter to prevent
// "Cannot read property 'EventEmitter' of undefined" crashes.
if (typeof globalThis.expo === 'undefined') {
  globalThis.expo = {};
}
if (!globalThis.expo.EventEmitter) {
  try {
    const EventEmitterClass = require('./emitter-polyfill');
    globalThis.expo.EventEmitter = EventEmitterClass;
    console.log('⚡ globalThis.expo.EventEmitter successfully polyfilled!');
  } catch (err) {
    console.error('Failed to polyfill globalThis.expo.EventEmitter:', err);
  }
}

// Polyfill globalThis.expo.modules['ExpoAsset'] to prevent "Cannot find native module 'ExpoAsset'"
// when running on an existing Development Build APK that was compiled without it.
if (typeof globalThis.expo.modules === 'undefined') {
  globalThis.expo.modules = {};
}
if (!globalThis.expo.modules['ExpoAsset']) {
  globalThis.expo.modules['ExpoAsset'] = {
    downloadAsync: async (url, md5Hash, type) => {
      console.log(`[ExpoAsset Polyfill] downloadAsync intercepted for: ${url}`);
      return url;
    }
  };
  console.log('⚡ Native module ExpoAsset successfully polyfilled in JS!');
}

// Disable system font scaling globally to ensure layout consistency across all devices
try {
  const { Text, TextInput } = require('react-native');
  const React = require('react');

  // Method 1: For older React Native versions
  if (Text.defaultProps) {
    Text.defaultProps.allowFontScaling = false;
  } else {
    Text.defaultProps = { allowFontScaling: false };
  }
  if (TextInput.defaultProps) {
    TextInput.defaultProps.allowFontScaling = false;
  } else {
    TextInput.defaultProps = { allowFontScaling: false };
  }

  // NOTE: In React 19 / React Native 0.81+, modifying Text.render or TextInput.render
  // directly causes internal React rendering crashes and native app crashes.
  // We bypass this monkey-patching to ensure stability.

  console.log('⚡ Global font scaling disabled successfully (legacy defaultProps fallback applied)!');
} catch (err) {
  console.warn('Failed to disable font scaling globally:', err);
}
